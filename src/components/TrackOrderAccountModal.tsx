import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ExternalLink,
  Layers,
  ChevronRight,
  User,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types/furniture';

interface TrackOrderAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const TrackOrderAccountModal: React.FC<TrackOrderAccountModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(orders[0]?.id || '1987-ORD-9842');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '1987-ORD-9842');
  const [activeTab, setActiveTab] = useState<'track' | 'history'>('track');

  // Find active searched order
  const activeOrder = orders.find(
    (o) => o.id.toLowerCase() === selectedOrderId.toLowerCase() || o.id.toLowerCase() === searchQuery.trim().toLowerCase()
  ) || orders[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = orders.find(
      (o) => o.id.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
             o.trackingNumber.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
             o.customer.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (found) {
      setSelectedOrderId(found.id);
    }
  };

  // 6-step progress timeline stages
  const timelineStages = [
    {
      id: 'design',
      title: 'In Design & Engineering',
      subtitle: '3D CAD parametric tolerance verification and timber grain orientation',
      description: 'Master joiners review client architectural specifications and confirm moisture equilibrium parameters.',
      date: activeOrder ? activeOrder.date : '2026-09-01',
      matchStatus: ['In Design', 'Order Received', 'CAD Verification'],
    },
    {
      id: 'materials',
      title: 'Timber & Slabs Selected',
      subtitle: 'Austrian PEFC-certified mature alpine timber allocation',
      description: 'Slabs individually graded for medullary rays, continuous grain matching, and Sunbrella™ fabric lot pairing.',
      date: '2026-09-03',
      matchStatus: ['Timber Selection', 'Materials Allocated'],
    },
    {
      id: 'crafting',
      title: 'Master Joinery & Crafting',
      subtitle: 'Steam-bending, mortise & tenon joinery, and structural assembly',
      description: 'Crafted by certified master cabinetmakers in our Upper Austrian atelier without composite particle boards.',
      date: '2026-09-07',
      matchStatus: ['Joinery & Frame Fabrication', 'Bespoke Upholstery & Cushioning', 'Crafting'],
    },
    {
      id: 'finishing',
      title: 'Botanical Glazing & QA',
      subtitle: 'Three coats of hand-rubbed organic herbal oils and load certification',
      description: 'Open-pored organic wax seal cures in climate-regulated resting chambers. Rigorous 200kg load test completed.',
      date: '2026-09-12',
      matchStatus: ['Master Finisher Inspection', 'Finishing & Inspection', 'Quality Assurance'],
    },
    {
      id: 'shipping',
      title: 'Climate Crating & Shipping',
      subtitle: 'Custom foam-padded wooden crating for white-glove transit',
      description: 'Dispatched via dedicated temperature-controlled art transport courier with real-time GPS tracking.',
      date: activeOrder ? activeOrder.estimatedDeliveryDate : '2026-09-25',
      matchStatus: ['Packaging & Crating', 'In Transit', 'Shipping'],
    },
    {
      id: 'delivered',
      title: 'White Glove Installation',
      subtitle: 'In-room placement, leveling, and packaging removal',
      description: 'Uniformed white-glove technicians position the piece, adjust brass leveling glides, and remove all crates.',
      date: 'Pending Delivery',
      matchStatus: ['Delivered', 'Completed'],
    },
  ];

  // Helper to determine step completion status
  const getStepStatus = (index: number) => {
    // Determine current order status index based on order status string
    const currentStatus = activeOrder?.status || 'Joinery & Frame Fabrication';
    
    let activeStageIndex = 2; // Default to crafting
    if (currentStatus.includes('Design') || currentStatus.includes('Received')) activeStageIndex = 0;
    else if (currentStatus.includes('Timber') || currentStatus.includes('Material')) activeStageIndex = 1;
    else if (currentStatus.includes('Joinery') || currentStatus.includes('Upholstery') || currentStatus.includes('Crafting')) activeStageIndex = 2;
    else if (currentStatus.includes('Finisher') || currentStatus.includes('Inspection') || currentStatus.includes('QA')) activeStageIndex = 3;
    else if (currentStatus.includes('Transit') || currentStatus.includes('Shipping') || currentStatus.includes('Crating')) activeStageIndex = 4;
    else if (currentStatus.includes('Delivered')) activeStageIndex = 5;

    if (index < activeStageIndex) return 'completed';
    if (index === activeStageIndex) return 'current';
    return 'upcoming';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#1A1917]/70 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl border border-[#E8E3DA] shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-white border-b border-[#E8E3DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1A1917] text-[#C5A880] flex items-center justify-center shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">
                Atelier Client Portal & Order Tracking
              </h2>
              <p className="text-xs text-[#766E65]">
                Real-time milestone tracking from raw Austrian timber to white-glove in-room installation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#F5F2EB] rounded-xl p-1 border border-[#E2DDD5] text-xs">
              <button
                onClick={() => setActiveTab('track')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'track' ? 'bg-white text-[#1A1917] shadow-xs' : 'text-[#766E65] hover:text-[#1A1917]'
                }`}
              >
                Track Live Order
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'history' ? 'bg-white text-[#1A1917] shadow-xs' : 'text-[#766E65] hover:text-[#1A1917]'
                }`}
              >
                All Commissions ({orders.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#F5F2EB] hover:bg-[#EAE6DE] text-[#1A1917] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 1: TRACK ORDER TIMELINE */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              {/* Order ID Input Form & Quick Sample Chips */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 shadow-xs space-y-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#766E65] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter Order ID (e.g. 1987-ORD-9842) or Tracking Code..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] text-sm text-[#1A1917] focus:outline-none focus:border-[#8C4B23] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#1A1917] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Track Commission</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                  </button>
                </form>

                {/* Quick Sample Order Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F2EFE9]">
                  <span className="text-[11px] font-mono text-[#766E65] uppercase">Select Active Order:</span>
                  {orders.map((ord) => (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setSelectedOrderId(ord.id);
                        setSearchQuery(ord.id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activeOrder?.id === ord.id
                          ? 'bg-[#8C4B23] text-white font-bold shadow-xs'
                          : 'bg-[#F5F2EB] text-[#524B43] hover:bg-[#EAE6DE]'
                      }`}
                    >
                      {ord.id} ({ord.customer.fullName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Status Banner */}
              {activeOrder && (
                <div className="bg-gradient-to-br from-[#22201D] to-[#141312] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-[#C5A880]/10 blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30 font-mono text-[10px] uppercase font-bold tracking-wider">
                          Active Commission
                        </span>
                        <span className="text-xs text-white/60 font-mono">{activeOrder.id}</span>
                      </div>
                      <h3 className="font-['Cinzel'] text-2xl font-bold text-white mt-1">
                        Current Status: {activeOrder.status}
                      </h3>
                      <p className="text-xs text-white/70 mt-0.5">
                        Client: {activeOrder.customer.fullName} · {activeOrder.customer.city}, {activeOrder.customer.country}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider">Estimated Delivery</div>
                        <div className="text-lg font-bold text-white flex items-center gap-1.5 justify-end">
                          <Calendar className="w-4 h-4 text-[#C5A880]" />
                          <span>{activeOrder.estimatedDeliveryDate}</span>
                        </div>
                        <div className="text-[11px] text-white/60 font-mono">{activeOrder.trackingNumber}</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Items in Order */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-white/80">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="font-semibold text-white truncate">{item.product.name}</div>
                        <div className="text-[11px] text-[#C5A880] mt-0.5">{item.wood.name}</div>
                        <div className="text-[10px] text-white/60 font-mono">
                          {item.customization.customWidthCm} × {item.customization.customDepthCm} × {item.customization.customHeightCm} cm
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Progress Timeline */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-4">
                  <h3 className="font-['Cinzel'] text-lg font-bold text-[#1A1917] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#8C4B23]" />
                    <span>Craftsmanship & Fulfillment Milestones</span>
                  </h3>
                  <span className="text-xs font-mono text-[#766E65]">
                    Vienna Atelier · Lead Time 4-6 Weeks
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E3DA]">
                  {timelineStages.map((stage, idx) => {
                    const status = getStepStatus(idx);
                    const isCompleted = status === 'completed';
                    const isCurrent = status === 'current';

                    return (
                      <div key={stage.id} className="relative group">
                        {/* Node circle on timeline */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[#8C4B23] border-[#8C4B23] text-white'
                              : isCurrent
                              ? 'bg-white border-[#8C4B23] text-[#8C4B23] ring-4 ring-[#8C4B23]/20 animate-pulse'
                              : 'bg-white border-[#D1C9BE] text-[#A39B90]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>

                        {/* Step details */}
                        <div className={`p-4 rounded-2xl border transition-all ${
                          isCurrent 
                            ? 'bg-[#FAF8F5] border-[#8C4B23] shadow-sm' 
                            : isCompleted
                            ? 'bg-white border-[#E8E3DA]'
                            : 'bg-white/40 border-[#EFECE6] opacity-60'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-['Cinzel'] text-base font-bold text-[#1A1917]">
                                {stage.title}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-[#8C4B23] text-white text-[10px] font-mono uppercase font-bold tracking-wider">
                                  Current Stage
                                </span>
                              )}
                              {isCompleted && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono uppercase font-semibold">
                                  Verified
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-[#766E65]">{stage.date}</span>
                          </div>

                          <div className="text-xs font-semibold text-[#8C4B23] mt-1">{stage.subtitle}</div>
                          <p className="text-xs text-[#524B43] mt-1.5 leading-relaxed">{stage.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Protocol Card */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2DDD5] flex items-center justify-center text-[#8C4B23] shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A1917]">White Glove Dedicated Transit Protocol</div>
                    <div className="text-[11px] text-[#766E65]">
                      Direct communication with our transport concierge 48 hours prior to residential delivery.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="mailto:concierge@1987furniture.com"
                    className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-white border border-[#E8E3DA] hover:bg-[#FAF8F5] text-xs font-semibold text-[#1A1917] transition-colors"
                  >
                    Contact Concierge
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ALL USER COMMISSIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="text-xs text-[#766E65]">
                Showing all active and fulfilled commissions placed under your atelier account. Click any to track immediately.
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setSearchQuery(ord.id);
                      setActiveTab('track');
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                      activeOrder?.id === ord.id
                        ? 'border-[#8C4B23] ring-1 ring-[#8C4B23]'
                        : 'border-[#E8E3DA]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2EFE9] pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#8C4B23]">{ord.id}</span>
                        <span className="mx-2 text-[#E8E3DA]">·</span>
                        <span className="text-xs text-[#766E65]">{ord.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] text-xs font-semibold text-[#1A1917]">
                          {ord.status}
                        </span>
                        <span className="font-['Cinzel'] text-sm font-bold text-[#1A1917]">
                          ${ord.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs text-[#524B43]">
                        <span className="font-semibold">{ord.customer.fullName}</span> · {ord.items.map(i => i.product.name).join(', ')}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#8C4B23]">
                        <span>View Progress Timeline</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E8E3DA] flex items-center justify-between text-xs text-[#766E65]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>10-Year Heirloom Warranty & Lifetime Artisan Support</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1A1917] hover:bg-black text-white font-semibold transition-colors cursor-pointer"
          >
            Close Portal
          </button>
        </div>

      </motion.div>
    </div>
  );
};
