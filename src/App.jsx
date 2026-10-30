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
  ShieldCheck
} from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import logoImage from './logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Price Estimator state
  const [serviceType, setServiceType] = useState('alteration');
  const [garmentType, setGarmentType] = useState('Trousers / Jeans (Hemming / Alteration)');
  const [estimatePrice, setEstimatePrice] = useState('12.00');

  // Order Tracker state
  const [ticketQuery, setTicketQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const handleCalculateEstimate = (e) => {
    e.preventDefault();
    let base = 12;
    if (garmentType.includes('Suit Jacket')) base = 25;
    else if (garmentType.includes('Dress')) base = 25;
    else if (garmentType.includes('Coat')) base = 30;
    else if (garmentType.includes('Curtains')) base = 15;
    else if (garmentType.includes('Dry Cleaning')) base = 14;
    else if (garmentType.includes('Duvet')) base = 22;
    setEstimatePrice(base.toFixed(2));
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    const cleanQuery = ticketQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    setLoadingOrder(true);
    try {
      const docRef = doc(db, 'orders', cleanQuery);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSearchedOrder({
          id: docSnap.id,
          ...docSnap.data()
        });
      } else {
        setSearchedOrder(null);
        alert("Ticket not found. Please check your reference code or contact our Grafton Street shop.");
      }
    } catch (error) {
      console.error("Error searching ticket:", error);
      alert("Error fetching order status. Please try again.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const openNativeMaps = () => {
    const addressQuery = encodeURIComponent('Grafton Street Area, Dublin, Ireland');
    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/60 via-white to-slate-50 text-slate-800 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/90 border-b border-cyan-100 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <div className="h-12 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="ALiCo Logo" 
                className="h-11 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <p className="text-xs text-cyan-700 font-semibold tracking-wider uppercase">Dublin Tailoring & Dry Cleaning</p>
            </div>
          </div>

          <nav className="flex bg-cyan-50/80 p-1.5 rounded-2xl border border-cyan-100 shadow-inner overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-600 hover:text-cyan-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('estimator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'estimator'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-600 hover:text-cyan-900'
              }`}
            >
              Price Estimator
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'tracker'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-600 hover:text-cyan-900'
              }`}
            >
              Live Order Tracker
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-600 hover:text-cyan-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> About & Location
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-600 hover:text-cyan-900'
              }`}
            >
              Price Menu
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-12">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-16 py-4">
            
            {/* Hero Banner with Business Image Context */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6 text-left">
                <span className="inline-flex items-center gap-1.5 bg-cyan-100 text-cyan-800 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Grafton Street Area, Dublin
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Expert Tailoring & <span className="text-cyan-600">Garment Care</span>
                </h1>
                <p className="text-slate-600 text-base leading-relaxed">
                  Welcome to ALiCo. From precision alterations and custom fitting to delicate dry cleaning and laundry services, we bring master craftsmanship to the heart of Dublin.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                  >
                    Calculate Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-white border-2 border-cyan-200 hover:border-cyan-400 text-cyan-800 font-bold px-7 py-3.5 rounded-2xl transition shadow-sm"
                  >
                    Track My Order
                  </button>
                </div>
                <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Professional Finish
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Fast Turnaround
                  </div>
                </div>
              </div>

              {/* Visual Tailoring / Laundry Showcase Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-cyan-100 bg-cyan-900 group">
                <img 
                  src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80" 
                  alt="Tailoring and Alterations Studio" 
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="text-cyan-300 font-semibold text-xs tracking-wider uppercase">Master Craftsmanship</span>
                  <h3 className="text-xl font-bold mt-1">Precision Alterations & Dry Cleaning in Dublin</h3>
                </div>
              </div>
            </div>

            {/* Service Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="bg-white border border-cyan-100 hover:border-cyan-300 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-cyan-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Precision Tailoring</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Expert trouser hemming, suit resizing, dress refitting, jacket alterations, and custom repairs done to perfection.
                </p>
              </div>

              <div className="bg-white border border-cyan-100 hover:border-cyan-300 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-cyan-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition">
                  <Shirt className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Dry Cleaning & Laundry</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Professional delicate dry cleaning, wash, dry & fold services, and deep-clean care for heavy duvets and beddings.
                </p>
              </div>

              <div className="bg-white border border-cyan-100 hover:border-cyan-300 transition p-8 rounded-3xl space-y-4 shadow-xl shadow-cyan-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Live Status Tracker</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Check your ticket code online anytime to see real-time updates on when your garments are ready for collection.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* PRICE ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div className="max-w-2xl mx-auto bg-white border border-cyan-100 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Instant Quote</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Price Estimator</h2>
              <p className="text-slate-500 text-sm">Select your garment or service type to preview estimated pricing.</p>
            </div>

            <form onSubmit={handleCalculateEstimate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Service Category</label>
                <select
                  value={serviceType}
                  onChange={(e) => {
                    setServiceType(e.target.value);
                    if (e.target.value === 'laundry') {
                      setGarmentType('Wash, Dry & Fold (Per Kg)');
                      setEstimatePrice('6.50');
                    } else {
                      setGarmentType('Trousers / Jeans (Hemming / Alteration)');
                      setEstimatePrice('12.00');
                    }
                  }}
                  className="w-full bg-cyan-50/50 border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-800 shadow-inner font-medium"
                >
                  <option value="alteration">Tailoring & Alteration</option>
                  <option value="laundry">Laundry & Dry Cleaning</option>
                </select>
              </div>

              {serviceType === 'alteration' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Garment Type</label>
                  <select
                    value={garmentType}
                    onChange={(e) => {
                      setGarmentType(e.target.value);
                      handleCalculateEstimate({ preventDefault: () => {} });
                    }}
                    className="w-full bg-cyan-50/50 border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-800 shadow-inner font-medium"
                  >
                    <option>Trousers / Jeans (Hemming / Alteration)</option>
                    <option>Suit Jacket / Blazer</option>
                    <option>Dress / Formal Wear</option>
                    <option>Skirt</option>
                    <option>Shirt / Blouse</option>
                    <option>Coat / Jacket</option>
                    <option>Curtains / Home Textiles</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Laundry Service</label>
                  <select
                    value={garmentType}
                    onChange={(e) => {
                      setGarmentType(e.target.value);
                      handleCalculateEstimate({ preventDefault: () => {} });
                    }}
                    className="w-full bg-cyan-50/50 border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-800 shadow-inner font-medium"
                  >
                    <option>Wash, Dry & Fold (Per Kg)</option>
                    <option>Dry Cleaning (Standard Garment)</option>
                    <option>Duvet / Heavy Bedding</option>
                    <option>Ironing Only</option>
                  </select>
                </div>
              )}

              <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg shadow-cyan-500/20">
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-cyan-100">Estimated Price</p>
                  <p className="text-4xl font-extrabold mt-1">€{estimatePrice}</p>
                </div>
                <span className="text-xs text-cyan-100 text-right max-w-[180px] leading-relaxed font-medium">
                  Final quotation confirmed upon in-store inspection.
                </span>
              </div>
            </form>
          </div>
        )}

        {/* ORDER TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-white border border-cyan-100 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Live System</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Track Your Order</h2>
              <p className="text-slate-500 text-sm">Enter your ticket code to view real-time status from our shop database.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. ALT-7842"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                className="flex-1 bg-cyan-50/50 border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-cyan-500 uppercase tracking-wider font-bold shadow-inner"
              />
              <button
                type="submit"
                disabled={loadingOrder}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {loadingOrder ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchedOrder && (
              <div className="bg-cyan-50/60 border-2 border-cyan-200 rounded-2xl p-6 space-y-4 shadow-sm animate-fade-in">
                <div className="flex justify-between items-center pb-3 border-b border-cyan-200">
                  <span className="font-mono text-cyan-900 font-extrabold text-base">Ticket: {searchedOrder.id}</span>
                  <span className="bg-cyan-500 text-white text-xs px-3.5 py-1 rounded-full font-bold shadow-sm">Live Status</span>
                </div>
                <div className="space-y-2.5 text-sm">
                  <p><strong className="text-slate-500">Service:</strong> <span className="text-slate-900 font-semibold">{searchedOrder.service || searchedOrder.item || 'Tailoring & Alterations'}</span></p>
                  <p><strong className="text-slate-500">Current Status:</strong> <span className="text-cyan-700 font-extrabold text-base">{searchedOrder.status || 'In Progress'}</span></p>
                  <p><strong className="text-slate-500">Target Ready Date:</strong> <span className="text-slate-900 font-medium">{searchedOrder.date || searchedOrder.readyDate || 'Ready Soon'}</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT & LOCATION TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 py-2">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Dublin Studio</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">About ALiCo & Location</h2>
              <p className="text-slate-500 text-sm">Visit our workshop in the Grafton Street area or get directions instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Contact & Hours Info */}
              <div className="bg-white border border-cyan-100 rounded-3xl p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Location</h3>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                        Grafton Street Area<br />
                        Dublin, Ireland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
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
                    <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
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
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-6 rounded-2xl transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-6"
                >
                  <Navigation className="w-4 h-4" /> Get Directions (Apple / Google Maps)
                </button>
              </div>

              {/* Interactive Dublin Map View */}
              <div className="bg-white border border-cyan-100 rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 to-teal-50/40 z-10 pointer-events-none"></div>

                <div className="relative z-20 flex justify-between items-start">
                  <span className="bg-white border border-cyan-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm">
                    📍 Grafton Street, Dublin
                  </span>
                  <span className="bg-cyan-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> Open Now
                  </span>
                </div>

                <div className="relative z-25 my-auto py-10 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-cyan-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/30 animate-bounce">
                    <MapPin className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xl">ALiCo Tailoring & Dry Cleaning</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Heart of Dublin City Centre</p>
                  </div>
                </div>

                <div className="relative z-20">
                  <button
                    onClick={openNativeMaps}
                    className="w-full bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-900 font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Open in Native Maps App <ExternalLink className="w-4 h-4 text-cyan-600" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PRICE MENU TAB */}
        {activeTab === 'menu' && (
          <div className="max-w-3xl mx-auto bg-white border border-cyan-100 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Transparent Rates</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Standard Price Menu</h2>
              <p className="text-slate-500 text-sm">Professional alterations and garment care pricing guide.</p>
            </div>

            <div className="divide-y divide-cyan-100 text-sm font-medium">
              <div className="py-4 flex justify-between items-center hover:bg-cyan-50/50 px-3 rounded-xl transition">
                <span className="text-slate-800">Trousers Hemming</span>
                <span className="font-extrabold text-cyan-600 text-base">€12.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-cyan-50/50 px-3 rounded-xl transition">
                <span className="text-slate-800">Zip Replacement (Jacket / Jeans)</span>
                <span className="font-extrabold text-cyan-600 text-base">€18.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-cyan-50/50 px-3 rounded-xl transition">
                <span className="text-slate-800">Waist Take-in / Let-out</span>
                <span className="font-extrabold text-cyan-600 text-base">€16.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-cyan-50/50 px-3 rounded-xl transition">
                <span className="text-slate-800">Dress Shortening / Hemming</span>
                <span className="font-extrabold text-cyan-600 text-base">€25.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-cyan-50/50 px-3 rounded-xl transition">
                <span className="text-slate-800">Sleeve Shortening (Jacket / Coat)</span>
                <span className="font-extrabold text-cyan-600 text-base">€22.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-cyan-50/50 px-3 rounded-xl transition">
                <span className="text-slate-800">Curtain Hemming (per metre)</span>
                <span className="font-extrabold text-cyan-600 text-base">€15.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-cyan-50/50 px-3 rounded-xl transition">
                <span className="text-slate-800">Wash, Dry & Fold (Per Kg)</span>
                <span className="font-extrabold text-cyan-600 text-base">€6.50</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-cyan-100 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <p>© {new Date().getFullYear()} ALiCo Master Tailoring & Garment Care. Grafton Street Area, Dublin, Ireland.</p>
      </footer>
    </div>
  );
}