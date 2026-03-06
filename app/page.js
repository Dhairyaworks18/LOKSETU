"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchReports, submitReport, upvoteReport } from "../lib/firebaseHelpers";
import { onAuthChange, signOut } from "../lib/authHelpers";
import { Search, Heart, Share, MapPin, Map, Home, FileText, BarChart2, MoreHorizontal, Camera, X, ChevronDown, Info } from "lucide-react";
import { ToastContainer } from "./components/Toast";

const IssueMap = dynamic(() => import("./components/IssueMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#E8F3F3] animate-pulse rounded-[24px]">Loading Map...</div>
});

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
// Hardcoded REPORTS array removed. Using Firebase fetch object.



const STATUS_STEPS = ["Filed", "Review", "Assigned", "Work", "Resolved"];

function calculateTrustScore(reports, user) {
  if (!reports || !Array.isArray(reports) || !user) return 0;
  const currentUserId = user.uid;
  const currentReporter = user.displayName || user.email;
  let score = 0;
  for (const r of reports) {
    const isOwner = r.userId === currentUserId || r.reporter === currentReporter;
    if (!isOwner) continue;
    if (r.photo && String(r.photo).trim() !== "") score += 10;
    else score += 5;
    if (r.status === "RESOLVED") score += 15;
    score += 2 * (r.upvotes || 0);
    if (r.verified === true) score += 20;
    if (r.status === "FAKE" || r.status === "SPAM") score -= 20;
    else if (r.status === "REJECTED") score -= 10;
    if (!r.location || String(r.location).trim() === "") score -= 5;
  }
  return Math.max(0, score);
}

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
          nodeColor = "bg-white border-2 border-[#F4A261]";
          textColor = "text-[#F4A261]";
        } else if (isWork) {
          // keep default iconNode (null) and colors
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
  const [reportsData, setReportsData] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasOpenedReportFromUrl = useRef(false);

  const showToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchReports().then(setReportsData).catch(console.error);
  }, []);

  useEffect(() => {
    const reportId = searchParams.get("reportId");
    if (!reportId || hasOpenedReportFromUrl.current || reportsData.length === 0) return;
    const rpt = reportsData.find(r => r.id === reportId);
    if (rpt) {
      setSelectedReport(rpt);
      hasOpenedReportFromUrl.current = true;
    }
  }, [reportsData, searchParams]);
  const [activeFilter, setActiveFilter] = useState("All Issues");
  const [activeNav, setActiveNav] = useState("Community Feed");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Sort: Recent First");
  const [locationName, setLocationName] = useState("Detecting location...");
  const [fullLocation, setFullLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTrustScoreInfo, setShowTrustScoreInfo] = useState(false);
  const trustScoreInfoRef = useRef(null);
  const trustScore = useMemo(() => calculateTrustScore(reportsData, user), [reportsData, user]);
  const trustScoreProgress = useMemo(() => {
    if (trustScore >= 850) return 100;
    if (trustScore >= 600) return ((trustScore - 600) / (850 - 600)) * 100;
    if (trustScore >= 300) return ((trustScore - 300) / (600 - 300)) * 100;
    if (trustScore >= 100) return ((trustScore - 100) / (300 - 100)) * 100;
    return (trustScore / 100) * 100;
  }, [trustScore]);

  // File Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportPhoto, setReportPhoto] = useState(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (trustScoreInfoRef.current && !trustScoreInfoRef.current.contains(e.target)) {
        setShowTrustScoreInfo(false);
      }
    };
    if (showTrustScoreInfo) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTrustScoreInfo]);

  const filteredReports = reportsData.filter(rpt => {
    // Nav Filter
    if (activeNav === "My Reports" && rpt.reporter !== (user?.displayName || user?.email)) return false;

    // Status Filter
    if (activeFilter === "Submitted" && rpt.status !== "SUBMITTED") return false;
    if (activeFilter === "In Progress" && rpt.status !== "IN PROGRESS") return false;
    if (activeFilter === "Resolved" && rpt.status !== "RESOLVED") return false;

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!rpt.title.toLowerCase().includes(q) &&
        !rpt.location.toLowerCase().includes(q) &&
        !rpt.description.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "Sort: Most Upvoted") {
      return b.upvotes - a.upvotes;
    }
    // "Sort: Recent First" (default)
    return b.id - a.id;
  });

  const myReportsCount = reportsData.filter(r => r.reporter === (user?.displayName || user?.email)).length;

  const navItems = [
    { label: "Community Feed", icon: <Home className="w-5 h-5" />, badge: null },
    { label: "Issue Map", icon: <Map className="w-5 h-5" />, badge: null },
    { label: "My Reports", icon: <FileText className="w-5 h-5" />, badge: myReportsCount > 0 ? myReportsCount.toString() : null },
  ];

  const filters = ["All Issues", "Submitted", "In Progress", "Resolved"];

  return (
    <div className="flex h-screen w-full bg-[#F5F1EA] font-sora overflow-hidden text-[#1E293B]">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-[260px] shrink-0 h-full bg-[#0F3D3E] flex flex-col items-stretch pt-6 pb-6 shadow-xl z-20">

        {/* Logo Section */}
        <div className="px-6 mb-8">
          <p className="font-sora text-[#F4A261] text-[14px] font-[800] tracking-widest leading-none mb-1">
            लोक सेतु
          </p>
          <h1 className="font-sora text-white text-[32px] font-[800] tracking-[-0.5px] leading-none mb-1">
            LokSetu
          </h1>
          <p className="font-sora text-[#94A3B8] text-[11px] font-[600] tracking-wide">
            Bridge to the People · India
          </p>
        </div>

        <div className="px-6 mb-6">
          <button
            onClick={() => {
              if (!user) {
                showToast("warning", "Sign In Required", "Please sign in to file a report");
                router.push("/login");
                return;
              }
              setShowReportModal(true);
            }}
            className="font-sora w-full bg-[#F4A261] hover:bg-[#E8924F] text-white rounded-[12px] py-3.5 px-4 text-[14px] font-[800] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
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
                onClick={() => {
                  if (item.label === "My Reports" && !user) {
                    showToast("warning", "Sign In Required", "Please sign in to view your reports");
                    router.push("/login");
                    return;
                  }
                  if (item.label === "Issue Map") {
                    setActiveNav("Issue Map");
                    return;
                  }
                  setActiveNav(item.label.trim());
                }}
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
          {user ? (
            <div ref={trustScoreInfoRef} className="relative">
              <div className="flex items-center gap-3 rounded-xl hover:bg-white/5 p-2 transition-colors cursor-pointer -mx-2">
                <div className="w-10 h-10 rounded-full bg-[#F4A261] text-white font-[800] text-lg flex items-center justify-center shadow-inner shrink-0 font-sora">
                  {(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-sora text-white text-[14px] font-[800] truncate">{user?.displayName || user?.email || "User"}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); signOut(); }}
                    className="font-sora text-[#F4A261] hover:text-[#fff] transition-colors text-[10px] font-[800] mt-1"
                  >
                    Sign Out
                  </button>
                  <div className="mt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="font-sora text-[#94A3B8] text-[10px] font-[600]">Trust Score: {trustScore}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowTrustScoreInfo(!showTrustScoreInfo); }}
                        className="p-0.5 rounded hover:bg-white/10 transition-colors"
                        aria-label="Trust Score info"
                      >
                        <Info className="w-3 h-3 text-[#94A3B8]" />
                      </button>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-[#1F7A7A] transition-all" style={{ width: `${Math.min(100, Math.max(0, trustScoreProgress))}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              {showTrustScoreInfo && (
                <div className="absolute bottom-full left-0 right-0 mb-2 w-[260px] bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 z-50 text-left max-h-[320px] overflow-y-auto">
                  <div className="p-5">
                    <h3 className="font-sora text-[16px] font-[800] text-[#1E293B] tracking-tight mb-2">Trust Score</h3>
                    <p className="font-sora text-[12px] text-[#64748B] font-[600] leading-relaxed mb-5">
                      Trust Score reflects how reliable and helpful a citizen&apos;s reports are to the community.
                    </p>

                    <p className="font-sora text-[11px] font-[800] text-[#1E293B] uppercase tracking-wider mb-2">How you earn points</p>
                    <ul className="font-sora text-[12px] text-[#1E293B] font-[600] space-y-2 mb-5">
                      <li className="flex items-start gap-2"><span className="text-[#22A06B] font-[800] shrink-0">+10</span> Report submitted with photo</li>
                      <li className="flex items-start gap-2"><span className="text-[#22A06B] font-[800] shrink-0">+5</span> Report submitted without photo</li>
                      <li className="flex items-start gap-2"><span className="text-[#22A06B] font-[800] shrink-0">+15</span> Report resolved</li>
                      <li className="flex items-start gap-2"><span className="text-[#22A06B] font-[800] shrink-0">+2</span> Someone upvotes your report</li>
                      <li className="flex items-start gap-2"><span className="text-[#22A06B] font-[800] shrink-0">+20</span> Report verified by authorities</li>
                    </ul>

                    <p className="font-sora text-[11px] font-[800] text-[#1E293B] uppercase tracking-wider mb-2">Penalties</p>
                    <ul className="font-sora text-[12px] text-[#1E293B] font-[600] space-y-2 mb-5">
                      <li className="flex items-start gap-2"><span className="text-[#E63946] font-[800] shrink-0">-20</span> Report marked as fake or spam</li>
                      <li className="flex items-start gap-2"><span className="text-[#E63946] font-[800] shrink-0">-10</span> Report rejected by authorities</li>
                      <li className="flex items-start gap-2"><span className="text-[#E63946] font-[800] shrink-0">-5</span> Report submitted without location</li>
                    </ul>

                    <p className="font-sora text-[11px] font-[800] text-[#1E293B] uppercase tracking-wider mb-2">Trust Levels</p>
                    <div className="space-y-1.5">
                      <div className="font-sora text-[12px] font-[600] text-[#1E293B] py-1.5 px-2.5 rounded-lg bg-[#F1F5F9] border border-gray-100">New Member (0–99)</div>
                      <div className="font-sora text-[12px] font-[600] text-[#1E293B] py-1.5 px-2.5 rounded-lg bg-[#F0FDF4] border border-[#bbf7d0]">Active Citizen (100–299)</div>
                      <div className="font-sora text-[12px] font-[600] text-[#1E293B] py-1.5 px-2.5 rounded-lg bg-[#E8F3F3] border border-[#99D4D4]">Trusted Reporter (300–599)</div>
                      <div className="font-sora text-[12px] font-[600] text-[#1E293B] py-1.5 px-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">Community Leader (600–849)</div>
                      <div className="font-sora text-[12px] font-[600] text-[#1E293B] py-1.5 px-2.5 rounded-lg bg-[#F5F9F9] border border-[#1F7A7A]/30">Elite Reporter (850+)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center gap-3 rounded-xl hover:bg-white/5 p-2 transition-colors cursor-pointer -mx-2"
              onClick={() => router.push("/login")}
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 text-white font-[800] text-lg flex items-center justify-center shadow-inner shrink-0 font-sora">
                ?
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-sora text-white text-[14px] font-[800] truncate">Guest Mode</p>
                <div className="font-sora text-[#F4A261] hover:text-[#fff] transition-colors text-[10px] font-[800] mt-1">
                  Sign In
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT (Center) ────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full relative z-10 min-w-[700px] border-r border-gray-200 shadow-sm">

        {/* Top Header */}
        <header className="h-[80px] shrink-0 border-b border-gray-200 flex items-center gap-6 px-8 bg-white z-10">
          {/* Community Feed Title */}
          <div>
            <h2 className="font-sora text-[20px] font-[800] text-[#1E293B] tracking-[-0.5px] leading-none whitespace-nowrap">
              {activeNav === "My Reports" ? "My Reports" : activeNav === "Issue Map" ? "City Issue Map" : activeNav === "Analytics" ? "Performance Analytics" : "Community Feed"}
            </h2>
            <p className="font-sora text-[13px] text-[#64748B] font-[600] mt-0.5">
              {activeNav === "My Reports" ? "Your filed issues" : activeNav === "Issue Map" ? `Live map of reported issues in ${locationName.split(',')[0]}` : activeNav === "Analytics" ? "Civic response insights" : "Civic issues near you"}
            </p>
          </div>

          {/* Search — now takes all remaining space */}
          {(activeNav === "Community Feed" || activeNav === "My Reports") && (
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
              <input
                type="text"
                placeholder="Search reports, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-sora w-full h-11 pl-11 pr-4 bg-[#F5F1EA] border border-gray-200 rounded-full text-[14px] text-charcoal outline-none focus:border-[#1F7A7A] focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
          )}
        </header>

        {/* Dynamic Content based on Nav */}
        {(activeNav === "Community Feed" || activeNav === "My Reports") && (
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

              <div ref={sortDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="font-sora h-10 px-4 bg-white border border-gray-200 text-[#1E293B] text-[13px] font-[700] rounded-lg shadow-sm outline-none min-w-[180px] cursor-pointer focus:ring-0 focus:outline-none focus:border-[#1F7A7A] hover:border-[#1F7A7A] flex items-center justify-between whitespace-nowrap"
                >
                  {sortBy}
                  <ChevronDown className="w-4 h-4 shrink-0 ml-1" />
                </button>
                {sortDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setSortBy("Sort: Recent First"); setSortDropdownOpen(false); }}
                      className="font-sora w-full px-4 py-2.5 text-left text-[13px] font-[700] text-[#1E293B] hover:bg-[#1F7A7A] hover:text-white transition-colors bg-white"
                    >
                      Sort: Recent First
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortBy("Sort: Most Upvoted"); setSortDropdownOpen(false); }}
                      className="font-sora w-full px-4 py-2.5 text-left text-[13px] font-[700] text-[#1E293B] hover:bg-[#1F7A7A] hover:text-white transition-colors bg-white"
                    >
                      Sort: Most Upvoted
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Feed List */}
            <div className="space-y-6">
              {filteredReports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-4">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="font-sora text-[16px] font-[800] text-[#1E293B] mb-1">No reports found</h3>
                  <p className="font-sora text-[13px] text-[#64748B] font-[600]">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
              )}
              {filteredReports.map(rpt => (
                <div
                  key={rpt.id}
                  className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => setSelectedReport(rpt)}
                >

                  {/* Header */}
                  <div className="p-5 pb-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      {rpt.icon}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-sora text-[16px] font-[800] text-[#1E293B] tracking-[-0.5px] leading-tight group-hover:text-[#1F7A7A] transition-colors">
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
                      <span className="font-sora text-[12px] font-[800] text-[#1F7A7A] group-hover:underline">{rpt.location}</span>
                    </div>

                    {/* Description */}
                    <p className="font-sora text-[14px] text-[#1E293B]/80 leading-relaxed font-[600] mb-6 max-w-3xl line-clamp-2">
                      {rpt.description}
                    </p>

                    <p className="font-sora text-[11px] font-[800] text-[#64748B] tracking-wider uppercase mb-1">Report Progress</p>
                    <ProgressTracker step={rpt.progressStep} />
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            showToast("warning", "Sign In Required", "Please sign in to upvote reports");
                            return;
                          }
                          upvoteReport(rpt.id, user.uid).then(() => fetchReports().then(setReportsData)).catch(console.error);
                        }}
                        className="font-sora flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-gray-200 rounded-full px-4 py-1.5 text-[13px] font-[800] text-[#1E293B] transition-colors"
                      >
                        <Heart className="w-4 h-4 fill-[#1F7A7A] text-[#1F7A7A]" /> {rpt.upvotes}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const shareUrl = `${window.location.origin}?reportId=${rpt.id}`;
                          navigator.clipboard.writeText(shareUrl);
                          showToast("info", "Link Copied!", "Report link copied to clipboard");
                        }}
                        className="font-sora flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-[13px] font-[800] text-[#1E293B] transition-colors"
                      >
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
        )}

        {/* Issue Map UI Placeholder */}
        {activeNav === "Issue Map" && (
          <div id="issue-map" className="flex-1 p-8 bg-[#f5f9f9] flex flex-col relative w-full h-full overflow-hidden">
            <IssueMap
              reportsData={reportsData}
              userLocation={fullLocation}
              onReportClick={(rpt) => setSelectedReport(rpt)}
            />
          </div>
        )}

        {/* Analytics UI Placeholder */}
        {activeNav === "Analytics" && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-[#F5F1EA] flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl bg-white rounded-[24px] p-10 shadow-lg border border-gray-100 text-center">
              <BarChart2 className="w-16 h-16 text-[#F4A261] mx-auto mb-4" />
              <h2 className="font-sora text-[24px] font-[800] text-[#1E293B] tracking-tight mb-2">City Analytics Dashboard</h2>
              <p className="font-sora text-[14px] text-[#64748B] font-[600] mb-8">Comprehensive statistics for civic issue resolution in {locationName.split(',')[0]}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] p-6 rounded-[16px] border border-gray-100">
                  <p className="font-sora text-[32px] font-[800] text-[#1E293B] mb-1">3.4 Days</p>
                  <p className="font-sora text-[12px] font-[700] text-[#64748B] uppercase tracking-wider">Avg. Resolution Time</p>
                </div>
                <div className="bg-[#f0fdf4] p-6 rounded-[16px] border border-[#bbf7d0]">
                  <p className="font-sora text-[32px] font-[800] text-[#22A06B] mb-1">94%</p>
                  <p className="font-sora text-[12px] font-[700] text-[#64748B] uppercase tracking-wider">Issues Verified</p>
                </div>
              </div>
            </div>
          </div>
        )}
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
          <button
            onClick={() => {
              if (!user) {
                showToast("warning", "Sign In Required", "Please sign in to file a report");
                router.push('/login');
                return;
              }
              setShowReportModal(true);
            }}
            className="font-sora w-full h-11 bg-[#145A5C] hover:bg-[#0c3132] text-white rounded-[12px] text-[14px] font-[800] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span className="text-[18px] leading-none font-[600]">+</span> File a Report
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-6">

          {/* Map Card - click to open full Issue Map */}
          <div className="mb-8">
            <h3 className="font-sora text-[11px] font-[800] text-[#1E293B] tracking-widest uppercase flex items-center gap-2 mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#E63946]" /> ISSUE MAP — {locationName.split(',')[0].toUpperCase()}
            </h3>
            <div
              className="w-full h-[180px] bg-[#D1E6E2] rounded-[16px] relative overflow-hidden mb-3 cursor-pointer"
              onClick={() => setActiveNav("Issue Map")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveNav("Issue Map")}
              aria-label="Open full Issue Map"
            >
              <IssueMap
                reportsData={reportsData.slice(0, 4)}
                userLocation={fullLocation}
                onReportClick={(rpt) => setSelectedReport(rpt)}
                className="w-full h-full rounded-[16px] pointer-events-none"
              />

              {/* Map overlay pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-lg py-2 px-3 shadow-lg flex items-center gap-2 border border-gray-100 z-20 pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22A06B]" />
                <span className="font-sora text-[11px] font-[800] text-[#1F7A7A]">{reportsData.length} active reports</span>
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
                { id: 1, label: "Potholes", count: 52, icon: "", color: "bg-[#E63946]", width: "80%" },
                { id: 2, label: "Streetlights", count: 38, icon: "", color: "bg-[#F4A261]", width: "65%" },
                { id: 3, label: "Waterlogging", count: 29, icon: "", color: "bg-[#3B82F6]", width: "45%" },
                { id: 4, label: "Garbage", count: 23, icon: "", color: "bg-[#22A06B]", width: "35%" },
              ].map(item => (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-sora flex items-center gap-2 text-[12px] font-[800] text-[#1E293B]">
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
      {
        showLocationModal && (
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
        )
      }

      {/* ── FILE REPORT MODAL ────────────────────────────────────── */}
      {
        showReportModal && (
          <div
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={() => { setShowReportModal(false); setReportFeedback(null); setReportPhoto(null); }}
          >
            <div
              className="bg-white rounded-[16px] shadow-2xl max-w-[500px] w-full p-8 modal-slide-up no-scrollbar overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sora text-[22px] font-[800] text-[#1E293B] tracking-[-0.5px]">
                  File a New Report
                </h3>
                <button
                  onClick={() => { setShowReportModal(false); setReportFeedback(null); setReportPhoto(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Form */}
              <div className="space-y-6">
                {/* Issue Type */}
                <div>
                  <label className="font-sora text-[11px] font-[800] text-[#1E293B] tracking-widest uppercase mb-3 block">
                    Issue Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Pothole', icon: '', label: 'Pothole' },
                      { id: 'Broken Streetlight', icon: '', label: 'Broken Streetlight' },
                      { id: 'Garbage', icon: '', label: 'Garbage' },
                      { id: 'Water Logging', icon: '', label: 'Water Logging' },
                      { id: 'Other', icon: '', label: 'Other / Specify Below' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setReportIssueType(type.id)}
                        className={`font-sora flex flex-col items-center justify-center p-4 rounded-[12px] border ${reportIssueType === type.id ? 'border-[#1F7A7A] bg-[#F5F9F9] shadow-[0_0_0_1px_rgba(31,122,122,0.1)]' : 'border-gray-200 hover:border-gray-300 bg-white'} transition-all ${type.id === 'Other' ? 'col-span-2' : ''}`}
                      >
                        <span className="text-[13px] font-[700] text-[#1E293B] leading-none">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="font-sora text-[11px] font-[800] text-[#1E293B] tracking-widest uppercase mb-2 block">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g., Broken Streetlight on Main Road"
                    className="font-sora w-full h-[48px] px-4 rounded-[12px] bg-[#F8FAFC] border border-gray-200 text-[#1E293B] text-[14px] placeholder:text-gray-400 outline-none focus:border-[#1F7A7A] focus:bg-white transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="font-sora text-[11px] font-[800] text-[#1E293B] tracking-widest uppercase mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    className="font-sora w-full h-[120px] p-4 rounded-[12px] bg-[#F8FAFC] border border-gray-200 text-[#1E293B] text-[14px] placeholder:text-gray-400 outline-none focus:border-[#1F7A7A] focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Photo Evidence */}
                <div>
                  <label className="font-sora text-[11px] font-[800] text-[#1E293B] tracking-widest uppercase mb-2 block">
                    Photo Evidence
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="photo-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setReportPhoto(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {!reportPhoto ? (
                    <button
                      onClick={() => document.getElementById('photo-upload').click()}
                      className="w-full h-[110px] rounded-[16px] border-[2px] border-dashed border-[#1F7A7A]/40 bg-[#F5F9F9] flex flex-col items-center justify-center hover:bg-[#E8F3F3] hover:border-[#1F7A7A]/60 transition-all group"
                    >
                      <Camera className="w-[28px] h-[28px] text-[#1F7A7A] mb-2.5 group-hover:scale-110 transition-transform" />
                      <span className="font-sora text-[14px] font-[800] text-[#1F7A7A] mb-1">Click to upload photo</span>
                      <span className="font-sora text-[11px] text-[#64748B] font-[600]">Camera or gallery · Location auto-captured</span>
                    </button>
                  ) : (
                    <div className="relative w-full h-[140px] rounded-[16px] overflow-hidden border border-gray-200 group">
                      <img src={reportPhoto} alt="Evidence Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => {
                            setReportPhoto(null);
                            document.getElementById('photo-upload').value = '';
                          }}
                          className="font-sora bg-white text-[#E63946] px-4 py-2 rounded-full text-[13px] font-[800] shadow-md flex items-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4" /> Remove Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto Captured Location Label */}
                <div className="flex items-center gap-2 justify-center py-2 bg-gray-50 rounded-[12px] border border-gray-100">
                  <MapPin className="w-3.5 h-3.5 text-[#22A06B]" />
                  <span className="font-sora text-[12px] font-[700] text-[#64748B]">
                    Location auto-tagged near <strong className="text-[#1E293B]">{locationName.split(',')[0]}</strong>
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  onClick={() => {
                    if (!reportIssueType || !reportTitle || !reportDescription) {
                      showToast("error", "Missing Details", "Please fill in all the required fields to submit the report.");
                      return;
                    }

                    // Duplicate Detection Logic 
                    // In a real app, this would use geospatial querying (e.g. PostGIS) to find issues within a 50m radius.
                    // For the demo, we check if the issue type matches any existing report AND if the user's city matches the report's city.
                    const userCity = locationName.split(',')[0].trim().toLowerCase();
                    const duplicateReport = reportsData.find(r => {
                      const isSameType = r.type.toLowerCase() === reportIssueType.toLowerCase() || r.title.toLowerCase().includes(reportTitle.toLowerCase());
                      // Demo fallback: if city isn't Bokaro, we still mock a match for demo purposes if the type matches.
                      const isSameArea = r.city.toLowerCase() === userCity || r.location.toLowerCase().includes(userCity) || true;
                      return isSameType && isSameArea;
                    });

                    if (duplicateReport) {
                      showToast("warning", "Issue Already Reported!", `A "${duplicateReport.type}" was already reported in your area. Upvote the existing report to escalate it!`);
                    } else {
                      (async () => {
                        try {
                          let fileToUpload = null;
                          if (reportPhoto) {
                            fileToUpload = await (await fetch(reportPhoto)).blob();
                          }
                          await submitReport({
                            title: reportTitle,
                            description: reportDescription,
                            issue_type: reportIssueType,
                            location: locationName,
                            state: locationName.split(',')[1]?.trim() || '',
                            reporter: user?.displayName || user?.email || "Anonymous",
                            userId: user?.uid,
                            is_anonymous: false,
                            emoji: reportIssueType === 'Pothole' ? '🚗' : reportIssueType === 'Broken Streetlight' ? '💡' : reportIssueType === 'Garbage' ? '🗑️' : reportIssueType === 'Water Logging' ? '💧' : '📝',
                            photoFile: fileToUpload
                          });
                          const updated = await fetchReports();
                          setReportsData(updated);

                          setShowReportModal(false);
                          setReportIssueType("");
                          setReportTitle("");
                          setReportDescription("");
                          setReportPhoto(null);
                          setActiveNav("My Reports");
                          showToast("success", "Report Submitted!", "Your report is now live. You'll be notified as it progresses.");
                        } catch (err) {
                          console.error(err);
                          showToast("error", "Something went wrong", "Failed to submit report. Please try again in a moment.");
                        }
                      })();
                    }
                  }}
                  className="font-sora w-full h-[52px] bg-[#F4A261] hover:bg-[#E8924F] text-white rounded-[12px] text-[15px] font-[800] shadow-md hover:shadow-lg transition-all"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ── REPORT DETAIL MODAL ────────────────────────────────────── */}
      {
        selectedReport && (
          <div
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="bg-white rounded-[16px] shadow-2xl max-w-[550px] w-full p-8 modal-slide-up no-scrollbar overflow-y-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-sora text-[20px] font-[800] text-[#1E293B] tracking-[-0.5px] flex items-center gap-2">
                  <span className="text-xl leading-none">{selectedReport.icon}</span> Report Detail
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Meta Info */}
              <h2 className="font-sora text-[22px] font-[800] text-[#1E293B] leading-tight mb-3">
                {selectedReport.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mb-5 border-b border-gray-100 pb-5">
                <StatusBadge status={selectedReport.status} />
                <span className="font-sora text-[12px] font-[600] text-[#64748B]">
                  by {selectedReport.reporter} <span className="mx-1">•</span> {selectedReport.timeAgo} <span className="mx-1">•</span> ID: #BKR-2024-10{46 + selectedReport.id}
                </span>
              </div>

              {/* Description */}
              <p className="font-sora text-[14px] text-[#1E293B]/80 font-[600] leading-relaxed mb-4">
                {selectedReport.description}
              </p>

              {/* Location */}
              <div className="flex items-center gap-1.5 mb-8">
                <MapPin className="w-[14px] h-[14px] text-[#1F7A7A]" />
                <span className="font-sora text-[13px] font-[800] text-[#1F7A7A] hover:underline cursor-pointer">{selectedReport.location}</span>
              </div>

              {/* Vertical Timeline */}
              <div className="bg-[#FAF9F6] rounded-[16px] p-6 mb-8 border border-[#F0EBE1]">
                <p className="font-sora text-[11px] font-[800] text-[#64748B] tracking-widest uppercase mb-6">Full Progress Timeline</p>

                <div className="relative border-l-2 border-dashed border-[#E2E8F0] ml-3.5 space-y-8 pb-2">

                  {/* Step 1: Filed */}
                  <div className="relative pl-8">
                    <div className={`absolute -left-[11px] top-0.5 w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${selectedReport.progressStep >= 0 ? "border-[#1F7A7A]" : "border-gray-200"}`}>
                      {selectedReport.progressStep > 0 ? (
                        <div className="w-full h-full bg-[#1F7A7A] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      ) : (
                        <div className="w-2 h-2 bg-[#1F7A7A] rounded-full" />
                      )}
                    </div>
                    <h4 className="font-sora text-[14px] font-[800] text-[#1E293B]">Report Filed</h4>
                    <p className="font-sora text-[12px] font-[600] text-[#64748B] mb-2">
                      {selectedReport.createdAt && typeof selectedReport.createdAt.toDate === "function"
                        ? (() => {
                            const d = selectedReport.createdAt.toDate();
                            const day = d.getDate();
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            const month = months[d.getMonth()];
                            const year = d.getFullYear();
                            let hours = d.getHours();
                            const minutes = d.getMinutes().toString().padStart(2, "0");
                            const ampm = hours >= 12 ? "PM" : "AM";
                            hours = hours % 12 || 12;
                            return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
                          })()
                        : "Report time unavailable"}
                    </p>
                    <div className="bg-white border text-[13px] border-[#E2E8F0] rounded-[8px] p-3 text-[#1E293B] shadow-sm font-sora font-[600]">
                      Submitted by {selectedReport.reporter} with photo evidence.
                    </div>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="relative pl-8">
                    <div className={`absolute -left-[11px] top-0.5 w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${selectedReport.progressStep >= 1 ? "border-[#F4A261]" : "border-gray-200"}`}>
                      {selectedReport.progressStep > 1 ? (
                        <div className="w-full h-full bg-[#1F7A7A] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      ) : selectedReport.progressStep === 1 ? (
                        <span className="text-[10px]">&rarr;</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">2</span>
                      )}
                    </div>
                    <h4 className={`font-sora text-[14px] font-[800] ${selectedReport.progressStep >= 1 ? "text-[#1E293B]" : "text-[#94A3B8]"}`}>Under Review by Authority</h4>
                    <p className="font-sora text-[12px] font-[600] text-[#94A3B8] mb-2">{selectedReport.progressStep >= 1 ? "16 Oct 2024 — In progress" : "Pending"}</p>
                    {selectedReport.progressStep >= 1 && (
                      <div className="bg-white border text-[13px] border-[#E2E8F0] rounded-[8px] p-3 text-[#1E293B] shadow-sm font-sora font-[600]">
                        Sent to {selectedReport.city} Municipal Corporation. Awaiting department acknowledgement.
                      </div>
                    )}
                  </div>

                  {/* Step 3: Assigned */}
                  <div className="relative pl-8">
                    <div className={`absolute -left-[11px] top-0.5 w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${selectedReport.progressStep >= 2 ? "border-[#F4A261]" : "border-gray-200"}`}>
                      {selectedReport.progressStep > 2 ? (
                        <div className="w-full h-full bg-[#1F7A7A] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      ) : selectedReport.progressStep === 2 ? (
                        <span className="text-[10px]">&rarr;</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">3</span>
                      )}
                    </div>
                    <h4 className={`font-sora text-[14px] font-[800] ${selectedReport.progressStep >= 2 ? "text-[#1E293B]" : "text-[#94A3B8]"}`}>Assigned to Department</h4>
                    <p className="font-sora text-[12px] font-[600] text-[#94A3B8]">{selectedReport.progressStep >= 2 ? "Work force designated" : "Pending"}</p>
                  </div>

                  {/* Step 4: Work Order */}
                  <div className="relative pl-8">
                    <div className={`absolute -left-[11px] top-0.5 w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${selectedReport.progressStep >= 3 ? "border-[#F4A261]" : "border-gray-200"}`}>
                      {selectedReport.progressStep > 3 ? (
                        <div className="w-full h-full bg-[#1F7A7A] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      ) : selectedReport.progressStep === 3 ? (
                        <span className="text-[10px]">&rarr;</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">4</span>
                      )}
                    </div>
                    <h4 className={`font-sora text-[14px] font-[800] ${selectedReport.progressStep >= 3 ? "text-[#1E293B]" : "text-[#94A3B8]"}`}>Work Order Issued</h4>
                    <p className="font-sora text-[12px] font-[600] text-[#94A3B8]">{selectedReport.progressStep >= 3 ? "Work initiated on ground" : "Pending"}</p>
                  </div>

                  {/* Step 5: Resolved */}
                  <div className="relative pl-8">
                    <div className={`absolute -left-[11px] top-0.5 w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${selectedReport.progressStep >= 4 ? "border-[#22A06B]" : "border-gray-200"}`}>
                      {selectedReport.progressStep >= 4 ? (
                        <div className="w-full h-full bg-[#22A06B] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">✓</span>
                      )}
                    </div>
                    <h4 className={`font-sora text-[14px] font-[800] ${selectedReport.progressStep >= 4 ? "text-[#1E293B]" : "text-[#94A3B8]"}`}>Issue Resolved</h4>
                    <p className="font-sora text-[12px] font-[600] text-[#94A3B8]">{selectedReport.progressStep >= 4 ? "Case closed and verified" : "Pending"}</p>
                  </div>

                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      showToast("warning", "Sign In Required", "Please sign in to upvote reports");
                      return;
                    }
                    upvoteReport(selectedReport.id, user.uid).then(() => fetchReports().then(data => {
                      setReportsData(data);
                      const updated = data.find(r => r.id === selectedReport.id);
                      if (updated) setSelectedReport(updated);
                    })).catch(console.error);
                  }}
                  className="font-sora flex-1 flex items-center justify-center gap-2 bg-[#F5F9F9] hover:bg-[#E8F3F3] text-[#1F7A7A] rounded-full px-4 py-3.5 text-[15px] font-[800] transition-colors"
                >
                  <Heart className="w-4 h-4 fill-[#1F7A7A]" /> Upvote ({selectedReport.upvotes})
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const shareUrl = `${window.location.origin}?reportId=${selectedReport.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    showToast("info", "Link Copied!", "Report link copied to clipboard");
                  }}
                  className="font-sora flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#1F7A7A] text-[#1F7A7A] rounded-full px-4 py-3.5 text-[15px] font-[800] shadow-[0_4px_12px_rgba(31,122,122,0.1)] transition-colors"
                >
                  <Share className="w-4 h-4" /> Share Report
                </button>
              </div>
            </div>
          </div>
        )
      }

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
