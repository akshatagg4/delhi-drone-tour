import React from 'react'
import MapplsMap from './components/MapplsMap'
import './App.css'

function App() {
  return (
    <div className="app">
      {/* We removed the sidebar and logic from here.
        Now, MapplsMap.jsx handles the entire UI (Sidebar + Map + Flight Mode).
      */}
      <MapplsMap />
    </div>
  )
}

export default App