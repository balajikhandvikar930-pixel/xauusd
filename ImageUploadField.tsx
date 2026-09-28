import { useRef, useState, useEffect } from 'react';
import { Upload, X, ImageIcon, RefreshCw } from 'lucide-react';
import { UploadedImage } from '@/lib/types';

interface ImageUploadFieldProps {
  slot: string;
  label: string;
  image: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUploadField({ slot, label, image, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    onChange({ slot, label, dataUrl, fileName: file.name });
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
      {image ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10">
          <img src={image.dataUrl} alt={label} className="w-full max-h-72 object-contain bg-black/40" />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-black/60 p-2 text-slate-200 backdrop-blur hover:bg-black/80 transition"
              title="Replace image"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg bg-red-500/80 p-2 text-white backdrop-blur hover:bg-red-500 transition"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition ${dragOver ? 'border-amber-400/60 bg-amber-400/5' : 'border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/10'}`}
        >
          <Upload className="h-6 w-6 text-slate-400" />
          <span className="text-sm text-slate-400">Click or drag a screenshot here</span>
          <span className="text-xs text-slate-500">PNG / JPG / WebP</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

interface ImagePreviewLightProps {
  image: UploadedImage;
}

export function ImagePreviewLight({ image }: ImagePreviewLightProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative overflow-hidden rounded-lg border border-white/10 hover:border-white/25 transition"
      >
        <img src={image.dataUrl} alt={image.label} className="h-16 w-16 object-cover bg-black/40" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition">
          <ImageIcon className="h-4 w-4 text-white" />
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(false)}>
          <img src={image.dataUrl} alt={image.label} className="max-h-[90vh] max-w-full rounded-xl" />
        </div>
      )}
    </>
  );
}
