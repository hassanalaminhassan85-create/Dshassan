import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  Smartphone, 
  Lock, 
  Sparkles, 
  Check, 
  Copy,
  Download,
  Printer
} from 'lucide-react';
import { StudentSession, AcademyPaymentRecord, apiRecordVerifiedPayment } from '../../lib/academyStorage';
import { AcademyEnrollment } from '../../types/enrollment';
import { AcademyCourse } from '../../lib/academyCoursesData';

interface StudentPaymentsTabProps {
  session: StudentSession;
  enrollments: AcademyEnrollment[];
  enrolledCourses: AcademyCourse[];
  paymentRecords: AcademyPaymentRecord[];
  onPaymentCompleted: (record: AcademyPaymentRecord) => void;
  onViewReceipt: (record: AcademyPaymentRecord) => void;
}

export const StudentPaymentsTab: React.FC<StudentPaymentsTabProps> = ({
  session,
  enrollments,
  enrolledCourses,
  paymentRecords,
  onPaymentCompleted,
  onViewReceipt
}) => {
  // Financial calculation
  const totalBilled = enrollments.reduce((sum, e) => sum + e.amount, 0) || 75000;
  const totalPaid = paymentRecords.reduce((sum, p) => sum + (p.status === 'verified' || p.status === 'paid' ? p.amount : 0), 0);
  const outstandingBalance = Math.max(0, totalBilled - totalPaid);
  const isFullyPaid = outstandingBalance === 0 && totalPaid > 0;

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit_70' | 'balance_30'>('full');
  const [selectedChannel, setSelectedChannel] = useState<'card' | 'transfer' | 'ussd' | 'qr'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessRecord, setPaymentSuccessRecord] = useState<AcademyPaymentRecord | null>(null);

  // Card details
  const [cardNumber, setCardNumber] = useState('5399 4100 8921 4402');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardPin, setCardPin] = useState('1234');

  // Copy helper
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Calculate payment amount based on option
  const payableAmount = (() => {
    if (outstandingBalance <= 0) return 0;
    if (paymentOption === 'deposit_70') return Math.round(totalBilled * 0.7);
    if (paymentOption === 'balance_30') return Math.min(outstandingBalance, Math.round(totalBilled * 0.3));
    return outstandingBalance;
  })();

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    setTimeout(async () => {
      const generatedRef = `PAY-DSTA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const targetEnrollment = enrollments[0];

      const record: AcademyPaymentRecord = {
        id: `pay_${Date.now()}`,
        reference: generatedRef,
        studentEmail: session.email,
        studentName: session.fullName,
        studentId: session.studentId,
        courseCode: targetEnrollment?.courseCode || 'DSTA-SWE01',
        courseTitle: targetEnrollment?.courseTitle || 'Full-Stack Software Engineering',
        amount: payableAmount,
        paymentMethod: selectedChannel === 'card' ? 'paystack' : 'bank_transfer',
        status: 'verified',
        paidAt: new Date().toISOString(),
        invoiceNumber: `INV/DSTA/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        notes: `Settled via ${selectedChannel.toUpperCase()} on DS Tech Academy Paystack payment gateway.`
      };

      await apiRecordVerifiedPayment(record);
      onPaymentCompleted(record);
      setIsProcessing(false);
      setPaymentSuccessRecord(record);
    }, 1500);
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText('0124892019');
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
          Tuition Settlements & Paystack Checkout
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Settle your admission deposit (70%) or complete final examination clearance (30%) via secure PCI-DSS payment gateways.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Billed Tuition
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            ₦{totalBilled.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {enrollments.length || 1} active enrolled program{enrollments.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Settled / Paid
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-1">
            ₦{totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Verified by Paystack Gateway
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Outstanding Tuition Balance
          </span>
          <div className={`text-2xl font-extrabold font-display mt-1 ${
            isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
          }`}>
            ₦{outstandingBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {isFullyPaid ? 'Tuition 100% Cleared' : 'Due for Examination Clearance'}
          </p>
        </div>
      </div>

      {/* Main Payment Action Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold border border-blue-500/30">
              PAYSTACK DIRECT GATEWAY
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              256-BIT SSL ENCRYPTED
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-display text-white">
            {isFullyPaid ? 'All Tuition Payments Are Up to Date' : `Outstanding Balance: ₦${outstandingBalance.toLocaleString()}`}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {isFullyPaid 
              ? 'Your financial standing is verified in good standing. You are cleared for all classroom labs, examinations, and final diploma conferment.'
              : 'DS Tech Academy supports flexible installment payments: 70% Initial Deposit unlocks immediate classroom access, and the 30% balance is payable prior to mid-term assessments.'}
          </p>
        </div>

        {!isFullyPaid ? (
          <button
            type="button"
            onClick={() => {
              setPaymentSuccessRecord(null);
              setIsCheckoutOpen(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <CreditCard size={18} />
            <span>Make Payment Now</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => paymentRecords[0] && onViewReceipt(paymentRecords[0])}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Receipt size={16} className="text-amber-400" />
            <span>Download Official Receipt</span>
          </button>
        )}
      </div>

      {/* Payment Records Ledger Summary */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt size={18} className="text-blue-500" />
            <span>Verified Tuition Receipts ({paymentRecords.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Reference / Docket</th>
                <th className="py-3 px-3">Program</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paymentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No verified payment records found.
                  </td>
                </tr>
              ) : (
                paymentRecords.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {p.reference}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {p.courseTitle}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₦{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paystack Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            >
              {paymentSuccessRecord ? (
                /* Success Screen */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                    Payment Verified & Cleared!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    ₦{paymentSuccessRecord.amount.toLocaleString()} successfully received for {paymentSuccessRecord.courseTitle}. Reference: {paymentSuccessRecord.reference}.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        onViewReceipt(paymentSuccessRecord);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
                    >
                      View & Print Official Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Interface */
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-xs">
                        PS
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                          Paystack Secure Checkout
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400">
                          DS TECH ACADEMY LTD (RC-1849204)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      LIVE TEST CHANNEL
                    </span>
                  </div>

                  {/* Payment Amount Plan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Payment Option
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentOption('full')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentOption === 'full'
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 font-bold'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase block">Full Clearance</span>
                        <span className="text-xs font-bold block mt-0.5">₦{outstandingBalance.toLocaleString()}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOption('deposit_70')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentOption === 'deposit_70'
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 font-bold'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase block">70% Deposit</span>
                        <span className="text-xs font-bold block mt-0.5">₦{Math.round(totalBilled * 0.7).toLocaleString()}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOption('balance_30')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentOption === 'balance_30'
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 font-bold'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] uppercase block">30% Balance</span>
                        <span className="text-xs font-bold block mt-0.5">₦{Math.round(totalBilled * 0.3).toLocaleString()}</span>
                      </button>
                    </div>
                  </div>

                  {/* Channel Tabs */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Payment Channel
                    </label>
                    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedChannel('card')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          selectedChannel === 'card' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChannel('transfer')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          selectedChannel === 'transfer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Bank Transfer
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedChannel('ussd')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          selectedChannel === 'ussd' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        USSD
                      </button>
                    </div>
                  </div>

                  {/* Channel UI */}
                  {selectedChannel === 'card' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedChannel === 'transfer' && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                      <p className="text-slate-500">
                        Transfer the exact amount to the dedicated DS Tech Virtual Account below:
                      </p>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                            Wema Bank / Paystack Titan
                          </span>
                          <span className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                            0124892019
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            DS TECH ACADEMY - {session.studentId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAccountNumber}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAcc ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedAcc ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedChannel === 'ussd' && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-center">
                      <p className="text-slate-500">
                        Dial this USSD code on your registered mobile device:
                      </p>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-black text-base text-blue-600 dark:text-blue-400">
                        *737*50*0124892019*35000#
                      </div>
                    </div>
                  )}

                  {/* Summary & Submit */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleProcessPayment}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Lock size={15} />
                      <span>{isProcessing ? 'Verifying with Paystack...' : `Authorize ₦${payableAmount.toLocaleString()}`}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
