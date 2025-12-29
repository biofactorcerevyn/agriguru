// Create proper 192x192 icon by resizing the 512x512 one
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 192;
canvas.height = 192;

const img = new Image();
img.onload = function() {
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(0, 0, 192, 192);
  
  // Draw a simple plant icon
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  // Stem
  ctx.fillRect(90, 120, 12, 60);
  // Leaves
  ctx.beginPath();
  ctx.arc(60, 100, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(120, 100, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(96, 70, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Convert to blob and save
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'icon-192x192.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
};

// Start with a simple icon since we can't access the 512x512 one
img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="%2316a34a"/><circle cx="256" cy="200" r="80" fill="white"/><rect x="240" y="280" width="32" height="160" fill="white"/></svg>';