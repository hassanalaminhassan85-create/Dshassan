import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, 
  Download, 
  Printer, 
  CheckCircle2, 
  Search, 
  X, 
  ShieldCheck, 
  Building2, 
  QrCode, 
  Calendar, 
  CreditCard,
  GraduationCap
} from 'lucide-react';
import { AcademyPaymentRecord, StudentSession } from '../../lib/academyStorage';

interface StudentPaymentHistoryTabProps {
  session: StudentSession;
  paymentRecords: AcademyPaymentRecord[];
  selectedReceipt: AcademyPaymentRecord | null;
  onCloseReceipt: () => void;
  onViewReceipt: (rec: AcademyPaymentRecord) => void;
}

export const StudentPaymentHistoryTab: React.FC<StudentPaymentHistoryTabProps> = ({
  session,
  paymentRecords,
  selectedReceipt,
  onCloseReceipt,
  onViewReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = paymentRecords.filter(p => 
    p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Tuition Ledger & Official Invoices
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Download and print verified electronic receipts for corporate sponsorship or university transfer credits.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref or program..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* History Ledger Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No payment transaction records match your search criteria.
          </div>
        ) : (
          filtered.map((payment) => (
            <div
              key={payment.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
                  <Receipt size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {payment.reference}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {payment.invoiceNumber || payment.reference || 'REC-VERIFIED'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {payment.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {payment.courseTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(payment.paidAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={12} />
                      {payment.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-display block">
                    ₦{payment.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Paystack Verified
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onViewReceipt(payment)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Receipt size={14} />
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Official Receipt / Invoice Modal (Printable) */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseReceipt}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none print:max-h-none"
            >
              {/* Header with DS Tech Academy Official Seal */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold">
                    <GraduationCap size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-blue-950 font-display">
                      DS TECH ACADEMY LTD
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      CAC RC: 1849204 • Federal Republic of Nigeria
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Abuja Campus & Adamawa Innovation Hub
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title="Print Receipt"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={onCloseReceipt}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Receipt Title */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    OFFICIAL TUITION INVOICE / RECEIPT
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                    Receipt Ref: {selectedReceipt.invoiceNumber || selectedReceipt.reference}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">ISSUED ON</span>
                  <span className="text-xs font-bold text-slate-800">
                    {new Date(selectedReceipt.paidAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </span>
                </div>
              </div>

              {/* Student & Payment Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs my-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Student Details
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.studentName}</p>
                  <p className="text-[11px] font-mono text-slate-600">{selectedReceipt.studentId}</p>
                  <p className="text-[11px] text-slate-500 truncate">{selectedReceipt.studentEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Payment Gateway
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.paymentMethod}</p>
                  <p className="text-[11px] font-mono text-slate-600">Paystack Ref: {selectedReceipt.reference}</p>
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={12} /> Status: Verified
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="my-4 border rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Program Description</th>
                      <th className="p-3">Code</th>
                      <th className="p-3 text-right">Settled Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">
                        {selectedReceipt.courseTitle}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {selectedReceipt.courseCode}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        ₦{selectedReceipt.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t font-bold">
                    <tr>
                      <td colSpan={2} className="p-3 text-right text-slate-700">
                        Total Amount Paid:
                      </td>
                      <td className="p-3 text-right font-mono text-sm text-blue-900">
                        ₦{selectedReceipt.amount.toLocaleString()} NGN
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Digital Seal & Signatures */}
              <div className="pt-4 border-t flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={28} className="text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Electronically Verified Document</p>
                    <p className="text-[10px]">DS Tech Academy Bursary Office</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Signed: Registrar</p>
                  <p className="text-[10px] font-mono">DSTA/FIN/2026/AUTH</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
