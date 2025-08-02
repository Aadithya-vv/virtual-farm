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
    let mouseX=0, mouseY=0;
    let showPreview=false;
    const imageCache={};

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    const draw = () => {
      // background: light brown
      ctx.fillStyle = '#d2b48c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spacing = 50 * scale;

      // vertical grid lines
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = 'rgba(166, 124, 82, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // horizontal grid lines
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = 'rgba(166, 124, 82, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // dark border
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#5c3d1a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // draw plants
      plants.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x * scale, p.y * scale, (p.spread / 2) * scale, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(76,175,80,0.15)";
        ctx.fill();
        if (p.image) {
          let img = imageCache[p.image];
          if (!img) {
            img = new Image();
            img.src = p.image;
            imageCache[p.image] = img;
            img.onload = draw;
          }
          if (img.complete) ctx.drawImage(img, p.x * scale - 16, p.y * scale - 16, 32, 32);
        }
      });

      // preview when adding/editing
      if (showPreview && selectedVegetable !== null) {
        const veg = vegetables[selectedVegetable];
        const halfSpread = (veg.spread/2);
        const overlap = checkOverlap(mouseX, mouseY, veg.spread, editingId);

        // boundary check to keep inside
        const safeX = Math.max(halfSpread, Math.min(mouseX, canvas.width/scale - halfSpread));
        const safeY = Math.max(halfSpread, Math.min(mouseY, canvas.height/scale - halfSpread));

        ctx.beginPath();
        ctx.arc(safeX*scale, safeY*scale, halfSpread*scale, 0, Math.PI*2);
        ctx.setLineDash([5,3]);
        ctx.strokeStyle = overlap ? "red" : "green";
        ctx.lineWidth=1;
        ctx.stroke();
        ctx.setLineDash([]);

        if (veg.image) {
          let img = imageCache[veg.image];
          if (!img) {
            img = new Image();
            img.src = veg.image;
            imageCache[veg.image] = img;
            img.onload = draw;
          }
          if (img.complete) ctx.drawImage(img, safeX*scale - 16, safeY*scale - 16, 32, 32);
        }
      }
    };

    const checkOverlap = (x, y, spread, skipIdx) =>
      plants.some((p, idx) => {
        if (skipIdx !== null && idx === skipIdx) return false;
        const dx = p.x - x, dy = p.y - y;
        return Math.hypot(dx, dy) < (p.spread/2 + spread/2);
      });

    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / scale;
      mouseY = (e.clientY - rect.top) / scale;
      setCoords({ x: Math.floor(mouseX), y: Math.floor(mouseY) });
      showPreview = true;
      draw();
    };

    const onLeave = () => {
      showPreview = false;
      draw();
    };

    const onClick = () => {
      if (selectedVegetable !== null) {
        const veg = vegetables[selectedVegetable];
        const halfSpread = veg.spread/2;

        // keep inside canvas bounds
        const safeX = Math.max(halfSpread, Math.min(mouseX, canvas.width/scale - halfSpread));
        const safeY = Math.max(halfSpread, Math.min(mouseY, canvas.height/scale - halfSpread));

        if (!checkOverlap(safeX, safeY, veg.spread, editingId)) {
          const newPlant = { ...veg, x: safeX, y: safeY };
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
          setToast({ visible:true, message:"❌ Overlap!" });
          setTimeout(()=>setToast({ visible:false, message:'' }), 2000);
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
    };
  }, [vegetables, plants, selectedVegetable, scale, editingId, setCoords, setPlants, setEditingId, setToast]);

  return (
    <canvas ref={canvasRef} style={{ display:'block', width:'100vw', height:'100vh' }}/>
  );
}
