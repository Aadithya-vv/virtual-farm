import React, { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({
  vegetables, setVegetables,
  selectedVegetable, setSelectedVegetable,
  plants, setPlants,
  editingIndex, setEditingIndex,
  setToast                       // ✅ receives setToast for toast popup
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
      spread: parseInt(vegSpread),
      depth: parseInt(vegDepth),
      emoji: vegEmoji
    }]);
    setVegName(''); setVegSpread(''); setVegDepth(''); setVegEmoji('');
  };

  return (
    <aside className="sidebar">
      <h2>🧰 Tools</h2>
      <input type="text" value={vegName} onChange={e => setVegName(e.target.value)} placeholder="Vegetable name"/>
      <input type="number" value={vegSpread} onChange={e => setVegSpread(e.target.value)} placeholder="Spread (cm)"/>
      <input type="number" value={vegDepth} onChange={e => setVegDepth(e.target.value)} placeholder="Depth (cm)"/>

      {/* ✅ Common emojis with better text color */}
      <div style={{
        marginBottom: '8px',
        color: '#2e7d32',          // 🌿 rich dark green for visibility
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
          const count = plants.filter(p=>p.name===veg.name).length;
          return (
            <div
              key={idx}
              className={selectedVegetable === idx ? 'selected veg-item' : 'veg-item'}
              onClick={() => setSelectedVegetable(idx)}
              style={{position:'relative'}}
            >
              <span style={{fontSize:'24px'}}>{veg.emoji}</span>
              {count>0 && <span style={{
                position:'absolute', top:0, right:0, background:'#4CAF50', color:'#fff',
                borderRadius:'50%', width:'18px', height:'18px', fontSize:'12px',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>{count}</span>}
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
