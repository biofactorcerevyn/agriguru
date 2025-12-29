import iconImg from "/icons/icon-512x512.png";

// Create a canvas to resize the icon to 192x192
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 192;
canvas.height = 192;

const img = new Image();
img.onload = () => {
  ctx?.drawImage(img, 0, 0, 192, 192);
  
  // Convert to blob and create download link
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icon-192x192.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};

img.src = iconImg;