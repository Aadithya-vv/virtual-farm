import React, { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({
  vegetables, setVegetables,
  selectedVegetable, setSelectedVegetable,
  plants, setPlants,
  editingId, setEditingId,
  setToast
}) {
  const [vegName, setVegName] = useState('');
  const [vegSpread, setVegSpread] = useState('');
  const [vegDepth, setVegDepth] = useState('');
  const [vegImage, setVegImage] = useState('');

  const addVegetable = () => {
    if (!vegName || !vegSpread || !vegDepth || !vegImage) {
      setToast({ visible: true, message: "⚠️ Please fill all fields including image!" });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
      return;
    }
    setVegetables(prev => [...prev, {
      name: vegName,
      spread: parseInt(vegSpread, 10),
      depth: parseInt(vegDepth, 10),
      image: vegImage
    }]);
    setVegName(''); setVegSpread(''); setVegDepth(''); setVegImage('');
  };

  const plantCounts = {};
  plants.forEach(p => {
    plantCounts[p.name] = (plantCounts[p.name] || 0) + 1;
  });

  return (
    <aside className="sidebar">
      <h2>🧰 Add Vegetable</h2>
      <input type="text" value={vegName} onChange={e => setVegName(e.target.value)} placeholder="Name" />
      <input type="number" value={vegSpread} onChange={e => setVegSpread(e.target.value)} placeholder="Spread (cm)" />
      <input type="number" value={vegDepth} onChange={e => setVegDepth(e.target.value)} placeholder="Depth (cm)" />
      <input type="text" value={vegImage} onChange={e => setVegImage(e.target.value)} placeholder="Image URL" />
      <button className="add-btn" onClick={addVegetable}>Add to Palette</button>

      <h2>🌱 Palette</h2>
      <div className="vegetables">
        {vegetables.map((veg, idx) => {
          const count = plantCounts[veg.name] || 0;
          return (
            <div
              key={idx}
              className={`veg-item ${selectedVegetable === idx ? 'selected' : ''}`}
              onClick={() => setSelectedVegetable(idx)}
              draggable
              onDragStart={e => e.dataTransfer.setData("application/json", JSON.stringify(veg))}
            >
              {veg.image && <img src={veg.image} alt={veg.name} style={{ width: '32px', height: '32px' }} />}
              <span style={{ fontSize: '0.8rem' }}>{veg.name}</span>

              {count > 0 && (
                <span className="plant-count">{count}</span>
              )}

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setVegetables(prev => prev.filter((_, i) => i !== idx));
                  if (selectedVegetable === idx) setSelectedVegetable(null);
                }}
              >🗑️</button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setSelectedVegetable(null)}
        disabled={selectedVegetable === null}
        className="deselect-btn"
      >❌ Deselect</button>

      <h2>📍 Planted</h2>
      <ul className="plant-list">
        {plants.map((p, idx) => (
          <li key={idx} className="plant-item">
            <span>{p.name} at ({Math.floor(p.x)}, {Math.floor(p.y)})</span>
            <button className="icon-btn" onClick={() => setEditingId(idx)}>✏️</button>
            <button className="icon-btn" onClick={() => setPlants(plants.filter((_, i) => i !== idx))}>🗑️</button>
          </li>
        ))}
      </ul>
      {editingId !== null && <p style={{ color: 'green' }}>Editing plant #{editingId + 1} – tap/click on grid</p>}
    </aside>
  );
}
