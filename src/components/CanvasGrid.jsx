import React, { useRef, useEffect } from 'react';

export default function CanvasGrid({
  vegetables, plants, setPlants,
  selectedVegetable, scale, setCoords,
  editingId, setEditingId, setToast
}) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let mouseX = 0, mouseY = 0;
    let showPreview = false;
    const imageCache = {};

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#d2b48c';  // light brown background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spacing = 50 * scale;
      ctx.strokeStyle = '#8b5a2b'; // darker brown lines
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // draw plants
      plants.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x * scale, p.y * scale, (p.spread / 2) * scale, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(76,175,80,0.15)";
        ctx.fill();
        if (p.image) {
          let img = imageCache[p.image];
          if (!img) {
            img = new Image(); img.src = p.image;
            imageCache[p.image] = img;
            img.onload = draw;
          }
          if (img.complete) ctx.drawImage(img, p.x * scale - 16, p.y * scale - 16, 32, 32);
        }
      });

      // preview
      if (showPreview && selectedVegetable !== null) {
        const veg = vegetables[selectedVegetable];
        if (!veg) return;
        const overlap = checkOverlap(mouseX, mouseY, veg.spread, editingId);
        ctx.beginPath();
        ctx.arc(mouseX * scale, mouseY * scale, (veg.spread / 2) * scale, 0, Math.PI * 2);
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = overlap ? "red" : "green";
        ctx.stroke();
        ctx.setLineDash([]);
        if (veg.image) {
          let img = imageCache[veg.image];
          if (!img) {
            img = new Image(); img.src = veg.image;
            imageCache[veg.image] = img;
            img.onload = draw;
          }
          if (img.complete) ctx.drawImage(img, mouseX * scale - 16, mouseY * scale - 16, 32, 32);
        }
      }

      // draw border
      ctx.strokeStyle = '#5a3c1a';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    };

    const checkOverlap = (x, y, spread, skipIdx) =>
      plants.some((p, idx) => {
        if (skipIdx !== null && idx === skipIdx) return false;
        const dx = p.x - x, dy = p.y - y;
        return Math.hypot(dx, dy) < (p.spread / 2 + spread / 2);
      });

    const handlePos = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      let x = (clientX - rect.left) / scale;
      let y = (clientY - rect.top) / scale;

      // boundary checks:
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x * scale > canvas.width) x = canvas.width / scale;
      if (y * scale > canvas.height) y = canvas.height / scale;

      mouseX = x; mouseY = y;
      setCoords({ x: Math.floor(x), y: Math.floor(y) });
      showPreview = true;
      draw();
    };

    const onMove = e => {
      handlePos(e.clientX, e.clientY);
    };

    const onTouchMove = e => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePos(touch.clientX, touch.clientY);
      }
      e.preventDefault();
    };

    const onLeave = () => { showPreview = false; draw(); };
    const onTouchEnd = () => { showPreview = false; draw(); };

    const onClick = () => {
      if (selectedVegetable !== null) {
        const veg = vegetables[selectedVegetable];
        if (!veg) return;
        if (!checkOverlap(mouseX, mouseY, veg.spread, editingId)) {
          const newPlant = { ...veg, x: mouseX, y: mouseY };
          setPlants(prev => {
            if (editingId !== null) {
              const copy = [...prev];
              copy[editingId] = newPlant;
              setEditingId(null);
              return copy;
            }
            return [...prev, newPlant];
          });
        } else {
          setToast({ visible: true, message: "❌ Overlap!" });
          setTimeout(() => setToast({ visible: false, message: "" }), 2000);
        }
      }
    };

    const onTouchStart = () => { onClick(); };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);

    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchstart', onTouchStart);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchstart', onTouchStart);
    };
  }, [vegetables, plants, selectedVegetable, scale, editingId, setCoords, setPlants, setEditingId, setToast]);

  return (
    <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh' }} />
  );
}
