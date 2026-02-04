import React, { useEffect, useRef, useState } from "react";
import TripPlanner from "./TripPlanner";


const MapplsMap = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const orbitIntervalRef = useRef(null);

  const [activeMonument, setActiveMonument] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [plannerStep, setPlannerStep] = useState("CITY"); 
// CITY → PLAN → READY → TOURING
 const [currentDay, setCurrentDay] = useState(null);
 const [isTouring, setIsTouring] = useState(false);


  const [status, setStatus] = useState("Initializing...");
  const [showVideo, setShowVideo] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [tripPlan, setTripPlan] = useState(null);
  


  /* ------------------ MONUMENT DATA ------------------ */
  const monuments = [
    {
      name: "India Gate",
      coords: [77.2295, 28.6129], // [lng, lat]
      desc:
        "India Gate is one of Delhi’s most iconic landmarks and a symbol of sacrifice. Built in 1931, it commemorates Indian soldiers who lost their lives in World War One. Beneath it burns the Amar Jawan Jyoti.",
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

  /* ------------------ NATURAL VOICE ------------------ */
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(v => v.name.includes("Google") && v.lang === "en-IN") ||
      voices.find(v => v.name.includes("Microsoft") && v.lang.includes("en-IN")) ||
      voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
      voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  /* ------------------ DISTANCE (HAVERSINE) ------------------ */
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
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
  const wait = (ms) => new Promise(res => setTimeout(res, ms));
  /* ------------------ TRIP PLANNER ------------------ */

  const generateTripPlan = (days, budget, city) => {
  console.log("Trip Requested:", days, budget, city);

  const perDay = Math.ceil(monuments.length / days);
  const plan = [];

  for (let i = 0; i < days; i++) {
    const dayMonuments = monuments.slice(
      i * perDay,
      (i + 1) * perDay
    );

    if (dayMonuments.length === 0) continue;

    plan.push({
      day: i + 1,
      places: dayMonuments,
      hotel: {
        name: `Comfort Stay - Day ${i + 1}`,
        price: Math.floor(budget / days),
        coords: dayMonuments[0].coords,
        bookingUrl: "https://www.skyscanner.co.in/hotels"
      }
    });
  }

  setTripPlan(plan);
  setPlannerStep("READY");


  // Focus map on first monument of Day 1
  flyToLocation(plan[0].places[0]);
};

const startTour = async () => {
  if (!tripPlan) return;

  setPlannerStep("TOURING");
  setIsTouring(true);

  for (const day of tripPlan) {
    setCurrentDay(day.day);
    await wait(2500);

    for (const place of day.places) {
      await flyToLocation(place, true); // ✅ WAIT FOR MOVE
      startOrbit();
      await wait(5000);
      stopOrbit();
    }
  }

  setCurrentDay(null);
  setIsTouring(false);
  setPlannerStep("READY");
};



  /* ------------------ DRONE FLY ------------------ */
  const flyToLocation = (monument, fromTour = false) => {
  return new Promise((resolve) => {
    if (!mapRef.current) return resolve();

    if (!fromTour) stopOrbit();

    setShowVideo(false);
    setIsCollapsed(false);
    setActiveMonument(monument);
    speak(monument.desc);

    mapRef.current.flyTo({
      center: monument.coords,
      zoom: 18,
      pitch: 75,
      bearing: 20,
      speed: 0.8,
      curve: 1.6
    });

    // ✅ wait for camera movement
    setTimeout(resolve, 2500);
  });
};



  /* ------------------ MAP INIT ------------------ */
  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };

    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => console.warn("Location permission denied"),
        { enableHighAccuracy: true }
      );
    }

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
  center: [78.9629, 20.5937], // India
  zoom: 4,
  pitch: 0
});


      mapRef.current.addListener("load", () => {
        setStatus("Map Ready");

        monuments.forEach(m => {
          const marker = new window.mappls.Marker({
            map: mapRef.current,
            position: { lng: m.coords[0], lat: m.coords[1] }
          });
          marker.addListener("click", () => flyToLocation(m));
          markersRef.current.push(marker);
        });

        if (userLocation) {
          userMarkerRef.current = new window.mappls.Marker({
            map: mapRef.current,
            position: userLocation,
            icon: {
              url: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png"
            }
          });
        }
      });
    };

    initMap();

    return () => {
      stopOrbit();
      markersRef.current.forEach(m => m.remove());
      const s = document.getElementById("mappls-script");
      if (s) document.body.removeChild(s);
    };
  }, []);

  /* ------------------ UI ------------------ */
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />
      {plannerStep === "CITY" && (
  <div style={cityOverlayStyle}>
    <h2>Select a City</h2>

    <button
      onClick={() => {
        setSelectedCity("Delhi");
        setPlannerStep("PLAN");

        mapRef.current.flyTo({
          center: [77.2295, 28.6129],
          zoom: 12,
          speed: 0.8
        });
      }}
    >
      Delhi
    </button>
  </div>
)}


      <div style={statusStyle}>{status}</div>

      {plannerStep !== "CITY" && (
  <div style={sidebarStyle}>
    {/* STEP: PLAN YOUR TRIP */}
{plannerStep === "PLAN" && (
  <>
    <h3 style={{ color: "#00d2ff" }}>🧭 Plan Your Trip</h3>
    <TripPlanner onGenerate={generateTripPlan} />
  </>
)}

{/* STEP: READY / TOURING */}
{(plannerStep === "READY" || plannerStep === "TOURING") && tripPlan && (
  <>
    <h3 style={{ color: "#00d2ff" }}>📍 Your Itinerary</h3>

    {tripPlan.map(day => (
      <div key={day.day}>
        <h4 style={{ color: "#00ffcc" }}>Day {day.day}</h4>

        {day.places.map(p => (
          <button
            key={p.name}
            disabled={plannerStep === "TOURING"}
            onClick={() => flyToLocation(p)}
            style={sidebarBtn(activeMonument?.name === p.name)}
          >
            📍 {p.name}
          </button>
        ))}
      </div>
    ))}

    {plannerStep === "READY" && (
      <button
        onClick={startTour}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          background: "#00d2ff",
          color: "black",
          fontWeight: "bold",
          borderRadius: 10
        }}
      >
        🎥 Experience Tour
      </button>
    )}
  </>
)}

    




