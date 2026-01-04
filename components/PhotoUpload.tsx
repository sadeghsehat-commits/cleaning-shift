'use client';

import { useState, useRef } from 'react';

interface PhotoUploadProps {
  onPhotosSelected: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

export default function PhotoUpload({ onPhotosSelected, maxPhotos = 5, label = 'Add Photos' }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Compress image if too large
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to keep file size small
          let quality = 0.7; // Start with 70% quality
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          // If still too large, reduce quality further
          const maxSize = 3 * 1024 * 1024; // 3MB max
          while (compressedBase64.length > maxSize && quality > 0.3) {
            quality -= 0.1;
            compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          }
          
          // If still too large, reduce dimensions
          if (compressedBase64.length > maxSize) {
            const scale = Math.sqrt(maxSize / compressedBase64.length) * 0.9;
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          }
          
          console.log('Compressed image size:', (compressedBase64.length / 1024).toFixed(2), 'KB');
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = base64;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    const remainingSlots = maxPhotos - photos.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await convertFileToBase64(file);
          newPhotos.push(base64);
        } catch (error) {
          console.error('Error converting file:', error);
        }
      }
    }

    const updatedPhotos = [...photos, ...newPhotos].slice(0, maxPhotos);
    setPhotos(updatedPhotos);
    onPhotosSelected(updatedPhotos);
  };

  const startCamera = async () => {
    try {
      // Try environment camera first (back camera on mobile), fallback to any camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (envError) {
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
        setIsCapturing(true);
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access in your browser settings.'
        : error.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : 'Could not access camera. Please use file upload instead.';
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (photos.length >= maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Limit dimensions to reduce file size
      const maxDimension = 1920;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, width, height);
      
      // Compress with lower quality for camera captures
      let base64 = canvas.toDataURL('image/jpeg', 0.7);
      
      // If still too large, reduce quality
      const maxSize = 3 * 1024 * 1024; // 3MB max
      let quality = 0.7;
      while (base64.length > maxSize && quality > 0.4) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      console.log('Captured photo size:', (base64.length / 1024).toFixed(2), 'KB');
      const updatedPhotos = [...photos, base64].slice(0, maxPhotos);
      setPhotos(updatedPhotos);
      onPhotosSelected(updatedPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosSelected(updatedPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          📁 Choose Files
        </button>
        <button
          type="button"
          onClick={isCapturing ? stopCamera : startCamera}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
        >
          {isCapturing ? '📷 Stop Camera' : '📷 Use Camera'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {isCapturing && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md rounded-lg"
            style={{ transform: 'scaleX(-1)' }}
          />
          <button
            type="button"
            onClick={capturePhoto}
            disabled={photos.length >= maxPhotos}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            📸 Capture Photo
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length >= maxPhotos && (
        <p className="text-sm text-gray-500">Maximum {maxPhotos} photos reached</p>
      )}
    </div>
  );
}

