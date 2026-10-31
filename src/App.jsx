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
  Flame
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

  // Detailed alteration options per garment type
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
            service: details.serviceType || data.service || 'Alterations & Tailoring',
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
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2A29] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-white">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1C1A19] text-[#EFECE6] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-4">
        <span>📍 Grafton Street Area, Dublin</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Master Tailoring, Alterations & Professional Laundry</span>
      </div>

      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 border-b border-[#E6DFD5] backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center justify-between w-full lg:w-auto cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <div className="h-10 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="ALiCo Logo" 
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <p className="text-[11px] text-[#A3703E] font-bold tracking-widest uppercase lg:hidden">Dublin Tailoring & Laundry</p>
          </div>

          {/* Boutique Artisan Navigation */}
          <nav className="bg-[#F4EFEB] p-1.5 rounded-2xl border border-[#E6DFD5] shadow-inner w-full lg:w-auto">
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-[#1C1A19] text-white shadow-md'
                    : 'text-[#615B55] hover:text-[#1C1A19]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('estimator')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'estimator'
                    ? 'bg-[#1C1A19] text-white shadow-md'
                    : 'text-[#615B55] hover:text-[#1C1A19]'
                }`}
              >
                Estimator
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'tracker'
                    ? 'bg-[#1C1A19] text-white shadow-md'
                    : 'text-[#615B55] hover:text-[#1C1A19]'
                }`}
              >
                Live Tracker
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'about'
                    ? 'bg-[#1C1A19] text-white shadow-md'
                    : 'text-[#615B55] hover:text-[#1C1A19]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" /> Studio
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap sm:col-auto col-span-2 ${
                  activeTab === 'menu'
                    ? 'bg-[#1C1A19] text-white shadow-md'
                    : 'text-[#615B55] hover:text-[#1C1A19]'
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-left">
                <span className="inline-flex items-center gap-1.5 bg-[#F4EFEB] border border-[#E6DFD5] text-[#A3703E] text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                  <Scissors className="w-3.5 h-3.5 text-[#A3703E]" /> Master Tailors & Dry Cleaners
                </span>
                <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-[#1C1A19] leading-tight">
                  Impeccable Fit. <br /><span className="text-[#A3703E] italic">Flawless Care.</span>
                </h1>
                <p className="text-[#615B55] text-base sm:text-lg leading-relaxed font-normal">
                  Welcome to ALiCo. Located in the heart of Dublin's Grafton Street area, we combine traditional bespoke tailoring, expert alterations, and professional garment care to bring your wardrobe to life.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="bg-[#1C1A19] hover:bg-[#2C2A29] text-white font-semibold px-8 py-4 rounded-2xl transition shadow-lg shadow-black/10 flex items-center gap-2 text-sm tracking-wide"
                  >
                    Calculate Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-white border-2 border-[#E6DFD5] hover:border-[#1C1A19] text-[#1C1A19] font-semibold px-8 py-4 rounded-2xl transition shadow-sm text-sm tracking-wide"
                  >
                    Track Order Status
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E6DFD5] text-xs font-semibold text-[#544F4A]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#A3703E]" /> Master Seamstress
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A3703E]" /> Eco Dry Cleaning
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#A3703E]" /> Live Tracking
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-[#1C1A19] group">
                <img 
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80" 
                  alt="Tailoring Workshop and Fabrics" 
                  className="w-full h-80 sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="text-[#D4AF37] font-serif font-semibold text-xs tracking-widest uppercase">Dublin Craftsmanship</span>
                  <h3 className="text-2xl font-serif font-bold mt-1">Bespoke Alterations & Garment Renewal</h3>
                </div>
              </div>
            </div>

            {/* SERVICES CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
              <div className="bg-white border border-[#E6DFD5] hover:border-[#A3703E] transition p-8 rounded-3xl space-y-4 shadow-xl shadow-stone-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-[#F4EFEB] border border-[#E6DFD5] flex items-center justify-center text-[#A3703E] group-hover:bg-[#1C1A19] group-hover:text-white transition">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1C1A19]">Precision Tailoring</h3>
                <p className="text-[#615B55] text-sm leading-relaxed">
                  From trouser hemming and suit resizing to delicate dress refitting and zip replacements, tailored precisely to your silhouette.
                </p>
              </div>

              <div className="bg-white border border-[#E6DFD5] hover:border-[#A3703E] transition p-8 rounded-3xl space-y-4 shadow-xl shadow-stone-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-[#F4EFEB] border border-[#E6DFD5] flex items-center justify-center text-[#A3703E] group-hover:bg-[#1C1A19] group-hover:text-white transition">
                  <Shirt className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1C1A19]">Dry Cleaning & Laundry</h3>
                <p className="text-[#615B55] text-sm leading-relaxed">
                  Gentle eco-friendly dry cleaning for suits and formal wear, alongside convenient wash, dry & fold and heavy duvet laundering.
                </p>
              </div>

              <div className="bg-white border border-[#E6DFD5] hover:border-[#A3703E] transition p-8 rounded-3xl space-y-4 shadow-xl shadow-stone-950/5 group">
                <div className="w-14 h-14 rounded-2xl bg-[#F4EFEB] border border-[#E6DFD5] flex items-center justify-center text-[#A3703E] group-hover:bg-[#1C1A19] group-hover:text-white transition">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1C1A19]">Real-Time Status</h3>
                <p className="text-[#615B55] text-sm leading-relaxed">
                  Never wonder when your garments are ready. Enter your shop ticket code anytime to track progress straight from our database.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRICE ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div className="max-w-2xl mx-auto bg-white border border-[#E6DFD5] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-[#A3703E] font-bold text-xs uppercase tracking-wider">Transparent Quote Generator</span>
              <h2 className="text-3xl font-serif font-bold text-[#1C1A19] mt-1">Interactive Price Estimator</h2>
              <p className="text-[#615B55] text-sm">Select your garment and specific alteration or cleaning service for an instant estimate.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#615B55] mb-2">1. Select Garment or Item Category</label>
                <select
                  value={selectedGarment}
                  onChange={(e) => handleGarmentChange(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1C1A19] text-[#1C1A19] shadow-inner font-medium"
                >
                  <option value="trousers">Trousers / Jeans</option>
                  <option value="jacket">Suit Jacket / Blazer</option>
                  <option value="dress">Dress / Formal Wear</option>
                  <option value="shirt">Shirt / Blouse</option>
                  <option value="skirt">Skirt</option>
                  <option value="curtains">Curtains / Home Textiles</option>
                  <option value="laundry">Laundry & Dry Cleaning Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#615B55] mb-2">2. Select Specific Service / Alteration</label>
                <select
                  value={selectedAlteration}
                  onChange={(e) => handleAlterationChange(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#1C1A19] text-[#1C1A19] shadow-inner font-medium"
                >
                  {alterationOptions[selectedGarment].map((alt, index) => (
                    <option key={index} value={`${alt.name} (€${alt.price.toFixed(2)})`}>
                      {alt.name} — €{alt.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#1C1A19] text-white rounded-2xl p-6 flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Estimated Price</p>
                  <p className="text-4xl font-serif font-extrabold mt-1">€{estimatePrice}</p>
                </div>
                <span className="text-xs text-[#EFECE6] text-right max-w-[190px] leading-relaxed font-light">
                  Final quotation confirmed upon in-store inspection at Grafton Street.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ORDER TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-white border border-[#E6DFD5] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-[#A3703E] font-bold text-xs uppercase tracking-wider">Live Shop System</span>
              <h2 className="text-3xl font-serif font-bold text-[#1C1A19] mt-1">Track Your Order</h2>
              <p className="text-[#615B55] text-sm">Enter your ticket number to view real-time status from our workshop database.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. 7244"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                className="flex-1 bg-[#FDFBF7] border border-[#E6DFD5] rounded-2xl px-4 py-3.5 text-sm text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] uppercase tracking-wider font-bold shadow-inner"
              />
              <button
                type="submit"
                disabled={loadingOrder}
                className="bg-[#1C1A19] hover:bg-[#2C2A29] text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg disabled:opacity-50 text-sm"
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
              <div className="bg-[#F4EFEB] border-2 border-[#E6DFD5] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-[#E6DFD5]">
                  <span className="font-mono text-[#1C1A19] font-extrabold text-base">Ticket: #{searchedOrder.id}</span>
                  <span className="bg-[#1C1A19] text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm">{searchedOrder.status || 'Pending'}</span>
                </div>
                <div className="space-y-2.5 text-sm font-medium">
                  <p><strong className="text-[#615B55]">Service:</strong> <span className="text-[#1C1A19]">{searchedOrder.service || searchedOrder.item || 'Tailoring & Alterations'}</span></p>
                  <p><strong className="text-[#615B55]">Phone:</strong> <span className="text-[#1C1A19]">{searchedOrder.phone || searchedOrder.phoneNumber || 'N/A'}</span></p>
                  <p><strong className="text-[#615B55]">Target Ready Date:</strong> <span className="text-[#A3703E] font-bold">{searchedOrder.date}</span></p>
                  <p><strong className="text-[#615B55]">Total:</strong> <span className="text-[#1C1A19] font-bold">€{searchedOrder.total || searchedOrder.price || '0.00'}</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT & LOCATION TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 py-2">
            <div>
              <span className="text-[#A3703E] font-bold text-xs uppercase tracking-wider">Dublin Studio</span>
              <h2 className="text-3xl font-serif font-extrabold text-[#1C1A19] tracking-tight mt-1">About ALiCo & Location</h2>
              <p className="text-[#615B55] text-sm">Visit our workshop in the Grafton Street area or get directions instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-[#E6DFD5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] border border-[#E6DFD5] flex items-center justify-center text-[#A3703E] shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#1C1A19] text-base">Studio Location</h3>
                      <p className="text-[#615B55] text-sm mt-1 leading-relaxed">
                        Grafton Street Area<br />
                        Dublin, Ireland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] border border-[#E6DFD5] flex items-center justify-center text-[#A3703E] shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#1C1A19] text-base">Working Hours</h3>
                      <p className="text-[#615B55] text-sm mt-1 leading-relaxed">
                        Monday – Friday: 9:00 AM – 6:30 PM<br />
                        Saturday: 10:00 AM – 5:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] border border-[#E6DFD5] flex items-center justify-center text-[#A3703E] shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#1C1A19] text-base">Contact Phone</h3>
                      <p className="text-[#615B55] text-sm mt-1">+353 (0)1 XXX XXXX</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openNativeMaps}
                  className="w-full bg-[#1C1A19] hover:bg-[#2C2A29] text-white font-bold py-4 px-6 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 mt-6 text-sm"
                >
                  <Navigation className="w-4 h-4" /> Get Directions (Apple / Google Maps)
                </button>
              </div>

              <div className="bg-white border border-[#E6DFD5] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F4EFEB]/80 to-[#FDFBF7]/40 z-10 pointer-events-none"></div>

                <div className="relative z-20 flex justify-between items-start">
                  <span className="bg-white border border-[#E6DFD5] text-[#1C1A19] text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm">
                    📍 Grafton Street, Dublin
                  </span>
                  <span className="bg-[#1C1A19] text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span> Open Now
                  </span>
                </div>

                <div className="relative z-25 my-auto py-10 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#1C1A19] text-white flex items-center justify-center mx-auto shadow-xl">
                    <MapPin className="w-10 h-10 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-extrabold text-[#1C1A19] text-xl">ALiCo Tailoring & Dry Cleaning</h4>
                    <p className="text-xs text-[#A3703E] mt-1 font-semibold uppercase tracking-wider">Heart of Dublin City Centre</p>
                  </div>
                </div>

                <div className="relative z-20">
                  <button
                    onClick={openNativeMaps}
                    className="w-full bg-[#F4EFEB] hover:bg-[#E6DFD5] border border-[#E6DFD5] text-[#1C1A19] font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Open in Native Maps App <ExternalLink className="w-4 h-4 text-[#A3703E]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRICE MENU TAB */}
        {activeTab === 'menu' && (
          <div className="max-w-3xl mx-auto bg-white border border-[#E6DFD5] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-[#A3703E] font-bold text-xs uppercase tracking-wider">Transparent Rates</span>
              <h2 className="text-3xl font-serif font-bold text-[#1C1A19] mt-1">Standard Price Menu</h2>
              <p className="text-[#615B55] text-sm">Professional alterations and garment care pricing guide.</p>
            </div>

            <div className="divide-y divide-[#E6DFD5] text-sm font-medium">
              <div className="py-4 flex justify-between items-center hover:bg-[#F4EFEB]/50 px-3 rounded-xl transition">
                <span className="text-[#1C1A19]">Trousers Hemming / Adjustment</span>
                <span className="font-serif font-extrabold text-[#A3703E] text-base">€12.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-[#F4EFEB]/50 px-3 rounded-xl transition">
                <span className="text-[#1C1A19]">Trousers Waist Take-in</span>
                <span className="font-serif font-extrabold text-[#A3703E] text-base">€16.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-[#F4EFEB]/50 px-3 rounded-xl transition">
                <span className="text-[#1C1A19]">Jacket Sleeve Shortening</span>
                <span className="font-serif font-extrabold text-[#A3703E] text-base">€22.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-[#F4EFEB]/50 px-3 rounded-xl transition">
                <span className="text-[#1C1A19]">Dress Hem Shortening</span>
                <span className="font-serif font-extrabold text-[#A3703E] text-base">€25.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-[#F4EFEB]/50 px-3 rounded-xl transition">
                <span className="text-[#1C1A19]">Zip Replacement (Jacket / Jeans)</span>
                <span className="font-serif font-extrabold text-[#A3703E] text-base">€18.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-[#F4EFEB]/50 px-3 rounded-xl transition">
                <span className="text-[#1C1A19]">Curtain Hemming (per metre)</span>
                <span className="font-serif font-extrabold text-[#A3703E] text-base">€15.00</span>
              </div>
              <div className="py-4 flex justify-between items-center hover:bg-[#F4EFEB]/50 px-3 rounded-xl transition">
                <span className="text-[#1C1A19]">Wash, Dry & Fold (Per Kg)</span>
                <span className="font-serif font-extrabold text-[#A3703E] text-base">€6.50</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E6DFD5] bg-white py-6 text-center text-xs text-[#615B55] font-medium">
        <p>© {new Date().getFullYear()} ALiCo Master Tailoring & Garment Care. Grafton Street Area, Dublin, Ireland.</p>
      </footer>
    </div>
  );
}
