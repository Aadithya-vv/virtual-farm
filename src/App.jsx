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
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // listen login/logout
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u || null); });
    return () => unsub();
  }, []);

  // load plants & palette
  useEffect(() => {
    if (user) {
      const load = async () => {
        const plantSnap = await getDocs(collection(db, "users", user.uid, "plants"));
        setPlants(plantSnap.docs.map(d => d.data()));
        const paletteSnap = await getDocs(collection(db, "users", user.uid, "palette"));
        setVegetables(paletteSnap.docs.map(d => d.data()));
      };
      load();
    }
  }, [user]);

  // save plants
  useEffect(() => {
    if (user) {
      const save = async () => {
        const col = collection(db, "users", user.uid, "plants");
        const snap = await getDocs(col);
        const existingIds = snap.docs.map(d => d.id);
        await Promise.all(plants.map((p, idx) => setDoc(doc(col, idx.toString()), p)));
        const keep = plants.map((_, idx) => idx.toString());
        const toDelete = existingIds.filter(id => !keep.includes(id));
        await Promise.all(toDelete.map(id => deleteDoc(doc(col, id))));
      };
      save();
    }
  }, [plants, user]);

  // save palette
  useEffect(() => {
    if (user) {
      const save = async () => {
        const col = collection(db, "users", user.uid, "palette");
        const snap = await getDocs(col);
        const existingIds = snap.docs.map(d => d.id);
        await Promise.all(vegetables.map((v, idx) => setDoc(doc(col, idx.toString()), v)));
        const keep = vegetables.map((_, idx) => idx.toString());
        const toDelete = existingIds.filter(id => !keep.includes(id));
        await Promise.all(toDelete.map(id => deleteDoc(doc(col, id))));
      };
      save();
    }
  }, [vegetables, user]);

  if (!user) return showSignup
    ? <SignupPage setUser={setUser} goToLogin={() => setShowSignup(false)} />
    : <LoginPage setUser={setUser} goToSignup={() => setShowSignup(true)} />;

  return (
    <div className="app">
      {sidebarVisible && (
        <Sidebar
          vegetables={vegetables} setVegetables={setVegetables}
          selectedVegetable={selectedVegetable} setSelectedVegetable={setSelectedVegetable}
          plants={plants} setPlants={setPlants}
          editingId={editingId} setEditingId={setEditingId}
          setToast={setToast}
        />
      )}
      <main>
        <div className="top-bar">
          <button className="hamburger" onClick={() => setSidebarVisible(!sidebarVisible)}>☰</button>
          <Controls scale={scale} setScale={setScale} coords={coords} />
          <button className="logout-btn" onClick={() => signOut(auth)}>🚪 Logout</button>
        </div>
        <CanvasGrid
          vegetables={vegetables}
          plants={plants}
          setPlants={setPlants}
          selectedVegetable={selectedVegetable}
          scale={scale}
          setCoords={setCoords}
          editingId={editingId} setEditingId={setEditingId}
          setToast={setToast}
        />
        {toast.visible && <div className="toast">{toast.message}</div>}
      </main>
    </div>
  );
}
