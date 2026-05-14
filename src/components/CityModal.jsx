import React from 'react';
import { X, Thermometer, Wind, Droplets, Users, Activity, TrendingUp, CircleDollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CityModal = ({ city, onClose }) => {
    const data = city.currentData;

    return (
        <div className="city-modal glass-panel">
            <button className="modal-close" onClick={onClose} title="Close">
                <X size={18} />
            </button>
            
            <div className="flex flex-col gap-3">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-xl font-bold">{city.name}</h2>
                    <p className="text-[10px] text-slate-400">{city.country}</p>
                </div>

                <div className="metrics-grid">
                    <div className="metric-card p-2">
                        <span className="metric-label flex items-center gap-1 text-[9px]">
                            <Thermometer size={10} /> Temp
                        </span>
                        <span className="metric-value text-base">{data?.temp}°C</span>
                    </div>
                    
                    <div className="metric-card p-2">
                        <span className="metric-label flex items-center gap-1 text-[9px]">
                            <Activity size={10} /> AQI
                        </span>
                        <span className={`metric-value text-base aqi-${data?.aqi}`}>
                            {data?.aqiText}
                        </span>
                    </div>

                    <div className="metric-card p-2">
                        <span className="metric-label flex items-center gap-1 text-[9px]">
                            <Users size={10} /> Pop.
                        </span>
                        <span className="metric-value text-base">
                            {(city.population / 1000000).toFixed(1)}M
                        </span>
                    </div>

                    <div className="metric-card p-2">
                        <span className="metric-label flex items-center gap-1 text-[9px]">
                            <CircleDollarSign size={10} /> 1 {city.currencyCode}
                        </span>
                        <span className="metric-value text-base">
                            ₹{data?.inrComparison}
                        </span>
                    </div>
                </div>

                <div className="metric-card p-2">
                    <span className="metric-label flex items-center gap-1 text-[9px] mb-1">
                        <TrendingUp size={10} /> 7-Day Trend
                    </span>
                    <div style={{ width: '100%', height: 50 }}>
                        <ResponsiveContainer>
                            <LineChart data={city.history}>
                                <Line 
                                    type="monotone" 
                                    dataKey="temp" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2} 
                                    dot={false} 
                                />
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                                    labelStyle={{ display: 'none' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-400 opacity-70">
                    <div className="flex items-center gap-1">
                        <Wind size={10} /> {data?.windSpeed} m/s
                    </div>
                    <div className="flex items-center gap-1">
                        <Droplets size={10} /> {data?.humidity}%
                    </div>
                    <div>
                        {new Date(data?.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityModal;
