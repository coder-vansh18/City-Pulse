import React, { useRef } from 'react';
import { Camera, X, UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onImageAdded?: (base64Image: string) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  onImageAdded,
  maxImages = 4,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.slice(0, maxImages - images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          const nextImages = [...images, base64];
          onChange(nextImages);
          if (onImageAdded) {
            onImageAdded(base64);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index);
    onChange(nextImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-medium">Photos / Evidence ({images.length}/{maxImages})</span>
        <span>JPG, PNG or WEBP</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Photo Previews */}
        {images.map((imgSrc, idx) => (
          <div
            key={idx}
            className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-surface-2 flex items-center justify-center shadow-sm"
          >
            <img
              src={imgSrc}
              alt={`Evidence preview ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-status-critical transition-colors"
              title="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="absolute bottom-1 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
              #{idx + 1}
            </span>
          </div>
        ))}

        {/* Upload Trigger Button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-accent hover:bg-surface-2/60 transition-all rounded-xl aspect-square flex flex-col items-center justify-center gap-1 text-muted hover:text-accent cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-surface-2 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Add Photo</span>
            <span className="text-[10px] text-muted">Click to browse</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
