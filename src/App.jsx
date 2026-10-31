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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50/50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs py-2 px-4 text-center font-semibold tracking-wide flex justify-center items-center gap-4 shadow-sm">
        <span>📍 Grafton Street Area, Dublin</span>
        <span className="hidden sm:inline">•</span>
        <span>Professional Laundry, Dry Cleaning & Precision Alterations</span>
      </div>

      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-sky-200 backdrop-blur-md px-4 sm:px-8 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Prominent Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <img 
              src={logoImage} 
              alt="ALiCo Logo" 
              className="h-14 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-blue-900 tracking-tight">ALiCo</h1>
              <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Laundry & Tailoring Studio</p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="bg-sky-100/80 p-1.5 rounded-2xl border border-sky-200 shadow-inner w-full lg:w-auto">
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-sky-200/60'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('estimator')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'estimator'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-sky-200/60'
                }`}
              >
                Price Estimator
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'tracker'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-sky-200/60'
                }`}
              >
                Live Tracker
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'about'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-sky-200/60'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" /> Studio
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap sm:col-auto col-span-2 ${
                  activeTab === 'menu'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-sky-200/60'
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
            
            {/* HERO BANNER WITH COMMERCIAL LAUNDRY MACHINES & TAILORING MEASURING */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-sky-200 rounded-3xl p-6 sm:p-10 shadow-xl">
              <div className="space-y-6 text-left">
                <span className="inline-flex items-center gap-2 bg-sky-100 text-blue-800 text-xs px-4 py-2 rounded-full font-extrabold uppercase tracking-wider">
                  <Waves className="w-4 h-4 text-blue-600" /> Dublin City Centre Studio
                </span>
                
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Expert Laundry & <span className="text-blue-600">Precision Tailoring</span>
                </h1>
                
                <p className="text-slate-600 text-base leading-relaxed">
                  Welcome to ALiCo. Located near Grafton Street, we combine commercial laundry washers & dryers with professional measuring, marking, and garment alterations.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-blue-600/25 text-sm"
                  >
                    Calculate Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-sky-50 hover:bg-sky-100 border-2 border-blue-200 text-blue-900 font-extrabold px-7 py-3.5 rounded-2xl transition shadow-sm text-sm"
                  >
                    Track My Order
                  </button>
                </div>
              </div>

              {/* Visuals: 1. Wash & Dry Hub | 2. Tailoring Measuring & Sizing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-sky-100 group">
                  <img 
                    src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80" 
                    alt="Commercial laundry washing and drying machines" 
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5"><Waves className="w-3.5 h-3.5 text-cyan-400" /> Wash & Dry Hub</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-sky-100 group">
                  <img 
                    src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80" 
                    alt="Tailor measuring and chalking garment alterations" 
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-cyan-400" /> Measuring & Sizing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-sky-200 hover:border-blue-500 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-blue-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Shirt className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Laundry & Dry Cleaning</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Professional wash, dry & fold by weight, delicate dry cleaning for suits and coats, and deep-clean care for heavy duvets and linens.
                </p>
              </div>

              <div className="bg-white border border-sky-200 hover:border-blue-500 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-blue-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Precision Alterations</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Expert trouser hemming, waist adjustments, jacket resizing, dress refitting, and durable zip replacements done to perfection.
                </p>
              </div>

              <div className="bg-white border border-sky-200 hover:border-blue-500 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-blue-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Live Status Tracker</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Check your ticket code online anytime to instantly view real-time progress updates on when your garments are ready for collection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRICE ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div className="max-w-2xl mx-auto bg-white border border-sky-200 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Transparent Quote Generator</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Interactive Price Estimator</h2>
              <p className="text-slate-600 text-sm">Select your garment or laundry service for an instant price estimate.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">1. Select Garment or Service Category</label>
                <select
                  value={selectedGarment}
                  onChange={(e) => handleGarmentChange(e.target.value)}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 text-slate-900 shadow-inner font-medium"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">2. Select Specific Service / Alteration</label>
                <select
                  value={selectedAlteration}
                  onChange={(e) => handleAlterationChange(e.target.value)}
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-600 text-slate-900 shadow-inner font-medium"
                >
                  {alterationOptions[selectedGarment].map((alt, index) => (
                    <option key={index} value={`${alt.name} (€${alt.price.toFixed(2)})`}>
                      {alt.name} — €{alt.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg shadow-blue-500/20">
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-sky-100">Estimated Price</p>
                  <p className="text-4xl font-extrabold mt-1">€{estimatePrice}</p>
                </div>
                <span className="text-xs text-sky-100 text-right max-w-[190px] leading-relaxed font-medium">
                  Final quotation confirmed upon drop-off at Grafton Street.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ORDER TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-white border border-sky-200 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Live System</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Track Your Order</h2>
              <p className="text-slate-600 text-sm">Enter your ticket number to view real-time status from our shop database.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. 7244"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                className="flex-1 bg-sky-50/50 border border-sky-200 rounded-2xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 uppercase tracking-wider font-bold shadow-inner"
              />
              <button
                type="submit"
                disabled={loadingOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-blue-600/25 disabled:opacity-50 text-sm"
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
              <div className="bg-sky-50/70 border-2 border-blue-300 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                  <span className="font-mono text-blue-900 font-extrabold text-base">Ticket: #{searchedOrder.id}</span>
                  <span className="bg-blue-600 text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm">{searchedOrder.status || 'Pending'}</span>
                </div>
                <div className="space-y-2.5 text-sm font-medium text-slate-700">
                  <p><strong className="text-slate-500">Service:</strong> <span className="text-slate-900">{searchedOrder.service || searchedOrder.item || 'Laundry & Tailoring'}</span></p>
                  <p><strong className="text-slate-500">Phone:</strong> <span className="text-slate-900">{searchedOrder.phone || searchedOrder.phoneNumber || 'N/A'}</span></p>
                  <p><strong className="text-slate-500">Target Ready Date:</strong> <span className="text-blue-700 font-bold">{searchedOrder.date}</span></p>
                  <p><strong className="text-slate-500">Total:</strong> <span className="text-slate-900 font-bold">€{searchedOrder.total || searchedOrder.price || '0.00'}</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT & LOCATION TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 py-2">
            <div>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Dublin Studio</span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">About ALiCo & Location</h2>
              <p className="text-slate-600 text-sm">Visit our workshop in the Grafton Street area or get directions instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-sky-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Studio Location</h3>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                        Grafton Street Area<br />
                        Dublin, Ireland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Working Hours</h3>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                        Monday – Friday: 9:00 AM – 6:30 PM<br />
                        Saturday: 10:00 AM – 5:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Contact Phone</h3>
                      <p className="text-slate-600 text-sm mt-1">+353 (0)1 XXX XXXX</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openNativeMaps}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 mt-6 text-sm"
                >
                  <Navigation className="w-4 h-4" /> Get Directions (Apple / Google Maps)
                </button>
              </div>

              <div className="bg-white border border-sky-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-50/50 z-10 pointer-events-none"></div>

                <div className="relative z-20 flex justify-between items-start">
                  <span className="bg-white border border-sky-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm">
                    📍 Grafton Street, Dublin
                  </span>
                  <span className="bg-blue-600 text-white text-xs px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> Open Now
                  </span>
                </div>

                <div className="relative z-25 my-auto py-10 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xl">
                    <MapPin className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xl">ALiCo Laundry & Tailoring</h4>
                    <p className="text-xs text-blue-600 mt-1 font-bold uppercase tracking-wider">Heart of Dublin City Centre</p>
                  </div>
                </div>

                <div className="relative z-20">
                  <button
                    onClick={openNativeMaps}
                    className="w-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-blue-900 font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Open in Native Maps App <ExternalLink className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRICE MENU TAB */}
        {activeTab === 'menu' && (
          <div className="max-w-3xl mx-auto bg-white border border-sky-200 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Transparent Rates</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Standard Price Menu</h2>
              <p className="text-slate-600 text-sm">Professional laundry care and alterations pricing guide.</p>
            </div>

            <div className="divide-y divide-sky-100 text-sm font-medium">
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Wash, Dry & Fold (Per Kg)</span>
                <span className="font-extrabold text-blue-600 text-base">€6.50</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Dry Cleaning (Standard Suit / Coat)</span>
                <span className="font-extrabold text-blue-600 text-base">€14.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Duvet / Heavy Bedding Care</span>
                <span className="font-extrabold text-blue-600 text-base">€22.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Trousers Hemming / Adjustment</span>
                <span className="font-extrabold text-blue-600 text-base">€12.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Trousers Waist Take-in</span>
                <span className="font-extrabold text-blue-600 text-base">€16.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Jacket Sleeve Shortening</span>
                <span className="font-extrabold text-blue-600 text-base">€22.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Dress Hem Shortening</span>
                <span className="font-extrabold text-blue-600 text-base">€25.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-sky-50/60 px-3 rounded-xl transition">
                <span className="text-slate-800">Zip Replacement (Jacket / Jeans)</span>
                <span className="font-extrabold text-blue-600 text-base">€18.00</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-sky-100 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <p>© {new Date().getFullYear()} ALiCo Master Laundry & Tailoring. Grafton Street Area, Dublin, Ireland.</p>
      </footer>
    </div>
  );
}
