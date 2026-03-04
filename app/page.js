"use client";

import { useState, useEffect } from "react";
import { Search, Heart, Share, MapPin, Map, Home, FileText, BarChart2, MoreHorizontal } from "lucide-react";

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
const REPORTS = [
  {
    id: 1,
    type: "Broken Streetlight",
    icon: "💡",
    title: "Broken Streetlight on Station Road",
    reporter: "Rajesh Kumar",
    timeAgo: "165 days ago",
    status: "SUBMITTED",
    location: "Station Road, Near BSL Gate, Bokaro Steel City",
    description:
      "The streetlight near Bokaro Steel Plant gate has been non-functional for over two weeks. This creates safety concerns for shift workers returning home late at night.",
    photo:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    upvotes: 15,
    progressStep: 1, // 0 = Filed, 1 = Review, 2 = Assigned, 3 = Work, 4 = Resolved
    city: "Bokaro",
    state: "Jharkhand",
  },
  {
    id: 2,
    type: "Water Logging",
    icon: "💧",
    title: "Water Logging at Bokaro Steel City Sector 4",
    reporter: "Amit Kumar Singh",
    timeAgo: "176 days ago",
    status: "IN PROGRESS",
    location: "City Centre Sec 4, Bokaro",
    description: "Heavy rain has caused significant water logging near the main intersection. Vehicles are getting stuck.",
    photo:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=2000&q=80",
    upvotes: 9,
    progressStep: 3,
    city: "Bokaro",
    state: "Jharkhand",
  },
];


const STATUS_STEPS = ["Filed", "Review", "Assigned", "Work", "Resolved"];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    SUBMITTED: "bg-[#EFF6FF] text-[#3B82F6]",
    "IN PROGRESS": "bg-[#FFF7ED] text-[#F4A261]",
    RESOLVED: "bg-[#F0FDF4] text-[#22A06B]",
  };
  return (
    <span className={`font-sora text-[10px] uppercase font-[800] tracking-wider px-3 py-1 rounded-md ${styles[status]}`}>
      {status}
    </span>
  );
}

