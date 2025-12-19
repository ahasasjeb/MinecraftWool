import React, { useState, useEffect } from 'react';
import { Box, Upload, FileText, Download, Trash2, Info, Share2, FileDown, BookOpen, AlertTriangle, X, Code, Database, Layers, Cpu } from 'lucide-react';
import { encodeData, decodeData, blocksToIdString, idStringToBlocks } from './utils/converter';
import { EncodedData, ProcessingStatus } from './types';
import { WoolVisualizer } from './components/WoolVisualizer';
import { Legend } from './components/Legend';
import { WOOL_IDS, WOOL_NAMES, WOOL_COLORS } from './constants';

const TechModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
      <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-[#141414]">
        <div>
            <h2 className="text-xl font-bold flex items-center space-x-2 text-blue-400">
            <Cpu size={24} />
            <span>WoolData 技术白皮书</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">WoolData Architecture Technical Specification</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"><X size={24} /></button>
      </div>
      
      <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
        <div className="max-w-3xl mx-auto py-8 px-6 space-y-10">
            
            {/* Section 1: Core Concept */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 border-b border-gray-800 pb-2">
                    <Database size={20} />
                    <h3 className="text-lg font-bold">1. 核心存储机制 (Nibble Storage)</h3>
                </div>
                <div className="prose prose-invert text-sm text-gray-400 leading-relaxed">
                    <p>
                        Minecraft 拥有 16 种颜色的羊毛，这并非巧合。在计算机科学中，16 正好等于 $2^4$，这意味着一个羊毛方块可以完美表示 **4位 (4 bits)** 的数据，即 **半个字节 (Nibble)**。
                    </p>
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 font-mono text-xs my-4">
                        <div className="flex justify-between items-center text-gray-500 mb-2">
                            <span>原始字节 (1 Byte)</span>
                            <span>=</span>
                            <span>8 Bits</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-3 rounded text-center border border-gray-700">
                                <div className="text-blue-400 font-bold text-lg">High Nibble</div>
                                <div className="text-white">1011 (11)</div>
                                <div className="text-xs text-gray-500 mt-1">蓝色羊毛 (Blue)</div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded text-center border border-gray-700">
                                <div className="text-yellow-400 font-bold text-lg">Low Nibble</div>
                                <div className="text-white">0100 (4)</div>
                                <div className="text-xs text-gray-500 mt-1">黄色羊毛 (Yellow)</div>
                            </div>
                        </div>
                        <div className="mt-2 text-center text-gray-500">
                            HEX: 0xB4 &nbsp;|&nbsp; Decimal: 180
                        </div>
                    </div>
                    <p>
                        相比于二进制（0/1，黑色/白色）堆叠，使用 16进制（Hex）堆叠可以将建筑高度 **压缩 50%**，大幅提升数据密度。
                    </p>
                </div>
            </section>

            {/* Section 2: Data Protocol */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 text-orange-400 border-b border-gray-800 pb-2">
                    <Code size={20} />
                    <h3 className="text-lg font-bold">2. 二进制协议结构 (Binary Protocol)</h3>
                </div>
                <p className="text-sm text-gray-400">
                    为了支持文件还原、元数据解析及完整性校验，我们将原始数据封装在一个自定义的二进制包中。结构如下：
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-gray-300">
                                <th className="p-2 border border-gray-700">偏移 (Offset)</th>
                                <th className="p-2 border border-gray-700">长度 (Size)</th>
                                <th className="p-2 border border-gray-700">类型 (Type)</th>
                                <th className="p-2 border border-gray-700">说明 (Description)</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-400">
                            <tr>
                                <td className="p-2 border border-gray-800">0x00</td>
                                <td className="p-2 border border-gray-800">2 Bytes</td>
                                <td className="p-2 border border-gray-800 text-yellow-500">UInt16 (BE)</td>
                                <td className="p-2 border border-gray-800">元数据长度 (Meta Length, N)</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-gray-800">0x02</td>
                                <td className="p-2 border border-gray-800">N Bytes</td>
                                <td className="p-2 border border-gray-800 text-green-500">UTF-8 String</td>
                                <td className="p-2 border border-gray-800">元数据 JSON (文件名, MIME, 时间戳)</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-gray-800">0x02 + N</td>
                                <td className="p-2 border border-gray-800">Variable</td>
                                <td className="p-2 border border-gray-800 text-blue-500">Binary</td>
                                <td className="p-2 border border-gray-800">有效载荷 (File Payload)</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-gray-800">EOF - 2</td>
                                <td className="p-2 border border-gray-800">2 Bytes</td>
                                <td className="p-2 border border-gray-800 text-red-500">UInt8[2]</td>
                                <td className="p-2 border border-gray-800">Fletcher-16 校验和 (Checksum)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-900/50 p-3 rounded border border-gray-800 text-xs text-gray-500">
                    <span className="font-bold text-gray-400">校验算法 (Fletcher-16):</span>
                    <br />
                    <code>sum1 = (sum1 + byte) % 255;</code>
                    <br />
                    <code>sum2 = (sum2 + sum1) % 255;</code>
                </div>
            </section>

             {/* Section 3: Coordinate Mapping */}
             <section className="space-y-4">
                <div className="flex items-center space-x-2 text-purple-400 border-b border-gray-800 pb-2">
                    <Layers size={20} />
                    <h3 className="text-lg font-bold">3. 3D 空间映射 (Spatial Mapping)</h3>
                </div>
                <div className="text-sm text-gray-400 space-y-2">
                    <p>
                        数据流被线性转换为方块列表，然后填充到 Minecraft 的标准区块 (Chunk) 空间中。一个 Chunk 的截面是 16x16。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                         <div className="bg-gray-900 p-4 rounded border border-gray-800">
                             <h4 className="font-bold text-gray-300 mb-2">坐标计算公式</h4>
                             <code className="text-xs text-blue-300 block mb-1">i = 线性索引 (Block Index)</code>
                             <code className="text-xs text-green-300 block mb-1">y = floor(i / 256)</code>
                             <code className="text-xs text-green-300 block mb-1">z = floor((i % 256) / 16)</code>
                             <code className="text-xs text-green-300 block">x = (i % 256) % 16</code>
                         </div>
                         <div className="bg-gray-900 p-4 rounded border border-gray-800">
                             <h4 className="font-bold text-gray-300 mb-2">填充顺序</h4>
                             <ol className="list-decimal list-inside text-xs space-y-1">
                                 <li>X 轴 (West -&gt; East)</li>
                                 <li>Z 轴 (North -&gt; South)</li>
                                 <li>Y 轴 (Bottom -&gt; Top)</li>
                             </ol>
                         </div>
                    </div>
                </div>
            </section>

             {/* Section 4: Mapping Table */}
             <section className="space-y-4">
                <div className="flex items-center space-x-2 text-pink-400 border-b border-gray-800 pb-2">
                    <BookOpen size={20} />
                    <h3 className="text-lg font-bold">4. 完整映射表 (ID Mapping)</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                     {Object.keys(WOOL_IDS).map((k) => {
                         const key = Number(k);
                         return (
                             <div key={key} className="bg-gray-900 p-2 rounded border border-gray-800 flex flex-col space-y-1">
                                 <div className="flex justify-between items-center">
                                     <span className="font-bold text-white">Value: {key}</span>
                                     <span className="font-mono text-gray-500">0x{key.toString(16).toUpperCase()}</span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: WOOL_COLORS[key as any]}}></div>
                                     <span className="text-gray-400">{WOOL_NAMES[key as any]}</span>
                                 </div>
                                 <div className="text-[10px] text-gray-600 font-mono truncate">
                                     {WOOL_IDS[key as any]}
                                 </div>
                             </div>
                         )
                     })}
                </div>
            </section>

        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800 bg-[#141414] text-center text-xs text-gray-600">
        Generated by WoolData Architect Prototype v0.2
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [encodedData, setEncodedData] = useState<EncodedData | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [decodedResult, setDecodedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [importString, setImportString] = useState('');

  const handleEncodeText = async () => {
    if (!inputText) return;
    setStatus('processing');
    setErrorMsg(null);
    try {
      const result = await encodeData(inputText, 'text');
      setEncodedData(result);
      setDecodedResult(null); // Clear previous result when new data is encoded
      setStatus('success');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "编码失败");
      setStatus('error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setStatus('processing');
    try {
      if (file.size > 500 * 1024) {
        alert("原型系统限制：为保证3D渲染流畅，请上传小于 500KB 的文件。");
        setStatus('error');
        return;
      }
      
      const result = await encodeData(file, 'file');
      setEncodedData(result);
      setDecodedResult(null); // Clear previous result when new data is uploaded
      setStatus('success');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "文件编码失败");
      setStatus('error');
    }
  };

  const handleDecode = () => {
    if (!encodedData) return;
    setErrorMsg(null);
    try {
        const result = decodeData(encodedData.blocks);
        setDecodedResult(result);
    } catch(e: any) {
        console.error(e);
        setErrorMsg(e.message || "解码失败");
    }
  }

  const handleImportIDs = async () => {
      if(!importString) return;
      setErrorMsg(null);
      setDecodedResult(null); // Clear result before starting import
      try {
          const result = await idStringToBlocks(importString);
          setEncodedData(result);
          // Auto decode to show content
          const decoded = decodeData(result.blocks);
          setDecodedResult(decoded);
          setActiveTab('decode');
          setImportString('');
      } catch (e: any) {
          setErrorMsg(e.message || "ID 序列导入失败，请检查格式");
      }
  }

  const downloadOriginal = () => {
      if(!decodedResult) return;
      
      const { metadata, data } = decodedResult;
      
      if (metadata.type === 'text') {
        const blob = new Blob([data as string], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decoded_text.txt';
        a.click();
        URL.revokeObjectURL(url);
      } else {
          const blob = data as Blob;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = metadata.name || 'downloaded_file';
          a.click();
          URL.revokeObjectURL(url);
      }
  }

  const downloadIDs = () => {
      if(!encodedData) return;
      const str = blocksToIdString(encodedData.blocks);
      const blob = new Blob([str], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minecraft_wool_structure_${Date.now()}.mcwool`;
      a.click();
      URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#121212] text-white">
      {showTech && <TechModal onClose={() => setShowTech(false)} />}

      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-[#1a1a1a]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Box size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">WoolData Architect</h1>
            <p className="text-xs text-gray-500">Minecraft Mod 原型系统</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
           <button 
             onClick={() => setShowTech(true)}
             className="flex items-center space-x-1 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-gray-800"
           >
             <BookOpen size={16} />
             <span>技术白皮书</span>
           </button>
           <span className="flex items-center space-x-1 border-l border-gray-700 pl-4">
             <Info size={14} />
             <span>4-bit Nibble 存储结构</span>
           </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Control Panel */}
        <aside className="w-96 flex flex-col border-r border-gray-800 bg-[#151515] overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* Action Tabs */}
            <div className="flex p-1 bg-gray-800 rounded-lg">
              <button
                onClick={() => setActiveTab('encode')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'encode' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                编码 (Encode)
              </button>
              <button
                 onClick={() => { setActiveTab('decode'); if(encodedData && !decodedResult) handleDecode(); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'decode' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
                disabled={!encodedData && !importString}
              >
                解码 (Decode)
              </button>
            </div>

            {errorMsg && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start space-x-2 animate-in slide-in-from-top-2">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-sm text-red-200">{errorMsg}</span>
                </div>
            )}

            {activeTab === 'encode' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Text Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                    <FileText size={16} />
                    <span>编码文本</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="输入文本以转换为羊毛阵列..."
                      className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-600"
                    />
                    <button
                      onClick={handleEncodeText}
                      disabled={!inputText}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold rounded transition-colors"
                    >
                      转换
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-800"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-600 text-xs uppercase">或</span>
                  <div className="flex-grow border-t border-gray-800"></div>
                </div>

                {/* File Input */}
                <div className="space-y-3">
                   <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                    <Upload size={16} />
                    <span>编码文件</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <Upload className="w-8 h-8 mb-2 text-gray-500 group-hover:text-blue-400 transition-colors" />
                      <p className="text-sm text-gray-400 text-center"><span className="font-semibold">点击上传文件</span></p>
                      <p className="text-xs text-gray-600 mt-1">最大 500KB</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-800"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-600 text-xs uppercase">或</span>
                  <div className="flex-grow border-t border-gray-800"></div>
                </div>

                {/* Import ID String */}
                 <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                    <FileDown size={16} />
                    <span>导入 Minecraft ID 序列</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={importString}
                      onChange={(e) => setImportString(e.target.value)}
                      placeholder="粘贴 white_wool, orange_wool... 序列"
                      className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-600 font-mono text-xs"
                    />
                    <button
                      onClick={handleImportIDs}
                      disabled={!importString}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold rounded transition-colors"
                    >
                      导入并解析
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'decode' && encodedData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-200">元数据头 (Metadata)</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex justify-between">
                            <span>类型:</span>
                            <span className="text-white bg-gray-700 px-2 py-0.5 rounded uppercase text-xs">
                                {encodedData.metadata.type}
                            </span>
                        </div>
                        {encodedData.metadata.name && (
                            <div className="flex justify-between items-center">
                                <span>文件名:</span>
                                <span className="text-white truncate max-w-[150px]" title={encodedData.metadata.name}>{encodedData.metadata.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>方块消耗:</span>
                            <span className="text-blue-400 font-mono">{encodedData.blocks.length.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>校验状态:</span>
                            <span className="text-green-400 font-mono flex items-center text-xs"><Box size={10} className="mr-1"/> 校验通过</span>
                        </div>
                    </div>
                 </div>
                 
                 {decodedResult && (
                     <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-200">还原结果</h3>
                        {encodedData.metadata.type === 'text' ? (
                            <div className="bg-black/40 p-3 rounded border border-gray-700 font-mono text-sm max-h-40 overflow-y-auto break-all">
                                {decodedResult.data}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center p-6 bg-gray-800/30 rounded border border-gray-700">
                                 <FileText className="w-12 h-12 text-gray-500 mb-2" />
                                 <p className="text-sm text-gray-400">二进制文件已就绪</p>
                             </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2">
                             <button 
                                onClick={downloadOriginal}
                                className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors text-xs font-semibold"
                            >
                                <Download size={14} />
                                <span>下载源文件</span>
                            </button>
                             <button 
                                onClick={downloadIDs}
                                className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors text-xs font-semibold border border-gray-600"
                            >
                                <Share2 size={14} />
                                <span>导出 ID 表</span>
                            </button>
                        </div>
                       
                     </div>
                 )}
              </div>
            )}
            
            {/* Hex Key */}
            <div className="pt-4 border-t border-gray-800">
                <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">羊毛对应表 (Key)</h4>
                <Legend />
            </div>

          </div>
        </aside>

        {/* Right 3D Visualizer */}
        <section className="flex-1 bg-black relative flex items-center justify-center p-6">
            {encodedData ? (
                <div className="w-full h-full flex flex-col animate-in zoom-in-95 duration-500">
                     <WoolVisualizer blocks={encodedData.blocks} />
                </div>
            ) : (
                <div className="text-center space-y-4 text-gray-600">
                    <div className="w-24 h-24 border-4 border-gray-800 rounded-2xl mx-auto flex items-center justify-center group hover:border-gray-700 transition-colors">
                        <Box size={40} className="group-hover:text-gray-500 transition-colors" />
                    </div>
                    <p>请在左侧选择数据进行编码<br/>以生成 3D 羊毛结构</p>
                </div>
            )}
            
            {encodedData && (
                <button 
                    onClick={() => {
                        setEncodedData(null); 
                        setDecodedResult(null);
                        setInputText('');
                        setImportString('');
                        setErrorMsg(null);
                        setActiveTab('encode');
                    }}
                    className="absolute top-8 right-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-full backdrop-blur transition-all border border-red-500/20"
                    title="清空场景"
                >
                    <Trash2 size={20} />
                </button>
            )}
        </section>
      </main>
    </div>
  );
};

export default App;
