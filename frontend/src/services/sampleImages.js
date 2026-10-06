// Canvas generators for realistic leaf sample testing

export function createSampleLeafCanvas(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 400, 400);
  bgGrad.addColorStop(0, '#2d3748');
  bgGrad.addColorStop(1, '#1a202c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 400, 400);

  // Draw Leaf Shape
  ctx.save();
  ctx.translate(200, 200);
  ctx.beginPath();
  ctx.moveTo(0, -150);
  ctx.bezierCurveTo(110, -110, 130, 80, 0, 150);
  ctx.bezierCurveTo(-130, 80, -110, -110, 0, -150);
  ctx.closePath();

  // Leaf Base Color
  const leafGrad = ctx.createLinearGradient(0, -150, 0, 150);
  if (type === 'healthy') {
    leafGrad.addColorStop(0, '#4ade80');
    leafGrad.addColorStop(0.5, '#22c55e');
    leafGrad.addColorStop(1, '#15803d');
  } else if (type === 'rust') {
    leafGrad.addColorStop(0, '#86efac');
    leafGrad.addColorStop(0.4, '#4ade80');
    leafGrad.addColorStop(0.8, '#a3e635');
    leafGrad.addColorStop(1, '#166534');
  } else if (type === 'spot') {
    leafGrad.addColorStop(0, '#bbf7d0');
    leafGrad.addColorStop(0.6, '#22c55e');
    leafGrad.addColorStop(1, '#14532d');
  } else if (type === 'blurry') {
    leafGrad.addColorStop(0, '#4ade80');
    leafGrad.addColorStop(1, '#166534');
  }
  ctx.fillStyle = leafGrad;
  ctx.fill();

  // Leaf Central & Secondary Veins
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -140);
  ctx.lineTo(0, 140);
  ctx.stroke();

  ctx.lineWidth = 2;
  for (let y = -100; y <= 100; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(40, y - 10, 70, y - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(-40, y - 10, -70, y - 20);
    ctx.stroke();
  }

  // Draw Disease Spots
  if (type === 'rust') {
    // Leaf Rust: Orange-brown powdery pustules and yellow halos
    for (let i = 0; i < 45; i++) {
      const rx = (Math.random() - 0.5) * 140;
      const ry = (Math.random() - 0.5) * 200;
      const radius = 3 + Math.random() * 8;
      
      // Halo
      ctx.beginPath();
      ctx.arc(rx, ry, radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.fill();

      // Rust center
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#c2410c';
      ctx.fill();
    }
  } else if (type === 'spot') {
    // Leaf Spot: Concentric dark brown necrotic lesions
    for (let i = 0; i < 18; i++) {
      const sx = (Math.random() - 0.5) * 120;
      const sy = (Math.random() - 0.5) * 180;
      const radius = 6 + Math.random() * 12;

      ctx.beginPath();
      ctx.arc(sx, sy, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#451a03';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, sy, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
    }
  }

  ctx.restore();

  // If blurry, simulate severe motion blur / defocus
  if (type === 'blurry') {
    ctx.filter = 'blur(16px)';
    ctx.drawImage(canvas, 0, 0);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export function getSampleLeafBlob(type) {
  const dataUrl = createSampleLeafCanvas(type);
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
