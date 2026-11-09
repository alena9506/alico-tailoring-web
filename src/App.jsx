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
  ShoppingCart,
  Menu,
  X
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import logoImage from './logo.png';
import tailorImage from './tailor.png';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('alico_active_tab') || 'overview';
  });

  useEffect(() => {
    sessionStorage.setItem('alico_active_tab', activeTab);
  }, [activeTab]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    'Laundry & Self-Service': [
      { name: 'Self-Service Wash (Commercial Machine)', price: 6.50 },
      { name: 'Self-Service Dryer (Per Cycle)', price: 4.00 },
      { name: 'Duvet / Heavy Bedding Care', price: 22.00 }
    ]
  });

  const categories = Object.keys(alterationOptions);
  const [selectedGarment, setSelectedGarment] = useState(categories[0]);
  const [selectedAlterationObj, setSelectedAlterationObj] = useState(alterationOptions[categories[0]][0]);
  
  const [estimateCart, setEstimateCart] = useState(() => {
    const saved = sessionStorage.getItem('alico_estimate_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('alico_estimate_cart', JSON.stringify(estimateCart));
  }, [estimateCart]);

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
        }, () => {});

        unsubscribes.push(unsub);
      } catch (e) {}
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/80 via-white to-teal-50/40 text-slate-800 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      
      {/* VECTOR WAVES */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -z-10 opacity-70">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-24 sm:h-28 text-cyan-200/60 fill-current">
          <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      {/* FLYER-STYLE ORANGE PAYMENT UPFRONT BADGE */}
      <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center p-2 text-center shadow-2xl border-3 sm:border-4 border-white animate-bounce pointer-events-none">
        <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight leading-tight">Payment</span>
        <span className="text-[11px] sm:text-sm font-black uppercase tracking-wider">up front</span>
        <span className="text-[9px] sm:text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full mt-0.5">only</span>
      </div>

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 text-white text-[11px] sm:text-xs py-2 px-3 text-center font-semibold tracking-wide flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 shadow-sm">
        <span>📍 Artane Shopping Centre, Dublin</span>
        <span className="hidden sm:inline">•</span>
        <span>Strict Policy: Payment Up Front Only Upon Drop-Off</span>
      </div>

      {/* HEADER & MOBILE HAMBURGER MENU BUTTON */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-cyan-100 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <img 
              src={logoImage} 
              alt="ALiCo Logo" 
              className="h-12 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">ALiCo</h1>
              <p className="text-[10px] sm:text-[11px] text-cyan-600 font-bold uppercase tracking-wider">Laundry & Tailoring Business</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex bg-cyan-50/80 p-1.5 rounded-2xl border border-cyan-100 shadow-inner gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('estimator')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'estimator' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
              }`}
            >
              Price Estimator
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tracker' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
              }`}
            >
              Live Tracker
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'about' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
              }`}
            >
              <Info className="w-3.5 h-3.5 shrink-0" /> About & Policy
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'menu' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' : 'text-slate-700 hover:text-cyan-900 hover:bg-cyan-100/60'
              }`}
            >
              Price Menu
            </button>
          </nav>

          {/* Mobile Hamburger Menu Gear Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden bg-cyan-100 hover:bg-cyan-200 text-cyan-900 p-2.5 rounded-2xl transition shadow-sm flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-cyan-100 flex flex-col gap-2 bg-white/95 rounded-2xl p-3 shadow-xl">
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                activeTab === 'overview' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-700 hover:bg-cyan-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => { setActiveTab('estimator'); setMobileMenuOpen(false); }}
              className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                activeTab === 'estimator' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-700 hover:bg-cyan-50'
              }`}
            >
              Price Estimator
            </button>
            <button
              onClick={() => { setActiveTab('tracker'); setMobileMenuOpen(false); }}
              className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                activeTab === 'tracker' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-700 hover:bg-cyan-50'
              }`}
            >
              Live Tracker
            </button>
            <button
              onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
              className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all flex items-center gap-2 ${
                activeTab === 'about' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-700 hover:bg-cyan-50'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" /> About & Policy
            </button>
            <button
              onClick={() => { setActiveTab('menu'); setMobileMenuOpen(false); }}
              className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                activeTab === 'menu' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-700 hover:bg-cyan-50'
              }`}
            >
              Price Menu
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-3 sm:p-8 max-w-7xl w-full mx-auto space-y-8 sm:space-y-12">
        
        {activeTab === 'overview' && (
          <div className="space-y-8 sm:space-y-12 py-2">
            {/* POLICY BANNER */}
            <div className="bg-gradient-to-r from-teal-800 via-cyan-800 to-slate-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-500/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                  <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="bg-cyan-500/30 text-cyan-200 font-extrabold text-[10px] sm:text-[11px] px-3 py-1 rounded-full uppercase tracking-widest">Mandatory Store Policy</span>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">Payment Up Front Only</h3>
                  <p className="text-cyan-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
                    Please note: No tailoring orders or drop-off garments will be accepted or processed without prior payment up front upon drop-off.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('about')}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl transition shadow-lg text-xs sm:text-sm whitespace-nowrap shrink-0 w-full md:w-auto"
              >
                View Full Policy
              </button>
            </div>

            {/* HERO SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white/95 backdrop-blur-md border border-cyan-100 rounded-3xl p-5 sm:p-10 shadow-xl">
              <div className="space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-900 text-xs px-4 py-2 rounded-full font-extrabold uppercase tracking-wider border border-cyan-100">
                    <Waves className="w-4 h-4 text-cyan-600" /> Artane Shopping Centre, Dublin
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
                
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Expert Tailoring & <span className="text-cyan-600">Alterations Specialists</span>
                </h1>
                
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Welcome to ALiCo at Artane Shopping Centre. We provide professional measuring, fitting, and precision garment alterations alongside self-service commercial laundry facilities.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-600/25 text-xs sm:text-sm"
                  >
                    Calculate Estimate
                  </button>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 text-cyan-950 font-extrabold px-6 py-3.5 rounded-2xl transition shadow-sm text-xs sm:text-sm"
                  >
                    Track My Order
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-100 group">
                  <img 
                    src={tailorImage} 
                    alt="Professional tailor measuring and marking denim with chalk" 
                    className="w-full h-40 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 sm:p-4">
                    <span className="text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-cyan-400" /> Precision Tailoring</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-100 group">
                  <img 
                    src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80" 
                    alt="Commercial laundry washing and drying machines" 
                    className="w-full h-40 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 sm:p-4">
                    <span className="text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5"><Waves className="w-3.5 h-3.5 text-cyan-400" /> Self-Service Laundry</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED ALTERATIONS & SERVICES SECTION (Like Zip Yard / Golden Needle) */}
            <div className="bg-white/95 backdrop-blur-md border border-cyan-100 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-cyan-600 font-extrabold text-xs uppercase tracking-wider">Expert Craftsmanship & Fitting</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Our Professional Tailoring & Alteration Services</h2>
                <p className="text-slate-600 text-sm">We provide expert garment alterations and tailoring to ensure your clothes fit you perfectly. Here is what we specialize in:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-cyan-50/60 border border-cyan-100 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Trousers & Jeans</h3>
                  <ul className="text-slate-600 text-xs space-y-1.5 list-disc list-inside">
                    <li>Standard Hemming & Shortening</li>
                    <li>Original Hemming (Keep Fade)</li>
                    <li>Waist Take-in & Let-out</li>
                    <li>Leg Tapering & Reshaping</li>
                  </ul>
                </div>

                <div className="bg-cyan-50/60 border border-cyan-100 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Suits & Blazers</h3>
                  <ul className="text-slate-600 text-xs space-y-1.5 list-disc list-inside">
                    <li>Jacket Sleeve Shortening</li>
                    <li>Side Seams Refitting</li>
                    <li>Shoulder Adjustments</li>
                    <li>Full Jacket Lining Replacement</li>
                  </ul>
                </div>

                <div className="bg-cyan-50/60 border border-cyan-100 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Dresses & Skirts</h3>
                  <ul className="text-slate-600 text-xs space-y-1.5 list-disc list-inside">
                    <li>Hem Shortening (Simple & Layered)</li>
                    <li>Side Seams & Bodice Refitting</li>
                    <li>Strap Adjustments</li>
                    <li>Waistband Resizing</li>
                  </ul>
                </div>

                <div className="bg-cyan-50/60 border border-cyan-100 p-6 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Zips & Repairs</h3>
                  <ul className="text-slate-600 text-xs space-y-1.5 list-disc list-inside">
                    <li>Full Zip Replacement (Jeans & Jackets)</li>
                    <li>Zip Runner / Slider Repair</li>
                    <li>Patchwork & Tear Repairs</li>
                    <li>Button Replacements</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* PRICE ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div className="max-w-3xl mx-auto bg-white border border-cyan-100 rounded-3xl p-5 sm:p-10 shadow-2xl space-y-8">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Live Real-Time Synchronized Rates</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Interactive Price Estimator</h2>
              <p className="text-slate-600 text-sm">Select multiple garments or services, add them to your estimate, and review your total.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-cyan-50/50 p-5 sm:p-6 rounded-3xl border border-cyan-200">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">1. Select Category</label>
                <select
                  value={selectedGarment}
                  onChange={(e) => handleGarmentChange(e.target.value)}
                  className="w-full bg-white border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-600 text-slate-900 shadow-inner font-medium"
                >
                  {Object.keys(alterationOptions).map((catName) => (
                    <option key={catName} value={catName}>{catName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">2. Select Service / Item</label>
                <select
                  value={selectedAlterationObj ? selectedAlterationObj.name : ''}
                  onChange={(e) => {
                    const found = (alterationOptions[selectedGarment] || []).find(i => i.name === e.target.value);
                    if (found) setSelectedAlterationObj(found);
                  }}
                  className="w-full bg-white border border-cyan-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-600 text-slate-900 shadow-inner font-medium"
                >
                  {(alterationOptions[selectedGarment] || []).map((alt, index) => (
                    <option key={index} value={alt.name}>
                      {alt.name} — €{alt.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddItemToEstimate}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold px-6 py-3 rounded-2xl transition shadow-lg shadow-cyan-600/25 flex items-center gap-2 text-sm w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Item to Estimate
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-600" /> Selected Items ({estimateCart.length})
              </h3>

              {estimateCart.length === 0 ? (
                <div className="border-2 border-dashed border-cyan-200 rounded-3xl p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm font-medium bg-white">
                  No items added yet. Select a category and service above and click "Add Item to Estimate".
                </div>
              ) : (
                <div className="divide-y divide-cyan-100 border border-cyan-100 rounded-3xl bg-white overflow-hidden shadow-sm">
                  {estimateCart.map((item) => {
                    const livePrice = getCartItemPrice(item);
                    return (
                      <div key={item.id} className="p-4 sm:p-5 flex justify-between items-center hover:bg-cyan-50/40 transition">
                        <div>
                          <span className="text-xs font-extrabold text-cyan-700 uppercase tracking-wider block">{item.category}</span>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.name}</h4>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="font-extrabold text-cyan-600 text-base sm:text-lg">€{livePrice.toFixed(2)}</span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition shadow-sm"
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

            <div className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl shadow-cyan-500/20">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-cyan-100">Total Estimated Price</p>
                <p className="text-3xl sm:text-5xl font-extrabold mt-1">€{totalEstimatePrice}</p>
              </div>
              <span className="text-xs text-cyan-100 text-center sm:text-right max-w-[220px] leading-relaxed font-medium">
                Payment up front only upon drop-off at Artane Shopping Centre.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="max-w-xl mx-auto bg-white border border-cyan-100 rounded-3xl p-5 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Live System</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Track Your Order</h2>
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
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3.5 rounded-2xl transition shadow-lg shadow-cyan-600/25 disabled:opacity-50 text-sm"
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
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Dublin Business & Policies</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">About ALiCo & Store Policy</h2>
              <p className="text-slate-600 text-sm">Learn more about our craftsmanship and our mandatory up front payment policy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-cyan-100 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-cyan-600" /> Tailoring & Alteration Specialists
                    </h3>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                      ALiCo at Artane Shopping Centre is Dublin's premier destination for expert garment alterations, precision measuring, and professional tailoring.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-600 shrink-0" /> Artane Shopping Centre, Dublin, Ireland</p>
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

              <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden border border-cyan-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <CreditCard className="w-32 h-32" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white">Mandatory Up Front Policy</h3>
                    <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider mt-1">Payment Upon Drop-Off</p>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    Please note that **all items and garments brought into ALiCo must be paid up front** at the time of drop-off. 
                  </p>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-xs text-cyan-100 space-y-2">
                    <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> No items will be taken or processed without prior payment up front only.</p>
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
          <div className="max-w-3xl mx-auto bg-white border border-cyan-100 rounded-3xl p-5 sm:p-10 shadow-2xl space-y-6">
            <div>
              <span className="text-cyan-600 font-bold text-xs uppercase tracking-wider">Live Real-Time Synchronized Rates</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Standard Price Menu</h2>
              <p className="text-slate-600 text-sm">Professional alterations and self-service laundry pricing guide. (Payment up front only).</p>
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

      {/* FLOATING QUICK CONTACT WIDGET */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-2.5">
        <a 
          href="https://wa.me/353860872382?text=Hi%20ALiCo%2C%20I%20would%20like%20to%20inquire%20about%20laundry%20and%20tailoring%20services." 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group relative border-2 border-white"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-emerald-500" />
          <span className="absolute right-12 sm:right-14 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            Chat on WhatsApp
          </span>
        </a>

        <a 
          href="tel:+353860872382" 
          className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 sm:p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group relative border-2 border-white"
          aria-label="Call Store"
        >
          <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute right-12 sm:right-14 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            Call +353 86 087 2382
          </span>
        </a>
      </div>

      <footer className="border-t border-cyan-100 bg-white py-6 text-center text-xs text-slate-500 font-medium space-y-1">
        <p>© {new Date().getFullYear()} ALiCo Laundry & Tailoring Business. Artane Shopping Centre, Dublin, Ireland.</p>
        <p className="text-teal-700 font-bold">Strict Policy Reminder: Payment up front only upon drop-off.</p>
      </footer>
    </div>
  );
}
