import { useRef, useCallback, useState } from 'react'
import MapplsMap from './components/MapplsMap'
import './App.css'

const MONUMENTS = [
  {
    id: 'india-gate',
    name: 'India Gate',
    lat: 28.6129,
    lng: 77.2295,
    text: 'The India Gate is a war memorial located astride the Rajpath. It stands as a memorial to 70,000 soldiers of the British Indian Army who died in between 1914 and 1921.',
  },
  {
    id: 'red-fort',
    name: 'Red Fort',
    lat: 28.6562,
    lng: 77.2410,
    text: 'The Red Fort is a historic fort in the city of Delhi in India that served as the main residence of the Mughal Emperors. Emperor Shah Jahan commissioned construction of the Red Fort on 12 May 1638.',
  },
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    lat: 27.1751,
    lng: 78.0421,
    text: 'The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal.',
  },
  {
    id: 'lotus-temple',
    name: 'Lotus Temple',
    lat: 28.5535,
    lng: 77.2588,
    text: 'The Lotus Temple, located in Delhi, India, is a Baháʼí House of Worship that was dedicated in December 1986. Notable for its flowerlike shape, it has become a prominent attraction in the city.',
  },
]

function App() {
  const mapRef = useRef(null)
  const [selectedMonument, setSelectedMonument] = useState(null)
  const [realViewActive, setRealViewActive] = useState(false)

  const handleMonumentClick = useCallback((monument) => {
    const m = mapRef.current

    if (realViewActive && m?.toggleRealView) {
      m.toggleRealView(false)
      setRealViewActive(false)
    }
    setSelectedMonument(monument)

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (!m || !m.flyTo) return

    m.flyTo(monument.lat, monument.lng)

    setTimeout(() => {
      if (m.startOrbit) m.startOrbit()
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(monument.text)
        window.speechSynthesis.speak(u)
      }
    }, 3000)
  }, [realViewActive])

  const handleRealViewToggle = useCallback(() => {
    const m = mapRef.current
    if (!m?.toggleRealView || !selectedMonument) return

    if (realViewActive) {
      m.toggleRealView(false)
      setRealViewActive(false)
    } else {
      m.toggleRealView(true, selectedMonument.lat, selectedMonument.lng)
      setRealViewActive(true)
    }
  }, [selectedMonument, realViewActive])

  return (
    <div className="app">
      <MapplsMap ref={mapRef} />
      <aside className="sidebar" aria-label="Monument list">
        <h2 className="sidebar-title">Monuments</h2>
        <ul className="monument-list">
          {MONUMENTS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className="monument-btn"
                onClick={() => handleMonumentClick(m)}
              >
                {m.name}
              </button>
            </li>
          ))}
        </ul>
        {selectedMonument && (
          <button
            type="button"
            className="monument-btn realview-btn"
            onClick={handleRealViewToggle}
          >
            {realViewActive ? 'Exit Street View' : 'Enter Street View'}
          </button>
        )}
      </aside>
    </div>
  )
}

export default App
