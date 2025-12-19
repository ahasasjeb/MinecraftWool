export enum WoolColor {
  White = 0,
  Orange = 1,
  Magenta = 2,
  LightBlue = 3,
  Yellow = 4,
  Lime = 5,
  Pink = 6,
  Gray = 7,
  LightGray = 8,
  Cyan = 9,
  Purple = 10,
  Blue = 11,
  Brown = 12,
  Green = 13,
  Red = 14,
  Black = 15,
}

export interface WoolBlock {
  id: number;
  colorIndex: number;
  x: number;
  y: number;
  z: number;
}

export interface EncodedData {
  blocks: number[]; // Array of color indices (0-15)
  originalSize: number;
  metadata: FileMetadata;
}

export interface FileMetadata {
  type: 'text' | 'file';
  name?: string;
  mimeType?: string;
  timestamp: number;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';
