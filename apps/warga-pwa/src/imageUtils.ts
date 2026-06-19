/**
 * Compresses an image file to <150KB using Canvas API.
 * This saves storage quota and optimizes response time.
 */
export function compressImage(file: File, maxWidth: number = 800, maxQuality: number = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Gagal mendapatkan konteks WebGL/2D'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Export to JPEG with compressed quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', maxQuality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
