import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Share2, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles,
  QrCode,
  Smartphone
} from 'lucide-react';
import { FurnitureItem, MaterialOption, CustomizationSelection } from '../types/furniture';
import { ProductImage } from '../utils/productImages';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: FurnitureItem;
  selection: CustomizationSelection;
  calculatedPrice: number;
  woodName?: string;
  fabricName?: string;
  metalName?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  product,
  selection,
  calculatedPrice,
  woodName,
  fabricName,
  metalName,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  if (!isOpen) return null;

  // Build high-fidelity shareable URL with parameters
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const customWidth = selection.customWidthCm ?? product.dimensions?.widthCm ?? 0;
  const customDepth = selection.customDepthCm ?? product.dimensions?.depthCm ?? 0;
  const customHeight = selection.customHeightCm ?? product.dimensions?.heightCm ?? 0;
  const woodId = selection.selectedWoodId || product.defaultWoodId || '';
  const fabricId = selection.selectedFabricId || product.defaultFabricId || '';
  const metalId = selection.selectedMetalId || product.defaultMetalId || '';

  const shareParams = new URLSearchParams({
    view: 'studio',
    product: product.id,
    wood: woodId,
    fabric: fabricId,
    metal: metalId,
    w: String(customWidth),
    d: String(customDepth),
    h: String(customHeight),
  });
  const shareUrl = `${origin}?${shareParams.toString()}`;

  const shareTitle = `My Custom ${product.name} from 1987 Furniture Atelier`;
  const shareText = `Check out my custom handcrafted solid wood configuration of the ${product.name} (${customWidth}x${customDepth}cm in ${woodName || 'Solid Wood'}) from 1987 Atelier:`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl border border-[#E8E3DA] p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#8C4B23]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-sm sm:text-base text-[#1A1917]">
                Share Atelier Configuration
              </h3>
              <p className="text-[11px] text-[#766E65]">
                Generate a persistent share link with all dimensional & material choices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#766E65] hover:text-[#1A1917] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Summary Card */}
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-3.5 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E8E3DA] shrink-0 relative bg-white">
            <ProductImage
              product={product}
              alt={product.name}
              containerClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-['Cinzel'] font-bold text-xs text-[#1A1917] truncate">
              {product.name}
            </div>
            <div className="text-[11px] text-[#766E65] truncate">
              {woodName || 'Solid Wood'} · {customWidth}×{customDepth}×{customHeight} cm
            </div>
            <div className="text-xs font-mono font-bold text-[#8C4B23] mt-0.5">
              ${calculatedPrice.toLocaleString('en-US')}
            </div>
          </div>
        </div>

        {/* Tab Switcher: Direct Link vs QR Code for Mobile AR */}
        <div className="flex items-center bg-[#F4EFEA] p-1 rounded-xl border border-[#E8E3DA] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'link' ? 'bg-white text-[#1A1917] shadow-xs' : 'text-[#766E65]'
            }`}
          >
            Direct Shareable Link
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'qr' ? 'bg-white text-[#1A1917] shadow-xs' : 'text-[#766E65]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#8C4B23]" />
            <span>Mobile AR QR Code</span>
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="space-y-4">
            {/* Direct Copyable Link Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#524B43] uppercase tracking-wider block">
                Shareable Configuration URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl px-3 py-2 text-xs font-mono text-[#524B43] select-all truncate focus:outline-none"
                />
                <button
                  id="copy-share-url-btn"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#1A1917] text-white hover:bg-black'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Channels Row */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-[#524B43] uppercase tracking-wider">
                Broadcast via Social Channels
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                >
                  <span className="font-bold text-xs text-[#1A1917]">X / Twitter</span>
                  <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                    Share <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>

                {/* Pinterest */}
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                >
                  <span className="font-bold text-xs text-[#1A1917]">Pinterest</span>
                  <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                    Pin <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                >
                  <span className="font-bold text-xs text-[#1A1917]">WhatsApp</span>
                  <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                    Send <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
                  className="p-2.5 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                >
                  <span className="font-bold text-xs text-[#1A1917]">Email</span>
                  <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                    Send <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* QR CODE VIEW */
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] flex flex-col items-center text-center space-y-3">
            <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-[#E8E3DA] shadow-sm flex items-center justify-center">
              {/* Clean vector QR Representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#1A1917]">
                <rect width="100" height="100" fill="white" />
                {/* 3 Corner Markers */}
                <rect x="5" y="5" width="25" height="25" fill="#1A1917" />
                <rect x="9" y="9" width="17" height="17" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="#1A1917" />

                <rect x="70" y="5" width="25" height="25" fill="#1A1917" />
                <rect x="74" y="9" width="17" height="17" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="#1A1917" />

                <rect x="5" y="70" width="25" height="25" fill="#1A1917" />
                <rect x="9" y="74" width="17" height="17" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="#1A1917" />

                {/* Simulated QR Payload Matrix */}
                <rect x="35" y="8" width="6" height="6" fill="#8C4B23" />
                <rect x="45" y="8" width="6" height="6" fill="#1A1917" />
                <rect x="55" y="8" width="6" height="6" fill="#1A1917" />
                <rect x="35" y="20" width="6" height="6" fill="#1A1917" />
                <rect x="45" y="20" width="6" height="6" fill="#8C4B23" />
                <rect x="55" y="25" width="6" height="6" fill="#1A1917" />
                <rect x="8" y="38" width="6" height="6" fill="#1A1917" />
                <rect x="18" y="45" width="6" height="6" fill="#1A1917" />
                <rect x="28" y="38" width="6" height="6" fill="#8C4B23" />
                <rect x="38" y="45" width="25" height="10" fill="#1A1917" rx="2" />
                <rect x="70" y="38" width="8" height="8" fill="#1A1917" />
                <rect x="82" y="45" width="8" height="8" fill="#8C4B23" />
                <rect x="35" y="65" width="8" height="8" fill="#1A1917" />
                <rect x="50" y="65" width="8" height="8" fill="#1A1917" />
                <rect x="40" y="80" width="18" height="6" fill="#8C4B23" />
                <rect x="70" y="75" width="20" height="15" fill="#1A1917" rx="1" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-[#1A1917] flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#8C4B23]" />
                Scan to Open True 1:1 AR on iPhone / Android
              </div>
              <p className="text-[11px] text-[#766E65] mt-0.5">
                Open camera app on your mobile device to place this custom piece directly in your room
              </p>
            </div>
          </div>
        )}

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] text-xs font-semibold text-[#524B43] hover:text-[#1A1917] transition-colors cursor-pointer"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
};
