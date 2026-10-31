import React, { useState } from 'react';
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
  Waves
} from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import logoImage from './logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Price Estimator state
  const [selectedGarment, setSelectedGarment] = useState('trousers');
  const [selectedAlteration, setSelectedAlteration] = useState('Hemming / Length adjustment (€12.00)');
  const [estimatePrice, setEstimatePrice] = useState('12.00');

  // Detailed alteration & laundry options
  const alterationOptions = {
    trousers: [
      { name: 'Hemming / Length adjustment', price: 12.00 },
      { name: 'Waist take-in / Let-out', price: 16.00 },
      { name: 'Zip replacement', price: 15.00 },
      { name: 'Taper legs (Slimming)', price: 18.00 },
      { name: 'New pocket lining', price: 14.00 }
    ],
    jacket: [
      { name: 'Sleeve shortening (Plain cuff)', price: 22.00 },
      { name: 'Sleeve shortening (Working buttonholes)', price: 35.00 },
      { name: 'Take in / Let out side seams', price: 30.00 },
      { name: 'Full jacket resize', price: 45.00 },
      { name: 'New jacket lining', price: 65.00 }
    ],
    dress: [
      { name: 'Hem shortening (Simple / Single layer)', price: 25.00 },
      { name: 'Hem shortening (Multi-layer / Formal)', price: 40.00 },
      { name: 'Take in side seams / Refitting', price: 28.00 },
      { name: 'Strap adjustment', price: 15.00 },
      { name: 'Zip replacement (Invisible zip)', price: 22.00 }
    ],
    shirt: [
      { name: 'Sleeve shortening', price: 18.00 },
      { name: 'Take in side seams (Slim fit)', price: 15.00 },
      { name: 'Darts in back', price: 14.00 },
      { name: 'Collar / Cuff replacement', price: 20.00 }
    ],
    skirt: [
      { name: 'Hem shortening', price: 18.00 },
      { name: 'Waist adjustment', price: 16.00 },
      { name: 'Zip replacement', price: 18.00 }
    ],
    curtains: [
      { name: 'Hemming per metre', price: 15.00 },
      { name: 'Insert curtain tape / Header tape', price: 18.00 },
      { name: 'Width reduction', price: 22.00 }
    ],
    laundry: [
      { name: 'Wash, Dry & Fold (Per Kg)', price: 6.50 },
      { name: 'Dry Cleaning (Standard Suit / Coat)', price: 14.00 },
      { name: 'Duvet / Heavy Bedding Care', price: 22.00 },
      { name: 'Ironing Only Service (Per item)', price: 4.00 }
    ]
  };

  const handleGarmentChange = (garmentKey) => {
    setSelectedGarment(garmentKey);
    const options = alterationOptions[garmentKey];
    if (options && options.length > 0) {
      setSelectedAlteration(`${options[0].name} (€${options[0].price.toFixed(2)})`);
      setEstimatePrice(options[0].price.toFixed(2));
    }
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-blue-950 text-cyan-300 text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-4 border-b border-blue-900">
        <span>📍 Grafton Street Area, Dublin</span>
        <span className="hidden sm:inline">•</span>
        <span>Professional Laundry, Dry Cleaning & Precision Alterations</span>
      </div>

      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-blue-900/50 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center justify-between w-full lg:w-auto cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <div className="h-10 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="ALiCo Logo" 
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <p className="text-[11px] text-cyan-400 font-bold tracking-widest uppercase lg:hidden">Laundry & Tailoring</p>
          </div>

          {/* Professional Blue/Aqua Navigation Bar */}
          <nav className="bg-slate-800 p-1.5 rounded-2xl border border-blue-900/60 shadow-inner w-full lg:w-auto">
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('estimator')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'estimator'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Price Estimator
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'tracker'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Live Tracker
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'about'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" /> Studio
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap sm:col-auto col-span-2 ${
                  activeTab === 'menu'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-16 py-4">
            {/* HERO SECTION */}
            <div className="bg-gradient-to-br from-blue-950 via-slate-800 to-slate-900 border border-blue-900/60 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="max-w-2xl space-y-6 relative z-10 text-left">
                <span className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
                  <Waves className="w-4 h-4 text-cyan-400" /> Dublin's Premier Laundry & Tailoring Hub
                </span>
                
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Expert Laundry Care & <span className="text-cyan-400">Precision Tailoring</span>
                </h1>
                
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                  Welcome to ALiCo. Conveniently located near Grafton Street, we provide professional wash, dry & fold, eco-friendly dry cleaning, and expert garment alterations with real-time digital tracking.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-2xl transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 text-sm"
                  >
                    Calculate Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-8 py-4 rounded-2xl transition shadow-sm text-sm"
                  >
                    Track Your Order
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-blue-900/60 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" /> Premium Fabric Care
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Same-Day Available
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-cyan-400" /> Instant Ticket Tracking
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800/80 border border-blue-900/40 hover:border-cyan-500/50 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-slate-950/20 group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                  <Shirt className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Laundry & Dry Cleaning</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Professional wash, dry & fold by weight, delicate dry cleaning for suits and coats, and deep-clean care for heavy duvets and linens.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-blue-900/40 hover:border-cyan-500/50 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-slate-950/20 group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Precision Alterations</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Expert trouser hemming, waist adjustments, jacket resizing, dress refitting, and durable zip replacements done to perfection.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-blue-900/40 hover:border-cyan-500/50 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-slate-950/20 group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Live Status Tracker</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Check your ticket code online anytime to instantly view real-time progress updates on when your garments are ready for collection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRICE ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div className="max-w-2xl mx-auto bg-slate-800 border border-blue-900/60 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Transparent Quote Generator</span>
              <h2 className="text-3xl font-bold text-white mt-1">Interactive Price Estimator</h2>
              <p className="text-slate-400 text-sm">Select your garment or laundry service for an instant price estimate.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">1. Select Garment or Service Category</label>
                <select
                  value={selectedGarment}
                  onChange={(e) => handleGarmentChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-500 text-white shadow-inner font-medium"
                >
                  <option value="laundry">Laundry & Dry Cleaning Services</option>
                  <option value="trousers">Trousers / Jeans</option>
                  <option value="jacket">Suit Jacket / Blazer</option>
                  <option value="dress">Dress / Formal Wear</option>
                  <option value="shirt">Shirt / Blouse</option>
                  <option value="skirt">Skirt</option>
                  <option value="curtains">Curtains / Home Textiles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">2. Select Specific Service / Alteration</label>
                <select
                  value={selectedAlteration}
                  onChange={(e) => handleAlterationChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-500 text-white shadow-inner font-medium"
                >
                  {alterationOptions[selectedGarment].map((alt, index) => (
                    <option key={index} value={`${alt.name} (€${alt.price.toFixed(2)})`}>
                      {alt.name} — €{alt.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-cyan-200">Estimated Price</p>
                  <p className="text-4xl font-extrabold mt-1">€{estimatePrice}</p>
                </div>
                <span className="text-xs text-slate-100 text-right max-w-[190px] leading-relaxed font-medium">
                  Final quotation confirmed upon drop-off at Grafton Street.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ORDER TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-slate-800 border border-blue-900/60 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Live System</span>
              <h2 className="text-3xl font-bold text-white mt-1">Track Your Order</h2>
              <p className="text-slate-400 text-sm">Enter your ticket number to view real-time status from our shop database.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. 7244"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 uppercase tracking-wider font-bold shadow-inner"
              />
              <button
                type="submit"
                disabled={loadingOrder}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-7 py-3.5 rounded-2xl transition shadow-lg disabled:opacity-50 text-sm"
              >
                {loadingOrder ? 'Searching...' : 'Search Ticket'}
              </button>
            </form>

            {errorMessage && (
              <div className="bg-rose-950/60 border-2 border-rose-800 text-rose-200 rounded-2xl p-4 flex items-center gap-3 text-sm font-medium shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {searchedOrder && (
              <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="font-mono text-cyan-400 font-extrabold text-base">Ticket: #{searchedOrder.id}</span>
                  <span className="bg-cyan-500 text-slate-950 text-xs px-3.5 py-1.5 rounded-full font-extrabold shadow-sm">{searchedOrder.status || 'Pending'}</span>
                </div>
                <div className="space-y-2.5 text-sm font-medium text-slate-300">
                  <p><strong className="text-slate-400">Service:</strong> <span className="text-white">{searchedOrder.service || searchedOrder.item || 'Laundry & Tailoring'}</span></p>
                  <p><strong className="text-slate-400">Phone:</strong> <span className="text-white">{searchedOrder.phone || searchedOrder.phoneNumber || 'N/A'}</span></p>
                  <p><strong className="text-slate-400">Target Ready Date:</strong> <span className="text-cyan-400 font-bold">{searchedOrder.date}</span></p>
                  <p><strong className="text-slate-400">Total:</strong> <span className="text-white font-bold">€{searchedOrder.total || searchedOrder.price || '0.00'}</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT & LOCATION TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 py-2">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Dublin Studio</span>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-1">About ALiCo & Location</h2>
              <p className="text-slate-400 text-sm">Visit our workshop in the Grafton Street area or get directions instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-800 border border-blue-900/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Studio Location</h3>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        Grafton Street Area<br />
                        Dublin, Ireland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Working Hours</h3>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        Monday – Friday: 9:00 AM – 6:30 PM<br />
                        Saturday: 10:00 AM – 5:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Contact Phone</h3>
                      <p className="text-slate-400 text-sm mt-1">+353 (0)1 XXX XXXX</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openNativeMaps}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 px-6 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 mt-6 text-sm"
                >
                  <Navigation className="w-4 h-4" /> Get Directions (Apple / Google Maps)
                </button>
              </div>

              <div className="bg-slate-800 border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-900/20 z-10 pointer-events-none"></div>

                <div className="relative z-20 flex justify-between items-start">
                  <span className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm">
                    📍 Grafton Street, Dublin
                  </span>
                  <span className="bg-cyan-500 text-slate-950 text-xs px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span> Open Now
                  </span>
                </div>

                <div className="relative z-25 my-auto py-10 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
                    <MapPin className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xl">ALiCo Laundry & Tailoring</h4>
                    <p className="text-xs text-cyan-400 mt-1 font-semibold uppercase tracking-wider">Heart of Dublin City Centre</p>
                  </div>
                </div>

                <div className="relative z-20">
                  <button
                    onClick={openNativeMaps}
                    className="w-full bg-slate-900 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Open in Native Maps App <ExternalLink className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRICE MENU TAB */}
        {activeTab === 'menu' && (
          <div className="max-w-3xl mx-auto bg-slate-800 border border-blue-900/60 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Transparent Rates</span>
              <h2 className="text-3xl font-bold text-white mt-1">Standard Price Menu</h2>
              <p className="text-slate-400 text-sm">Professional laundry care and alterations pricing guide.</p>
            </div>

            <div className="divide-y divide-slate-700 text-sm font-medium">
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Wash, Dry & Fold (Per Kg)</span>
                <span className="font-extrabold text-cyan-400 text-base">€6.50</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Dry Cleaning (Standard Suit / Coat)</span>
                <span className="font-extrabold text-cyan-400 text-base">€14.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Duvet / Heavy Bedding Care</span>
                <span className="font-extrabold text-cyan-400 text-base">€22.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Trousers Hemming / Adjustment</span>
                <span className="font-extrabold text-cyan-400 text-base">€12.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Trousers Waist Take-in</span>
                <span className="font-extrabold text-cyan-400 text-base">€16.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Jacket Sleeve Shortening</span>
                <span className="font-extrabold text-cyan-400 text-base">€22.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Dress Hem Shortening</span>
                <span className="font-extrabold text-cyan-400 text-base">€25.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-slate-700/50 px-3 rounded-xl transition">
                <span className="text-white">Zip Replacement (Jacket / Jeans)</span>
                <span className="font-extrabold text-cyan-400 text-base">€18.00</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-blue-900/50 bg-slate-950 py-6 text-center text-xs text-slate-400 font-medium">
        <p>© {new Date().getFullYear()} ALiCo Master Laundry & Tailoring. Grafton Street Area, Dublin, Ireland.</p>
      </footer>
    </div>
  );
}
