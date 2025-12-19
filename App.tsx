import React, { useState, useEffect } from 'react';
import { Box, Upload, FileText, Download, Trash2, Info, Share2, FileDown, BookOpen, AlertTriangle, X } from 'lucide-react';
import { encodeData, decodeData, blocksToIdString, idStringToBlocks } from './utils/converter';
import { EncodedData, ProcessingStatus } from './types';
import { WoolVisualizer } from './components/WoolVisualizer';
import { Legend } from './components/Legend';

const TechModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
        <h2 className="text-lg font-bold flex items-center space-x-2 text-blue-400">
          <BookOpen size={20} />
          <span>技术原理详解</span>
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition-colors"><X size={20} /></button>
      </div>
      <div className="p-6 overflow-y-auto text-sm space-y-4 text-gray-300 leading-relaxed">
        <section>
          <h3 className="text-white font-semibold mb-2">1. 数据存储机制 (Nibbles)</h3>
          <p>
            Minecraft有16种颜色的羊毛。由于 $2^4 = 16$，我们可以用一个羊毛方块完美表示 **4位二进制 (4 bits)**，也就是 **半个字节 (Nibble)**。
            因此，每两个羊毛方块可以组成一个完整的字节 (8 bits)。这种方式比二进制（0/1）堆叠更节省空间（高度减少一半）。
          </p>
        </section>
        
        <section>
          <h3 className="text-white font-semibold mb-2">2. 数据包结构 (Packet Structure)</h3>
          <p>为了区分文件类型并确保数据安全，我们在原始数据外包裹了一层协议头：</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li><span className="text-yellow-400">元数据长度 (2 Bytes)</span>: 指示接下来的JSON头有多长。</li>
            <li><span className="text-green-400">元数据 (Variable)</span>: JSON格式字符串，包含文件名、MIME类型、时间戳。</li>
            <li><span className="text-blue-400">有效载荷 (Variable)</span>: 实际的文件或文本二进制数据。</li>
            <li><span className="text-red-400">校验和 (2 Bytes)</span>: 基于 Fletcher-16 算法生成的签名，用于检测方块是否丢失或摆放错误。</li>
          </ul>
        </section>

        <section>
          <h3 className="text-white font-semibold mb-2">3. 3D 映射 (Mapping)</h3>
          <p>
            数据被平铺在 16x16 的区块 (Chunk) 中。写满一层 (256个方块) 后，Y轴增加，向上堆叠。
            这种结构与 Minecraft 的 Chunk 存储机制天然契合。
          </p>
        </section>

        <section>
            <h3 className="text-white font-semibold mb-2">4. 导出格式 (English IDs)</h3>
            <p>
                为了方便 Mod 读取或玩家手动建造（如果疯了的话），导出文件由 Minecraft ID 组成，例如 <code className="bg-black px-1 rounded">orange_wool</code>。
            </p>
        </section>
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
             <span>技术详解</span>
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