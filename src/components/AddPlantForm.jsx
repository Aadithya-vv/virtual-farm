import React, { useState } from 'react';

export default function AddPlantForm({ setVegetables }) {
  const [name, setName] = useState('');
  const [spread, setSpread] = useState('');
  const [depth, setDepth] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const addPlant = () => {
    if (!name || !spread || !depth || !preview) return;
    setVegetables(prev => [...prev, {
      name,
      spread: parseInt(spread,10),
      depth: parseInt(depth,10),
      image: preview   // reuse the same object URL
    }]);
    setName(''); setSpread(''); setDepth(''); setImageFile(null); setPreview(null);
  };

  return (
    <div className="add-plant-card">
      <h3>Add New Plant</h3>
      <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input type="number" placeholder="Spread (cm)" value={spread} onChange={e=>setSpread(e.target.value)} />
      <input type="number" placeholder="Depth (cm)" value={depth} onChange={e=>setDepth(e.target.value)} />
      
      <label className="file-label">
        {preview ? (
          <img src={preview} alt="Preview" className="preview-img" />
        ) : "Choose Image"}
        <input type="file" accept="image/*" onChange={e=>{
          if (e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setPreview(url);
            setImageFile(e.target.files[0]);
          }
        }} hidden />
      </label>

      <button onClick={addPlant}>➕ Add Plant</button>
    </div>
  );
}
