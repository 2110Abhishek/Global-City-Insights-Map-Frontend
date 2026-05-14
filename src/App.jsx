import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { RefreshCw, Map as MapIcon, Globe as GlobeIcon, Layers } from 'lucide-react';
import CityModal from './components/CityModal';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

// Custom Marker Icon (SVG)
const customIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="marker-pin"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function App() {
  const globeEl = useRef();
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(new Date());
  const [mapMode, setMapMode] = useState('3d'); // '2d' or '3d'
  const [globeSize, setGlobeSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cities`);
      setCities(res.data);
      setLastFetch(new Date());
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching cities:", err);
      setError("Waiting for backend connection...");
    }
  };

  useEffect(() => {
    fetchCities();
    const interval = setInterval(fetchCities, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setGlobeSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mapMode === '3d' && globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, [mapMode, cities]);

  const globeData = cities.map(city => ({
    lat: city.coordinates.lat,
    lng: city.coordinates.lng,
    size: 0.2,
    color: '#60a5fa',
    label: city.name,
    cityData: city
  }));

  if (loading && cities.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <RefreshCw className="animate-spin mr-2" /> Loading Insights...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="overlay-header glass-panel">
        <h1>GLOBAL CITY INSIGHTS</h1>
        <button 
          onClick={() => setMapMode(mapMode === '2d' ? '3d' : '2d')}
          className="toggle-btn"
        >
          {mapMode === '2d' ? <GlobeIcon size={16} /> : <MapIcon size={16} />}
          <span>{mapMode === '2d' ? '3D Globe' : '2D Map'}</span>
        </button>
      </header>

      {mapMode === '3d' ? (
        <Globe
          ref={globeEl}
          width={globeSize.width}
          height={globeSize.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          pointsData={globeData}
          pointAltitude={0.05}
          pointColor="color"
          pointRadius={0.7}
          pointsMerge={true}
          onPointClick={(point) => setSelectedCity(point.cityData)}
          labelsData={globeData}
          labelLat={d => d.lat}
          labelLng={d => d.lng}
          labelText={d => d.label}
          labelSize={2.0}
          labelDotRadius={0.8}
          labelColor={() => '#60a5fa'}
          labelResolution={3}
          onLabelClick={(label) => setSelectedCity(label.cityData)}
        />
      ) : (
        <MapContainer 
          center={[20, 0]} 
          zoom={2.5} 
          scrollWheelZoom={true}
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {cities.map(city => (
            <Marker 
              key={city._id} 
              position={[city.coordinates.lat, city.coordinates.lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => setSelectedCity(city)
              }}
            >
            </Marker>
          ))}
        </MapContainer>
      )}

      {selectedCity && (
        <CityModal 
          city={selectedCity} 
          onClose={() => setSelectedCity(null)} 
        />
      )}

      {error && (
        <div className="absolute bottom-5 left-5 z-[2000] bg-red-900/80 p-3 rounded-lg border border-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="absolute bottom-5 right-5 z-[1000] flex flex-col items-end gap-2">
        <button 
          onClick={fetchCities}
          className="glass-panel p-2 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
        <div className="text-[10px] text-slate-400 bg-black/50 p-2 rounded">
          Last Sync: {lastFetch.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default App;
