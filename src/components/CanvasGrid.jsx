import React, { useRef, useEffect } from 'react';

export default function CanvasGrid({
  vegetables, plants, setPlants,
  selectedVegetable, scale, setCoords,
  editingIndex, setEditingIndex, setTooltip, setToast
}) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let mouseX=0, mouseY=0;
    let showPreview = false;

    const drawGrid = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // Grid lines
      ctx.strokeStyle="#cce3d1";
      for(let i=0;i<=canvas.width;i+=100){
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
      }
      for(let j=0;j<=canvas.height;j+=100){
        ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke();
      }

      // Existing plants
      plants.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.spread/2,0,Math.PI*2);
        ctx.fillStyle="rgba(76,175,80,0.15)";
        ctx.fill();

        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji || "🌱", p.x, p.y);
      });

      // Ghost preview
      if(showPreview){
        let veg=null;
        if(editingIndex!==null) veg=plants[editingIndex];
        else if(selectedVegetable!==null) veg=vegetables[selectedVegetable];
        if(veg){
          const canPlace=!checkOverlap(mouseX,mouseY,veg.spread, editingIndex);
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, veg.spread/2, 0, Math.PI*2);
          ctx.lineWidth = 2;
          ctx.setLineDash([8,4]);
          ctx.strokeStyle = canPlace ? "green" : "red";
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = "24px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(veg.emoji || "🌱", mouseX, mouseY);
        }
      }
    };

    const checkOverlap = (x,y,spread,skipIndex=null) =>
      plants.some((p, idx)=>{
        if(idx===skipIndex) return false;
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx*dx+dy*dy) < (p.spread/2 + spread/2);
      });

    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / scale;
      mouseY = (e.clientY - rect.top) / scale;
      setCoords({x: Math.floor(mouseX), y: Math.floor(mouseY)});
      setTooltip({ visible:true, x:e.clientX, y:e.clientY, text:`X:${Math.floor(mouseX)}, Y:${Math.floor(mouseY)}` });
      showPreview=true; drawGrid();
    };

    const onLeave=()=>{
      setTooltip(t=>({...t,visible:false}));
      showPreview=false; drawGrid();
    };

    const onClick=()=>{
      if(editingIndex!==null){
        const old=plants[editingIndex];
        if(!checkOverlap(mouseX,mouseY,old.spread,editingIndex)){
          setPlants(prev=>{
            const copy=[...prev];
            copy[editingIndex]={...copy[editingIndex], x:mouseX, y:mouseY};
            return copy;
          });
          setEditingIndex(null);
        } else {
          setToast({ visible:true, message:"❌ Overlap: can't move here!" });
          setTimeout(()=>setToast({ visible:false, message:'' }), 3000);
        }
      }
      else if(selectedVegetable!==null){
        const veg=vegetables[selectedVegetable];
        if(!checkOverlap(mouseX,mouseY,veg.spread)){
          setPlants(prev=>[...prev,{...veg, x:mouseX, y:mouseY}]);
        } else {
          setToast({ visible:true, message:"❌ Overlap: can't place here!" });
          setTimeout(()=>setToast({ visible:false, message:'' }), 3000);
        }
      }
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);
    drawGrid();

    return ()=>{
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
    };
  }, [vegetables, plants, selectedVegetable, scale, setCoords, setPlants, editingIndex, setEditingIndex, setTooltip, setToast]);

  return (
    <canvas ref={canvasRef} width={2000} height={2000}
      style={{
        transform:`scale(${scale})`,
        transformOrigin:'0 0',
        border:'1px solid #cce3d1',
        background:'#fff8ec',
        borderRadius:'10px'
      }}
    />
  );
}
