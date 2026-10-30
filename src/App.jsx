import React, { useState } from 'react';
import { 
  Scissors, Calculator, ClipboardCheck, CalendarDays, 
  Phone, MapPin, Clock, CheckCircle2, 
  AlertCircle, ShieldCheck 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const priceMenu = [
    { category: 'Trousers / Jeans', items: [
      { id: 't1', name: 'Standard Hemming', turnaround: '2 Days', price: 15.00 },
      { id: 't2', name: 'Leg Tapering / Slimming', turnaround: '3 Days', price: 22.00 },
      { id: 't3', name: 'Waist Adjustment (In/Out)', turnaround: '2 Days', price: 20.00 },
      { id: 't4', name: 'Zipper Replacement', turnaround: '2 Days', price: 18.00 }
    ]},
    { category: 'Dresses / Skirts', items: [
      { id: 'd1', name: 'Hemming (Single Layer)', turnaround: '3 Days', price: 25.00 },
      { id: 'd2', name: 'Hemming (Multi-Layer / Formal)', turnaround: '5 Days', price: 45.00 },
      { id: 'd3', name: 'Side Seam Adjustments', turnaround: '4 Days', price: 30.00 },
      { id: 'd4', name: 'Strap Shortening', turnaround: '2 Days', price: 15.00 }
    ]},
    { category: 'Suits & Coats', items: [
      { id: 's1', name: 'Jacket Sleeve Shortening', turnaround: '4 Days', price: 35.00 },
      { id: 's2', name: 'Jacket Taking In / Out', turnaround: '5 Days', price: 50.00 },
      { id: 's3', name: 'Coat Lining Replacement', turnaround: '7 Days', price: 90.00 },
      { id: 's4', name: 'Trouser Hemming (Cuffed)', turnaround: '3 Days', price: 18.00 }
    ]},
    { category: 'Repairs & Restorations', items: [
      { id: 'r1', name: 'Patch / Tear Repair', turnaround: '2 Days', price: 12.00 },
      { id: 'r2', name: 'Button Replacement (Each)', turnaround: '1 Day', price: 4.00 },
      { id: 'r3', name: 'Seam Re-stitching', turnaround: '2 Days', price: 10.00 }
    ]}
  ];

  const [selectedServices, setSelectedServices] = useState([]);

  const toggleService = (item) => {
    if (selectedServices.find(s => s.id === item.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== item.id));
    } else {
      setSelectedServices([...selectedServices, item]);
    }
  };

  const totalEstimate = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const [searchTicket, setSearchTicket] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState(false);

  const mockOrders = {
    'ALC-1042': { id: 'ALC-1042', customer: 'Siobhan Murphy', item: 'Silk Evening Dress Hemming', status: 'In Alteration', due: '2026-11-02', total: '€45.00', paid: '€20.00 deposit' },
    'ALC-1089': { id: 'ALC-1089', customer: 'Liam O’Connor', item: 'Two-Piece Suit Tapering', status: 'Ready for Fitting', due: '2026-10-31', total: '€85.00', paid: 'Fully Paid' },
    'ALC-1102': { id: 'ALC-1102', customer: 'Emma Walsh', item: 'Wool Coat Lining Repair', status: 'Completed', due: '2026-10-29', total: '€90.00', paid: 'Fully Paid' },
  };

  const handleTrack = (e) => {
    e.preventDefault();
    const found = mockOrders[searchTicket.trim().toUpperCase()];
    if (found) {
      setTrackedOrder(found);
      setTrackError(false);
    } else {
      setTrackedOrder(null);
      setTrackError(true);
    }
  };

  const [bookingData, setBookingData] = useState({ name: '', phone: '', email: '', date: '', time: '10:00', notes: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: '#020617', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #00A8D6, #5FB3B3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0, 168, 214, 0.3)' }}>
              <Scissors style={{ width: '1.5rem', height: '1.5rem', color: '#020617', strokeWidth: 2.5 }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.05em', margin: 0, color: '#ffffff' }}>ALiCo</h1>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5FB3B3', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Master Tailoring • Dublin</p>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'home', label: 'Overview' },
              { id: 'estimator', label: 'Price Estimator' },
              { id: 'tracker', label: 'Order Tracker' },
              { id: 'booking', label: 'Book Fitting' },
              { id: 'menu', label: 'Price Menu' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: activeTab === tab.id ? 'rgba(0, 168, 214, 0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#00A8D6' : '#cbd5e1',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div>
            <button 
              onClick={() => setActiveTab('booking')}
              style={{ backgroundColor: '#00A8D6', color: '#020617', fontWeight: 700, padding: '0.625rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem', border: 'none', boxShadow: '0 4px 12px rgba(0, 168, 214, 0.3)' }}
            >
              Book Appointment
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>

        {/* HOME / OVERVIEW TAB */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, rgba(0, 168, 214, 0.15) 100%)', border: '1px solid #1e293b', borderRadius: '1.5rem', padding: '3rem', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ maxWidth: '42rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(0, 168, 214, 0.1)', border: '1px solid rgba(0, 168, 214, 0.3)', padding: '0.25rem 0.875rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: '#00A8D6', marginBottom: '1.5rem' }}>
                  <ShieldCheck style={{ width: '1rem', height: '1rem' }} />
                  <span>Dublin's Premier Tailoring Studio</span>
                </div>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, margin: '0 0 1.5rem 0' }}>
                  Perfect Fit, Guaranteed by <span style={{ color: '#00A8D6' }}>ALiCo</span>
                </h2>
                <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
                  Experience precision alterations, bespoke tailoring, and meticulous garment restoration. Instant estimates, live ticket tracking, and seamless in-store bookings.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveTab('estimator')} style={{ backgroundColor: '#00A8D6', color: '#020617', fontWeight: 700, padding: '0.875rem 1.75rem', borderRadius: '0.75rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px -5px rgba(0, 168, 214, 0.4)' }}>
                    <Calculator style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Get Instant Quote</span>
                  </button>
                  <button onClick={() => setActiveTab('tracker')} style={{ backgroundColor: '#1e293b', color: '#ffffff', fontWeight: 600, padding: '0.875rem 1.75rem', borderRadius: '0.75rem', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ClipboardCheck style={{ width: '1.25rem', height: '1.25rem', color: '#5FB3B3' }} />
                    <span>Track Order Ticket</span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                { tab: 'estimator', icon: Calculator, color: '#00A8D6', title: 'Instant Estimator', desc: 'Select garment services and calculate transparent pricing immediately.' },
                { tab: 'tracker', icon: ClipboardCheck, color: '#5FB3B3', title: 'Order Tracker', desc: 'Check real-time status updates using your unique alteration ticket ID.' },
                { tab: 'booking', icon: CalendarDays, color: '#00A8D6', title: 'Book a Fitting', desc: 'Schedule your in-store consultation with our master Dublin tailors.' },
                { tab: 'menu', icon: Scissors, color: '#5FB3B3', title: 'Price Menu', desc: 'Explore our standard transparent rates for all garment types.' }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} onClick={() => setActiveTab(card.tab)} style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: '1rem' }}>
                      <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem 0' }}>{card.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ESTIMATOR TAB */}
        {activeTab === 'estimator' && (
          <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>Instant Price Estimator</h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>Select your garment requirements below to generate an instant estimate.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {priceMenu.map((group, idx) => (
                  <div key={idx} style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00A8D6', margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid #1e293b' }}>{group.category}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {group.items.map((item) => {
                        const isSelected = selectedServices.find(s => s.id === item.id);
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => toggleService(item)}
                            style={{ padding: '1rem', borderRadius: '0.75rem', border: `1px solid ${isSelected ? '#00A8D6' : '#1e293b'}`, backgroundColor: isSelected ? 'rgba(0, 168, 214, 0.1)' : '#0f172a', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>Est. turnaround: {item.turnaround}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontWeight: 700, color: '#5FB3B3' }}>€{item.price.toFixed(2)}</span>
                              <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isSelected ? '#00A8D6' : '#334155'}`, backgroundColor: isSelected ? '#00A8D6' : 'transparent', color: '#020617', fontWeight: 700, fontSize: '0.875rem' }}>
                                {isSelected ? '✓' : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem', position: 'sticky', top: '6rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calculator style={{ width: '1.25rem', height: '1.25rem', color: '#00A8D6' }} /> Estimate Summary
                  </h3>
                  
                  {selectedServices.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>No services selected yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ maxHeight: '15rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedServices.map((s) => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid #1e293b' }}>
                            <span style={{ color: '#cbd5e1' }}>{s.name}</span>
                            <span style={{ fontWeight: 600, color: '#ffffff' }}>€{s.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
                        <span>Total:</span>
                        <span style={{ color: '#00A8D6' }}>€{totalEstimate.toFixed(2)}</span>
                      </div>

                      <button onClick={() => setActiveTab('booking')} style={{ width: '100%', backgroundColor: '#00A8D6', color: '#020617', fontWeight: 700, padding: '0.875rem', borderRadius: '0.75rem', border: 'none', marginTop: '0.5rem' }}>
                        Book Fitting with Quote
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div style={{ maxWidth: '32rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>Order Ticket Tracker</h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>Enter your alteration ticket number (e.g., ALC-1042 or ALC-1089)</p>
            </div>

            <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '2rem' }}>
              <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="e.g. ALC-1042" 
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value)}
                  style={{ flex: 1, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: '#ffffff', textTransform: 'uppercase', fontFamily: 'monospace', outline: 'none' }}
                  required
                />
                <button type="submit" style={{ backgroundColor: '#00A8D6', color: '#020617', fontWeight: 700, padding: '0 1.5rem', borderRadius: '0.75rem', border: 'none' }}>
                  Track
                </button>
              </form>

              {trackError && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <AlertCircle style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                  <span>Ticket not found. Try: ALC-1042 or ALC-1089.</span>
                </div>
              )}

              {trackedOrder && (
                <div style={{ marginTop: '1.5rem', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #1e293b' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Ticket ID</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#00A8D6', fontSize: '1.125rem' }}>{trackedOrder.id}</div>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(95, 179, 179, 0.15)', color: '#5FB3B3' }}>
                      {trackedOrder.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Customer</span><span style={{ fontWeight: 600, color: '#ffffff' }}>{trackedOrder.customer}</span></div>
                    <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Due Date</span><span style={{ fontWeight: 600, color: '#ffffff' }}>{trackedOrder.due}</span></div>
                    <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Service</span><span style={{ fontWeight: 600, color: '#ffffff' }}>{trackedOrder.item}</span></div>
                    <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Fee</span><span style={{ fontWeight: 600, color: '#5FB3B3' }}>{trackedOrder.total}</span></div>
                    <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Payment</span><span style={{ fontWeight: 600, color: '#ffffff' }}>{trackedOrder.paid}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKING TAB */}
        {activeTab === 'booking' && (
          <div style={{ maxWidth: '32rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>Schedule In-Store Fitting</h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>Book your consultation with our Dublin master tailors.</p>
            </div>

            <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '2rem' }}>
              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', backgroundColor: 'rgba(0, 168, 214, 0.1)', color: '#00A8D6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Fitting Appointment Confirmed!</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, maxWidth: '24rem' }}>Thank you, <strong style={{ color: '#ffffff' }}>{bookingData.name}</strong>. Your fitting is scheduled for {bookingData.date} at {bookingData.time}.</p>
                  <button onClick={() => setBookingSuccess(false)} style={{ marginTop: '1rem', backgroundColor: '#0f172a', color: '#00A8D6', border: '1px solid rgba(0, 168, 214, 0.3)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600 }}>
                    Book Another Appointment
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Full Name</label>
                    <input type="text" required placeholder="e.g. Niamh Kelly" value={bookingData.name} onChange={e => setBookingData({...bookingData, name: e.target.value})} style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Phone Number</label>
                      <input type="tel" required placeholder="087 123 4567" value={bookingData.phone} onChange={e => setBookingData({...bookingData, phone: e.target.value})} style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Email Address</label>
                      <input type="email" required placeholder="niamh@example.ie" value={bookingData.email} onChange={e => setBookingData({...bookingData, email: e.target.value})} style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Preferred Date</label>
                      <input type="date" required value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Time Slot</label>
                      <select value={bookingData.time} onChange={e => setBookingData({...bookingData, time: e.target.value})} style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ffffff', boxSizing: 'border-box', outline: 'none' }}>
                        <option value="09:30">09:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="14:30">02:30 PM</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" style={{ width: '100%', backgroundColor: '#00A8D6', color: '#020617', fontWeight: 700, padding: '0.875rem', borderRadius: '0.75rem', border: 'none', marginTop: '0.5rem' }}>
                    Confirm Appointment
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PRICE MENU TAB */}
        {activeTab === 'menu' && (
          <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>Transparent Price Menu</h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>Standard pricing for Dublin's finest tailoring and alterations.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {priceMenu.map((group, idx) => (
                <div key={idx} style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#00A8D6', margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid #1e293b' }}>{group.category}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {group.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Turnaround: {item.turnaround}</div>
                          </div>
                          <span style={{ fontWeight: 700, color: '#5FB3B3' }}>€{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#020617', borderTop: '1px solid #1e293b', padding: '2rem 0', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '4rem' }}>
        <p>© {new Date().getFullYear()} ALiCo Master Tailoring & Precision Alterations. Dublin, Ireland. All rights reserved.</p>
      </footer>
    </div>
  );
}