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
  AlertTriangle,
  MessageCircle,
  PhoneCall,
  Plus,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
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
  const [selectedAlterationObj, setSelectedAlterationObj] = useState(alterationOptions[categories[0]][0]);
  
  // Multi-item estimate cart state saved in sessionStorage
  const [estimateCart, setEstimateCart] = useState(() => {
    const saved = sessionStorage.getItem('alico_estimate_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('alico_estimate_cart', JSON.stringify(estimateCart));
  }, [estimateCart]);

  // Real-time live price listener using Firestore onSnapshot
  useEffect(() => {
    const targetCollections = ['priceBook', 'prices', 'services', 'inventory'];
    let unsubscribes = [];

    targetCollections.forEach((colName) => {
      try {
        const unsub = onSnapshot(collection(db, colName), (querySnapshot) => {
          if (!querySnapshot.empty) {
            setAlterationOptions((prevOptions) => {
              const liveOptions = { ...prevOptions };

              querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                let cat = data.category || data.serviceCategory || data.type || data.group || 'General Services';
                cat = cat.trim();

                if (!liveOptions[cat]) {
                  liveOptions[cat] = [];
                }

                const itemName = data.name || data.serviceName || data.title || data.item || 'Service Item';
                const itemPrice = Number(data.price || data.cost || data.amount || 0);

                const existingIndex = liveOptions[cat].findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());
                if (existingIndex >= 0) {
                  liveOptions[cat][existingIndex].price = itemPrice;
                } else {
                  liveOptions[cat].push({ name: itemName, price: itemPrice });
                }
              });

              return liveOptions;
            });
          }
        }, (err) => {
          // Ignore permission errors
        });

        unsubscribes.push(unsub);
      } catch (e) {
        // Skip if collection doesn't exist
      }
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Update selected alteration when category changes
  useEffect(() => {
    const options = alterationOptions[selectedGarment] || [];
    if (options.length > 0) {
      const exists = options.find(i => selectedAlterationObj && i.name === selectedAlterationObj.name);
      setSelectedAlterationObj(exists || options[0]);
    }
  }, [selectedGarment, alterationOptions]);

  const handleGarmentChange = (garmentKey) => {
    setSelectedGarment(garmentKey);
    const options = alterationOptions[garmentKey] || [];
    if (options.length > 0) {
      setSelectedAlterationObj(options[0]);
    }
  };

  const handleAddItemToEstimate = () => {
    if (!selectedAlterationObj) return;

    const newItem = {
      id: Date.now(),
      category: selectedGarment,
      name: selectedAlterationObj.name
    };

    setEstimateCart([...estimateCart, newItem]);
  };

  const handleRemoveItem = (id) => {
    setEstimateCart(estimateCart.filter(item => item.id !== id));
  };

  const getCartItemPrice = (item) => {
    const catItems = alterationOptions[item.category] || [];
    const found = catItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    return found ? found.price : (item.price || 0.00);
  };

  const totalEstimatePrice = estimateCart.reduce((sum, item) => sum + getCartItemPrice(item), 0).toFixed(2);

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
    const addressQuery = encodeURIComponent('Artane Shopping Centre, Dublin, Ireland');
    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b88a6] via-[#105d76] to-[#093544] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950 relative overflow-hidden">
      
      {/* DECORATIVE WATER BUBBLE & WAVE GRADIENTS */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#25a9cc]/40 via-transparent to-transparent pointer-events-none -z-10 rounded-b-[60%] blur-3xl"></div>
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* FLYER-STYLE ORANGE PAYMENT UPFRONT BADGE */}
      <div className="fixed bottom-24 right-6 z-45 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center p-3 text-center shadow-2xl border-4 border-white/90 animate-bounce pointer-events-none">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight leading-tight">Payment</span>
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider">up front</span>
        <span className="text-[10px] sm:text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full mt-0.5">only</span>
      </div>

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#093544]/90 text-cyan-200 text-xs py-2 px-4 text-center font-semibold tracking-wide flex justify-center items-center gap-4 border-b border-cyan-500/30 shadow-sm">
        <span>📍 Artane Shopping Centre, Dublin</span>
        <span className="hidden sm:inline">•</span>
        <span>Strict Policy: Payment Up Front Only Upon Drop-Off</span>
      </div>

      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#0d475c]/95 border-b border-cyan-500/30 backdrop-blur-md px-4 sm:px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <div className="bg-white/95 px-3 py-1.5 rounded-2xl shadow-md">
              <img 
                src={logoImage} 
                alt="ALiCo Logo" 
                className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">ALiCo</h1>
              <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-wider">Laundry & Tailoring Business</p>
            </div>
          </div>

          <nav className="bg-[#093544]/80 p-1.5 rounded-2xl border border-cyan-500/30 shadow-inner w-full lg:w-auto">
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40' : 'text-slate-200 hover:text-white hover:bg-cyan-900/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('estimator')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'estimator' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40' : 'text-slate-200 hover:text-white hover:bg-cyan-900/50'
                }`}
              >
                Price Estimator
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                  activeTab === 'tracker' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40' : 'text-slate-200 hover:text-white hover:bg-cyan-900/50'
                }`}
              >
                Live Tracker
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'about' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40' : 'text-slate-200 hover:text-white hover:bg-cyan-900/50'
                }`}
              >
                <Info className="w-3.5 h-3.5 shrink-0" /> About & Policy
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap sm:col-auto col-span-2 ${
                  activeTab === 'menu' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40' : 'text-slate-200 hover:text-white hover:bg-cyan-900/50'
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
            {/* POLICY BANNER MATCHING FLYER VIBE */}
            <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-400/40 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                  <AlertTriangle className="w-7 h-7 animate-pulse text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <span className="bg-cyan-500/30 text-cyan-200 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-widest">Mandatory Store Policy</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Payment Up Front Only</h3>
                  <p className="text-cyan-100/90 text-sm leading-relaxed max-w-2xl font-medium">
                    Please note: All laundry services and tailoring items require strict payment up front upon drop-off. No exceptions or subsequent payments accepted.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('about')}
                className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold px-6 py-3 rounded-2xl transition shadow-lg text-sm whitespace-nowrap shrink-0 relative z-10"
              >
                View Full Policy
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#0e495f]/90 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-[#093544] text-cyan-200 text-xs px-4 py-2 rounded-full font-extrabold uppercase tracking-wider border border-cyan-500/40 shadow-sm">
                    <Waves className="w-4 h-4 text-cyan-400" /> Artane Shopping Centre, Dublin
                  </span>
                  
                  <div className="inline-flex items-center gap-1.5 bg-slate-900/80 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                    <span className="text-emerald-400 font-extrabold">Trustpilot</span>
                    <div className="flex text-amber-400 gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="text-slate-300 font-semibold">5.0</span>
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Laundry & <span className="text-cyan-400">Tailoring Business</span>
                </h1>
                
                <p className="text-cyan-100 text-base leading-relaxed">
                  Welcome to ALiCo at Artane Shopping Centre, Dublin. We provide professional laundry care and expert tailoring services with sparkling results and bubble-clean quality.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-500/30 text-sm"
                  >
                    Calculate Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-[#093544] hover:bg-[#06242f] border-2 border-cyan-500/40 text-cyan-200 font-extrabold px-7 py-3.5 rounded-2xl transition shadow-sm text-sm"
                  >
                    Track My Order
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-cyan-500/40 group">
                  <img 
                    src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80" 
                    alt="Commercial laundry washing and drying machines" 
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5"><Waves className="w-3.5 h-3.5 text-cyan-400" /> Laundry Services</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-cyan-500/40 group">
                  <img 
                    src={tailorImage} 
                    alt="Professional tailor measuring and marking denim with chalk" 
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-cyan-400" /> Tailoring Services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MULTI-ITEM PRICE ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div className="max-w-3xl mx-auto bg-[#0e495f]/95 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-white">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Live Real-Time Synchronized Rates</span>
              <h2 className="text-3xl font-bold text-white mt-1">Interactive Price Estimator</h2>
              <p className="text-cyan-100 text-sm">Select multiple garments or services, add them to your estimate, and review your total.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#093544]/80 p-6 rounded-3xl border border-cyan-500/30">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-200 mb-2">1. Select Category</label>
                <select
                  value={selectedGarment}
                  onChange={(e) => handleGarmentChange(e.target.value)}
                  className="w-full bg-[#0d475c] border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400 text-white shadow-inner font-medium"
                >
                  {Object.keys(alterationOptions).map((catName) => (
                    <option key={catName} value={catName} className="bg-[#093544] text-white">{catName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-200 mb-2">2. Select Service / Item</label>
                <select
                  value={selectedAlterationObj ? selectedAlterationObj.name : ''}
                  onChange={(e) => {
                    const found = (alterationOptions[selectedGarment] || []).find(i => i.name === e.target.value);
                    if (found) setSelectedAlterationObj(found);
                  }}
                  className="w-full bg-[#0d475c] border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400 text-white shadow-inner font-medium"
                >
                  {(alterationOptions[selectedGarment] || []).map((alt, index) => (
                    <option key={index} value={alt.name} className="bg-[#093544] text-white">
                      {alt.name} — €{alt.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddItemToEstimate}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Item to Estimate
                </button>
              </div>
            </div>

            {/* ESTIMATE CART / SELECTED ITEMS */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-400" /> Selected Items ({estimateCart.length})
              </h3>

              {estimateCart.length === 0 ? (
                <div className="border-2 border-dashed border-cyan-500/30 rounded-3xl p-8 text-center text-cyan-200/70 text-sm font-medium bg-[#093544]/50">
                  No items added yet. Select a category and service above and click "Add Item to Estimate".
                </div>
              ) : (
                <div className="divide-y divide-cyan-500/20 border border-cyan-500/30 rounded-3xl bg-[#093544]/70 overflow-hidden shadow-sm">
                  {estimateCart.map((item) => {
                    const livePrice = getCartItemPrice(item);
                    return (
                      <div key={item.id} className="p-4 sm:p-5 flex justify-between items-center hover:bg-cyan-900/30 transition">
                        <div>
                          <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider block">{item.category}</span>
                          <h4 className="font-bold text-white text-base">{item.name}</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-extrabold text-cyan-400 text-lg">€{livePrice.toFixed(2)}</span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 p-2 rounded-xl transition shadow-sm border border-rose-500/30"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TOTAL ESTIMATE BANNER */}
            <div className="bg-gradient-to-r from-teal-800 to-cyan-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl shadow-cyan-500/20 border border-cyan-400/30">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-cyan-200">Total Estimated Price</p>
                <p className="text-4xl sm:text-5xl font-extrabold mt-1">€{totalEstimatePrice}</p>
              </div>
              <span className="text-xs text-cyan-100 text-center sm:text-right max-w-[220px] leading-relaxed font-medium">
                Payment up front only upon drop-off at Artane Shopping Centre.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-[#0e495f]/95 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-white">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Live System</span>
              <h2 className="text-3xl font-bold text-white mt-1">Track Your Order</h2>
              <p className="text-cyan-100 text-sm">Enter your ticket number to view real-time status from our shop database.</p>
            </div>

            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. 7244"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                className="flex-1 bg-[#0d475c] border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 uppercase tracking-wider font-bold shadow-inner placeholder:text-cyan-300/50"
              />
              <button
                type="submit"
                disabled={loadingOrder}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-500/30 disabled:opacity-50 text-sm"
              >
                {loadingOrder ? 'Searching...' : 'Search Ticket'}
              </button>
            </form>

            {errorMessage && (
              <div className="bg-rose-950/80 border-2 border-rose-500/40 text-rose-200 rounded-2xl p-4 flex items-center gap-3 text-sm font-medium shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {searchedOrder && (
              <div className="bg-[#093544] border-2 border-cyan-500/50 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-cyan-500/30">
                  <span className="font-mono text-cyan-200 font-extrabold text-base">Ticket: #{searchedOrder.id}</span>
                  <span className="bg-cyan-500 text-slate-950 text-xs px-3.5 py-1.5 rounded-full font-extrabold shadow-sm">{searchedOrder.status || 'Pending'}</span>
                </div>
                <div className="space-y-2.5 text-sm font-medium text-cyan-100">
                  <p><strong className="text-cyan-300">Service:</strong> <span className="text-white">{searchedOrder.service || searchedOrder.item || 'Laundry & Tailoring'}</span></p>
                  <p><strong className="text-cyan-300">Phone:</strong> <span className="text-white">{searchedOrder.phone || searchedOrder.phoneNumber || 'N/A'}</span></p>
                  <p><strong className="text-cyan-300">Target Ready Date:</strong> <span className="text-cyan-400 font-bold">{searchedOrder.date}</span></p>
                  <p><strong className="text-cyan-300">Total:</strong> <span className="text-white font-bold">€{searchedOrder.total || searchedOrder.price || '0.00'}</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 py-2 text-white">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Dublin Business & Policies</span>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-1">About ALiCo & Store Policy</h2>
              <p className="text-cyan-100 text-sm">Learn more about our bubble-clean laundry care, expert tailoring, and our mandatory up front payment policy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0e495f]/95 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-cyan-400" /> Laundry & Tailoring Business
                    </h3>
                    <p className="text-cyan-100 text-sm mt-2 leading-relaxed">
                      ALiCo at Artane Shopping Centre is Dublin's premier destination for expert garment care, precision measuring, and professional alterations.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-cyan-100">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400 shrink-0" /> Artane Shopping Centre, Dublin, Ireland</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400 shrink-0" /> Mon – Fri: 9:00 AM – 6:30 PM, Sat: 10:00 AM – 5:00 PM</p>
                  </div>
                </div>

                <button
                  onClick={openNativeMaps}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 mt-6 text-sm"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </button>
              </div>

              <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden border border-cyan-500/30">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <CreditCard className="w-32 h-32" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white">Mandatory Up Front Policy</h3>
                    <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider mt-1">Payment Upon Drop-Off</p>
                  </div>
                  <p className="text-cyan-100 text-sm leading-relaxed">
                    Please note that **all items and garments brought into ALiCo must be paid up front** at the time of drop-off. 
                  </p>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-xs text-cyan-100 space-y-2">
                    <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> No items will be taken or processed without prior payment up front only.</p>
                    <p>We accept all major credit/debit cards and contactless payments in-store.</p>
                  </div>
                </div>

                <div className="relative z-10 pt-2">
                  <span className="text-xs text-cyan-300 block text-center font-medium">Thank you for your cooperation and trust in ALiCo.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="max-w-3xl mx-auto bg-[#0e495f]/95 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-white">
            <div>
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Live Real-Time Synchronized Rates</span>
              <h2 className="text-3xl font-bold text-white mt-1">Standard Price Menu</h2>
              <p className="text-cyan-100 text-sm">Professional laundry care and alterations pricing guide. (Payment up front only).</p>
            </div>

            <div className="divide-y divide-cyan-500/20 text-sm font-medium">
              {Object.entries(alterationOptions).map(([catKey, items]) => (
                <div key={catKey} className="py-4 space-y-2">
                  <h3 className="font-extrabold text-cyan-200 text-sm uppercase tracking-wider bg-[#093544] px-3 py-1.5 rounded-lg border border-cyan-500/30">{catKey}</h3>
                  {items.map((item, idx) => (
                    <div key={`${catKey}-${idx}`} className="py-2.5 flex justify-between items-center hover:bg-cyan-900/30 px-3 rounded-xl transition">
                      <span className="text-cyan-100">{item.name}</span>
                      <span className="font-extrabold text-cyan-400 text-base">€{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FLOATING QUICK CONTACT WIDGET (WhatsApp & Call) */}
      <div className="fixed bottom-6 right-36 sm:right-40 z-50 flex flex-col items-end gap-3">
        <a 
          href="https://wa.me/353860872382?text=Hi%20ALiCo%2C%20I%20would%20like%20to%20inquire%20about%20laundry%20and%20tailoring%20services." 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group relative border-2 border-white/20"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
          <span className="absolute right-14 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            Chat on WhatsApp
          </span>
        </a>

        <a 
          href="tel:+353860872382" 
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group relative border-2 border-white/20"
          aria-label="Call Store"
        >
          <PhoneCall className="w-6 h-6" />
          <span className="absolute right-14 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            Call +353 86 087 2382
          </span>
        </a>
      </div>

      <footer className="border-t border-cyan-500/30 bg-[#093544]/90 backdrop-blur-md py-6 text-center text-xs text-cyan-200/80 font-medium space-y-1">
        <p>© {new Date().getFullYear()} ALiCo Laundry & Tailoring Business. Artane Shopping Centre, Dublin, Ireland.</p>
        <p className="text-cyan-300 font-bold">Strict Policy Reminder: Payment up front only upon drop-off.</p>
      </footer>
    </div>
  );
}
