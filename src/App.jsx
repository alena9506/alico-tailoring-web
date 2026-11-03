import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Shirt, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ShieldCheck,
  Waves,
  Star,
  CreditCard,
  Info,
  AlertTriangle
} from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import logoImage from './logo.png';
import tailorImage from './tailor.png';

export default function App() {
  // Remember active tab across refreshes using sessionStorage
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('alico_active_tab') || 'overview';
  });

  useEffect(() => {
    sessionStorage.setItem('alico_active_tab', activeTab);
  }, [activeTab]);

  // Comprehensive fallback structure ensuring categories always appear even before sync
  const [alterationOptions, setAlterationOptions] = useState({
    'Trousers / Jeans': [
      { name: 'Standard Hemming', price: 15.00 },
      { name: 'Original Hemming (Keep Fade)', price: 15.00 },
      { name: 'Zip Runner / Slider Replacement', price: 8.00 },
      { name: 'Taper Legs', price: 18.00 },
      { name: 'Waist Take-in / Let-out', price: 16.00 }
    ],
    'Suit Jacket / Blazer': [
      { name: 'Take in Side Seams', price: 28.00 },
      { name: 'Shorten Length from Bottom', price: 30.00 },
      { name: 'Sleeve Shortening (Plain)', price: 22.00 },
      { name: 'Shoulder Adjustment', price: 45.00 },
      { name: 'Replace Lining', price: 65.00 }
    ],
    'Skirt': [
      { name: 'Hem Shortening', price: 18.00 },
      { name: 'Waist Adjustment', price: 16.00 },
      { name: 'Full Zip Replacement', price: 18.00 }
    ],
    'Dress': [
      { name: 'Hem Shortening (Simple)', price: 25.00 },
      { name: 'Take in Side Seams / Refitting', price: 28.00 },
      { name: 'Strap Adjustment', price: 15.00 }
    ],
    'Laundry & Dry Cleaning': [
      { name: 'Wash, Dry & Fold (Per Kg)', price: 6.50 },
      { name: 'Dry Cleaning (Standard Suit / Coat)', price: 14.00 },
      { name: 'Duvet / Heavy Bedding Care', price: 22.00 }
    ]
  });

  const categories = Object.keys(alterationOptions);
  const [selectedGarment, setSelectedGarment] = useState(categories[0]);
  const [selectedAlteration, setSelectedAlteration] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('0.00');

  // Automatically fetch ALL categories and prices live from Firestore (checking both 'priceBook' and 'prices')
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        let querySnapshot = null;
        const targetCollections = ['priceBook', 'prices', 'services', 'inventory'];

        for (const colName of targetCollections) {
          try {
            const snap = await getDocs(collection(db, colName));
            if (!snap.empty) {
              querySnapshot = snap;
              break;
            }
          } catch (e) {
            // Try next collection
          }
        }

        if (querySnapshot && !querySnapshot.empty) {
          const liveOptions = { ...alterationOptions };

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Support all possible category property names from your ticketing app
            let cat = data.category || data.serviceCategory || data.type || data.group || 'General Services';
            cat = cat.trim();

            if (!liveOptions[cat]) {
              liveOptions[cat] = [];
            }

            const itemName = data.name || data.serviceName || data.title || data.item || 'Service Item';
            const itemPrice = Number(data.price || data.cost || data.amount || 0);

            // Update or add item dynamically
            const existingIndex = liveOptions[cat].findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());
            if (existingIndex >= 0) {
              liveOptions[cat][existingIndex].price = itemPrice;
            } else {
              liveOptions[cat].push({ name: itemName, price: itemPrice });
            }
          });

          setAlterationOptions(liveOptions);
        }
      } catch (err) {
        console.error("Error fetching live prices from Firestore:", err);
      }
    };

    fetchLivePrices();
  }, []);

  // Update selected alteration options when category changes
  useEffect(() => {
    const options = alterationOptions[selectedGarment] || [];
    if (options.length > 0) {
      setSelectedAlteration(`${options[0].name} (€${options[0].price.toFixed(2)})`);
      setEstimatePrice(options[0].price.toFixed(2));
    } else {
      setSelectedAlteration('');
      setEstimatePrice('0.00');
    }
  }, [selectedGarment, alterationOptions]);

  const handleGarmentChange = (garmentKey) => {
    setSelectedGarment(garmentKey);
  };

  const handleAlterationChange = (altString) => {
    setSelectedAlteration(altString);
    const match = altString.match(/€([\d.]+)/);
    if (match && match[1]) {
      setEstimatePrice(match[1]);
    }
  };

  // Order Tracker state
  const [ticketQuery, setTicketQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    const cleanQuery = ticketQuery.trim();
    if (!cleanQuery) return;

    setLoadingOrder(true);
    setErrorMessage('');
    setSearchedOrder(null);

    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      let foundOrder = null;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const details = data.details || {};
        
        const docId = docSnap.id ? docSnap.id.toString().trim() : '';
        const detailsId = details.id !== undefined && details.id !== null ? details.id.toString().trim() : '';
        const tagIdVal = data.tagId !== undefined && data.tagId !== null ? data.tagId.toString().trim() : '';
        const rootId = data.id !== undefined && data.id !== null ? data.id.toString().trim() : '';

        if (
          docId === cleanQuery || 
          detailsId === cleanQuery || 
          tagIdVal === cleanQuery || 
          rootId === cleanQuery ||
          data.tag?.toString().trim() === cleanQuery
        ) {
          const rawDate = details.dueDate || data.dueDate || data.date || data.readyDate;

          foundOrder = {
            id: detailsId || tagIdVal || rootId || docId,
            service: details.serviceType || data.service || 'Laundry & Alterations',
            status: details.status || data.status || 'Pending',
            date: rawDate ? rawDate : 'As agreed in store',
            total: details.total || data.total || '0.00',
            phone: details.phone || data.phone || 'N/A',
            ...data
          };
        }
      });

      if (foundOrder) {
        setSearchedOrder(foundOrder);
      } else {
        setErrorMessage("Ticket not found. Please check your ticket number and try again.");
      }
    } catch (error) {
      console.error("Error searching ticket:", error);
      setErrorMessage("Error fetching order status. Please check your connection.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const openNativeMaps = () => {
    const addressQuery = encodeURIComponent('Grafton Street Area, Dublin, Ireland');
    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/50 via-white to-teal-50/30 text-slate-800 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 text-white text-xs py-2 px-4 text-center font-semibold tracking-wide flex justify-center items-center gap-4 shadow-sm">
        <span>📍 Grafton Street Area, Dublin</span>
        <span className="hidden sm:inline">•</span>
        <span>Strict Policy: All Items Must Be Paid Upfront Upon Drop-Off</span>
      </div>

      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-cyan-100 backdrop-blur-md px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <img 
              src={logoImage} 
              alt="ALiCo Logo" 
              className="h-14 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">ALiCo</h1>
              <p className="text-[11px] text-cyan-600 font-bold uppercase tracking-wider">Laundry & Tailoring Studio</p>
            </div>
          </div>

          <nav className="bg-cyan-50/80 p-1.5 rounded-2xl border border-cyan-100 shadow-inner w-full lg:w-auto">
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('estimator')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'estimator' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
                }`}
              >
                Price Estimator
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'tracker' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
                }`}
              >
                Live Tracker
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'about' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
                }`}
              >
                <Info className="w-3.5 h-3.5 shrink-0" /> About & Policy
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap sm:col-auto col-span-2 ${
                  activeTab === 'menu' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
                }`}
              >
                Price Menu
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-12">
        
        {activeTab === 'overview' && (
          <div className="space-y-12 py-2">
            <div className="bg-gradient-to-r from-teal-800 via-cyan-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-500/30">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                  <AlertTriangle className="w-7 h-7 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="bg-cyan-500/30 text-cyan-200 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-widest">Mandatory Store Policy</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Payment Upfront Is Required</h3>
                  <p className="text-cyan-100/90 text-sm leading-relaxed max-w-2xl font-medium">
                    Please note: No items or garments will be taken, accepted, or processed for laundry or alterations without prior payment upfront upon drop-off. No afterwards payment accepted.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('about')}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl transition shadow-lg text-sm whitespace-nowrap shrink-0"
              >
                View Full Policy
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-cyan-100 rounded-3xl p-6 sm:p-10 shadow-xl">
              <div className="space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-900 text-xs px-4 py-2 rounded-full font-extrabold uppercase tracking-wider border border-cyan-100">
                    <Waves className="w-4 h-4 text-cyan-600" /> Dublin City Centre Studio
                  </span>
                  
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                    <span className="text-emerald-700 font-extrabold">Trustpilot</span>
                    <div className="flex text-amber-400 gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="text-slate-600 font-semibold">5.0</span>
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Expert Laundry & <span className="text-cyan-600">Precision Tailoring</span>
                </h1>
                
                <p className="text-slate-600 text-base leading-relaxed">
                  Welcome to ALiCo. Located near Grafton Street, we combine commercial laundry washers & dryers with professional measuring, marking, and garment alterations.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-600/25 text-sm"
                  >
                    Calculate Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 text-cyan-950 font-extrabold px-7 py-3.5 rounded-2xl transition shadow-sm text-sm"
                  >
                    Track My Order
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-100 group">
                  <img 
                    src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80" 
                    alt="Commercial laundry washing and drying machines" 
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5"><Waves className="w-3.5 h-3.5 text-cyan-400" /> Wash & Dry Hub</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-100 group">
                  <img 
                    src={tailorImage} 
                    alt="Professional tailor measuring and marking denim with chalk" 
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-cyan-400" /> Measuring & Sizing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'estimator' && (
          <div className="max-w-2xl mx-auto bg-white border border-cyan-100 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Live Synchronized Rates</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Interactive Price Estimator</h2>
              <p className="text-slate-600 text-sm">Select your garment or laundry service for an instant price estimate.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">1. Select Garment or Service Category</label>
                <select
                  value={selectedGarment}
                  onChange={(e) => handleGarmentChange(e.target.value)}
                  className="w-full bg-cyan-50/50 border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-600 text-slate-900 shadow-inner font-medium"
                >
                  {Object.keys(alterationOptions).map((catName) => (
                    <option key={catName} value={catName}>{catName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">2. Select Specific Service / Alteration</label>
                <select
                  value={selectedAlteration}
                  onChange={(e) => handleAlterationChange(e.target.value)}
                  className="w-full bg-cyan-50/50 border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-600 text-slate-900 shadow-inner font-medium"
                >
                  {(alterationOptions[selectedGarment] || []).map((alt, index) => (
                    <option key={index} value={`${alt.name} (€${alt.price.toFixed(2)})`}>
                      {alt.name} — €{alt.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg shadow-cyan-500/20">
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-cyan-100">Estimated Price</p>
                  <p className="text-4xl font-extrabold mt-1">€{estimatePrice}</p>
                </div>
                <span className="text-xs text-cyan-100 text-right max-w-[190px] leading-relaxed font-medium">
                  Payment is required upfront upon drop-off at Grafton Street.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-white border border-cyan-100 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Live System</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Track Your Order</h2>
              <p className="text-slate-600 text-sm">Enter your ticket number to view real-time status from our shop database.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. 7244"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                className="flex-1 bg-cyan-50/50 border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 uppercase tracking-wider font-bold shadow-inner"
              />
              <button
                type="submit"
                disabled={loadingOrder}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-600/25 disabled:opacity-50 text-sm"
              >
                {loadingOrder ? 'Searching...' : 'Search Ticket'}
              </button>
            </form>

            {errorMessage && (
              <div className="bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center gap-3 text-sm font-medium shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {searchedOrder && (
              <div className="bg-cyan-50/70 border-2 border-cyan-300 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-cyan-200">
                  <span className="font-mono text-cyan-950 font-extrabold text-base">Ticket: #{searchedOrder.id}</span>
                  <span className="bg-cyan-600 text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm">{searchedOrder.status || 'Pending'}</span>
                </div>
                <div className="space-y-2.5 text-sm font-medium text-slate-700">
                  <p><strong className="text-slate-500">Service:</strong> <span className="text-slate-900">{searchedOrder.service || searchedOrder.item || 'Laundry & Tailoring'}</span></p>
                  <p><strong className="text-slate-500">Phone:</strong> <span className="text-slate-900">{searchedOrder.phone || searchedOrder.phoneNumber || 'N/A'}</span></p>
                  <p><strong className="text-slate-500">Target Ready Date:</strong> <span className="text-cyan-700 font-bold">{searchedOrder.date}</span></p>
                  <p><strong className="text-slate-500">Total:</strong> <span className="text-slate-900 font-bold">€{searchedOrder.total || searchedOrder.price || '0.00'}</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 py-2">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Dublin Studio & Policies</span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">About ALiCo & Store Policy</h2>
              <p className="text-slate-600 text-sm">Learn more about our craftsmanship and our mandatory upfront payment policy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-cyan-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-cyan-600" /> Master Tailoring & Laundry
                    </h3>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                      ALiCo is Dublin's premier destination for expert garment care, precision measuring, and professional alterations. Located conveniently near Grafton Street, our workshop handles everything from delicate dry cleaning to complex suit refitting.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-600 shrink-0" /> Grafton Street Area, Dublin, Ireland</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-600 shrink-0" /> Mon – Fri: 9:00 AM – 6:30 PM, Sat: 10:00 AM – 5:00 PM</p>
                  </div>
                </div>

                <button
                  onClick={openNativeMaps}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 mt-6 text-sm"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </button>
              </div>

              <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden border border-cyan-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <CreditCard className="w-32 h-32" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white">Mandatory Upfront Policy</h3>
                    <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider mt-1">Payment Upon Drop-Off</p>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    Please note that **all items and garments brought into ALiCo must be paid for upfront** at the time of drop-off. 
                  </p>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-xs text-cyan-100 space-y-2">
                    <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> No items will be taken or processed for laundry or alterations without prior upfront payment.</p>
                    <p>We accept all major credit/debit cards and contactless payments in-store.</p>
                  </div>
                </div>

                <div className="relative z-10 pt-2">
                  <span className="text-xs text-slate-400 block text-center font-medium">Thank you for your cooperation and trust in ALiCo.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="max-w-3xl mx-auto bg-white border border-cyan-100 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Live Synchronized Rates</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Standard Price Menu</h2>
              <p className="text-slate-600 text-sm">Professional laundry care and alterations pricing guide. (Payment required upfront).</p>
            </div>

            <div className="divide-y divide-cyan-50 text-sm font-medium">
              {Object.entries(alterationOptions).map(([catKey, items]) => (
                <div key={catKey} className="py-4 space-y-2">
                  <h3 className="font-extrabold text-cyan-900 text-sm uppercase tracking-wider bg-cyan-50/80 px-3 py-1.5 rounded-lg">{catKey}</h3>
                  {items.map((item, idx) => (
                    <div key={`${catKey}-${idx}`} className="py-2.5 flex justify-between items-center hover:bg-cyan-50/40 px-3 rounded-xl transition">
                      <span className="text-slate-800">{item.name}</span>
                      <span className="font-extrabold text-cyan-600 text-base">€{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-cyan-100 bg-white py-6 text-center text-xs text-slate-500 font-medium space-y-1">
        <p>© {new Date().getFullYear()} ALiCo Master Laundry & Tailoring. Grafton Street Area, Dublin, Ireland.</p>
        <p className="text-teal-700 font-bold">Strict Policy Reminder: All items must be paid upfront upon drop-off.</p>
      </footer>
    </div>
  );
}
