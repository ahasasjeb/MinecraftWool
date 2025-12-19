import { EncodedData, FileMetadata } from '../types';
import { WOOL_IDS, WOOL_COLORS } from '../constants';

// Reverse map for importing
const ID_TO_COLOR_INDEX: Record<string, number> = {};
Object.entries(WOOL_IDS).forEach(([index, id]) => {
  ID_TO_COLOR_INDEX[id] = Number(index);
});

/**
 * Calculates a simple Fletcher-16 checksum for integrity verification.
 * Returns a 2-byte array [check1, check2]
 */
function calculateChecksum(data: Uint8Array): Uint8Array {
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < data.length; i++) {
    sum1 = (sum1 + data[i]) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return new Uint8Array([sum1, sum2]);
}

/**
 * Encodes a string or file buffer into an array of 4-bit integers (0-15).
 * Structure:
 * 1. Metadata Length (2 bytes, UInt16, Big Endian)
 * 2. Metadata JSON string
 * 3. Payload
 * 4. Checksum (2 bytes, Fletcher-16)
 */
export const encodeData = async (
  input: string | File, 
  type: 'text' | 'file'
): Promise<EncodedData> => {
  let buffer: Uint8Array;
  let metadata: FileMetadata;

  if (type === 'text') {
    const textEncoder = new TextEncoder();
    const payload = textEncoder.encode(input as string);
    metadata = {
      type: 'text',
      timestamp: Date.now(),
    };
    buffer = createPacket(payload, metadata);
  } else {
    const file = input as File;
    const arrayBuffer = await file.arrayBuffer();
    const payload = new Uint8Array(arrayBuffer);
    metadata = {
      type: 'file',
      name: file.name,
      mimeType: file.type,
      timestamp: Date.now(),
    };
    buffer = createPacket(payload, metadata);
  }

  // Convert Uint8Array to 4-bit nibbles
  const nibbles: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    // High nibble (first 4 bits)
    nibbles.push((byte >> 4) & 0x0F);
    // Low nibble (last 4 bits)
    nibbles.push(byte & 0x0F);
  }

  return {
    blocks: nibbles,
    originalSize: buffer.length,
    metadata,
  };
};

function createPacket(payload: Uint8Array, metadata: FileMetadata): Uint8Array {
  const textEncoder = new TextEncoder();
  const metaString = JSON.stringify(metadata);
  const metaBytes = textEncoder.encode(metaString);
  
  // Header: 2 bytes for meta length
  if (metaBytes.length > 65535) {
    throw new Error("Metadata too large");
  }

  // Calculate total size: MetaLen(2) + Meta + Payload + Checksum(2)
  const contentSize = 2 + metaBytes.length + payload.length;
  const output = new Uint8Array(contentSize + 2);
  const view = new DataView(output.buffer);
  
  // Write Meta Length
  view.setUint16(0, metaBytes.length, false); // Big Endian
  
  // Write Meta
  output.set(metaBytes, 2);
  
  // Write Payload
  output.set(payload, 2 + metaBytes.length);
  
  // Calculate Checksum of the content so far
  const content = output.slice(0, contentSize);
  const checksum = calculateChecksum(content);
  
  // Write Checksum at the end
  output.set(checksum, contentSize);
  
  return output;
}

export const decodeData = (blocks: number[]): { metadata: FileMetadata; data: Blob | string } => {
  // Convert nibbles back to bytes
  if (blocks.length % 2 !== 0) {
    console.warn("Odd number of blocks, ignoring last block.");
  }
  
  const byteLength = Math.floor(blocks.length / 2);
  const buffer = new Uint8Array(byteLength);
  
  for (let i = 0; i < byteLength; i++) {
    const high = blocks[i * 2];
    const low = blocks[i * 2 + 1];
    buffer[i] = (high << 4) | low;
  }

  // INTEGRITY CHECK
  if (buffer.length < 4) throw new Error("数据过短，无法解析 (Data too short)");
  
  const receivedChecksum = buffer.slice(buffer.length - 2);
  const dataContent = buffer.slice(0, buffer.length - 2);
  const calculatedChecksum = calculateChecksum(dataContent);
  
  if (receivedChecksum[0] !== calculatedChecksum[0] || receivedChecksum[1] !== calculatedChecksum[1]) {
     throw new Error("数据完整性校验失败：文件可能已损坏 (Checksum mismatch)");
  }

  // Parse Header
  const view = new DataView(buffer.buffer);
  const metaLength = view.getUint16(0, false);
  
  if (dataContent.length < 2 + metaLength) throw new Error("数据损坏：元数据截断");
  
  const metaBytes = buffer.slice(2, 2 + metaLength);
  const textDecoder = new TextDecoder();
  let metadata: FileMetadata;
  
  try {
    metadata = JSON.parse(textDecoder.decode(metaBytes));
  } catch (e) {
    throw new Error("元数据头解析失败");
  }

  // Payload is after meta length (2) and meta bytes, but before checksum (which we already stripped logic-wise via dataContent slice logic effectively)
  // Re-slicing from dataContent which excludes checksum
  const payload = dataContent.slice(2 + metaLength);
  
  if (metadata.type === 'text') {
    return {
      metadata,
      data: textDecoder.decode(payload),
    };
  } else {
    return {
      metadata,
      data: new Blob([payload], { type: metadata.mimeType || 'application/octet-stream' }),
    };
  }
};

/**
 * Converts encoded blocks to a string of Minecraft IDs separated by newlines
 */
export const blocksToIdString = (blocks: number[]): string => {
  return blocks.map(b => WOOL_IDS[b]).join('\n');
};

/**
 * Parses a string of Minecraft IDs back into encoded blocks
 */
export const idStringToBlocks = async (str: string): Promise<EncodedData> => {
  const lines = str.trim().split(/[\s,\n]+/); // Split by newline, comma or space
  const blocks: number[] = [];
  
  for (const line of lines) {
    if (!line) continue;
    const id = line.trim();
    if (ID_TO_COLOR_INDEX[id] === undefined) {
      throw new Error(`未知的羊毛ID: ${id}`);
    }
    blocks.push(ID_TO_COLOR_INDEX[id]);
  }
  
  // We try to "peek" the metadata without full decode to return an EncodedData object
  // But decoding is the only way to get real metadata. 
  // For the purpose of the prototype state, we will do a full verify/decode here 
  // just to extract metadata for the "Processing" step, but return the blocks.
  
  try {
    const { metadata } = decodeData(blocks);
    return {
      blocks,
      originalSize: Math.floor(blocks.length / 2),
      metadata
    };
  } catch (e) {
    // Even if decode fails (e.g. checksum), we might still want to return blocks 
    // to visualize the corrupted data, but let's throw to be safe for now.
    throw e;
  }
};
