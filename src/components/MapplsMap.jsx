/* src/components/MapplsMap.jsx */
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const MapplsMap = forwardRef((props, ref) => {
  const mapRef = useRef(null);
  const realViewRef = useRef(null);
  const orbitRef = useRef(null);
  const [isRealViewActive, setIsRealViewActive] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 1. Script Loader with RealView Plugin
  useEffect(() => {
    const loadScript = () => {
      if (window.Mappls && window.Mappls.Map) {
        initMap();
        return;
      }
      
      const key = import.meta.env.VITE_MAPPLS_KEY;
      const script = document.createElement('script');
      // Crucial: plugins=realview is required here
      script.src = `https://apis.mappls.com/advancedmaps/api/${key}/map_sdk?layer=vector&v=3.0&callback=initMapWithRealView&plugins=realview`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      window.initMapWithRealView = () => {
        initMap();
      };
    };

    loadScript();
    
    return () => {
      // Cleanup orbit on unmount
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
    };
  }, []);

  // 2. Initialize Map
  const initMap = () => {
    // Safety check
    if (mapRef.current) return;

    const map = new window.Mappls.Map('map', {
      center: [28.6129, 77.2295], // India Gate
      zoom: 18,
      tilt: 65,      // Max tilt for 3D drama
      heading: 0,
      clickableIcons: false,
    });

    map.addListener('load', function() {
        console.log("Map Loaded");
        setIsMapLoaded(true);

        // A. Enable Textured 3D Landmarks (Red Fort, Taj, etc.)
        if (window.mappls.add3DModel) {
             window.mappls.add3DModel({ map: map });
        }
        
        // B. Switch to Hybrid (Satellite) for realism
        // Note: Some Mappls versions use setTraffic, others just rely on the base tile.
        // If the map looks generic, we can force a layer change here if needed.
        map.setTraffic(false);
    });

    mapRef.current = map;
  };

  // 3. Expose Functions to Parent (App.jsx)
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng) => {
        if (!mapRef.current) return;
        
        // Stop RealView if flying to new place
        if (isRealViewActive) toggleRealView(false);

        // Mappls uses panTo + Zoom for smooth flight
        mapRef.current.panTo({ lat, lng });
        
        setTimeout(() => {
            mapRef.current.setZoom(19);
            mapRef.current.setTilt(65);
        }, 1500); // Wait for pan to finish
    },
    
    startOrbit: () => {
        if (!mapRef.current || orbitRef.current) return;

        let heading = mapRef.current.getHeading() || 0;
        const animate = () => {
            // Stop spinning if user enters Street View
            if (isRealViewActive) return;

            heading = (heading + 0.15) % 360; // 0.15 speed
            mapRef.current.setHeading(heading);
            orbitRef.current = requestAnimationFrame(animate);
        };
        animate();
    },

    enterRealView: (lat, lng) => {
        toggleRealView(true, lat, lng);
    }
  }));

  // 4. Toggle Logic for Street View
  const toggleRealView = (shouldActive, lat, lng) => {
      setIsRealViewActive(shouldActive);

      if (shouldActive) {
          // Initialize or Move RealView
          if (!realViewRef.current) {
              if(!window.Mappls.RealView) {
                  alert("RealView Plugin not loaded yet. Wait a sec and try again.");
                  return;
              }
              
              realViewRef.current = new window.Mappls.RealView({
                  mapId: 'realview-container',
                  position: { lat, lng },
                  unit: 'metric'
              });
          } else {
              // Just move the existing viewer
              realViewRef.current.setPosition({ lat, lng });
          }
      } else {
          // Switching back to Map -> Do nothing special, CSS hides the div
      }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* The 3D Map */}
        <div id="map" style={{ width: '100%', height: '100%' }}></div>

        {/* The Street View Overlay (Top Z-Index) */}
        <div id="realview-container" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 99999, // Super high to cover the map
            display: isRealViewActive ? 'block' : 'none',
            backgroundColor: 'black'
        }}>
            {/* Close Button for RealView */}
            <button 
                onClick={() => setIsRealViewActive(false)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 100000,
                    padding: '10px 20px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                EXIT STREET VIEW
            </button>
        </div>
    </div>
  );
});

export default MapplsMap;