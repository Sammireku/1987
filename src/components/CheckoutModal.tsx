import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Download, 
  ArrowRight,
  Sparkles,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, OrderItem, CustomerDetails, MaterialOption, FurnitureItem, CustomizationSelection } from '../types/furniture';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: {
    product: FurnitureItem;
    customization: CustomizationSelection;
    wood: MaterialOption;
    fabric: MaterialOption;
    metal: MaterialOption;
    quantity: number;
    unitPrice: number;
  }[];
  onOrderComplete: (newOrder: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<'checkout' | 'processing' | 'confirmed'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'wire' | 'affirm'>('card');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('842');
  const [cardName, setCardName] = useState<string>('Genevieve Dupond');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Customer Delivery Info
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: 'Genevieve Dupond',
    email: 'g.dupond@interiors-studio.com',
    phone: '+1 (212) 555-0198',
    address: '74 Mercer Street, Loft 4B',
    apartment: 'Floor 4',
    city: 'New York',
    state: 'NY',
    postalCode: '10012',
    country: 'United States',
    deliveryOption: 'white_glove',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const deliveryFee = customer.deliveryOption === 'white_glove' ? 180 : customer.deliveryOption === 'room_of_choice' ? 95 : 0;
  const tax = subtotal * 0.08875;
  const total = subtotal + deliveryFee + tax;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      // Create confirmed order
      const orderId = `1987-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const trackingNumber = `1987-BESPOKE-WG-${Math.floor(10000 + Math.random() * 90000)}`;

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 28);
      const estDelivery = targetDate.toISOString().split('T')[0];

      const newOrder: Order = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        customer,
        items: cartItems.map((ci, idx) => ({
          id: `ord-item-${idx}-${Date.now()}`,
          ...ci,
        })),
        subtotal,
        deliveryFee,
        tax,
        total,
        status: 'Order Confirmed',
        paymentMethod,
        paymentLast4: paymentMethod === 'card' ? '4242' : '9012',
        estimatedDeliveryDate: estDelivery,
        trackingNumber,
      };

      setConfirmedOrder(newOrder);
      onOrderComplete(newOrder);
      setStep('confirmed');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8C4B23', '#C5A880', '#D4AF37', '#22201D'],
        });
      } catch {}
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#FAF8F5] border border-[#C5A880]/60 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#22201D] text-white flex items-center justify-between border-b border-[#C5A880]/30">
          <div className="flex items-center gap-3">
            <span className="font-['Cinzel'] text-lg font-bold tracking-widest text-[#C5A880]">1987</span>
            <span className="text-white/40">|</span>
            <span className="text-xs font-medium uppercase tracking-wider text-white/90">
              {step === 'confirmed' ? 'Commission Secured' : 'Frictionless Bespoke Checkout'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {step === 'checkout' && (
            <form onSubmit={handleProcessPayment} className="space-y-8">
              
              {/* 1. Item Review Summary */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#22201D] flex items-center justify-between">
                  <span>Custom Commissioned Pieces ({cartItems.length})</span>
                  <span className="text-[#8C4B23] font-mono">Bespoke Production Queue</span>
                </div>

                <div className="divide-y divide-[#E2DDD5]">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-bold text-sm text-[#22201D] font-['Cinzel']">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-[#766E65] flex flex-wrap items-center gap-2 mt-0.5">
                          <span>Scale: {item.customization.customWidthCm} × {item.customization.customDepthCm} × {item.customization.customHeightCm} cm</span>
                          <span>•</span>
                          <span>{item.wood.name}</span>
                          <span>•</span>
                          <span>{item.fabric.name}</span>
                          <span>•</span>
                          <span>{item.metal.name}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-sm text-[#22201D]">
                        ${item.unitPrice.toLocaleString('en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Customer & Delivery Address */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] space-y-4 text-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-[#22201D] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8C4B23]" />
                  White-Glove Delivery Location
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#22201D] block mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#22201D] block mb-1">Email for Production Updates</label>
                    <input
                      required
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="font-semibold text-[#22201D] block mb-1">Street Address</label>
                    <input
                      required
                      type="text"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#22201D] block mb-1">Apartment / Suite</label>
                    <input
                      type="text"
                      value={customer.apartment || ''}
                      onChange={(e) => setCustomer({ ...customer, apartment: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-[#22201D] block mb-1">City</label>
                    <input
                      required
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#22201D] block mb-1">State / Postal Code</label>
                    <input
                      required
                      type="text"
                      value={`${customer.state} ${customer.postalCode}`}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#22201D] block mb-1">Contact Phone</label>
                    <input
                      required
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Secure Payment Processing */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#22201D] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Encrypted Payment Processing
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    256-Bit TLS · PCI-DSS Level 1
                  </div>
                </div>

                {/* Payment Method Switcher */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#8C4B23] bg-[#8C4B23]/5 text-[#8C4B23] ring-1 ring-[#8C4B23]'
                        : 'border-[#E2DDD5] bg-[#FAF8F5] text-[#766E65] hover:bg-white'
                    }`}
                  >
                    Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'border-[#8C4B23] bg-[#8C4B23]/5 text-[#8C4B23] ring-1 ring-[#8C4B23]'
                        : 'border-[#E2DDD5] bg-[#FAF8F5] text-[#766E65] hover:bg-white'
                    }`}
                  >
                    Apple / Google Pay
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('affirm')}
                    className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                      paymentMethod === 'affirm'
                        ? 'border-[#8C4B23] bg-[#8C4B23]/5 text-[#8C4B23] ring-1 ring-[#8C4B23]'
                        : 'border-[#E2DDD5] bg-[#FAF8F5] text-[#766E65] hover:bg-white'
                    }`}
                  >
                    0% APR Affirm ($280/mo)
                  </button>
                </div>

                {/* Card Inputs */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="font-semibold text-[#22201D] block mb-1">Cardholder Name</label>
                      <input
                        required
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="font-semibold text-[#22201D] block mb-1">Card Number</label>
                        <div className="relative">
                          <input
                            required
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full p-2.5 pl-9 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg font-mono text-xs"
                          />
                          <CreditCard className="w-4 h-4 text-[#766E65] absolute left-3 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-[#22201D] block mb-1">Expiry / CVV</label>
                        <div className="flex gap-1.5">
                          <input
                            required
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-1/2 p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg font-mono text-xs text-center"
                          />
                          <input
                            required
                            type="password"
                            maxLength={4}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-1/2 p-2.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg font-mono text-xs text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'apple_pay' && (
                  <div className="p-4 bg-[#F2EFE9] rounded-xl text-center text-xs text-[#22201D] space-y-2">
                    <div>Biometric authentication ready via Touch ID / Face ID.</div>
                    <div className="text-[11px] text-[#766E65]">Instant tokenized authorization without exposing account numbers.</div>
                  </div>
                )}

                {paymentMethod === 'affirm' && (
                  <div className="p-4 bg-[#F2EFE9] rounded-xl text-xs text-[#22201D] space-y-1">
                    <div className="font-bold">12 Months at 0% APR financing</div>
                    <div className="text-[11px] text-[#766E65]">Pay approximately ${(total / 12).toFixed(2)}/month. No hidden fees or penalties.</div>
                  </div>
                )}
              </div>

              {/* Order Total Breakdown */}
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E2DDD5] space-y-2 text-xs">
                <div className="flex justify-between text-[#766E65]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#22201D]">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[#766E65]">
                  <span>Two-Person White-Glove In-Home Placement</span>
                  <span className="font-mono text-[#22201D]">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#766E65]">
                  <span>Estimated Tax</span>
                  <span className="font-mono text-[#22201D]">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-[#E2DDD5] text-[#22201D]">
                  <span>Commission Total</span>
                  <span className="font-mono text-[#8C4B23] text-lg font-bold">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-payment-button"
                type="submit"
                className="w-full py-4 rounded-xl bg-[#8C4B23] hover:bg-[#723B1B] text-white text-xs font-bold tracking-widest uppercase shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Authorize Bespoke Commission · ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </button>

            </form>
          )}

          {/* Processing Screen */}
          {step === 'processing' && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#C5A880] border-t-[#8C4B23] animate-spin"></div>
              <h3 className="font-['Cinzel'] text-xl font-bold text-[#22201D]">
                Encrypting & Submitting Commission...
              </h3>
              <p className="text-xs text-[#766E65] max-w-sm">
                Allocating timber stock and generating CAD cut records in the 1987 Atelier production ledger.
              </p>
            </div>
          )}

          {/* Confirmed Screen */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="py-6 space-y-6 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="font-['Cinzel'] text-2xl font-bold text-[#22201D]">
                  Commission Formally Recorded
                </h2>
                <div className="text-xs font-mono font-bold text-[#8C4B23]">
                  Reference ID: {confirmedOrder.id}
                </div>
                <p className="text-xs text-[#766E65] max-w-md mx-auto">
                  Thank you, {confirmedOrder.customer.fullName}. Your handcrafted piece has entered our workshop queue. A formal receipt and digital blueprint proof has been dispatched to {confirmedOrder.customer.email}.
                </p>
              </div>

              {/* Production Schedule Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] space-y-3 text-xs">
                <div className="font-bold text-[#22201D] uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Atelier Production Roadmap</span>
                  <span className="font-mono text-[#8C4B23]">Target Delivery: {confirmedOrder.estimatedDeliveryDate}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 text-emerald-800 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>1. Timber Sourcing & Moisture Equalization (In Progress)</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#766E65]">
                    <span className="w-2 h-2 rounded-full bg-[#DCD8D0]"></span>
                    <span>2. Structural Joinery & Steam-Bending</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#766E65]">
                    <span className="w-2 h-2 rounded-full bg-[#DCD8D0]"></span>
                    <span>3. Custom Upholstery & Cushion Loft Assembly</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#766E65]">
                    <span className="w-2 h-2 rounded-full bg-[#DCD8D0]"></span>
                    <span>4. Hand-Applied Oil Finish & Quality Inspection</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#766E65]">
                    <span className="w-2 h-2 rounded-full bg-[#DCD8D0]"></span>
                    <span>5. White-Glove In-Home Placement</span>
                  </div>
                </div>
              </div>

              {/* Modal Confirmation Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E2DDD5] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#22201D] flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#8C4B23]" />
                  Print Formal Receipt
                </button>

                <button
                  id="confirmed-close-button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#22201D] hover:bg-black text-white text-xs font-bold uppercase tracking-wider"
                >
                  Return to 1987 Studio
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
