import React, { useEffect, useRef, useState } from 'react';
import '../App.css'; // Ensure styling is applied

const MapplsMap = () => {
  const mapRef = useRef(null);
  const realViewRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // --- 1. THE MONUMENTS DATA ---
  const monuments = [
    { 
      name: "India Gate", 
      coords: [28.6129, 77.2295], 
      desc: "Welcome to India Gate, a war memorial located astride the Rajpath." 
    },
    { 
      name: "Red Fort", 
      coords: [28.6562, 77.2410], 
      desc: "This is the Red Fort, a historic fort in the city of Delhi." 
    },
    { 
      name: "Taj Mahal", 
      coords: [27.1751, 78.0421], 
      desc: "The Taj Mahal, an immense mausoleum of white marble in Agra." 
    },
    { 
      name: "Lotus Temple", 
      coords: [28.5535, 77.2588], 
      desc: "The Lotus Temple, notable for its flowerlike shape." 
    }
  ];

  // --- 2. AI NARRATION FUNCTION ---
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- 3. LOAD MAP SAFELY ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://apis.mappls.com/advancedmaps/api/${import.meta.env.VITE_MAPPLS_KEY}/map_sdk?layer=vector&v=3.0&plugins=realview`;
    script.async = true;
    script.defer = true;
    script.id = "mappls-script";
    document.body.appendChild(script);

    const initMap = () => {
      if (window.mappls && window.mappls.Map) {
        // Initialize Map
        mapRef.current = new window.mappls.Map('map', {
          center: [28.6129, 77.2295],
          zoom: 18,
        });

        // Initialize RealView (Street Mode) once map loads
        mapRef.current.addListener('load', () => {
          setIsMapLoaded(true);
          if (window.mappls.RealView) {
            realViewRef.current = new window.mappls.RealView({
              map: mapRef.current,
              position: mapRef.current.getCenter(),
            });
          }
        });

      } else {
        setTimeout(initMap, 100);
      }
    };

    initMap();

    return () => {
      const existingScript = document.getElementById("mappls-script");
      if (existingScript) document.body.removeChild(existingScript);
      if (realViewRef.current) realViewRef.current.remove();
    };
  }, []);

  // --- 4. FLY TO LOCATION FUNCTION ---
  const flyToLocation = (monument) => {
    if (mapRef.current && isMapLoaded) {
      // Move the Map
      mapRef.current.panTo({ lat: monument.coords[0], lng: monument.coords[1] });
      mapRef.current.setZoom(19);

      // Move the Street View (if active)
      if (realViewRef.current) {
        realViewRef.current.setPosition({ lat: monument.coords[0], lng: monument.coords[1] });
      }

      // Speak
      speak(monument.desc);
    }
  };

  // --- 5. THE UI (SIDEBAR + MAP) ---
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: '250px',
        background: '#2c3e50',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000 // Ensure it sits on top
      }}>
        <h2>Drone Tour</h2>
        {monuments.map((m, index) => (
          <button 
            key={index} 
            onClick={() => flyToLocation(m)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              background: '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              textAlign: 'left'
            }}
          >
            ✈️ {m.name}
          </button>
        ))}
      </div>

      {/* MAP CONTAINER */}
      <div id="map" style={{ flex: 1, height: '100%' }}></div>
    </div>
  );
};

export default MapplsMap;