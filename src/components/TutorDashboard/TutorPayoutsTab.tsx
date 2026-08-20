import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  Clock, 
  X, 
  Send, 
  ArrowUpRight, 
  Receipt, 
  ShieldCheck, 
  AlertCircle,
  Printer
} from 'lucide-react';
import { TutorSession, TutorPayoutRequest, apiCreateTutorPayout } from '../../lib/academyStorage';

interface TutorPayoutsTabProps {
  session: TutorSession;
  payouts: TutorPayoutRequest[];
  onPayoutCreated: (newPayout: TutorPayoutRequest) => void;
}

export const TutorPayoutsTab: React.FC<TutorPayoutsTabProps> = ({
  session,
  payouts,
  onPayoutCreated
}) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState<number>(150000);
  const [bankName, setBankName] = useState('Zenith Bank');
  const [accountNumber, setAccountNumber] = useState('2081194821');
  const [accountName, setAccountName] = useState(session.fullName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedVoucher, setSelectedVoucher] = useState<TutorPayoutRequest | null>(null);

  const totalAccruedHonorarium = 650000;
  const totalPaidOut = payouts.filter(p => p.status === 'approved' || p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingRequestsTotal = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const availableForWithdrawal = Math.max(0, totalAccruedHonorarium - totalPaidOut - pendingRequestsTotal);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountInput <= 0 || amountInput > availableForWithdrawal) {
      alert(`Amount must be between ₦1,000 and available balance (₦${availableForWithdrawal.toLocaleString()})`);
      return;
    }

    setIsSubmitting(true);
    const newReq = await apiCreateTutorPayout(
      session.tutorId,
      session.email,
      session.fullName,
      amountInput,
      bankName,
      accountNumber,
      accountName
    );

    setIsSubmitting(false);
    setSuccessMessage(`Honorarium Payout Request for ₦${amountInput.toLocaleString()} submitted to Bursary!`);
    onPayoutCreated(newReq);

    setTimeout(() => {
      setSuccessMessage(null);
      setIsRequestModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Honorarium & Faculty Payouts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track lecture session compensation, grading honoraria, and automated bank settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
          disabled={availableForWithdrawal < 10000}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <DollarSign size={16} />
          <span>Request Honorarium Payout</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Accrued</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            ₦{totalAccruedHonorarium.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Course deliveries & capstone reviews</span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-emerald-500">Paid Out to Bank</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-1">
            ₦{totalPaidOut.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">Settled via NIBSS / CBN</span>
        </div>

        <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 shadow-sm">
          <span className="text-xs font-semibold uppercase text-purple-600 dark:text-purple-400">Available Balance</span>
          <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 font-display mt-1">
            ₦{availableForWithdrawal.toLocaleString()}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 block font-medium">Ready for immediate withdrawal</span>
        </div>
      </div>

      {/* Payout History Ledger */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt size={18} className="text-purple-500" />
          <span>Faculty Disbursement History</span>
        </h3>

        <div className="space-y-3">
          {payouts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No honorarium payout transactions recorded yet.
            </div>
          ) : (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    payout.status === 'approved' || payout.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {payout.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        payout.status === 'approved' || payout.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {payout.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {payout.bankName} • Account: {payout.accountNumber} ({payout.accountName})
                    </p>

                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Requested: {new Date(payout.requestedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-display block">
                      ₦{payout.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Bursary Settlement
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(payout)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Receipt size={14} />
                    <span>Voucher</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Payout Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Request Honorarium Payout
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct transfer to verified Nigerian Commercial Bank
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {successMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Withdrawal Amount (₦)
                    </label>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                      Max: ₦{availableForWithdrawal.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={10000}
                    max={availableForWithdrawal}
                    step={5000}
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-base text-purple-600 dark:text-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Commercial Bank
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Zenith Bank">Zenith Bank Plc</option>
                    <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                    <option value="Access Bank">Access Bank Plc</option>
                    <option value="First Bank">First Bank of Nigeria</option>
                    <option value="Kuda Bank">Kuda Microfinance Bank</option>
                    <option value="UBA">United Bank for Africa (UBA)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Number (10 Digits NUBAN)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Beneficiary Name
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Submitting...' : 'Dispatch Request to Bursary'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Payout Voucher Modal */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVoucher(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 print:p-0"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-base font-black text-blue-950 font-display">
                    DS TECH ACADEMY LTD
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Faculty Honorarium Voucher • CAC RC: 1849204
                  </p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(null)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="py-4 text-xs space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voucher Ref:</span>
                  <span className="font-mono font-bold">{selectedVoucher.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Instructor:</span>
                  <span className="font-bold">{selectedVoucher.tutorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary Bank:</span>
                  <span className="font-bold">{selectedVoucher.bankName} ({selectedVoucher.accountNumber})</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-3 border-t">
                  <span>Disbursed Amount:</span>
                  <span className="font-mono text-purple-700">₦{selectedVoucher.amount.toLocaleString()} NGN</span>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={18} className="text-purple-600" />
                  <span>Approved by Financial Controller</span>
                </div>
                <span>DSTA/FAC/FIN/2026</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
