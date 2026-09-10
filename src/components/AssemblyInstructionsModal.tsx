import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Clock, 
  Users, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { FurnitureItem } from '../types/furniture';

interface AssemblyInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: FurnitureItem;
}

interface StepData {
  stepNumber: number;
  title: string;
  summary: string;
  partsNeeded: string[];
  toolsNeeded: string[];
  durationMinutes: number;
  criticalNote?: string;
  diagramType: 'base_prep' | 'frame_joinery' | 'hardware_fastening' | 'cushion_placement' | 'leveling_inspection';
}

export const AssemblyInstructionsModal: React.FC<AssemblyInstructionsModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPdfDownloaded, setIsPdfDownloaded] = useState<boolean>(false);

  // Generate customized assembly steps based on furniture category and specifications
  const steps: StepData[] = [
    {
      stepNumber: 1,
      title: 'Unpacking & Timber Inspection',
      summary: 'Lay the protective wool felt blanket onto a clean, flat floor. Carefully lift the solid wood components from the wooden atelier crate without using box cutters directly on the wood surfaces.',
      partsNeeded: ['Main Base Component (Part A)', 'Protective Underlay'],
      toolsNeeded: ['Soft Cotton Gloves', 'Uncrating Pry Tool'],
      durationMinutes: 5,
      criticalNote: 'Ensure the temperature is between 18°C–24°C to allow timber to acclimatize prior to final bolt tightening.',
      diagramType: 'base_prep',
    },
    {
      stepNumber: 2,
      title: 'Structural Frame & Joinery Alignment',
      summary: 'Interlock the precision mortise-and-tenon or finger joints of the side frames with the primary horizontal stretcher. Match the hand-stamped craft identification numbers on corresponding joints.',
      partsNeeded: ['Side Brackets (Parts B1 & B2)', 'Center Spine Beam (Part C)'],
      toolsNeeded: ['Soft-Faced Rubber Mallet (Included)'],
      durationMinutes: 8,
      criticalNote: 'Do not force dry joints. If snug, tap gently using the provided wooden spacer block.',
      diagramType: 'frame_joinery',
    },
    {
      stepNumber: 3,
      title: 'Architectural Fasteners & Torque Setting',
      summary: 'Insert the stainless steel socket head connector bolts into the counterbored brass insert bushings. Thread all bolts finger-tight first before applying final half-turn torque.',
      partsNeeded: ['8x M8 Architectural Bolts', '8x Neoprene Vibration Washers'],
      toolsNeeded: ['4mm Atelier Precision Hex Key (Included)'],
      durationMinutes: 10,
      criticalNote: 'Torque specification: 8.5 Nm. Do not use power drill drivers to avoid stripping natural wood threads.',
      diagramType: 'hardware_fastening',
    },
    {
      stepNumber: 4,
      title: 'Upholstery & Cushion Lock Placement',
      summary: 'Position the high-resilience foam core upholstered modules into the recessed wood seat perimeter. Engage the concealed industrial magnetic or tension clip locks.',
      partsNeeded: ['Seat Upholstery Core', 'Backrest Bolsters'],
      toolsNeeded: ['None (Hand Alignment)'],
      durationMinutes: 5,
      criticalNote: 'Smooth Sunbrella™ fabric towards outer edges to preserve tailored profile seams.',
      diagramType: 'cushion_placement',
    },
    {
      stepNumber: 5,
      title: 'Floor Glide Leveling & Final Inspection',
      summary: 'Rotate the recessed brass leveling glides on the underside of each leg until all contact points sit completely flush on the floor without rocking.',
      partsNeeded: ['4x Felt Glides (Fitted)'],
      toolsNeeded: ['Spirit Level (Included in tool kit)'],
      durationMinutes: 4,
      criticalNote: 'Apply the complimentary bottle of cold-pressed organic walnut finishing oil with the microfiber pad once per year.',
      diagramType: 'leveling_inspection',
    },
  ];

  if (!isOpen || !product) return null;

  const currentStep = steps[currentStepIndex];

  // Handle PDF Download Simulation
  const handleDownloadPDF = () => {
    setIsPdfDownloaded(true);
    const content = `1987 FURNITURE ATELIER - OFFICIAL ASSEMBLY SPECIFICATION
=========================================================
Product: ${product.name}
SKU: 1987-CAT87-${product.id.toUpperCase()}
Category: ${product.category.toUpperCase()}
Dimensions: ${product.dimensions?.widthCm ?? 0}cm (W) x ${product.dimensions?.depthCm ?? 0}cm (D) x ${product.dimensions?.heightCm ?? 0}cm (H)
Lead Time: ${product.leadTimeWeeks} Weeks
PEFC Certification: AT-2026-PEFC-87910
Manufactured: Gmunden Atelier, Austria

MANUAL MANIFEST & HARDWARE LIST:
1. Part A: Main Timber Chassis (Solid Wood)
2. Part B: Subframe Lateral Stretcher (2x)
3. Part C: Stainless Steel Connector Pack (8x M8 Bolts, 8x Bushings)
4. Part D: Atelier Hex Key Tool & Spirit Level

STEPS OVERVIEW:
${steps.map((s) => `STEP ${s.stepNumber}: ${s.title}\n- ${s.summary}\n- Critical Note: ${s.criticalNote || 'Standard'}\n`).join('\n')}

For white-glove installation support, contact: concierge@1987furniture.com`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1987-Assembly-Guide-${product.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setIsPdfDownloaded(false), 4000);
  };

  // Render SVG Technical Diagram based on diagramType
  const renderDiagram = (type: StepData['diagramType']) => {
    return (
      <div className="w-full h-56 sm:h-72 bg-[#1A1917] rounded-2xl border border-[#38332C] relative flex items-center justify-center p-6 overflow-hidden">
        {/* Subtle architectural grid background */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(#C5A880 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Blueprint Stamp */}
        <div className="absolute top-3 left-3 text-[9px] font-mono text-[#C5A880]/70 border border-[#C5A880]/30 px-2 py-0.5 rounded">
          DWG-REF: 1987-{product.id.slice(0, 8).toUpperCase()}-STEP-{currentStepIndex + 1}
        </div>

        <div className="absolute top-3 right-3 text-[9px] font-mono text-[#C5A880]/70">
          SCALE: 1:10 METRIC
        </div>

        {/* Dynamic Vector Technical Diagram */}
        <svg viewBox="0 0 400 200" className="w-full h-full max-w-md text-[#FAF8F5]">
          {type === 'base_prep' && (
            <g stroke="#C5A880" strokeWidth="1.5" fill="none">
              {/* Floor plane */}
              <line x1="20" y1="170" x2="380" y2="170" strokeDasharray="4 4" stroke="#665D52" />
              {/* Felt blanket */}
              <rect x="50" y="162" width="300" height="8" rx="2" fill="#3D3730" stroke="#8C4B23" />
              {/* Main wood chassis */}
              <rect x="80" y="110" width="240" height="45" rx="3" fill="#262320" />
              <line x1="80" y1="125" x2="320" y2="125" stroke="#C5A880" strokeDasharray="2 2" />
              {/* Lifting arrows */}
              <path d="M120,70 L120,95 M115,90 L120,98 L125,90" stroke="#FFF" strokeWidth="2" />
              <path d="M280,70 L280,95 M275,90 L280,98 L285,90" stroke="#FFF" strokeWidth="2" />
              <text x="200" y="55" fill="#C5A880" fontSize="11" textAnchor="middle" fontFamily="monospace">LOWER LEVEL CHASSIS GENTLY</text>
            </g>
          )}

          {type === 'frame_joinery' && (
            <g stroke="#C5A880" strokeWidth="1.5" fill="none">
              {/* Left leg joint */}
              <rect x="70" y="50" width="30" height="110" rx="2" fill="#262320" />
              {/* Tenon cutout */}
              <rect x="100" y="85" width="20" height="30" fill="#3D3730" strokeDasharray="2 2" />
              {/* Horizontal rail sliding into tenon */}
              <rect x="135" y="85" width="180" height="30" rx="2" fill="#262320" />
              {/* Slide direction arrow */}
              <path d="M165,100 L115,100 M125,93 L112,100 L125,107" stroke="#FFF" strokeWidth="2" />
              {/* Rubber mallet icon outline */}
              <rect x="330" y="60" width="28" height="16" rx="2" fill="#8C4B23" />
              <line x1="344" y1="76" x2="344" y2="120" stroke="#FFF" strokeWidth="2" />
              <text x="200" y="45" fill="#C5A880" fontSize="11" textAnchor="middle" fontFamily="monospace">ENGAGE MORTISE & TENON SLOTS</text>
            </g>
          )}

          {type === 'hardware_fastening' && (
            <g stroke="#C5A880" strokeWidth="1.5" fill="none">
              <rect x="60" y="90" width="280" height="40" rx="3" fill="#262320" />
              {/* 4 Bolt positions */}
              {[100, 160, 240, 300].map((bx, idx) => (
                <g key={idx}>
                  {/* Hex bolt */}
                  <circle cx={bx} cy="60" r="8" fill="#3D3730" stroke="#FFF" />
                  <path d={`M${bx},40 L${bx},75 M${bx - 4},70 L${bx},80 L${bx + 4},70`} stroke="#C5A880" strokeWidth="1.5" />
                  {/* Bushing hole */}
                  <rect x={bx - 6} y="90" width="12" height="20" rx="1" fill="#8C4B23" stroke="#FFF" />
                </g>
              ))}
              {/* Torque indicator */}
              <text x="200" y="165" fill="#FFF" fontSize="11" textAnchor="middle" fontFamily="monospace">
                TORQUE TO 8.5 Nm WITH PROVIDED 4mm KEY
              </text>
            </g>
          )}

          {type === 'cushion_placement' && (
            <g stroke="#C5A880" strokeWidth="1.5" fill="none">
              {/* Base */}
              <rect x="60" y="130" width="280" height="30" rx="2" fill="#262320" />
              {/* Cushion module floating above */}
              <rect x="80" y="60" width="240" height="50" rx="8" fill="#3D3730" stroke="#FFF" />
              {/* Downward alignment arrows */}
              <path d="M120,115 L120,126 M116,122 L120,128 L124,122" stroke="#C5A880" strokeWidth="2" />
              <path d="M280,115 L280,126 M276,122 L280,128 L284,122" stroke="#C5A880" strokeWidth="2" />
              <text x="200" y="45" fill="#C5A880" fontSize="11" textAnchor="middle" fontFamily="monospace">PRESS FIRMLY INTO MAGNETIC STOPS</text>
            </g>
          )}

          {type === 'leveling_inspection' && (
            <g stroke="#C5A880" strokeWidth="1.5" fill="none">
              {/* Leg bottoms */}
              <rect x="70" y="50" width="35" height="85" fill="#262320" />
              <rect x="295" y="50" width="35" height="85" fill="#262320" />
              {/* Adjustable brass glides */}
              <rect x="73" y="135" width="29" height="12" rx="2" fill="#C5A880" stroke="#FFF" />
              <rect x="298" y="135" width="29" height="12" rx="2" fill="#C5A880" stroke="#FFF" />
              {/* Rotation symbol */}
              <path d="M87,162 A10,10 0 1,0 77,152" stroke="#FFF" strokeWidth="1.5" />
              <path d="M312,162 A10,10 0 1,0 302,152" stroke="#FFF" strokeWidth="1.5" />
              {/* Level line */}
              <line x1="30" y1="147" x2="370" y2="147" strokeDasharray="3 3" stroke="#8C4B23" />
              <text x="200" y="175" fill="#C5A880" fontSize="11" textAnchor="middle" fontFamily="monospace">ROTATE GLIDES FOR ZERO-ROCK BALANCING</text>
            </g>
          )}
        </svg>

        {/* Step Badge Bottom Right */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#C5A880] bg-black/60 px-2.5 py-1 rounded-full border border-[#C5A880]/30">
          Step {currentStep.stepNumber} of {steps.length}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="relative bg-white w-full max-w-5xl rounded-3xl border border-[#E8E3DA] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* TOP BAR */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8E3DA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E3DA] flex items-center justify-center text-[#8C4B23]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cinzel'] font-bold text-base sm:text-lg text-[#1A1917]">
                  Atelier Assembly Instructions
                </h2>
                <span className="text-[10px] font-mono bg-[#8C4B23]/10 text-[#8C4B23] px-2 py-0.5 rounded font-semibold">
                  {product.name}
                </span>
              </div>
              <p className="text-xs text-[#766E65]">
                Official manual from 1987 Austrian workshop · Estimated build time: 25–35 min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="hidden sm:flex items-center bg-[#EFECE6] p-1 rounded-xl border border-[#E8E3DA] text-xs font-semibold">
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'interactive'
                    ? 'bg-[#1A1917] text-white shadow-xs'
                    : 'text-[#615951] hover:text-[#1A1917]'
                }`}
              >
                Interactive Steps
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'pdf'
                    ? 'bg-[#1A1917] text-white shadow-xs'
                    : 'text-[#615951] hover:text-[#1A1917]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>PDF Blueprint View</span>
              </button>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="p-2.5 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#FAF8F5] text-[#1A1917] transition-colors cursor-pointer"
              title="Download Assembly Guide"
            >
              <Download className="w-4 h-4 text-[#8C4B23]" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#E8E3DA] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#1A1917] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* QUICK SPECS BANNER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3DA] flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#8C4B23]" />
              <div>
                <div className="text-[10px] uppercase text-[#766E65] font-mono">Assembly Time</div>
                <div className="text-xs font-bold text-[#1A1917]">Approx. 25 Mins</div>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3DA] flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#8C4B23]" />
              <div>
                <div className="text-[10px] uppercase text-[#766E65] font-mono">Recommended Crew</div>
                <div className="text-xs font-bold text-[#1A1917]">1–2 Persons</div>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3DA] flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-[#8C4B23]" />
              <div>
                <div className="text-[10px] uppercase text-[#766E65] font-mono">Tool Requirements</div>
                <div className="text-xs font-bold text-[#1A1917]">Hex Key (Included)</div>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3DA] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#8C4B23]" />
              <div>
                <div className="text-[10px] uppercase text-[#766E65] font-mono">Joinery Standard</div>
                <div className="text-xs font-bold text-[#1A1917]">Mortise & Tenon</div>
              </div>
            </div>
          </div>

          {/* VIEW MODE: INTERACTIVE STEPS */}
          {viewMode === 'interactive' && (
            <div className="space-y-6">
              
              {/* Step Progress Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#8C4B23]">STEP {currentStep.stepNumber} OF {steps.length}</span>
                  <span className="text-[#766E65]">{currentStep.durationMinutes} minutes</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {steps.map((step, idx) => (
                    <button
                      key={step.stepNumber}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentStepIndex
                          ? 'bg-[#8C4B23]'
                          : idx < currentStepIndex
                          ? 'bg-emerald-600'
                          : 'bg-[#E8E3DA]'
                      }`}
                      title={`Jump to Step ${step.stepNumber}: ${step.title}`}
                    />
                  ))}
                </div>
              </div>

              {/* Diagram Stage */}
              {renderDiagram(currentStep.diagramType)}

              {/* Step Details & Instruction Text */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Main Instructions */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="font-['Cinzel'] font-bold text-xl text-[#1A1917]">
                      {currentStep.title}
                    </h3>
                    <p className="text-sm text-[#524B43] mt-2 leading-relaxed">
                      {currentStep.summary}
                    </p>
                  </div>

                  {currentStep.criticalNote && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Artisan Precaution: </strong>
                        {currentStep.criticalNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Col: Parts & Tools Manifest for this step */}
                <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-4 space-y-4 text-xs">
                  <div>
                    <div className="text-[11px] font-mono font-bold uppercase text-[#8C4B23] mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Required Components
                    </div>
                    <ul className="space-y-1.5">
                      {currentStep.partsNeeded.map((part, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-2 text-[#524B43]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{part}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-[#E8E3DA] pt-3">
                    <div className="text-[11px] font-mono font-bold uppercase text-[#8C4B23] mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      Tools Required
                    </div>
                    <ul className="space-y-1.5">
                      {currentStep.toolsNeeded.map((tool, tIdx) => (
                        <li key={tIdx} className="flex items-center gap-2 text-[#524B43]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8C4B23]"></span>
                          <span>{tool}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between border-t border-[#E8E3DA] pt-4">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl border border-[#E8E3DA] hover:bg-[#FAF8F5] text-xs font-semibold text-[#524B43] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <div className="text-xs font-mono text-[#766E65]">
                  Step {currentStepIndex + 1} of {steps.length}
                </div>

                <button
                  disabled={currentStepIndex === steps.length - 1}
                  onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-[#1A1917] hover:bg-black text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* VIEW MODE: ARCHITECTURAL PDF BLUEPRINT VIEW */}
          {viewMode === 'pdf' && (
            <div className="space-y-4">
              {/* PDF Control Bar */}
              <div className="flex items-center justify-between bg-[#FAF8F5] border border-[#E8E3DA] rounded-2xl p-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="p-1.5 rounded-lg bg-white border border-[#E8E3DA] hover:bg-[#F3EFE9] cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    className="p-1.5 rounded-lg bg-white border border-[#E8E3DA] hover:bg-[#F3EFE9] cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="p-1.5 rounded-lg bg-white border border-[#E8E3DA] hover:bg-[#F3EFE9] cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[#766E65] ml-1">{zoomLevel}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#F3EFE9] font-semibold text-[#524B43] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Blueprint</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3 py-1.5 rounded-xl bg-[#8C4B23] hover:bg-[#723C1B] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Manual PDF</span>
                  </button>
                </div>
              </div>

              {/* Rendered Document Simulation */}
              <div className="overflow-x-auto bg-[#524B43]/20 p-4 rounded-3xl border border-[#E8E3DA]">
                <div 
                  className="bg-white mx-auto shadow-2xl p-8 sm:p-12 border border-[#E8E3DA] max-w-3xl font-serif text-[#1A1917] space-y-6"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  {/* Document Header */}
                  <div className="border-b-2 border-[#1A1917] pb-4 flex items-start justify-between">
                    <div>
                      <div className="font-['Cinzel'] font-black text-2xl tracking-widest">
                        1987 ATELIER
                      </div>
                      <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#8C4B23]">
                        Certified Alpine Solid Timber Engineering
                      </div>
                      <div className="text-[10px] font-mono text-[#766E65] mt-1">
                        DOC: INST-CAT87-{product.id.toUpperCase()} · REVISION 2.4
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] space-y-0.5">
                      <div>PEFC/33-04-129 CERTIFIED</div>
                      <div>0.00 FORMALDEHYDE</div>
                      <div className="text-emerald-700 font-bold">QA PASSED #87</div>
                    </div>
                  </div>

                  {/* Product Specification Grid */}
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E3DA] font-sans grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] text-[#766E65] uppercase">Product Model</div>
                      <div className="font-bold text-[#1A1917]">{product.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#766E65] uppercase">Finished Dimensions</div>
                      <div className="font-mono text-[#1A1917]">
                        {product.dimensions?.widthCm ?? 0} × {product.dimensions?.depthCm ?? 0} × {product.dimensions?.heightCm ?? 0} cm
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#766E65] uppercase">Timber Harvest</div>
                      <div className="font-bold text-[#1A1917]">Austrian PEFC Oak/Walnut</div>
                    </div>
                  </div>

                  {/* Hardware Manifest */}
                  <div className="space-y-2 font-sans">
                    <h4 className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider text-[#1A1917] border-b border-[#E8E3DA] pb-1">
                      1. Parts & Fasteners Manifest
                    </h4>
                    <table className="w-full text-xs text-left border border-[#E8E3DA]">
                      <thead className="bg-[#FAF8F5] font-mono text-[10px] uppercase text-[#766E65]">
                        <tr>
                          <th className="p-2 border-r border-[#E8E3DA]">ID</th>
                          <th className="p-2 border-r border-[#E8E3DA]">Description</th>
                          <th className="p-2 border-r border-[#E8E3DA]">Qty</th>
                          <th className="p-2">Material Specification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E3DA]">
                        <tr>
                          <td className="p-2 font-mono font-bold border-r border-[#E8E3DA]">A</td>
                          <td className="p-2 border-r border-[#E8E3DA]">Primary Timber Chassis Frame</td>
                          <td className="p-2 font-mono border-r border-[#E8E3DA]">1</td>
                          <td className="p-2">Solid Alpine Hardwood</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono font-bold border-r border-[#E8E3DA]">B1/B2</td>
                          <td className="p-2 border-r border-[#E8E3DA]">Lateral Uprights / Leg Stanchions</td>
                          <td className="p-2 font-mono border-r border-[#E8E3DA]">2</td>
                          <td className="p-2">Solid Wood w/ Brass Inserts</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono font-bold border-r border-[#E8E3DA]">H-1</td>
                          <td className="p-2 border-r border-[#E8E3DA]">M8 Architectural Hex Socket Bolts</td>
                          <td className="p-2 font-mono border-r border-[#E8E3DA]">8</td>
                          <td className="p-2">316 Marine Stainless Steel</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono font-bold border-r border-[#E8E3DA]">T-1</td>
                          <td className="p-2 border-r border-[#E8E3DA]">Precision 4mm Allen Hex Key</td>
                          <td className="p-2 font-mono border-r border-[#E8E3DA]">1</td>
                          <td className="p-2">Hardened Tool Steel</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Sequential Steps in Document */}
                  <div className="space-y-4 font-sans pt-2">
                    <h4 className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider text-[#1A1917] border-b border-[#E8E3DA] pb-1">
                      2. Sequential Step-by-Step Directives
                    </h4>

                    {steps.map((step) => (
                      <div key={step.stepNumber} className="border-l-2 border-[#8C4B23] pl-4 space-y-1">
                        <div className="font-bold text-xs text-[#1A1917]">
                          Step {step.stepNumber}: {step.title}
                        </div>
                        <p className="text-xs text-[#524B43] leading-relaxed">
                          {step.summary}
                        </p>
                        {step.criticalNote && (
                          <div className="text-[11px] text-amber-800 font-medium">
                            * {step.criticalNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sign-Off Block */}
                  <div className="border-t border-[#E8E3DA] pt-4 font-mono text-[10px] flex justify-between items-end text-[#766E65]">
                    <div>
                      <div>INSPECTOR: K. WEISS (CHIEF MEISTER)</div>
                      <div>AUSTRIAN ATELIER WORKSHOP #4</div>
                    </div>
                    <div className="text-right">
                      <div className="font-['Cinzel'] text-xs font-bold text-[#8C4B23]">1987 GUILD SEAL</div>
                      <div>AUTHENTIC HANDCRAFTED WOOD</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM NOTIFICATION TOAST */}
        <AnimatePresence>
          {isPdfDownloaded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 right-4 bg-[#1A1917] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs z-50 border border-[#C5A880]/40"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Assembly Guide downloaded successfully.</span>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
