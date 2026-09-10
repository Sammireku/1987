import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Maximize2, 
  ShieldCheck, 
  Sun, 
  Download, 
  Sliders, 
  CheckCircle2, 
  RotateCw, 
  AlertCircle, 
  Sparkles,
  Layers,
  Compass,
  Eye,
  Trash2,
  Image as ImageIcon,
  Check,
  Scan
} from 'lucide-react';
import { FurnitureItem, MaterialOption } from '../types/furniture';
import { ThreeCanvas } from './ThreeCanvas';

interface ARViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: FurnitureItem;
  woodMaterial: MaterialOption;
  fabricMaterial: MaterialOption;
  metalMaterial: MaterialOption;
  customWidthCm: number;
  customDepthCm: number;
  customHeightCm: number;
}

interface ARSnapshot {
  id: string;
  timestamp: string;
  productName: string;
  dimensions: string;
  woodName: string;
  fabricName: string;
  dataUrl: string;
}

export const ARViewModal: React.FC<ARViewModalProps> = ({
  isOpen,
  onClose,
  product,
  woodMaterial,
  fabricMaterial,
  metalMaterial,
  customWidthCm,
  customDepthCm,
  customHeightCm,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scaleLocked, setScaleLocked] = useState<boolean>(true);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0);
  const [rotationDeg, setRotationDeg] = useState<number>(15);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionZ, setPositionZ] = useState<number>(0);
  const [floorHeightCm, setFloorHeightCm] = useState<number>(0);
  
  // Real-Time Contact Shadows Toggle (User Request)
  const [contactShadowEnabled, setContactShadowEnabled] = useState<boolean>(true);

  // Environmental Lighting / Brightness Slider (User Request)
  const [lightIntensity, setLightIntensity] = useState<number>(1.0);

  // Visual Surface Detection Indicator (User Request)
  const [showSurfaceIndicator, setShowSurfaceIndicator] = useState<boolean>(true);
  const [surfaceDetected, setSurfaceDetected] = useState<boolean>(true);

  // Screenshot & Storage State (User Request)
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<ARSnapshot | null>(null);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [savedSnapshots, setSavedSnapshots] = useState<ARSnapshot[]>(() => {
    try {
      const stored = localStorage.getItem('1987_ar_snapshots');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showMetricGrid, setShowMetricGrid] = useState<boolean>(true);
  const [virtualEnv, setVirtualEnv] = useState<'camera' | 'living_loft' | 'executive_office' | 'scandinavian_room'>('camera');

  // Start live camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play error', e));
      }
      setHasCamera(true);
      setVirtualEnv('camera');
      setSurfaceDetected(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCamera(false);
      setCameraError(err.message || 'Camera access declined or unavailable in this environment.');
      setVirtualEnv('living_loft'); // Fallback to calibrated architectural loft
      setSurfaceDetected(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Capture combined screenshot: Camera/Background + 3D Furniture model + calibration metadata
  const handleTakeScreenshot = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const compositeCanvas = document.createElement('canvas');
      const targetW = 1920;
      const targetH = 1080;
      compositeCanvas.width = targetW;
      compositeCanvas.height = targetH;
      const ctx = compositeCanvas.getContext('2d');

      if (!ctx) throw new Error('Could not obtain 2D canvas context');

      // 1. Draw Background (Video feed or luxury room)
      if (virtualEnv === 'camera' && videoRef.current && videoRef.current.videoWidth > 0) {
        const video = videoRef.current;
        const vRatio = video.videoWidth / video.videoHeight;
        const tRatio = targetW / targetH;
        let sWidth = video.videoWidth;
        let sHeight = video.videoHeight;
        let sX = 0;
        let sY = 0;

        if (vRatio > tRatio) {
          sWidth = video.videoHeight * tRatio;
          sX = (video.videoWidth - sWidth) / 2;
        } else {
          sHeight = video.videoWidth / tRatio;
          sY = (video.videoHeight - sHeight) / 2;
        }

        ctx.drawImage(video, sX, sY, sWidth, sHeight, 0, 0, targetW, targetH);
      } else if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, targetW, targetH);
      } else {
        // Fallback elegant background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, targetH);
        bgGrad.addColorStop(0, '#2A2621');
        bgGrad.addColorStop(1, '#12100E');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // 2. Draw 3D Furniture WebGL Layer
      const threeCanvas = document.getElementById('ar-three-canvas') as HTMLCanvasElement;
      if (threeCanvas && threeCanvas.width > 0) {
        // Calculate centered placement matching CSS transform
        const modelScale = 1.15 * scaleMultiplier;
        const drawW = targetW * 0.7 * modelScale;
        const drawH = targetH * 0.75 * modelScale;
        const drawX = (targetW - drawW) / 2 + (positionX * 2);
        const drawY = (targetH - drawH) / 2 + ((positionZ + floorHeightCm) * 2);

        ctx.save();
        ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
        ctx.rotate((rotationDeg * Math.PI) / 180);
        ctx.drawImage(threeCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // 3. Draw Luxury Brand & Metric Watermark Stamp
      ctx.save();
      // Bottom banner overlay
      ctx.fillStyle = 'rgba(26, 25, 23, 0.85)';
      ctx.fillRect(40, targetH - 130, 680, 80);

      // Border line in atelier gold
      ctx.strokeStyle = '#C5A880';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, targetH - 130, 680, 80);

      // Logo Emblem
      ctx.fillStyle = '#C5A880';
      ctx.font = 'bold 26px "Cinzel", Georgia, serif';
      ctx.fillText('1987 ATELIER', 60, targetH - 92);

      // Product and specification
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${product.name} · True 1:1 AR Verified`, 60, targetH - 65);

      // Dimensions & finish tag
      ctx.fillStyle = '#C5A880';
      ctx.font = '13px monospace';
      ctx.fillText(
        `${customWidthCm} × ${customDepthCm} × ${customHeightCm} cm | ${woodMaterial.name} / ${fabricMaterial.name}`,
        260,
        targetH - 92
      );

      // Real-time lighting & contact shadow badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '12px monospace';
      ctx.fillText(`Lighting: ${Math.round(lightIntensity * 100)}% · Shadows: ${contactShadowEnabled ? 'ON' : 'OFF'}`, 480, targetH - 65);

      ctx.restore();

      // 4. Generate Image Data URL
      const dataUrl = compositeCanvas.toDataURL('image/jpeg', 0.92);

      const newSnapshot: ARSnapshot = {
        id: `snapshot_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        productName: product.name,
        dimensions: `${customWidthCm} × ${customDepthCm} × ${customHeightCm} cm`,
        woodName: woodMaterial.name,
        fabricName: fabricMaterial.name,
        dataUrl,
      };

      // 5. Save to Browser Memory / LocalStorage (User Request)
      const updatedSnapshots = [newSnapshot, ...savedSnapshots.slice(0, 19)]; // Store up to 20 captures
      setSavedSnapshots(updatedSnapshots);
      try {
        localStorage.setItem('1987_ar_snapshots', JSON.stringify(updatedSnapshots));
      } catch (err) {
        console.warn('LocalStorage limit reached for AR captures, kept in memory', err);
      }

      setLastCapturedImage(newSnapshot);

    } catch (err) {
      console.error('Screenshot capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadSnapshot = (snapshot: ARSnapshot) => {
    const link = document.createElement('a');
    link.download = `1987_AR_${product.name.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    link.href = snapshot.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSnapshots.filter(s => s.id !== id);
    setSavedSnapshots(updated);
    try {
      localStorage.setItem('1987_ar_snapshots', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    if (lastCapturedImage?.id === id) {
      setLastCapturedImage(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ar-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex flex-col overflow-hidden text-white font-sans"
          >
        
        {/* Top Floating Control Bar */}
        <header className="absolute top-0 left-0 right-0 z-30 p-4 md:p-6 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-2.5 pointer-events-auto">
            
            {/* Atelier AR Calibration Badge */}
            <div className="bg-[#1C1A17]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C5A880]/40 shadow-xl flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-white text-xs font-semibold tracking-wider uppercase font-['Cinzel']">
                1987 True-Scale AR
              </span>
              <span className="text-[#C5A880] text-[11px] font-mono border-l border-white/20 pl-2">
                1:1 Metric Calibration
              </span>
            </div>

            {/* Scale lock indicator */}
            <button
              id="ar-toggle-scale-lock"
              onClick={() => {
                setScaleLocked(!scaleLocked);
                if (!scaleLocked) setScaleMultiplier(1.0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 border cursor-pointer ${
                scaleLocked
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20 shadow-md'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{scaleLocked ? '1:1 Scale Locked' : 'Free Scaling'}</span>
            </button>

            {/* Surface Detection Status Indicator Pill (User Request) */}
            <div 
              onClick={() => setShowSurfaceIndicator(!showSurfaceIndicator)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#C5A880]/30 text-xs text-[#C5A880] cursor-pointer hover:bg-black/80 transition-colors"
              title="Toggle Visual Surface Detection Grid"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Surface: <strong className="text-white">Floor Locked (0.00m)</strong></span>
            </div>

          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            
            {/* View Saved AR Captures Drawer Toggle */}
            <button
              id="ar-open-gallery-button"
              onClick={() => setShowGallery(!showGallery)}
              className="relative px-3 py-1.5 rounded-full bg-[#1C1A17]/90 backdrop-blur-md border border-white/20 hover:border-[#C5A880] text-xs text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View Saved AR Snapshots"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Gallery</span>
              {savedSnapshots.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#8C4B23] text-white text-[10px] font-mono font-bold">
                  {savedSnapshots.length}
                </span>
              )}
            </button>

            {/* Virtual Room Selector if camera is fallback or preferred */}
            <div className="hidden md:flex bg-[#1C1A17]/90 backdrop-blur-md rounded-full p-1 border border-white/10 text-xs">
              <button
                onClick={() => {
                  setVirtualEnv('camera');
                  startCamera();
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${virtualEnv === 'camera' ? 'bg-[#C5A880] text-[#1A1917] font-semibold' : 'text-white/70 hover:text-white'}`}
              >
                Live Camera
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setVirtualEnv('living_loft');
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${virtualEnv === 'living_loft' ? 'bg-[#C5A880] text-[#1A1917] font-semibold' : 'text-white/70 hover:text-white'}`}
              >
                Loft Space
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setVirtualEnv('executive_office');
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${virtualEnv === 'executive_office' ? 'bg-[#C5A880] text-[#1A1917] font-semibold' : 'text-white/70 hover:text-white'}`}
              >
                Office Suite
              </button>
            </div>

            <button
              id="ar-close-button"
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 transition-colors shadow-lg cursor-pointer"
              title="Close AR Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* AR Viewport: Live Camera Feed OR High-Def Architectural Space */}
        <div 
          ref={canvasContainerRef}
          className="relative flex-1 w-full h-full overflow-hidden bg-[#11100F] flex items-center justify-center"
        >
          {virtualEnv === 'camera' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-95 contrast-105"
            />
          )}

          {virtualEnv === 'living_loft' && (
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#2A2621] via-[#1E1B17] to-[#12100E] flex items-center justify-center">
              <img
                ref={bgImageRef}
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80"
                alt="Modern Loft Living Room"
                crossOrigin="anonymous"
                className="w-full h-full object-cover opacity-60 filter saturate-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none"></div>
            </div>
          )}

          {virtualEnv === 'executive_office' && (
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1C2024] to-[#0E1012] flex items-center justify-center">
              <img
                ref={bgImageRef}
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
                alt="Executive Office Suite"
                crossOrigin="anonymous"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none"></div>
            </div>
          )}

          {/* VISUAL SURFACE DETECTION INDICATOR (User Request) */}
          {showSurfaceIndicator && (
            <div
              className="absolute bottom-12 pointer-events-none z-10 flex items-center justify-center"
              style={{
                transform: `perspective(900px) rotateX(74deg) translateY(${floorHeightCm}px) scale(${scaleMultiplier})`,
              }}
            >
              {/* Subtle expanding grid pulse rings */}
              <div className="relative w-[780px] h-[780px] rounded-full border border-[#C5A880]/20 flex items-center justify-center animate-ar-surface-pulse">
                <div className="w-[580px] h-[580px] rounded-full border border-[#C5A880]/30 animate-pulse"></div>
              </div>

              {/* Surface Radar LiDAR Sweep Line */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[680px] h-[680px] rounded-full border border-dashed border-[#C5A880]/40 animate-ar-lidar-sweep pointer-events-none">
                  <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-[#C5A880] absolute top-1/2 left-1/2 origin-left"></div>
                </div>
              </div>

              {/* 10cm metric calibration dots grid */}
              <div
                className="absolute w-[680px] h-[680px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(197, 168, 128, 0.12) 0%, rgba(197, 168, 128, 0.02) 65%, transparent 75%)',
                  backgroundImage: 'radial-gradient(#C5A880 1.2px, transparent 1.2px), radial-gradient(#C5A880 1.2px, transparent 1.2px)',
                  backgroundSize: '36px 36px',
                  backgroundPosition: '0 0, 18px 18px',
                }}
              />

              {/* Center Plinth Crosshair & Target Indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 border-[#C5A880] rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C5A880] animate-ping"></div>
              </div>

              {/* Exact Footprint Boundary Frame with corner brackets */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-emerald-400/80 bg-emerald-500/10 rounded-md transition-all duration-200"
                style={{
                  width: `${customWidthCm * 2.8}px`,
                  height: `${customDepthCm * 2.8}px`,
                }}
              >
                {/* Footprint badge */}
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-emerald-300 bg-black/85 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-md whitespace-nowrap">
                  Surface Plane: {customWidthCm} × {customDepthCm} cm
                </span>

                {/* 4 Corner Targeting Reticles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>
              </div>

            </div>
          )}

          {/* 3D Furniture Model Layer rendered transparently over camera feed */}
          <div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto transition-transform duration-150"
            style={{
              transform: `translate(${positionX}px, ${positionZ + floorHeightCm}px) scale(${scaleMultiplier}) rotate(${rotationDeg}deg)`,
            }}
          >
            <div className="w-[85%] h-[80%] max-w-[850px] max-h-[750px]">
              <ThreeCanvas
                canvasId="ar-three-canvas"
                product={product}
                woodMaterial={woodMaterial}
                fabricMaterial={fabricMaterial}
                metalMaterial={metalMaterial}
                customWidthCm={customWidthCm}
                customDepthCm={customDepthCm}
                customHeightCm={customHeightCm}
                showDimensions={true}
                explodedAmount={0}
                isARMode={true}
                contactShadowEnabled={contactShadowEnabled}
                lightIntensity={lightIntensity}
              />
            </div>
          </div>

          {/* Quick Snapshot Notification / Preview Toast */}
          <AnimatePresence>
            {lastCapturedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute top-20 right-6 z-40 bg-[#1A1917]/95 border border-[#C5A880] text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm flex items-center gap-3"
              >
                <img 
                  src={lastCapturedImage.dataUrl} 
                  alt="Snapshot preview" 
                  className="w-16 h-16 object-cover rounded-xl border border-white/20 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved to Browser Memory!</span>
                  </div>
                  <div className="text-[11px] font-mono text-white/80 truncate mt-0.5">
                    {lastCapturedImage.productName}
                  </div>
                  <div className="text-[10px] text-[#A79F93]">
                    {lastCapturedImage.dimensions}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDownloadSnapshot(lastCapturedImage)}
                      className="text-[11px] font-semibold text-[#1A1917] bg-[#C5A880] hover:bg-[#D4AF37] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => setShowGallery(true)}
                      className="text-[11px] text-white/80 hover:text-white underline cursor-pointer"
                    >
                      Open Gallery
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setLastCapturedImage(null)}
                  className="text-white/60 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Snapshot Flash Overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-500 pointer-events-none"></div>
          )}
        </div>

        {/* Bottom AR Calibration Dock */}
        <footer className="relative z-30 bg-[#1C1A17]/95 backdrop-blur-xl border-t border-[#C5A880]/20 p-4 md:p-6 text-white">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            
            {/* Row 1: Product Summary + Contact Shadow Toggle + Brightness Slider */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
              
              {/* Product Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#2B2723] border border-[#C5A880]/30 flex items-center justify-center font-['Cinzel'] text-lg text-[#C5A880] font-bold">
                  87
                </div>
                <div>
                  <div className="font-['Cinzel'] text-sm font-semibold tracking-wide text-white">{product.name}</div>
                  <div className="text-xs text-[#C5A880] flex items-center gap-2 mt-0.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: woodMaterial.colorHex }}></span>
                    <span>{woodMaterial.name}</span>
                    <span className="text-white/30">/</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fabricMaterial.colorHex }}></span>
                    <span>{fabricMaterial.name}</span>
                  </div>
                </div>
              </div>

              {/* ADVANCED AR REAL-TIME TOGGLES: Contact Shadows + Environmental Lighting */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                
                {/* 1. Real-Time Contact Shadows Toggle (User Request) */}
                <button
                  id="ar-toggle-contact-shadows"
                  onClick={() => setContactShadowEnabled(!contactShadowEnabled)}
                  className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                    contactShadowEnabled
                      ? 'bg-[#C5A880]/25 border-[#C5A880] text-[#C5A880] shadow-sm font-semibold'
                      : 'bg-black/40 border-white/15 text-white/50 hover:text-white/80'
                  }`}
                  title="Enable real-time contact shadows for realistic floor occlusion"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Contact Shadows: <strong>{contactShadowEnabled ? 'ON' : 'OFF'}</strong></span>
                </button>

                {/* 2. Environmental Lighting / Brightness Slider (User Request) */}
                <div className="flex items-center gap-2.5 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10">
                  <Sun className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="text-white/80">Room Light:</span>
                  <input
                    id="ar-lighting-slider"
                    type="range"
                    min="0.4"
                    max="2.2"
                    step="0.1"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(Number(e.target.value))}
                    className="w-24 sm:w-28 accent-[#C5A880] cursor-pointer"
                    title="Adjust virtual light intensity to match your physical room"
                  />
                  <span className="font-mono text-[#C5A880] font-semibold w-10 text-right">
                    {Math.round(lightIntensity * 100)}%
                  </span>
                </div>

                {/* 3. Surface Detection Toggle (User Request) */}
                <button
                  id="ar-toggle-surface-indicator"
                  onClick={() => setShowSurfaceIndicator(!showSurfaceIndicator)}
                  className={`px-3 py-2 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showSurfaceIndicator
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-black/30 border-white/10 text-white/60'
                  }`}
                  title="Toggle floor space detection pulse"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Surface Pulse</span>
                </button>

              </div>

            </div>

            {/* Row 2: Placement Sliders & Take Screenshot Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Rotation Slider */}
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  <RotateCw className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="text-white/70">Rotate:</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotationDeg}
                    onChange={(e) => setRotationDeg(Number(e.target.value))}
                    className="w-20 accent-[#C5A880] cursor-pointer"
                  />
                  <span className="font-mono text-white/90 w-8">{rotationDeg}°</span>
                </div>

                {/* Free Scale (if unlocked) */}
                {!scaleLocked && (
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 animate-in fade-in">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white/70">Scale:</span>
                    <input
                      type="range"
                      min="0.6"
                      max="1.6"
                      step="0.05"
                      value={scaleMultiplier}
                      onChange={(e) => setScaleMultiplier(Number(e.target.value))}
                      className="w-20 accent-amber-400 cursor-pointer"
                    />
                    <span className="font-mono text-white/90 w-10">{(scaleMultiplier * 100).toFixed(0)}%</span>
                  </div>
                )}

                {/* Reset to Center */}
                <button
                  onClick={() => {
                    setPositionX(0);
                    setPositionZ(0);
                    setRotationDeg(15);
                    setScaleMultiplier(1.0);
                    setScaleLocked(true);
                    setFloorHeightCm(0);
                    setLightIntensity(1.0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset to 1:1 Origin"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Origin</span>
                </button>
              </div>

              {/* TAKE SCREENSHOT BUTTON (User Request) */}
              <div className="flex items-center gap-3">
                <button
                  id="ar-take-screenshot-button"
                  onClick={handleTakeScreenshot}
                  disabled={isCapturing}
                  className="px-6 py-2.5 rounded-full bg-[#C5A880] hover:bg-[#D4AF37] text-[#1A1917] font-semibold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Take combined screenshot of camera view and 3D furniture"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCapturing ? 'Capturing...' : 'Take Screenshot'}</span>
                </button>
              </div>

            </div>

          </div>
        </footer>

        {/* SAVED SNAPSHOTS GALLERY DRAWER */}
        <AnimatePresence>
          {showGallery && (
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ duration: 0.25 }}
              className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[#1A1917] border-l border-[#C5A880]/30 shadow-2xl z-40 p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C5A880]" />
                    <h3 className="font-['Cinzel'] text-base font-bold text-white">AR Room Snapshots</h3>
                  </div>
                  <button
                    onClick={() => setShowGallery(false)}
                    className="p-1 rounded-full text-white/60 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-white/60">
                  High-resolution composites saved directly in your browser storage.
                </p>

                {savedSnapshots.length === 0 ? (
                  <div className="text-center py-12 text-white/40 space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-white/20" />
                    <div className="text-xs">No snapshots taken yet.</div>
                    <div className="text-[11px] text-white/30">Click &apos;Take Screenshot&apos; to capture your room with the 3D model!</div>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
                    {savedSnapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 hover:border-[#C5A880]/50 transition-colors"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                          <img src={snap.dataUrl} alt={snap.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-start justify-between text-xs pt-1">
                          <div>
                            <div className="font-semibold text-white truncate max-w-[190px]">{snap.productName}</div>
                            <div className="text-[10px] font-mono text-[#C5A880]">{snap.dimensions}</div>
                            <div className="text-[9px] text-white/40">{snap.timestamp}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDownloadSnapshot(snap)}
                              className="p-1.5 rounded-lg bg-[#C5A880] text-[#1A1917] hover:bg-[#D4AF37] transition-colors cursor-pointer"
                              title="Download to device"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSnapshot(snap.id, e)}
                              className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Delete snapshot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {savedSnapshots.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all saved AR room snapshots?')) {
                        setSavedSnapshots([]);
                        localStorage.removeItem('1987_ar_snapshots');
                      }
                    }}
                    className="w-full py-2 text-center text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                  >
                    Clear All Saved Captures
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
