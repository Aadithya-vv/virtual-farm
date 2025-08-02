import React, { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({
  vegetables, setVegetables,
  selectedVegetable, setSelectedVegetable,
  plants, setPlants,
  editingIndex, setEditingIndex,
  setToast
}) {
  const [vegName, setVegName] = useState('');
  const [vegSpread, setVegSpread] = useState('');
  const [vegDepth, setVegDepth] = useState('');
  const [vegEmoji, setVegEmoji] = useState('');

  const commonEmojis = ['🥕','🍅','🥬','🫑','🌽','🥦'];

  const addVegetable = () => {
    if (!vegName || !vegSpread || !vegDepth || !vegEmoji) {
      setToast({ visible:true, message:"⚠️ Please fill all fields including emoji!" });
      setTimeout(()=>setToast({ visible:false, message:'' }), 3000);
      return;
    }
    setVegetables(prev => [...prev, {
      name: vegName,
      spread: parseInt(vegSpread, 10),
      depth: parseInt(vegDepth, 10),
      emoji: vegEmoji
    }]);
    setVegName(''); setVegSpread(''); setVegDepth(''); setVegEmoji('');
  };

  const plantCounts = {};
  plants.forEach(p => {
    plantCounts[p.name] = (plantCounts[p.name] || 0) + 1;
  });

  return (
    <aside className="sidebar">
      <h2>🧰 Tools</h2>
      <input type="text" value={vegName} onChange={e => setVegName(e.target.value)} placeholder="Vegetable name"/>
      <input type="number" value={vegSpread} onChange={e => setVegSpread(e.target.value)} placeholder="Spread (cm)"/>
      <input type="number" value={vegDepth} onChange={e => setVegDepth(e.target.value)} placeholder="Depth (cm)"/>

      <div style={{
        marginBottom: '8px',
        color: '#2e7d32',
        fontWeight: '500',
        fontSize: '0.95rem'
      }}>
        Common:
        {commonEmojis.map(emj=>(
          <span key={emj} style={{cursor:'pointer',fontSize:'20px',margin:'0 3px'}}
                onClick={()=>setVegEmoji(emj)}>{emj}</span>
        ))}
      </div>

      <input type="text" value={vegEmoji} onChange={e => setVegEmoji(e.target.value)} placeholder="Emoji (e.g. 🥕)" maxLength="2"/>
      <button onClick={addVegetable}>Add</button>

      <h2>🌱 Palette</h2>
      <div className="vegetables">
        {vegetables.map((veg, idx) => {
          const count = plantCounts[veg.name] || 0;
          return (
            <div
              key={idx}
              draggable
              onDragStart={e => {
                e.dataTransfer.setData("application/json", JSON.stringify(veg));
              }}
              className={selectedVegetable === idx ? 'selected veg-item' : 'veg-item'}
              onClick={() => setSelectedVegetable(idx)}
              style={{position:'relative'}}
              title="Drag to grid or click to select"
            >
              <span style={{fontSize:'24px'}}>{veg.emoji}</span>

              {/* 🟩 Count badge */}
              {count>0 && <span style={{
                position:'absolute', top:0, right:0, background:'#4CAF50', color:'#fff',
                borderRadius:'50%', width:'18px', height:'18px', fontSize:'12px',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>{count}</span>}

              {/* 🗑 Delete button */}
              <button
                className="delete-btn"
                onClick={(e)=>{
                  e.stopPropagation();
                  setVegetables(prev => prev.filter((_, i) => i !== idx));
                  if(selectedVegetable === idx) setSelectedVegetable(null);
                }}
                title="Delete from palette"
              >🗑️</button>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setSelectedVegetable(null)}
        disabled={selectedVegetable === null}
        style={{
          marginTop:'6px',
          background: selectedVegetable===null ? '#ccc' : '#aaa',
          cursor: selectedVegetable===null ? 'not-allowed' : 'pointer'
        }}
      >
        ❌ Unequip / Deselect
      </button>

      <h2>📍 Planted</h2>
      <ul className="plant-list">
        {plants.map((p, idx) => (
          <li key={idx} className="plant-item">
            <span>{p.emoji} {p.name} at ({Math.floor(p.x)}, {Math.floor(p.y)})</span>
            <button className="icon-btn" onClick={() => setEditingIndex(idx)} title="Edit">✏️</button>
            <button className="icon-btn" onClick={() => setPlants(plants.filter((_, i) => i !== idx))} title="Delete">🗑️</button>
          </li>
        ))}
      </ul>

      {editingIndex !== null && <p style={{color:'green'}}>Editing plant #{editingIndex+1} – click new spot</p>}
    </aside>
  );
}
