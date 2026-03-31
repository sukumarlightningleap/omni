"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface VTOModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productName: string;
}

const VTOModal: React.FC<VTOModalProps> = ({ isOpen, onClose, productImage, productName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('userImage', file);
    formData.append('productImage', productImage);

    console.log('VTO Payload Check:', { productImage, hasUserImage: !!file });

    try {
      const response = await fetch('/api/vto', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('VTO API HTTP Error:', { status: response.status, body: errorText });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('VTO API Response Success:', data.success);
      if (data.success && data.image) {
        setResult(data.image);
      } else if (data.debug) {
        alert("AI Reasoning: " + data.debug);
      }
    } catch (error) {
      console.error('VTO failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-[110]"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Preview */}
              <div className="bg-neutral-950 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-800">
                <div className="relative aspect-[3/4] w-full max-w-[200px] mb-4">
                  <Image 
                    src={productImage} 
                    alt={productName} 
                    fill 
                    className="object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest">{productName}</h3>
                <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-tighter">AI Try-On Active</p>
              </div>

              {/* Action Zone */}
              <div className="p-8 relative min-h-[500px] flex flex-col">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1 tracking-tight italic">Studio Composite</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Powered by Gemini 2.0 Flash</p>
                </div>

                {loading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 p-8">
                    <div className="relative">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.4, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
                      />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="relative w-16 h-16 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      />
                      <Sparkles className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-blue-500 text-xs font-bold uppercase tracking-[0.5em] animate-pulse">Retouching Reality</p>
                      <p className="text-neutral-500 text-[8px] uppercase tracking-[0.2em] mt-3 leading-relaxed">Gemini is compositing your fit with photorealistic precision...</p>
                    </div>
                  </div>
                )}

                {!result ? (
                  <div className="flex-1 flex flex-col">
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="relative flex-1 border-2 border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center gap-4 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors cursor-pointer overflow-hidden group mb-6"
                    >
                      {preview ? (
                        <Image src={preview} alt="User Preview" fill className="object-cover opacity-60" />
                      ) : (
                        <Upload size={32} className="text-neutral-700 group-hover:text-neutral-500 transition-colors" />
                      )}
                      
                      <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        accept="image/*"
                      />
                      
                      <div className="text-center z-10 px-4">
                        <p className="text-sm font-medium tracking-tight mb-1">{preview ? 'Identity Verified' : 'Upload Your Portrait'}</p>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">Studio Lighting Preferred</p>
                      </div>
                    </div>

                    <button
                      disabled={!file || loading}
                      onClick={handleGenerate}
                      className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all duration-300 disabled:opacity-30 disabled:grayscale"
                    >
                      Process AI Composition
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative flex-1 bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 mb-6 group"
                    >
                      <Image src={result} alt="Generated Fit" fill className="object-cover" />
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-widest text-blue-400 font-bold">Studio AI Rendering</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-150" />
                        </div>
                      </div>
                    </motion.div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = result;
                          link.download = `unrwly-fit-${productName.toLowerCase().replace(/\s+/g, '-')}.png`;
                          link.click();
                        }}
                        className="flex-1 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all duration-300"
                      >
                        Secure Fit
                      </button>
                      <button 
                        onClick={() => {
                          setResult(null);
                          setFile(null);
                          setPreview(null);
                        }}
                        className="px-6 py-4 border border-neutral-800 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/5 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VTOModal;
