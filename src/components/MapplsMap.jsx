import React, { useEffect, useRef } from 'react';

const MapplsMap = () => {
  const realViewRef = useRef(null);

  useEffect(() => {
    // Debug: Check if Key is present
    console.log("Map Component Mounted. Key:", import.meta.env.VITE_MAPPLS_KEY);

    // 1. Load the Script Dynamically
    const script = document.createElement("script");
    script.src = `https://apis.mappls.com/advancedmaps/api/${import.meta.env.VITE_MAPPLS_KEY}/map_sdk?layer=vector&v=3.0&plugins=realview`;
    script.async = true;
    script.defer = true;
    script.id = "mappls-script"; // Tag it so we don't duplicate
    document.body.appendChild(script);

    // 2. The Safety Loop (Waits for script to load)
    const initMap = () => {
      if (window.mappls && window.mappls.Map) {
        console.log("Mappls script loaded. Initializing Map...");
        
        // Initialize the Map
        const map = new window.mappls.Map('map', {
          center: [28.6129, 77.2295],
          zoom: 18,
        });

        // Add RealView (Street View) once map loads
        map.addListener('load', () => {
          console.log("Map fully loaded.");
          if (window.mappls.RealView) {
            realViewRef.current = new window.mappls.RealView({
              map: map,
              position: map.getCenter(),
            });
          }
        });

      } else {
        console.log("Waiting for script...");
        setTimeout(initMap, 100); // Try again in 100ms
      }
    };

    // 3. Start checking
    initMap();

    // Cleanup
    return () => {
      const existingScript = document.getElementById("mappls-script");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      if (realViewRef.current) {
        realViewRef.current.remove();
      }
    };
  }, []);

  // 4. THE CRITICAL PART: Return a div with Explicit Height
  return (
    <div 
      id="map" 
      style={{ 
        width: '100%', 
        height: '100vh', // Forces the map to take full screen height
        backgroundColor: '#f0f0f0' // Light gray background to confirm div is there
      }} 
    >
      <p style={{ textAlign: 'center', paddingTop: '20px' }}>Loading Map...</p>
    </div>
  );
};

export default MapplsMap;