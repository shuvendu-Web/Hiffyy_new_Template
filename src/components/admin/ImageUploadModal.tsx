import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Link,
  Sparkles,
  AlertCircle,
  Loader2,
  Wand2,
  RotateCcw,
  Sliders,
  Eye,
} from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentImage?: string;
}

// Client-side HTML5 Canvas Image Compressor with Full Alpha Channel / Transparency Preservation
const compressImage = (file: File, maxWidth = 1400, quality = 0.84): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas rendering context not available'));
        return;
      }

      // Ensure canvas starts clean and transparent (no solid fill)
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // CRITICAL: Preserve transparency for PNG and WebP!
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');

      if (isPng) {
        // PNG format maintains 100% alpha transparency (no black background)
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } else if (isWebp) {
        // WebP supports transparency with compression
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      } else {
        // JPEG only for non-transparent photo formats
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };
    img.src = objectUrl;
  });
};

// Automatic White / Solid Background Remover to create Transparent PNG
const removeWhiteBackground = (dataUrl: string, tolerance = 35): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const totalPixels = data.length;

      // Sample 4 corners to automatically identify background tint
      const cornerOffsets = [0, (canvas.width - 1) * 4, (canvas.width * (canvas.height - 1)) * 4, totalPixels - 4];
      let rSum = 0, gSum = 0, bSum = 0;
      for (const offset of cornerOffsets) {
        rSum += data[offset];
        gSum += data[offset + 1];
        bSum += data[offset + 2];
      }
      const bgR = Math.round(rSum / 4);
      const bgG = Math.round(gSum / 4);
      const bgB = Math.round(bSum / 4);

      // Chroma-key algorithm: remove pixels matching background within tolerance
      for (let i = 0; i < totalPixels; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance in RGB space
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        if (dist <= tolerance) {
          // Pure transparent
          data[i + 3] = 0;
        } else if (dist < tolerance + 20) {
          // Soft anti-aliasing edge feather
          const alphaFactor = (dist - tolerance) / 20;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to process image transparency'));
    img.src = dataUrl;
  });
};

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImage,
}) => {
  const [selectedUrl, setSelectedUrl] = useState(currentImage || '');
  const [originalUploadUrl, setOriginalUploadUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'checker' | 'hero' | 'white'>('checker');
  const [bgTolerance, setBgTolerance] = useState<number>(35);
  const [isTransparentPng, setIsTransparentPng] = useState<boolean>(() => {
    return currentImage?.toLowerCase().includes('.png') || currentImage?.startsWith('data:image/png') || false;
  });

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress('Processing image with alpha transparency...');
    setErrorMessage(null);

    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    setIsTransparentPng(isPng);

    try {
      // 1. Downscale & compress client-side while preserving PNG transparency
      const compressedDataUrl = await compressImage(file, 1400, 0.84);
      setOriginalUploadUrl(compressedDataUrl);
      setUploadProgress('Saving to server storage...');

      // 2. Upload to server static uploads directory
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: compressedDataUrl,
            filename: file.name.replace(/\.[^/.]+$/, ''),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            setSelectedUrl(data.url);
            setUploadProgress(
              isPng
                ? 'Transparent PNG successfully saved to /uploads'
                : 'Image successfully saved to /uploads'
            );
            setIsUploading(false);
            return;
          }
        }
      } catch (serverErr) {
        console.warn('Server upload endpoint not responding, using compressed data URL:', serverErr);
      }

      // 3. Fallback to lightweight compressed data URL
      setSelectedUrl(compressedDataUrl);
      setUploadProgress(isPng ? 'Transparent PNG ready (~180KB)' : 'Optimized image ready (~120KB)');
    } catch (err: unknown) {
      console.error('Image Processing Error:', err);
      setErrorMessage((err as Error)?.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  // Magic wand: Remove white or solid background
  const handleMakeTransparent = async () => {
    if (!selectedUrl) return;
    setIsRemovingBg(true);
    setErrorMessage(null);

    try {
      // Save current as original if not yet saved
      if (!originalUploadUrl) {
        setOriginalUploadUrl(selectedUrl);
      }

      const transparentDataUrl = await removeWhiteBackground(selectedUrl, bgTolerance);
      setIsTransparentPng(true);

      // Attempt to save new transparent PNG to server
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: transparentDataUrl,
            filename: 'transparent-packshot',
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            setSelectedUrl(data.url);
            setUploadProgress('Background removed! Transparent PNG saved to /uploads');
            setIsRemovingBg(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not save transparent PNG to server, using dataUrl:', err);
      }

      setSelectedUrl(transparentDataUrl);
      setUploadProgress('Background removed! Transparent PNG ready');
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || 'Failed to remove background');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleRevertOriginal = () => {
    if (originalUploadUrl) {
      setSelectedUrl(originalUploadUrl);
      setUploadProgress('Reverted to original uploaded image');
    }
  };

  const presetImages = [
    {
      label: 'Transparent Dropper Bottle (PNG)',
      url: 'https://images.unsplash.com/photo-1608248597359-f77985dcc822?auto=format&fit=crop&w=800&q=80',
      isPng: true,
    },
    {
      label: 'Transparent Flacon (PNG)',
      url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      isPng: true,
    },
    {
      label: 'Golden Saffron Elixir',
      url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Oud Royal Flacon',
      url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Model Cream Radiance',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Model Saffron Glow',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-sm border border-[#E6DFD5] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#12231A] text-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#C5A880]" />
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-white">
              Admin Image Asset Manager & Transparent PNG Studio
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E6DFD5] bg-[#FAF8F5] text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload' ? 'bg-white border-b-2 border-[#12231A] text-[#12231A]' : 'text-[#717A75]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (PNG / JPG)</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-3 px-4 font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'url' ? 'bg-white border-b-2 border-[#12231A] text-[#12231A]' : 'text-[#717A75]'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-3 px-4 font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'presets' ? 'bg-white border-b-2 border-[#12231A] text-[#12231A]' : 'text-[#717A75]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Gallery</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label
                className={`border-2 border-dashed rounded-sm p-7 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isUploading
                    ? 'border-[#12231A] bg-[#12231A]/5'
                    : 'border-[#C5A880]/60 bg-[#FAF8F5] hover:bg-[#F4EFE6]'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-[#12231A] animate-spin" />
                    <span className="text-xs font-bold text-[#12231A]">{uploadProgress}</span>
                    <span className="text-[10px] text-[#717A75]">Retaining PNG transparency without black backgrounds...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#C5A880] mb-2" />
                    <span className="text-xs font-bold text-[#12231A] mb-1">Click to upload PNG or JPG image</span>
                    <span className="text-[10px] text-[#717A75] text-center max-w-sm">
                      PNG files retain 100% transparent backgrounds. High-res images are automatically compressed to prevent site lag.
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </>
                )}
              </label>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-sm flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {uploadProgress && !isUploading && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-2 text-xs text-emerald-800">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{uploadProgress}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-[#717A75] uppercase">
                Direct Image URL (Supports transparent PNG links)
              </label>
              <input
                type="text"
                placeholder="https://example.com/perfume-packshot.png"
                value={selectedUrl}
                onChange={(e) => {
                  setSelectedUrl(e.target.value);
                  setIsTransparentPng(e.target.value.toLowerCase().includes('.png'));
                }}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono focus:outline-none"
              />
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presetImages.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedUrl(preset.url);
                    setIsTransparentPng(Boolean(preset.isPng));
                  }}
                  className={`border rounded-sm p-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                    selectedUrl === preset.url
                      ? 'border-[#12231A] bg-[#12231A]/5 ring-2 ring-[#12231A]'
                      : 'border-[#E6DFD5] bg-white hover:border-[#C5A880]'
                  }`}
                >
                  <div className="w-full aspect-square rounded-sm mb-1.5 flex items-center justify-center overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:10px_10px]">
                    <img src={preset.url} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-medium text-[#12231A] truncate w-full">{preset.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Live Preview with Transparency Checkerboard & Magic Background Removal Tool */}
          {selectedUrl && (
            <div className="mt-4 p-4 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#886938]" />
                  <span>Transparency & Packshot Preview</span>
                </span>

                {/* Preview Background Switcher */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-sm border border-[#E6DFD5] text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPreviewBg('checker')}
                    className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                      previewBg === 'checker' ? 'bg-[#12231A] text-white font-bold' : 'text-[#717A75]'
                    }`}
                  >
                    Checkerboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('hero')}
                    className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                      previewBg === 'hero' ? 'bg-[#A0B7A3] text-[#12231A] font-bold' : 'text-[#717A75]'
                    }`}
                  >
                    Hero Green (#A0B7A3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('white')}
                    className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                      previewBg === 'white' ? 'bg-gray-200 text-[#12231A] font-bold' : 'text-[#717A75]'
                    }`}
                  >
                    White
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div
                className={`w-full h-44 rounded-sm border border-[#E6DFD5] flex items-center justify-center p-2 relative overflow-hidden transition-colors ${
                  previewBg === 'checker'
                    ? 'bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:14px_14px]'
                    : previewBg === 'hero'
                    ? 'bg-[#A0B7A3]'
                    : 'bg-white'
                }`}
              >
                <img
                  src={selectedUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain drop-shadow-md select-none transition-transform hover:scale-105 duration-300"
                />

                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/75 text-white text-[9px] rounded-xs font-mono">
                  {selectedUrl.toLowerCase().endsWith('.png') || selectedUrl.startsWith('data:image/png')
                    ? 'PNG • Transparent Alpha'
                    : 'Image Asset'}
                </span>
              </div>

              {/* Background Removal / Transparency Tools */}
              <div className="pt-2 border-t border-[#E6DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMakeTransparent}
                    disabled={isRemovingBg}
                    className="px-3 py-1.5 bg-[#96F816] text-[#12231A] text-xs font-bold rounded-sm hover:bg-[#85e110] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isRemovingBg ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Removing Background...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Remove White BG (Make PNG Transparent)</span>
                      </>
                    )}
                  </button>

                  {originalUploadUrl && (
                    <button
                      type="button"
                      onClick={handleRevertOriginal}
                      className="px-2.5 py-1.5 bg-white border border-[#E6DFD5] text-[#717A75] hover:text-[#12231A] text-xs font-medium rounded-sm flex items-center gap-1 cursor-pointer"
                      title="Revert to original file"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revert</span>
                    </button>
                  )}
                </div>

                {/* Tolerance slider */}
                <div className="flex items-center gap-2 text-[10px] text-[#717A75]">
                  <Sliders className="w-3 h-3 text-[#886938]" />
                  <span>Sensitivity:</span>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={bgTolerance}
                    onChange={(e) => setBgTolerance(Number(e.target.value))}
                    className="w-20 accent-[#12231A] cursor-pointer"
                  />
                  <span className="font-mono text-[#12231A] font-bold">{bgTolerance}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E6DFD5] flex items-center justify-between">
          <span className="text-[10px] text-[#717A75] font-mono">
            {selectedUrl ? (isTransparentPng ? '✓ Transparent PNG detected' : 'Standard image format') : 'No image selected'}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedUrl || isUploading || isRemovingBg}
              className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Use This Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
