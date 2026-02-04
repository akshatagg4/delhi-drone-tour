# 🌍 GeoYatra

### *From Maps to Memories*

GeoYatra is a **map-first, AI-assisted travel planning and immersive tour experience** designed to help travelers plan smarter, explore deeper, and avoid common travel pitfalls — all in one interactive platform.

Built with a strong focus on **Indian tourism**, GeoYatra combines intelligent trip planning, interactive maps, and guided experiences to transform how users explore cities.

---

## 🚀 Problem Statement

Travel planning today is fragmented:

* Planning happens on one app
* Maps on another
* Bookings elsewhere
* Local experiences are unstructured
* Tourists are vulnerable to overpricing and scams

**GeoYatra solves this by unifying planning, navigation, and experiences into a single map-driven journey.**

---

## 💡 Solution Overview

GeoYatra is divided into **three progressive phases**, each adding more intelligence and value to the travel experience.

---

## 🧭 Phase 1: Smart Trip Planning (Completed)

**User Flow**

1. User selects a city
2. Enters:

   * Number of days
   * Budget
3. GeoYatra generates a **day-wise itinerary** automatically

**Key Features**

* Intelligent distribution of monuments per day
* Budget-aware hotel suggestions
* One-click redirection to hotel booking platforms
* Clean sidebar-based planning UI

---

## 🗺️ Phase 2: Interactive Map & Experience Tour (Completed)

**Map-First Experience**

* Interactive Mappls map
* Monument markers with rich descriptions
* Distance calculation from user’s location
* Audio narration using Web Speech API

### 🎥 Experience Tour Mode

A fully automated, cinematic tour mode:

* Visits monuments day-by-day
* Smooth camera fly-throughs
* Auto narration
* Orbit animations for immersive viewing

This feature allows users to **experience the city virtually before visiting**.

---

## 💰 Phase 3: Price Intelligence & Scam Prevention (Planned)

**Upcoming Features**

* Scan product prices
* Compare with estimated local market value
* Identify potential overpricing
* Crowd-sourced bargaining and scam-alert zones on the map

This phase focuses on **traveler safety and transparency**.

---

## 🧠 Core Features

* 🗺️ Interactive map-based navigation
* 📅 Auto-generated itineraries
* 🎧 Audio-guided monument tours
* 🎥 Cinematic “Experience Tour” mode
* 🏨 Hotel recommendations with booking links
* 📍 Distance & navigation support
* 🧩 Modular, phase-based architecture

---

## 🛠️ Tech Stack

* **Frontend**: React + Vite
* **Maps**: Mappls Maps SDK
* **State Management**: React Hooks
* **Audio**: Web Speech API
* **UI**: Custom dark-themed components
* **Deployment Ready**: Vite-based build

---

## 🏗️ Project Structure

```
src/
 ├── components/
 │   ├── MapplsMap.jsx      # Main map & experience logic
 │   ├── TripPlanner.jsx   # Trip planning form
 ├── assets/
 ├── videos/
 └── App.jsx
```

---

## ⚙️ Setup Instructions

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/geoyatra.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Add your Mappls API key

   ```env
   VITE_MAPPLS_KEY=your_api_key_here
   ```

4. Run the project

   ```bash
   npm run dev
   ```

---

## 🎯 Hackathon Impact

GeoYatra demonstrates:

* Strong **problem–solution fit**
* Scalable architecture
* Practical use of maps + AI
* Clear roadmap beyond MVP
* Real-world applicability for Indian tourism

---

## 👥 Team

**Team Name:** Gravity Code
**Project:** GeoYatra
**Tagline:** *From Maps to Memories*

---

## 🔮 Future Scope

* Multi-language support (Hindi, regional languages)
* AI-generated local storytelling
* Heat-map based bargain zones
* Real-time crowd density
* Offline tour support
* Mobile app version

---

## 📜 License

This project is built for hackathon and educational purposes.