function ProgressTracker({ step }) {
  return (
    <div className="flex items-center w-full max-w-2xl mt-4">
      {STATUS_STEPS.map((label, i) => {
        const isFiled = label === "Filed";
        const isReview = label === "Review";
        const isAssigned = label === "Assigned";
        const isWork = label === "Work";
        const isResolved = label === "Resolved";

        const completed = i < step;
        const active = i === step;
        const isLast = i === STATUS_STEPS.length - 1;

        let iconNode = null;
        let nodeColor = "bg-white border-2 border-gray-200 text-gray-300";
        let textColor = "text-gray-400";

        if (isFiled && (completed || active)) {
          iconNode = (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
          nodeColor = "bg-[#22A06B] border-none";
          textColor = "text-[#22A06B]";
        } else if (isReview && (active)) {
          iconNode = (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          );
          nodeColor = "bg-[#F4A261] border-[#F4A261] border-2 shadow-[0_0_0_4px_rgba(244,162,97,0.15)]";
          textColor = "text-[#F4A261]";
        } else if (isReview && completed) {
          iconNode = (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
          nodeColor = "bg-[#22A06B] border-none";
          textColor = "text-charcoal";
        } else if (isAssigned && completed) {
          iconNode = (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
          nodeColor = "bg-[#22A06B] border-none";
          textColor = "text-charcoal";
        } else if (isAssigned && active) {
          iconNode = <div className="w-1.5 h-1.5 bg-[#F4A261] rounded-full" />;
          nodeColor = "bg-white border-2 border-[#F4A261]";
          textColor = "text-[#F4A261]";
        } else if (isAssigned) {
          iconNode = <div className="w-1 h-1 bg-gray-300 rounded-full" />;
        } else if (isWork && completed) {
          iconNode = (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
          nodeColor = "bg-[#22A06B] border-none";
          textColor = "text-charcoal";
        } else if (isWork && active) {
          iconNode = <span>🔨</span>;
          nodeColor = "bg-white border-2 border-[#F4A261]";
          textColor = "text-[#F4A261]";
        } else if (isWork) {
          iconNode = <span className="text-[10px]">🔨</span>;
        } else if (isResolved && completed) {
          iconNode = (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
          nodeColor = "bg-[#22A06B] border-none";
          textColor = "text-[#22A06B]";
        } else if (isResolved && active) {
          iconNode = (
            <svg className="w-3.5 h-3.5 text-[#22A06B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
          nodeColor = "bg-white border-2 border-[#22A06B]";
          textColor = "text-[#22A06B]";
        } else if (isResolved) {
          iconNode = (
            <svg className="w-3 h-3 text-[#22A06B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
        }

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 relative z-10 w-6">
              <div
                className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all ${nodeColor}`}
              >
                {iconNode}
              </div>
              <span
                className={`font-sora text-[11px] font-[800] absolute top-8 whitespace-nowrap ${textColor}`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-[2px] flex-1 mx-2 -mt-6 ${completed ? "bg-[#22A06B]" : "bg-gray-200"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP PAGE ───────────────────────────────────────────────────────────
export default function LokSetuApp() {
  const [activeFilter, setActiveFilter] = useState("All Issues");
  const [activeNav, setActiveNav] = useState("Community Feed");
  const [locationName, setLocationName] = useState("Detecting location...");
  const [fullLocation, setFullLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Using OpenStreetMap's free Nominatim reverse geocoding API
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                {
                  headers: {
                    'User-Agent': 'LokSetu App'
                  }
                }
              );
              
              if (!response.ok) {
                throw new Error('Failed to fetch location');
              }
              
              const data = await response.json();

              // Store full location data
              setFullLocation({
                displayName: data.display_name || '',
                address: data.address || {},
                coordinates: { lat: latitude, lon: longitude }
              });

              // Try multiple address fields to get the best location name
              const address = data.address || {};
              
              // Prioritize district - check multiple possible fields
              const district = address.district || 
                           address.state_district || 
                           address.county || 
                           address.subdistrict ||
                           address.sub_district;
              
              // City/town fields
              const city = address.city || 
                          address.town || 
                          address.village || 
                          address.municipality ||
                          address.city_district;
              
              const state = address.state || 
                           address.region || 
                           address.province ||
                           address.state_code;
              
              const country = address.country;

              // Build location string with district prioritized
              if (district && state) {
                setLocationName(`${district}, ${state}`);
              } else if (district && country && country !== 'India') {
                // Only use country if it's not India (since we want Indian districts)
                setLocationName(`${district}, ${country}`);
              } else if (city && state) {
                // Fallback to city if district not available
                setLocationName(`${city}, ${state}`);
              } else if (district) {
                setLocationName(district);
              } else if (city && country && country !== 'India') {
                setLocationName(`${city}, ${country}`);
              } else if (state) {
                setLocationName(state);
              } else if (data.display_name) {
                // Parse display_name to extract district/city and state
                const parts = data.display_name.split(',').map(p => p.trim());
                // Look for district/city (usually first or second part) and state
                if (parts.length >= 3) {
                  // Usually format: "City/District, State, Country"
                  setLocationName(`${parts[0]}, ${parts[1]}`);
                } else if (parts.length >= 2) {
                  setLocationName(`${parts[0]}, ${parts[parts.length - 1]}`);
                } else if (parts.length > 0) {
                  setLocationName(parts[0]);
                } else {
                  setLocationName("Location unavailable");
                }
              } else {
                // Last resort: show coordinates
                setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
              }
            } catch (error) {
              console.error("Error fetching location name:", error);
              // Try to get location from IP as fallback
              try {
                const ipResponse = await fetch('https://ipapi.co/json/');
                const ipData = await ipResponse.json();
                // Prioritize district/city and state over country
                if (ipData.city && ipData.region) {
                  setLocationName(`${ipData.city}, ${ipData.region}`);
                } else if (ipData.city && ipData.region_name) {
                  setLocationName(`${ipData.city}, ${ipData.region_name}`);
                } else if (ipData.city) {
                  setLocationName(ipData.city);
                } else if (ipData.region) {
                  setLocationName(ipData.region);
                } else {
                  setLocationName("Location unavailable");
                }
              } catch (ipError) {
                setLocationName("Location unavailable");
              }
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            // Try IP-based location as fallback
            fetch('https://ipapi.co/json/')
              .then(res => res.json())
              .then(data => {
                // Prioritize district/city and state over country
                if (data.city && data.region) {
                  setLocationName(`${data.city}, ${data.region}`);
                } else if (data.city && data.region_name) {
                  setLocationName(`${data.city}, ${data.region_name}`);
                } else if (data.city) {
                  setLocationName(data.city);
                } else if (data.region) {
                  setLocationName(data.region);
                } else {
                  setLocationName("Location unavailable");
                }
              })
              .catch(() => {
                setLocationName("Location unavailable");
              });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        // Fallback to IP-based location if geolocation not supported
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data.city && data.region) {
              setLocationName(`${data.city}, ${data.region}`);
            } else if (data.city) {
              setLocationName(data.city);
            } else {
              setLocationName("Location unavailable");
            }
          })
          .catch(() => {
            setLocationName("Location unavailable");
          });
      }
    };

    fetchLocation();
  }, []);

  const navItems = [
    { label: "Community Feed", icon: <Home className="w-5 h-5" />, badge: null },
    { label: "Issue Map", icon: <Map className="w-5 h-5" />, badge: null },
    { label: "My Reports", icon: <FileText className="w-5 h-5" />, badge: "2" },
    { label: "Analytics", icon: <BarChart2 className="w-5 h-5" />, badge: null },
  ];

  const filters = ["All Issues", "Submitted", "In Progress", "Resolved"];

  return (
    <div className="flex h-screen w-full bg-[#F5F1EA] font-sora overflow-hidden text-[#1E293B]">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-[260px] shrink-0 h-full bg-[#0F3D3E] flex flex-col items-stretch pt-6 pb-6 shadow-xl z-20">

        {/* Logo Section */}
        <div className="px-6 mb-8">
          <p className="font-sora text-[#F4A261] text-[14px] font-[800] tracking-widest leading-none mb-1">
            लोक से तु
          </p>
          <h1 className="font-sora text-white text-[32px] font-[800] tracking-[-0.5px] leading-none mb-1">
            LokSetu
          </h1>
          <p className="font-sora text-[#94A3B8] text-[11px] font-[600] tracking-wide">
            Bridge to the People · India
          </p>
        </div>

        {/* File Report Button */}
        <div className="px-6 mb-6">
          <button className="font-sora w-full bg-[#F4A261] hover:bg-[#E8924F] text-white rounded-[12px] py-3.5 px-4 text-[14px] font-[800] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <span className="text-[18px] leading-none">+</span> File a Report
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className={`w-full flex items-center justify-between px-3 py-[10px] rounded-[10px] text-left transition-all ${isActive
                    ? "bg-[#145A5C] text-white"
                    : "text-[#94A3B8] hover:bg-[#0B2F30] hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-[#1F7A7A]"}>{item.icon}</span>
                  <span className={`font-sora text-[14px] ${isActive ? "font-[700]" : "font-[600]"}`}>
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span className="font-sora bg-[#F4A261] text-white text-[10px] font-[800] w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="px-4 mt-auto border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 rounded-xl hover:bg-white/5 p-2 transition-colors cursor-pointer -mx-2">
            <div className="w-10 h-10 rounded-full bg-[#F4A261] text-white font-[800] text-lg flex items-center justify-center shadow-inner shrink-0 font-sora">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-sora text-white text-[14px] font-[800] truncate">Arjun Sharma</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-sora inline-flex items-center gap-1 border border-[#F4A261]/50 bg-black/20 text-[#F4A261] text-[10px] font-[800] px-2 py-0.5 rounded-[6px]">
                  🛡️ Trust: 847
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT (Center) ────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full relative z-10 min-w-[700px] border-r border-gray-200 shadow-sm">

        {/* Top Header */}
        <header className="h-[80px] shrink-0 border-b border-gray-200 flex items-center gap-6 px-8 bg-white z-10">
          {/* Community Feed Title */}
          <div>
            <h2 className="font-sora text-[20px] font-[800] text-[#1E293B] tracking-[-0.5px] leading-none whitespace-nowrap">
              Community Feed
            </h2>
            <p className="font-sora text-[13px] text-[#64748B] font-[600] mt-0.5">
              Civic issues near you
            </p>
          </div>

          {/* Search — now takes all remaining space */}
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
              <input
                type="text"
                placeholder="Search reports, locations..."
              className="font-sora w-full h-11 pl-11 pr-4 bg-[#F5F1EA] border border-gray-200 rounded-full text-[14px] text-charcoal outline-none focus:border-[#1F7A7A] focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </header>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-[#F5F1EA]">

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="font-sora text-[28px] font-[800] text-[#0F3D3E] leading-none mb-1.5 tracking-[-0.5px]">142</p>
                <p className="font-sora text-[10px] font-[800] text-[#64748B] uppercase tracking-wider leading-tight">Total<br />Reports</p>
              </div>
              <p className="font-sora text-[12px] font-[800] text-[#22A06B] mt-3">↑ 12 this week</p>
            </div>

            <div className="bg-white rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="font-sora text-[28px] font-[800] text-[#F4A261] leading-none mb-1.5 tracking-[-0.5px]">67</p>
                <p className="font-sora text-[10px] font-[800] text-[#64748B] uppercase tracking-wider leading-tight">In<br />Progress</p>
              </div>
              <p className="font-sora text-[12px] font-[800] text-[#F4A261] mt-3">Active cases</p>
            </div>

            <div className="bg-white rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="font-sora text-[28px] font-[800] text-[#0F3D3E] leading-none mb-1.5 tracking-[-0.5px]">48</p>
                <p className="font-sora text-[10px] font-[800] text-[#64748B] uppercase tracking-wider leading-tight">Resolved<br />&nbsp;</p>
              </div>
              <p className="font-sora text-[12px] font-[800] text-[#22A06B] mt-3">34% rate</p>
            </div>

            <div className="bg-white rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="font-sora text-[28px] font-[800] text-[#0F3D3E] leading-none mb-1.5 tracking-[-0.5px]">27</p>
                <p className="font-sora text-[10px] font-[800] text-[#64748B] uppercase tracking-wider leading-tight">Pending<br />&nbsp;</p>
              </div>
              <p className="font-sora text-[12px] font-[600] text-[#64748B] mt-3">Awaiting action</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`font-sora px-5 py-2 rounded-full text-[13px] font-[800] transition-all ${activeFilter === f
                    ? "bg-[#145A5C] text-white shadow-md border border-[#145A5C]"
                    : "bg-white text-[#1E293B] border border-gray-200 hover:bg-gray-50 shadow-sm"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <select className="font-sora h-10 px-4 bg-white border border-gray-200 text-[#1E293B] text-[13px] font-[700] rounded-lg shadow-sm outline-none w-[180px] appearance-none cursor-pointer">
              <option>Sort: Recent First</option>
              <option>Sort: Most Upvoted</option>
            </select>
          </div>

          {/* Feed List */}
          <div className="space-y-6">
            {REPORTS.map(rpt => (
              <div key={rpt.id} className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-200 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 pb-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {rpt.icon}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-sora text-[16px] font-[800] text-[#1E293B] tracking-[-0.5px] leading-tight">
                        {rpt.title}
                      </h3>
                      <StatusBadge status={rpt.status} />
                    </div>
                    <p className="font-sora text-[12px] text-[#64748B] font-[600]">
                      by {rpt.reporter} <span className="mx-1.5">•</span> {rpt.timeAgo}
                    </p>
                  </div>
                </div>

                {/* Simulated Map / Placeholder Banner */}
                <div className="w-full h-[180px] bg-[#DCECE9] relative overflow-hidden flex items-center justify-center border-y border-gray-100">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, #0B2F30 19px, #0B2F30 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #0B2F30 19px, #0B2F30 20px)`
                  }} />
                  <div className="text-4xl filter drop-shadow-md z-10 animate-pulse">{rpt.icon}</div>
                </div>

                {/* Content Body */}
                <div className="p-6">
                  {/* Location Pin Line */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="w-[14px] h-[14px] text-[#E63946]" />
                    <span className="font-sora text-[12px] font-[800] text-[#1F7A7A]">{rpt.location}</span>
                  </div>

                  {/* Description */}
                  <p className="font-sora text-[14px] text-[#1E293B]/80 leading-relaxed font-[600] mb-6 max-w-3xl">
                    {rpt.description}
                  </p>

                  <p className="font-sora text-[11px] font-[800] text-[#64748B] tracking-wider uppercase mb-1">Report Progress</p>
                  <ProgressTracker step={rpt.progressStep} />
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <button className="font-sora flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-gray-200 rounded-full px-4 py-1.5 text-[13px] font-[800] text-[#1E293B] transition-colors">
                      <Heart className="w-4 h-4 fill-[#1F7A7A] text-[#1F7A7A]" /> {rpt.upvotes}
                    </button>
                    <button className="font-sora flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-[13px] font-[800] text-[#1E293B] transition-colors">
                      <Share className="w-4 h-4 text-[#64748B]" /> Share
                    </button>
                  </div>
                  <button className="font-sora text-[12px] font-[700] text-[#64748B] hover:text-[#1E293B] transition-colors flex items-center gap-1">
                    Click for full details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-[352px] w-16 h-16 bg-[#F4A261] hover:bg-[#E8924F] text-white rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center z-50 transition-all hover:scale-110 font-sora group">
          <span className="text-[28px] leading-none font-[800] group-hover:rotate-90 transition-transform">+</span>
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[12px] font-[800] px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-sora shadow-lg">
            File a Report
          </span>
        </button>
      </main>

      {/* ── RIGHT SIDEBAR (Extra Data Layer) ─────────────────────── */}
      <aside className="w-[320px] shrink-0 bg-white h-full overflow-y-auto no-scrollbar flex flex-col">

        {/* Sticky top: Location + File Report */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          {/* Location Pill */}
          <div 
            onClick={() => setShowLocationModal(true)}
            className="h-10 px-4 flex items-center gap-2 bg-[#F5F1EA] border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 transition-colors mb-3"
          >
            <MapPin className="w-4 h-4 text-[#E63946]" />
            <span className="font-sora text-[13px] font-[800] text-[#1F7A7A] truncate max-w-[200px]">{locationName}</span>
          </div>

          {/* File a Report CTA */}
          <button className="font-sora w-full h-11 bg-[#145A5C] hover:bg-[#0c3132] text-white rounded-[12px] text-[14px] font-[800] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
            <span className="text-[18px] leading-none font-[600]">+</span> File a Report
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-6">

        {/* Map Card */}
        <div className="mb-8">
            <h3 className="font-sora text-[11px] font-[800] text-[#1E293B] tracking-widest uppercase flex items-center gap-2 mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#E63946]" /> ISSUE MAP — {locationName.split(',')[0].toUpperCase()}
          </h3>
          <div className="w-full h-[180px] bg-[#D1E6E2] rounded-[16px] relative overflow-hidden mb-3">
            {/* Map grid lines */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, #FFFFFF 19px, #FFFFFF 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #FFFFFF 19px, #FFFFFF 20px)`
            }} />

            {/* Map Pins */}
            <div className="absolute top-[30%] left-[40%] w-3 h-3 bg-[#E63946] rounded-full border-2 border-white shadow-md z-10" />
            <div className="absolute top-[50%] left-[70%] w-3 h-3 bg-[#F4A261] rounded-full border-2 border-white shadow-md z-10" />
            <div className="absolute bottom-[30%] left-[55%] w-3 h-3 bg-[#3B82F6] rounded-full border-2 border-white shadow-md z-10" />
            <div className="absolute top-[25%] right-[20%] w-3 h-3 bg-[#22A06B] rounded-full border-2 border-white shadow-md z-10" />

            {/* Map overlay pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-lg py-2 px-3 shadow-lg flex items-center gap-2 border border-gray-100 z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22A06B]" />
                <span className="font-sora text-[11px] font-[800] text-[#1F7A7A]">4 active reports nearby</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sora text-[10px] font-[800] text-[#64748B]">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#E63946]" /> High Priority</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F4A261]" /> In Progress</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#22A06B]" /> Resolved</span>
          </div>
        </div>

        {/* Issue Breakdown */}
        <div className="mb-8 p-1">
            <h3 className="font-sora text-[11px] font-[800] text-[#1E293B] tracking-widest uppercase flex items-center gap-2 mb-4">
            <BarChart2 className="w-3.5 h-3.5" /> ISSUE BREAKDOWN
          </h3>

          <div className="space-y-4">
            {[
              { id: 1, label: "Potholes", count: 52, icon: "🚗", color: "bg-[#E63946]", width: "80%" },
              { id: 2, label: "Streetlights", count: 38, icon: "💡", color: "bg-[#F4A261]", width: "65%" },
              { id: 3, label: "Waterlogging", count: 29, icon: "💧", color: "bg-[#3B82F6]", width: "45%" },
              { id: 4, label: "Garbage", count: 23, icon: "🗑️", color: "bg-[#22A06B]", width: "35%" },
            ].map(item => (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-1.5">
                    <div className="font-sora flex items-center gap-2 text-[12px] font-[800] text-[#1E293B]">
                    <span className="bg-gray-50 p-1.5 rounded text-sm leading-none border border-gray-100 flex items-center justify-center w-7 h-7">{item.icon}</span>
                    {item.label}
                    </div>
                    <span className="font-sora text-[12px] font-[800] text-[#64748B]">{item.count}</span>
                </div>
                <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        </div>
      </aside>

      {/* Location Details Modal */}
      {showLocationModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLocationModal(false)}
        >
          <div 
            className="bg-white rounded-[16px] shadow-2xl max-w-md w-full p-6 modal-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora text-[18px] font-[800] text-[#1E293B] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E63946]" />
                Your Location
          </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {fullLocation ? (
          <div className="space-y-4">
                {/* Full Address */}
                <div>
                  <p className="font-sora text-[11px] font-[800] text-[#64748B] uppercase tracking-wider mb-2">Full Address</p>
                  <p className="font-sora text-[14px] text-[#1E293B] font-[600] leading-relaxed">
                    {fullLocation.displayName}
                  </p>
                </div>

                {/* Address Details */}
                {fullLocation.address && Object.keys(fullLocation.address).length > 0 && (
                  <div>
                    <p className="font-sora text-[11px] font-[800] text-[#64748B] uppercase tracking-wider mb-2">Address Details</p>
                    <div className="space-y-1.5">
                      {fullLocation.address.house_number && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">House Number:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.house_number}</span>
                        </div>
                      )}
                      {fullLocation.address.road && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">Road:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.road}</span>
                        </div>
                      )}
                      {fullLocation.address.neighbourhood && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">Neighbourhood:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.neighbourhood}</span>
                        </div>
                      )}
                      {fullLocation.address.suburb && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">Suburb:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.suburb}</span>
                        </div>
                      )}
                      {fullLocation.address.city && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">City:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.city}</span>
                        </div>
                      )}
                      {fullLocation.address.district && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">District:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.district}</span>
                        </div>
                      )}
                      {fullLocation.address.state && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">State:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.state}</span>
                        </div>
                      )}
                      {fullLocation.address.postcode && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">Postcode:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.postcode}</span>
                        </div>
                      )}
                      {fullLocation.address.country && (
                        <div className="flex justify-between">
                          <span className="font-sora text-[12px] text-[#64748B]">Country:</span>
                          <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.address.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Coordinates */}
                {fullLocation.coordinates && (
                  <div>
                    <p className="font-sora text-[11px] font-[800] text-[#64748B] uppercase tracking-wider mb-2">Coordinates</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-sora text-[12px] text-[#64748B]">Latitude:</span>
                        <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.coordinates.lat.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sora text-[12px] text-[#64748B]">Longitude:</span>
                        <span className="font-sora text-[12px] font-[600] text-[#1E293B]">{fullLocation.coordinates.lon.toFixed(6)}</span>
                      </div>
                </div>
                </div>
                )}
              </div>
            ) : (
              <p className="font-sora text-[14px] text-[#64748B] font-[600]">
                Location details are being fetched...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
