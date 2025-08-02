import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import CanvasGrid from './components/CanvasGrid.jsx';
import Controls from './components/Controls.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/SignupPage.jsx';
import './App.css';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";

export default function App() {
  const [vegetables, setVegetables] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [scale, setScale] = useState(1);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [editingIndex, setEditingIndex] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
  const [toast, setToast] = useState({ visible:false, message:'' });
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  // Listen for auth state changes
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth, (u)=>{
      if(u) setUser(u); else setUser(null);
    });
    return ()=>unsub();
  },[]);

  // Load plants when user logs in
  useEffect(()=>{
    if(user){
      const load=async()=>{
        const snap=await getDocs(collection(db,"users",user.uid,"plants"));
        setPlants(snap.docs.map(d=>d.data()));
      };
      load();
    }
  },[user]);

  // Save plants & delete removed docs
  useEffect(()=>{
    if(user){
      const savePlants = async () => {
        const userPlantsCol = collection(db,"users",user.uid,"plants");
        const snap = await getDocs(userPlantsCol);
        const existingIds = snap.docs.map(d => d.id);   // e.g., ["0","1"]

        // Save/update current plants
        await Promise.all(
          plants.map((p, idx) => 
            setDoc(doc(userPlantsCol, idx.toString()), p)
          )
        );

        // Delete docs no longer present
        const currentIds = plants.map((_, idx) => idx.toString());
        const toDelete = existingIds.filter(id => !currentIds.includes(id));
        await Promise.all(
          toDelete.map(id => deleteDoc(doc(userPlantsCol, id)))
        );
      };
      savePlants();
    }
  },[plants,user]);

  if(!user) return showSignup
    ? <SignupPage setUser={setUser} setToast={setToast} goToLogin={()=>setShowSignup(false)} />
    : <LoginPage setUser={setUser} setToast={setToast} goToSignup={()=>setShowSignup(true)} />;

  return (
    <div className="app">
      <Sidebar
        vegetables={vegetables}
        setVegetables={setVegetables}
        selectedVegetable={selectedVegetable}
        setSelectedVegetable={setSelectedVegetable}
        plants={plants}
        setPlants={setPlants}
        editingIndex={editingIndex}
        setEditingIndex={setEditingIndex}
        setToast={setToast}
      />
      <main>
        <div className="top-bar">
          <Controls scale={scale} setScale={setScale} coords={coords} />
          <button className="logout-btn" onClick={()=>signOut(auth)}>🚪 Logout</button>
        </div>
        <div className="grid-wrapper">
          <CanvasGrid
            vegetables={vegetables}
            plants={plants}
            setPlants={setPlants}
            selectedVegetable={selectedVegetable}
            scale={scale}
            setCoords={setCoords}
            editingIndex={editingIndex}
            setEditingIndex={setEditingIndex}
            setTooltip={setTooltip}
            setToast={setToast}
          />
        </div>
        {/* Tooltip */}
        <div className="tooltip"
          style={{display:tooltip.visible?'block':'none',
            position:'fixed',top:tooltip.y+10,left:tooltip.x+10,
            background:'rgba(0,0,0,0.7)',color:'#fff',padding:'2px 6px',
            borderRadius:'4px',fontSize:'12px',pointerEvents:'none'}}>
          {tooltip.text}
        </div>
        {/* Toast */}
        {toast.visible && (
          <div className="toast">{toast.message}</div>
        )}
      </main>
    </div>
  );
}
