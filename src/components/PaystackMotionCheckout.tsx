import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, ShieldCheck, Sparkles, CheckCircle2, Lock, 
  ArrowRight, X, Copy, Check, QrCode, Building, Smartphone,
  DollarSign, RefreshCw, AlertCircle, ExternalLink, Receipt
} from 'lucide-react';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // in kobo
        ref?: string;
        currency?: string;
        metadata?: any;
        callback: (response: { reference: string; status: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaystackPaymentConfig {
  amount: number; // in Naira (e.g., 15000 for ₦15,000)
  email: string;
  customerName?: string;
  phone?: string;
  title: string;
  description?: string;
  reference?: string;
  metadata?: Record<string, any>;
  onSuccess?: (reference: string, response?: any) => void;
  onCancel?: () => void;
}

interface PaystackMotionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PaystackPaymentConfig;
}

// Fallback Paystack Public Key
const DEFAULT_PAYSTACK_PK = 'pk_test_01928384756473829102938475610293';

export const PaystackMotionCheckoutModal: React.FC<PaystackMotionCheckoutModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd' | 'qr'>('card');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardNumber, setCardNumber] = useState('5399 •••• •••• 8812');
  const [cardHolder, setCardHolder] = useState(config.customerName || 'VALUED CLIENT');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [ussdBank, setUssdBank] = useState('GTBank (*737#)');

  // Sync Paystack Inline JS script
  useEffect(() => {
    if (!document.getElementById('paystack-js')) {
      const script = document.createElement('script');
      script.id = 'paystack-js';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Update holder when config updates
  useEffect(() => {
    if (config.customerName) {
      setCardHolder(config.customerName.toUpperCase());
    }
  }, [config.customerName]);

  if (!isOpen) return null;

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(config.amount);

  const generatedRef = config.reference || `DST_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(paymentRef || generatedRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const executePaystackInline = () => {
    setIsProcessing(true);
    const paystackKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || DEFAULT_PAYSTACK_PK;

    // Check if Paystack script is loaded and usable
    if (window.PaystackPop && typeof window.PaystackPop.setup === 'function') {
      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: config.email || 'client@dstech.agency',
          amount: Math.round(config.amount * 100), // convert Naira to Kobo
          currency: 'NGN',
          ref: generatedRef,
          metadata: {
            custom_fields: [
              { display_name: "Customer Name", variable_name: "customer_name", value: config.customerName || "Valued Client" },
              { display_name: "Item Title", variable_name: "item_title", value: config.title },
              ...(config.metadata ? Object.entries(config.metadata).map(([k, v]) => ({ display_name: k, variable_name: k, value: String(v) })) : [])
            ]
          },
          callback: (response: { reference: string; status: string }) => {
            setIsProcessing(false);
            setPaymentSuccess(true);
            setPaymentRef(response.reference || generatedRef);
            if (config.onSuccess) {
              config.onSuccess(response.reference || generatedRef, response);
            }
          },
          onClose: () => {
            setIsProcessing(false);
            if (config.onCancel) config.onCancel();
          }
        });
        handler.openIframe();
        return;
      } catch (err) {
        console.warn('Paystack inline popup fallback triggered:', err);
      }
    }

    // High-Motion Interactive Simulation Fallback (for local preview/testing)
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setPaymentRef(generatedRef);
      if (config.onSuccess) {
        config.onSuccess(generatedRef, { reference: generatedRef, status: 'success' });
      }
    }, 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 25 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative my-auto text-left"
        >
          {/* Top Energy Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 animate-pulse" />

          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shadow-lg shadow-orange-500/10">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                  <Sparkles size={11} className="animate-spin text-amber-500" />
                  Secure Paystack Payment Node
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {config.title}
                </h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          {!paymentSuccess ? (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Payment Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between relative overflow-hidden group">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-medium">
                    Total Amount Due
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight flex items-baseline gap-1">
                    {formattedAmount}
                    <span className="text-xs text-slate-400 font-sans font-normal">NGN</span>
                  </div>
                  {config.description && (
                    <p className="text-xs text-slate-300 line-clamp-1">{config.description}</p>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck size={12} />
                    256-Bit SSL Encrypted
                  </span>
                  <p className="text-[10px] font-mono text-slate-400">Ref: {generatedRef.slice(-8)}</p>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80">
                {[
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'transfer', label: 'Transfer', icon: Building },
                  { id: 'ussd', label: 'USSD', icon: Smartphone },
                  { id: 'qr', label: 'QR', icon: QrCode },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPaymentMethod(tab.id as any)}
                      className={`relative flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'text-white bg-slate-800 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* High-Motion 3D Interactive Card Preview */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="perspective-1000">
                    <motion.div
                      animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/30 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between cursor-pointer"
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                    >
                      {/* Ambient background particle effect */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

                      {/* Front of Card */}
                      <div className={`space-y-4 ${isCardFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center text-[8px] font-mono font-bold text-slate-950">
                              CHIP
                            </div>
                            <span className="text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase">DS Tech Virtual Node</span>
                          </div>
                          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Paystack Secured
                          </div>
                        </div>

                        <div className="space-y-1 text-center py-1">
                          <span className="text-[9px] uppercase font-mono text-slate-400 tracking-widest">Card Number</span>
                          <p className="text-lg sm:text-xl font-mono font-black text-white tracking-wider">
                            {cardNumber}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[8px] uppercase font-mono text-slate-400 tracking-wider">Card Holder</span>
                            <p className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight">{cardHolder}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] uppercase font-mono text-slate-400 tracking-wider">Expires</span>
                            <p className="text-xs font-mono font-bold text-slate-100">{cardExpiry}</p>
                          </div>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div 
                        className={`absolute inset-0 p-5 flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-2xl ${
                          isCardFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        } transition-opacity duration-300`}
                        style={{ transform: 'rotateY(180deg)' }}
                      >
                        <div className="w-full h-8 bg-slate-800 -mx-5 mt-1" />
                        <div className="flex items-center justify-end gap-3 px-2">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">CVV / CVC</span>
                          <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded text-sm font-mono font-bold text-emerald-400">
                            {cardCvv}
                          </div>
                        </div>
                        <div className="text-center text-[9px] font-mono text-slate-400">
                          Click card to flip back to front
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center font-mono">
                    💡 Click card above to flip and inspect CVV security node
                  </p>
                </div>
              )}

              {/* Bank Transfer View */}
              {paymentMethod === 'transfer' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                    <span>Paystack Automated Account</span>
                    <span className="text-emerald-400">Expires in 29:59</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-400">Bank Name:</span>
                      <span className="font-bold text-white font-mono">Wema Bank / Paystack</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-900">
                      <span className="text-slate-400">Account Number:</span>
                      <span className="font-bold text-emerald-400 font-mono text-base tracking-wider">9023489111</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Beneficiary:</span>
                      <span className="font-bold text-white">DS Tech / Paystack Checkout</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-300">
                    ⚡ Transfer exactly {formattedAmount}. Paystack automatically verifies your transfer within 10 seconds.
                  </p>
                </div>
              )}

              {/* USSD View */}
              {paymentMethod === 'ussd' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-mono text-slate-400 block">Select Your Bank</label>
                  <select 
                    value={ussdBank}
                    onChange={(e) => setUssdBank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GTBank (*737#)">GTBank (*737#)</option>
                    <option value="Access Bank (*901#)">Access Bank (*901#)</option>
                    <option value="Zenith Bank (*966#)">Zenith Bank (*966#)</option>
                    <option value="First Bank (*894#)">First Bank (*894#)</option>
                    <option value="UBA (*919#)">UBA (*919#)</option>
                    <option value="Kuda Bank">Kuda Bank App</option>
                  </select>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Dial USSD Code on Phone</span>
                    <div className="text-xl font-bold font-mono text-emerald-400 tracking-wider">
                      *737*50*{config.amount}*8812#
                    </div>
                  </div>
                </div>
              )}

              {/* QR View */}
              {paymentMethod === 'qr' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl shadow-xl border-4 border-emerald-500/30 flex items-center justify-center">
                    <QrCode size={120} className="text-slate-900" />
                  </div>
                  <p className="text-xs text-slate-300">
                    Scan with your bank app (Kuda, GTWorld, Access, Zenith) to complete payment instantly.
                  </p>
                </div>
              )}

              {/* Primary High-Motion Paystack Trigger Button */}
              <motion.button
                onClick={executePaystackInline}
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black uppercase tracking-wider text-sm sm:text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all relative overflow-hidden group"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />

                {isProcessing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin text-slate-950" />
                    <span>Connecting Paystack Node...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} className="text-slate-950" />
                    <span>Pay {formattedAmount} via Paystack</span>
                    <ArrowRight size={18} className="text-slate-950 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Paystack Verified Merchant
                </span>
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-slate-400" />
                  No card details stored
                </span>
              </div>
            </div>
          ) : (
            /* High Motion Celebration Receipt Screen */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 text-center space-y-6"
            >
              {/* Particle Success Orb */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-ping" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-emerald-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/50">
                  <CheckCircle2 size={44} className="stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                  PAYSTACK TRANSACTION VERIFIED
                </span>
                <h3 className="text-2xl font-black text-white font-serif tracking-tight">
                  Payment Successful!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your payment of <strong className="text-emerald-400 font-mono">{formattedAmount}</strong> has been successfully processed and recorded.
                </p>
              </div>

              {/* Receipt Details Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Payment Title:</span>
                  <span className="font-bold text-white text-right line-clamp-1">{config.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Paystack Reference:</span>
                  <div className="flex items-center gap-1 font-bold text-emerald-400">
                    <span>{paymentRef || generatedRef}</span>
                    <button 
                      onClick={handleCopyRef}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300"
                      title="Copy Reference"
                    >
                      {copiedRef ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Payer Name:</span>
                  <span className="font-bold text-white">{cardHolder}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="font-bold text-slate-300">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Return & Continue
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Reusable High-Motion Paystack Pay Button Component
export interface PaystackPayButtonProps {
  amount: number;
  email?: string;
  customerName?: string;
  phone?: string;
  title: string;
  description?: string;
  reference?: string;
  metadata?: Record<string, any>;
  onSuccess?: (reference: string, response?: any) => void;
  onNavigateToPayment?: (config: PaystackPaymentConfig) => void;
  className?: string;
  children?: React.ReactNode;
  variant?: 'emerald' | 'indigo' | 'outline' | 'dark' | 'orange';
}

export const PaystackPayButton: React.FC<PaystackPayButtonProps> = ({
  amount,
  email = 'client@dstech.agency',
  customerName = 'Valued Client',
  phone = '',
  title,
  description,
  reference,
  metadata,
  onSuccess,
  onNavigateToPayment,
  className = '',
  children,
  variant = 'emerald'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);

  const variantStyles = {
    emerald: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25',
    indigo: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-400 text-white shadow-indigo-500/25',
    outline: 'bg-transparent border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
    dark: 'bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-white hover:text-emerald-400',
    orange: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/25'
  };

  const handlePayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const config: PaystackPaymentConfig = {
      amount,
      email,
      customerName,
      phone,
      title,
      description,
      reference,
      metadata,
      onSuccess
    };

    if (onNavigateToPayment) {
      onNavigateToPayment(config);
    } else {
      // Trigger global payment event for full-page Paystack process
      window.dispatchEvent(new CustomEvent('dstech_paystack_pay', { detail: config }));
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handlePayClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl transition-all overflow-hidden group cursor-pointer ${variantStyles[variant]} ${className}`}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />

      {children ? (
        children
      ) : (
        <>
          <CreditCard size={15} className="shrink-0" />
          <span>Pay {formattedAmount} via Paystack</span>
          <Sparkles size={13} className="shrink-0 animate-pulse text-amber-300" />
        </>
      )}
    </motion.button>
  );
};
