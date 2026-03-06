"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored icons based on status
const createCustomIcon = (status, emoji) => {
    const color = status === 'RESOLVED' ? '#22A06B' : status === 'IN PROGRESS' ? '#F4A261' : '#E63946';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; align-items: center; justify-content: center; font-size: 14px; position: relative; z-index: 10;">${emoji}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
};

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function IssueMap({ reportsData, userLocation, onReportClick, className }) {
    // Center on Bokaro generally if we don't have location
    const [center, setCenter] = useState([23.6693, 86.1511]); // Default Bokaro
    const [zoom, setZoom] = useState(13);

    useEffect(() => {
        if (userLocation?.coordinates) {
            setCenter([userLocation.coordinates.lat, userLocation.coordinates.lon]);
            setZoom(14);
        }
    }, [userLocation]);

    return (
        <div className={className || "w-full h-full bg-[#E8F3F3] rounded-[24px] overflow-hidden border border-gray-200"}>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full z-10" zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <ChangeView center={center} zoom={zoom} />

                {/* User Location Marker */}
                {userLocation?.coordinates && (
                    <Marker
                        position={[userLocation.coordinates.lat, userLocation.coordinates.lon]}
                        icon={L.divIcon({
                            className: 'user-location-icon',
                            html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); position: relative; z-index: 20;">
                       <div style="position: absolute; top: -7px; left: -7px; width: 24px; height: 24px; border-radius: 50%; background-color: #3B82F6; opacity: 0.3; animation: pulse 2s infinite;"></div>
                     </div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })}
                    >
                        <Popup className="font-sora">
                            <span className="font-[800]">You are here</span><br />
                            <span className="text-[12px]">{userLocation.displayName.split(',')[0]}</span>
                        </Popup>
                    </Marker>
                )}

                {/* Report Markers */}
                {reportsData.map((report) => {
                    // Calculate an offset just for demo purposes so dots aren't identical
                    const hashId = (typeof report.id === 'number' ? report.id : 1);
                    const latOffset = (hashId * 0.005) % 0.04 - 0.02;
                    const lonOffset = (hashId * 0.007) % 0.04 - 0.02;

                    const position = [
                        center[0] + latOffset,
                        center[1] + lonOffset
                    ];

                    return (
                        <Marker
                            key={report.id}
                            position={position}
                            icon={createCustomIcon(report.status, report.icon)}
                            eventHandlers={{
                                click: () => onReportClick(report),
                            }}
                        >
                            <Popup className="font-sora">
                                <div className="flex flex-col gap-1 p-1">
                                    <span className="font-[800] text-[14px] text-[#1E293B] flex items-center gap-1">{report.icon} {report.title.substring(0, 25)}...</span>
                                    <span className="text-[12px] text-[#64748B] mb-1">{report.location}</span>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] uppercase font-[800] tracking-wider px-2 py-0.5 rounded ${report.status === 'RESOLVED' ? 'bg-[#F0FDF4] text-[#22A06B]' : report.status === 'IN PROGRESS' ? 'bg-[#FFF7ED] text-[#F4A261]' : 'bg-[#EFF6FF] text-[#3B82F6]'}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
