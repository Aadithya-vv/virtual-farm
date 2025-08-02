import React from 'react';
export default function Controls({scale,setScale,coords}) {
  return (
    <div className="controls">
      <label>Zoom:
        <input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={e=>setScale(parseFloat(e.target.value))}/>
      </label>
      <span>X:{coords.x}, Y:{coords.y}</span>
    </div>
  );
}
