'use client';
import { useRef, useState } from "react";

interface UploadScreenProps {
  onImageSelected: (file: File) => void;
}

export default function UploadScreen({ onImageSelected }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }
    onImageSelected(file);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-container-padding pt-stack-lg pb-32 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-grid-gutter items-center mb-16">
        <div className="flex flex-col gap-stack-md order-2 md:order-1">
          <h1 className="font-display-lg text-display-lg text-on-background max-md:font-headline-lg-mobile max-md:text-headline-lg-mobile">
            Understand your prescription in seconds
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Upload a photo of your medical script to decode complex instructions instantly.
          </p>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="w-full max-w-[400px]">
            <img 
              alt="Friendly medical illustration showing a medicine bottle and prescription form" 
              className="w-full h-auto rounded-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ2D1RGfbXbLFoUDom6hxu9piwjT2eRokDVqWJy8yLyW4ievGbysjjaUel6jhhTXvUcJ2UuMo64mdsP5qrFGf7sArswqItnJPFKfakjz6DHzo2S0ce3ktin2wILIMKSiS6A5GbEZP_aVyxJ0WqKVyto1k9dMZOvjgHgUbVljSluCNzPPC3WejVI2-BUJJvaoD0PUfxnwLV5GlcBDoLq8xw6lCX6tqmhqfcGM1c_A_z1XvpyDTaDzHv-rYC0jhruLIggskdDHecQVY"
            />
          </div>
        </div>
      </section>

      <section className="w-full flex justify-center mb-16">
        <div className="w-full max-w-[800px] tonal-card rounded-[20px] p-stack-lg transition-all duration-300">
          <div 
            className={`upload-dashed rounded-[16px] p-12 flex flex-col items-center justify-center gap-stack-md cursor-pointer group transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container shadow-md group-hover:scale-105 transition-transform duration-200">
              <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            </div>
            <div className="text-center">
              <h3 className="font-headline-md text-headline-md text-on-background mb-2">Capture Script</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">JPEG, PNG up to 10MB</p>
            </div>
            <button className="mt-4 primary-button px-8 py-3 font-label-md text-label-md flex items-center gap-2 shadow-md pointer-events-none">
              <span className="material-symbols-outlined text-sm">upload</span>
              Upload or Take a Photo
            </button>
            <input 
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-grid-gutter">
        <div className="tonal-card p-stack-md rounded-[20px] flex flex-col gap-stack-sm border border-surface-container-highest">
          <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center mb-2">
            <span className="material-symbols-outlined">health_metrics</span>
          </div>
          <h4 className="font-headline-md text-headline-md text-primary">Precise OCR</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">Our advanced vision models read even the trickiest doctor handwriting.</p>
        </div>
        <div className="tonal-card p-stack-md rounded-[20px] flex flex-col gap-stack-sm border border-surface-container-highest">
          <div className="w-12 h-12 bg-tertiary-container/30 text-tertiary rounded-lg flex items-center justify-center mb-2">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <h4 className="font-headline-md text-headline-md text-tertiary">Secure & Private</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">Your medical data is encrypted and never stored on our servers longer than needed.</p>
        </div>
        <div className="tonal-card p-stack-md rounded-[20px] flex flex-col gap-stack-sm border border-surface-container-highest">
          <div className="w-12 h-12 bg-primary-container/20 text-on-primary-container rounded-lg flex items-center justify-center mb-2">
            <span className="material-symbols-outlined">translate</span>
          </div>
          <h4 className="font-headline-md text-headline-md text-on-primary-container">Simple English</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">Translates Latin shorthand (like 'bid' or 'po') into plain instructions.</p>
        </div>
      </section>
    </div>
  );
}
