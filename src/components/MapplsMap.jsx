import React, { useEffect, useRef, useState } from "react";

const MapplsMap = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const orbitIntervalRef = useRef(null);

  const [activeMonument, setActiveMonument] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [showVideo, setShowVideo] = useState(false);

  // IMPORTANT: coords are [lng, lat]
  const monuments = [
  {
    name: "India Gate",
    coords: [77.2295, 28.6129],
    desc: "India Gate is one of Delhi’s most iconic landmarks and a powerful symbol of sacrifice and remembrance. Built in 1931, the monument was designed by British architect Sir Edwin Lutyens to honor over 84,000 Indian soldiers who lost their lives during World War I and the Third Anglo-Afghan War. Standing 42 meters tall, its design is inspired by ancient Roman triumphal arches, representing victory and honor. Beneath India Gate burns the Amar Jawan Jyoti, an eternal flame dedicated to the unknown soldiers who gave their lives for the nation. Today, India Gate is not just a historic memorial, but a place where history, patriotism, and everyday life come together.",
    video: "/videos/india_gate.mp4"
  },


    {
      name: "Red Fort",
      coords: [77.2410, 28.6562],
      desc: "The Red Fort served as the main residence of the Mughal emperors."
    },
    {
      name: "Qutub Minar",
      coords: [77.1855, 28.5244],
      desc: "Qutub Minar is the tallest brick minaret in the world."
    },
    {
      name: "Humayun's Tomb",
      coords: [77.2507, 28.5933],
      desc: "Humayun's Tomb is the first garden tomb on the Indian subcontinent."
    },
    {
      name: "Lotus Temple",
      coords: [77.2588, 28.5535],
      desc: "The Lotus Temple is known for its distinctive lotus-shaped architecture."
    }
  ];

  /* ------------------ AUDIO ------------------ */
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  /* ------------------ ORBIT ------------------ */
  const stopOrbit = () => {
    if (orbitIntervalRef.current) {
      clearInterval(orbitIntervalRef.current);
      orbitIntervalRef.current = null;
    }
  };

  const startOrbit = () => {
    if (!mapRef.current) return;
    stopOrbit();

    let bearing = mapRef.current.getBearing() || 0;

    orbitIntervalRef.current = setInterval(() => {
      bearing += 2;
      mapRef.current.rotateTo(bearing, { duration: 200 });
    }, 200);
  };

  /* ------------------ DRONE FLY-IN ------------------ */
  const flyToLocation = (monument) => {
    if (!mapRef.current) return;

    stopOrbit();
    setShowVideo(false);
    setActiveMonument(monument);
    speak(monument.desc);

    mapRef.current.flyTo({
      center: monument.coords,
      zoom: 18,
      pitch: 75,
      bearing: 20,
      speed: 0.8,
      curve: 1.6,
      easing: (t) => t
    });
  };

  /* ------------------ MAP INIT ------------------ */
  useEffect(() => {
    setStatus("Loading Map Script...");

    const script = document.createElement("script");
    script.src = `https://apis.mappls.com/advancedmaps/api/${import.meta.env.VITE_MAPPLS_KEY}/map_sdk?layer=vector&v=3.0`;
    script.async = true;
    script.defer = true;
    script.id = "mappls-script";
    document.body.appendChild(script);

    const initMap = () => {
      if (!window.mappls || !window.mappls.Map) {
        setTimeout(initMap, 100);
        return;
      }

      setStatus("Creating Map...");

      mapRef.current = new window.mappls.Map("map", {
        center: [77.2295, 28.6129],
        zoom: 12,
        pitch: 45,
        interactive: true
      });

      mapRef.current.addListener("load", () => {
        setStatus("Map Ready");

        monuments.forEach((m) => {
          const marker = new window.mappls.Marker({
            map: mapRef.current,
            position: { lng: m.coords[0], lat: m.coords[1] }
          });

          marker.addListener("click", () => flyToLocation(m));
          markersRef.current.push(marker);
        });
      });
    };

    initMap();

    return () => {
      stopOrbit();
      markersRef.current.forEach((m) => m.remove());
      const s = document.getElementById("mappls-script");
      if (s) document.body.removeChild(s);
    };
  }, []);

  /* ------------------ UI ------------------ */
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* MAP */}
      <div
        id="map"
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      {/* STATUS */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "black",
          color: "#00ffcc",
          padding: "6px 12px",
          borderRadius: 6,
          fontSize: 12,
          zIndex: 999
        }}
      >
        {status}
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 260,
          background: "rgba(10,10,10,0.95)",
          color: "white",
          borderRadius: 12,
          padding: 15,
          zIndex: 10
        }}
      >
        <h3 style={{ marginBottom: 10, color: "#00d2ff" }}>
          🇮🇳 Delhi Drone Tour
        </h3>

        {monuments.map((m, i) => (
          <button
            key={i}
            onClick={() => flyToLocation(m)}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 8,
              background:
                activeMonument?.name === m.name ? "#0077b6" : "#222",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            📍 {m.name}
          </button>
        ))}
      </div>

      {/* INFO CARD */}
      {activeMonument && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 360,
            background: "rgba(0,0,0,0.95)",
            color: "white",
            borderRadius: 16,
            padding: 24,
            zIndex: 20,
            borderLeft: "5px solid #00d2ff"
          }}
        >
          <h2 style={{ marginBottom: 10, color: "#00d2ff" }}>
            {activeMonument.name}
          </h2>

          <p style={{ color: "#ccc", lineHeight: 1.6 }}>
            {activeMonument.desc}
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
            <button
              onClick={() => speak(activeMonument.desc)}
              style={btnStyle("#222")}
            >
              🔊 Audio
            </button>

            <button
              onClick={() => {
                startOrbit();
                if (activeMonument.video) setShowVideo(true);
              }}
              style={btnStyle("#333")}
            >
              🌀 Orbit
            </button>

            <button onClick={stopOrbit} style={btnStyle("#444")}>
              ⏹ Stop
            </button>
          </div>
        </div>
      )}

      {/* VIDEO OVERLAY */}
      {showVideo && activeMonument?.video && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowVideo(false)}
        >
          <video
            src={activeMonument.video}
            autoPlay
            muted
            playsInline
            onEnded={() => setShowVideo(false)}
            style={{
              width: "80%",
              maxWidth: "900px",
              borderRadius: "16px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)"
            }}
          />
        </div>
      )}
    </div>
  );
};

/* ------------------ BUTTON STYLE ------------------ */
const btnStyle = (bg) => ({
  flex: 1,
  padding: "10px",
  background: bg,
  color: "white",
  border: "1px solid #555",
  borderRadius: "8px",
  cursor: "pointer"
});

export default MapplsMap;
