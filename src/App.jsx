import React, { useState } from 'react';
import { 
  Scissors, 
  Shirt, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Navigation, 
  CheckCircle2, 
  Info,
  Calendar,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Price Estimator state
  const [serviceType, setServiceType] = useState('alteration');
  const [garmentType, setGarmentType] = useState('Trousers / Jeans');
  const [customAlteration, setCustomAlteration] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('12.00');

  // Order Tracker state
  const [ticketQuery, setTicketQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);

  const handleCalculateEstimate = (e) => {
    e.preventDefault();
    // Quick estimation logic based on garment selection
    let base = 12;
    if (garmentType.includes('Suit Jacket')) base = 25;
    else if (garmentType.includes('Dress')) base = 25;
    else if (garmentType.includes('Coat')) base = 30;
    else if (garmentType.includes('Curtains')) base = 15;
    setEstimatePrice(base.toFixed(2));
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    // Simulated order lookup result for demonstration
    setSearchedOrder({
      id: ticketQuery.toUpperCase(),
      service: 'Trousers Hemming & Tailoring',
      status: 'In Progress - Ready by Tomorrow',
      date: '2026-11-02',
      customer: 'Valued Client'
    });
  };

  const openNativeMaps = () => {
    const addressQuery = encodeURIComponent('Grafton Street Area, Dublin, Ireland');
    // Universal URL that triggers Apple Maps on iOS or Google Maps on Android/Desktop
    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg shadow-lg">
              AL
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                ALiCo <span className="text-teal-400 text-xs font-normal px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">Dublin</span>
              </h1>
              <p className="text-xs text-slate-400">Master Tailoring & Garment Care</p>
            </div>
          </div>

          <nav className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-inner overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('estimator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'estimator'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Price Estimator
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'tracker'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Order Tracker
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> About & Location
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Price Menu
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-12 py-6">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider">
                Grafton Street Area, Dublin
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Precision Tailoring & Garment Care
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Welcome to ALiCo. Experience expert craftsmanship, custom alterations, and professional dry cleaning services right in the heart of Dublin.
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => setActiveTab('about')}
                  className="bg-teal-500 text-slate-950 font-bold px-6 py-3 rounded-2xl hover:bg-teal-400 transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> View Location & Hours
                </button>
                <button
                  onClick={() => setActiveTab('estimator')}
                  className="bg-slate-900 border border-slate-700 text-slate-200 font-bold px-6 py-3 rounded-2xl hover:bg-slate-800 transition"
                >
                  Calculate Estimate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Expert Alterations</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  From precision trouser hemming and zip replacements to complex jacket and dress refitting.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Shirt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Laundry & Dry Cleaning</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Professional wash, dry & fold services, delicate dry cleaning, and heavy bedding care.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Live Order Tracking</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Track the real-time progress of your garments anytime with your unique ticket reference code.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRICE ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Instant Price Estimator</h2>
              <p className="text-slate-400 text-sm">Select your garment or service type to preview estimated pricing.</p>
            </div>

            <form onSubmit={handleCalculateEstimate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Service Category</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 text-white shadow-inner"
                >
                  <option value="alteration">Tailoring & Alteration</option>
                  <option value="laundry">Laundry & Dry Cleaning</option>
                </select>
              </div>

              {serviceType === 'alteration' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Garment Type</label>
                  <select
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 text-white shadow-inner"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Laundry Service</label>
                  <select
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 text-white shadow-inner"
                  >
                    <option>Wash, Dry & Fold (Per Kg)</option>
                    <option>Dry Cleaning (Standard Garment)</option>
                    <option>Duvet / Heavy Bedding</option>
                    <option>Ironing Only</option>
                  </select>
                </div>
              )}

              <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase font-semibold text-teal-400 tracking-wider">Estimated Price</p>
                  <p className="text-3xl font-extrabold text-white mt-1">€{estimatePrice}</p>
                </div>
                <span className="text-xs text-slate-400 text-right max-w-[200px]">
                  Final quotation confirmed upon in-store inspection.
                </span>
              </div>
            </form>
          </div>
        )}

        {/* ORDER TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Track Your Order</h2>
              <p className="text-slate-400 text-sm">Enter your ticket code to view current status and ready dates.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. ALT-7842"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 uppercase tracking-wider shadow-inner"
              />
              <button
                type="submit"
                className="bg-teal-500 text-slate-950 font-bold px-6 py-3 rounded-2xl hover:bg-teal-400 transition shadow-lg shadow-teal-500/20"
              >
                Search
              </button>
            </form>

            {searchedOrder && (
              <div className="bg-slate-950 border border-teal-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="font-mono text-teal-400 font-bold text-sm">Ticket: {searchedOrder.id}</span>
                  <span className="bg-teal-500/10 text-teal-300 text-xs px-3 py-1 rounded-full font-medium">Active</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong className="text-slate-400">Service:</strong> {searchedOrder.service}</p>
                  <p><strong className="text-slate-400">Status:</strong> <span className="text-teal-300 font-semibold">{searchedOrder.status}</span></p>
                  <p><strong className="text-slate-400">Target Ready Date:</strong> {searchedOrder.date}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT & LOCATION TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 py-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">About ALiCo & Location</h2>
              <p className="text-slate-400 text-sm">Visit our Dublin studio or get turn-by-turn directions instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Contact & Hours Info */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Location</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Grafton Street Area<br />
                        Dublin, Ireland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Working Hours</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Monday – Friday: 9:00 AM – 6:30 PM<br />
                        Saturday: 10:00 AM – 5:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Contact Phone</h3>
                      <p className="text-slate-400 text-sm mt-1">+353 (0)1 XXX XXXX</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openNativeMaps}
                  className="w-full bg-teal-500 text-slate-950 font-bold py-3.5 px-6 rounded-2xl hover:bg-teal-400 transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 mt-6"
                >
                  <Navigation className="w-4 h-4" /> Get Directions (Apple / Google Maps)
                </button>
              </div>

              {/* Interactive Dublin Map View Placeholder */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-slate-950/40 z-10 pointer-events-none"></div>
                
                {/* Simulated Dublin Map Background Preview */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>

                <div className="relative z-20 flex justify-between items-start">
                  <span className="bg-slate-900/90 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-medium shadow-md">
                    📍 Dublin, Ireland
                  </span>
                  <span className="bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span> Live Pin
                  </span>
                </div>

                <div className="relative z-20 my-auto py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-400 mx-auto shadow-2xl animate-bounce">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">ALiCo Tailoring Studio</h4>
                    <p className="text-xs text-slate-400 mt-1">Grafton Street District, Dublin</p>
                  </div>
                </div>

                <div className="relative z-20">
                  <button
                    onClick={openNativeMaps}
                    className="w-full bg-slate-950 border border-slate-700 hover:border-teal-500 text-slate-200 font-bold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-inner"
                  >
                    Open in Native Maps App <ExternalLink className="w-4 h-4 text-teal-400" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PRICE MENU TAB */}
        {activeTab === 'menu' && (
          <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Standard Price Menu</h2>
              <p className="text-slate-400 text-sm">Transparent pricing guide for professional alterations and care.</p>
            </div>

            <div className="divide-y divide-slate-800 text-sm">
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-200 font-medium">Trousers Hemming</span>
                <span className="font-bold text-teal-400">€12.00</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-200 font-medium">Zip Replacement (Jacket / Jeans)</span>
                <span className="font-bold text-teal-400">€18.00</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-200 font-medium">Waist Take-in / Let-out</span>
                <span className="font-bold text-teal-400">€16.00</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-200 font-medium">Dress Shortening / Hemming</span>
                <span className="font-bold text-teal-400">€25.00</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-200 font-medium">Sleeve Shortening (Jacket / Coat)</span>
                <span className="font-bold text-teal-400">€22.00</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-200 font-medium">Curtain Hemming (per metre)</span>
                <span className="font-bold text-teal-400">€15.00</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-200 font-medium">Wash, Dry & Fold (Per Kg)</span>
                <span className="font-bold text-teal-400">€6.50</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} ALiCo Master Tailoring & Garment Care. Grafton Street Area, Dublin, Ireland.</p>
      </footer>
    </div>
  );
}