</div>
)}

{currentDay && (
  <div style={dayBannerStyle}>
    Day {currentDay}
  </div>
)}



      {activeMonument && (
  <div style={infoCardStyle}>
    {/* Header */}
    <div style={headerStyle}>
      <h2 style={{ margin: 0, color: "#00d2ff" }}>
        {activeMonument.name}
      </h2>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={collapseBtn}
      >
        {isCollapsed ? "➕" : "➖"}
      </button>
    </div>

    {/* Content */}
    {!isCollapsed && (
      <>
        <p style={descStyle}>{activeMonument.desc}</p>

        {userLocation && (
          <p style={{ color: "#00ffcc", marginTop: 8 }}>
            📏 Distance:{" "}
            {getDistanceKm(
              userLocation.lat,
              userLocation.lng,
              activeMonument.coords[1],
              activeMonument.coords[0]
            )}{" "}
            km
          </p>
        )}

        
          
      </>
    )}

    {/* Action Buttons */}
    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 16,
        flexWrap: "wrap"
      }}
    >
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

      <button
        onClick={() => {
          if (!userLocation)
            return alert("Location not available");

          const url = `https://www.google.com/maps/dir/?api=1&destination=${activeMonument.coords[1]},${activeMonument.coords[0]}&travelmode=driving`;
          window.open(url, "_blank");
        }}
        style={btnStyle("#006400")}
      >
        🧭 Navigate
      </button>
    </div>
  </div>
)}


      {showVideo && activeMonument?.video && (
        <div style={videoOverlay} onClick={() => setShowVideo(false)}>
          <video
            src={activeMonument.video}
            autoPlay
            muted
            playsInline
            onEnded={() => setShowVideo(false)}
            style={videoStyle}
          />
        </div>
      )}
    </div>
  );
};

/* ------------------ STYLES ------------------ */
const statusStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "black",
  color: "#00ffcc",
  padding: "6px 12px",
  borderRadius: 6,
  fontSize: 12,
  zIndex: 999
};

const sidebarStyle = {
  position: "absolute",
  top: 20,
  left: 20,
  width: 260,
  background: "rgba(10,10,10,0.95)",
  padding: 15,
  borderRadius: 12,
  zIndex: 10
};

const sidebarBtn = (active) => ({
  width: "100%",
  padding: 12,
  marginBottom: 8,
  background: active ? "#0077b6" : "#222",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  textAlign: "left"
});

const infoCardStyle = {
  position: "absolute",
  bottom: 40,
  right: 40,
  width: 360,
  background: "rgba(0,0,0,0.95)",
  padding: 24,
  borderRadius: 16,
  borderLeft: "5px solid #00d2ff",
  zIndex: 20
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const collapseBtn = {
  background: "none",
  border: "none",
  color: "#00d2ff",
  fontSize: 18,
  cursor: "pointer"
};

const descStyle = {
  color: "#ccc",
  lineHeight: 1.6,
  marginTop: 12
};

const btnStyle = (bg) => ({
  flex: 1,
  padding: 10,
  background: bg,
  color: "white",
  border: "1px solid #555",
  borderRadius: 8,
  cursor: "pointer"
});

const videoOverlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const videoStyle = {
  width: "80%",
  maxWidth: "900px",
  borderRadius: 16,
  boxShadow: "0 30px 80px rgba(0,0,0,0.7)"
};
const cityOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "white"
};

const dayBannerStyle = {
  position: "absolute",
  top: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#00d2ff",
  color: "black",
  padding: "12px 30px",
  borderRadius: 20,
  fontSize: 22,
  fontWeight: "bold",
  zIndex: 9999
};


export default MapplsMap;
