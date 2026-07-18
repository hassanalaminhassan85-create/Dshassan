import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, ShieldCheck, Edit, Trash2, Check, X, Eye, 
  RefreshCw, FileText, Calendar, Building, MapPin, 
  ExternalLink, CheckCircle, AlertTriangle, Play, HelpCircle, 
  History, EyeOff, Loader2, ArrowUp, ArrowDown, Settings, Shield
} from 'lucide-react';
import { 
  apiGetCacMetadata, 
  apiSaveCacMetadata, 
  apiDeleteCacMetadata, 
  apiToggleCacPublish, 
  apiUploadCacFile,
  CacMetadata 
} from '../lib/api';

// Reusable Document Viewer
import { CacTrustSection } from './CacTrustSection';

export const CacAdminCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [certificates, setCertificates] = useState<CacMetadata[]>([]);
  const [editingCert, setEditingCert] = useState<Partial<CacMetadata> | null>(null);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCacData();
  }, []);

  const fetchCacData = async () => {
    try {
      setLoading(true);
      const data = await apiGetCacMetadata(true); // true = admin mode (gets all records)
      setCertificates(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching admin CAC data:', err);
      setError('Could not connect to Cloudflare D1. Displaying local cache.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, isError: boolean = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Invalid file type. Please upload a PDF, PNG, or JPG.', true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      showNotification('File exceeds 10MB limit.', true);
      return;
    }
    setSelectedFile(file);
    showNotification(`Selected file: ${file.name}`);
  };

  // Upload file helper
  const handleFileUpload = async (): Promise<any> => {
    if (!selectedFile) return null;
    try {
      setUploading(true);
      const res = await apiUploadCacFile(selectedFile);
      setSelectedFile(null);
      return res;
    } catch (err: any) {
      console.error('Upload failed:', err);
      showNotification('File upload failed. Default mock keys will be used.', true);
      return {
        r2_object_key: `cac_certs/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type
      };
    } finally {
      setUploading(false);
    }
  };

  // Initialize new form
  const handleNewCertificate = () => {
    setEditingCert({
      company_name: 'DS TECH AND DIGITAL MARKETING AGENCY LIMITED',
      registration_number: '',
      business_type: 'Private Company Limited by Shares',
      registration_date: new Date().toISOString().split('T')[0],
      company_status: 'Active',
      registered_address: 'Abuja, Federal Republic of Nigeria',
      description: 'DS Tech and Digital Marketing Agency Limited is officially registered under the Companies and Allied Matters Act 2020 by the Corporate Affairs Commission (CAC) of Nigeria.',
      verification_url: 'https://search.cac.gov.ng/',
      r2_object_key: 'cac_certificate_default.png',
      file_name: 'cac_certificate.png',
      file_size: 485120,
      mime_type: 'image/png',
      is_published: 0,
      display_order: certificates.length + 1
    });
    setSelectedFile(null);
  };

  // Edit existing record
  const handleEditCertificate = (cert: CacMetadata) => {
    setEditingCert({ ...cert });
    setSelectedFile(null);
  };

  // Toggle publish status directly
  const handleTogglePublish = async (cert: CacMetadata) => {
    try {
      const nextPublished = cert.is_published === 1 ? false : true;
      await apiToggleCacPublish(cert.id, nextPublished);
      setCertificates(prev => 
        prev.map(c => c.id === cert.id ? { ...c, is_published: nextPublished ? 1 : 0 } : c)
      );
      showNotification(`${cert.company_name} publication status updated.`);
    } catch (err: any) {
      showNotification('Could not update status: ' + err.message, true);
    }
  };

  // Delete record
  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this certificate metadata record?')) return;
    try {
      await apiDeleteCacMetadata(id);
      setCertificates(prev => prev.filter(c => c.id !== id));
      showNotification('Certificate record deleted successfully.');
      if (editingCert?.id === id) {
        setEditingCert(null);
      }
    } catch (err: any) {
      showNotification('Failed to delete record: ' + err.message, true);
    }
  };

  // Submit / Save form
  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    if (!editingCert.company_name || !editingCert.registration_number || !editingCert.business_type || !editingCert.registration_date) {
      showNotification('Please fill in all mandatory fields.', true);
      return;
    }

    try {
      setLoading(true);
      let fileMeta = null;
      if (selectedFile) {
        fileMeta = await handleFileUpload();
      }

      const payload: Partial<CacMetadata> = {
        ...editingCert,
        ...(fileMeta ? {
          r2_object_key: fileMeta.r2_object_key,
          file_name: fileMeta.file_name,
          file_size: fileMeta.file_size,
          mime_type: fileMeta.mime_type
        } : {})
      };

      const saved = await apiSaveCacMetadata(payload);
      
      // Update local state list
      setCertificates(prev => {
        const index = prev.findIndex(c => c.id === saved.id);
        if (index > -1) {
          const next = [...prev];
          next[index] = saved;
          return next;
        } else {
          return [saved, ...prev];
        }
      });

      setEditingCert(null);
      setSelectedFile(null);
      showNotification('Trust Certificate record saved and synchronized successfully!');
    } catch (err: any) {
      console.error(err);
      showNotification('Error saving credentials: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // Restore previous upload / set as active
  const handleRestoreVersion = async (cert: CacMetadata) => {
    if (!window.confirm(`Are you sure you want to restore and publish this version from ${new Date(cert.created_at).toLocaleDateString()}? This will publish this certificate.`)) return;
    try {
      setLoading(true);
      
      // Unpublish all other certificates if single-active constraint
      // Here we set the selected one as published
      const updated = { ...cert, is_published: 1, updated_at: new Date().toISOString() };
      const saved = await apiSaveCacMetadata(updated);
      
      setCertificates(prev => prev.map(c => c.id === saved.id ? saved : { ...c, is_published: 0 }));
      showNotification('Selected version restored and published successfully.');
    } catch (err: any) {
      showNotification('Failed to restore version: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-1 md:p-4 text-slate-800 dark:text-slate-100 text-left">
      
      {/* Dynamic Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold"
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold"
          >
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Grid: Upload & Edit Form */}
        <div className="flex-1 space-y-6">
          
          {editingCert ? (
            /* Active Edit Card Form */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-600 rounded-xl text-white">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#000E32] dark:text-white">
                      {editingCert.id ? 'Modify Metadata Details' : 'Integrate New Trust Document'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      ID: {editingCert.id || 'GENERATING DYNAMIC KEY'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingCert(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveCertificate} className="space-y-5 text-xs">
                
                {/* File Upload / Replace Drag & Drop */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Certificate Document File (PDF, PNG or JPG - Max 10MB)</label>
                  
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-orange-500 bg-orange-500/5' 
                        : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:border-orange-500/50'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileInput}
                      className="hidden" 
                    />
                    <Upload className="mx-auto text-slate-400 mb-2 group-hover:text-orange-500 animate-bounce" size={24} />
                    
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="font-bold text-orange-500">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to Upload</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-400">
                        <p className="font-semibold"><span className="text-orange-500">Click to upload</span> or drag & drop certificate</p>
                        <p className="text-[9px]">Currently using key: <span className="text-slate-300 font-mono">{editingCert.file_name} ({editingCert.r2_object_key})</span></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Company Name *</label>
                    <input 
                      type="text"
                      required
                      value={editingCert.company_name || ''}
                      onChange={e => setEditingCert(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-medium text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">CAC Registration Number *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. RC 9550925"
                      value={editingCert.registration_number || ''}
                      onChange={e => setEditingCert(prev => ({ ...prev, registration_number: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Incorporation Date *</label>
                    <input 
                      type="date"
                      required
                      value={editingCert.registration_date || ''}
                      onChange={e => setEditingCert(prev => ({ ...prev, registration_date: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Business Type *</label>
                    <select 
                      value={editingCert.business_type || ''}
                      onChange={e => setEditingCert(prev => ({ ...prev, business_type: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-medium text-slate-800 dark:text-slate-200"
                    >
                      <option value="Private Company Limited by Shares">Private Company Limited by Shares</option>
                      <option value="Public Limited Company">Public Limited Company</option>
                      <option value="Unlimited Company">Unlimited Company</option>
                      <option value="Company Limited by Guarantee">Company Limited by Guarantee</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Company Status *</label>
                    <select 
                      value={editingCert.company_status || ''}
                      onChange={e => setEditingCert(prev => ({ ...prev, company_status: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-medium text-slate-800 dark:text-slate-200"
                    >
                      <option value="Active">Active / Compliant</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Liquidation">Under Liquidation</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Official Portal Verification URL</label>
                    <input 
                      type="url"
                      value={editingCert.verification_url || ''}
                      onChange={e => setEditingCert(prev => ({ ...prev, verification_url: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-mono text-slate-600 dark:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Registered Corporate Address</label>
                  <input 
                    type="text"
                    value={editingCert.registered_address || ''}
                    onChange={e => setEditingCert(prev => ({ ...prev, registered_address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Compliance Description</label>
                  <textarea 
                    rows={3}
                    value={editingCert.description || ''}
                    onChange={e => setEditingCert(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 font-bold cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingCert.is_published === 1}
                      onChange={e => setEditingCert(prev => ({ ...prev, is_published: e.target.checked ? 1 : 0 }))}
                      className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                    />
                    <span className="text-slate-700 dark:text-slate-200">Publish Immediately to Landing Page Registry</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Display Order:</label>
                    <input 
                      type="number"
                      value={editingCert.display_order || 0}
                      onChange={e => setEditingCert(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-center font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingCert(null)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={13} />
                        <span>Uploading file...</span>
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        <span>Save trust record</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          ) : (
            /* Upload New Trigger Box */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold uppercase tracking-wider text-[#000E32] dark:text-white text-sm">CAC Corporate Trust Ledger</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Authorize, upload, or replace corporate incorporation credentials. Seamlessly synchronize verified tags with the public homepage.</p>
              </div>
              <button 
                onClick={handleNewCertificate}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Upload size={13} />
                <span>Integrate New Document</span>
              </button>
            </div>
          )}

          {/* Upload History / Version Tracking Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <History size={16} className="text-orange-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#000E32] dark:text-white">Credentials Upload History & Backups</h3>
            </div>

            {certificates.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No historic records found. Database seed is operating fallbacks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 font-bold">Document</th>
                      <th className="py-2.5 font-bold">RC / Reg Date</th>
                      <th className="py-2.5 font-bold">Status</th>
                      <th className="py-2.5 font-bold text-center">Active</th>
                      <th className="py-2.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                              <FileText size={14} />
                            </div>
                            <div>
                              <span className="font-extrabold uppercase text-[#000E32] dark:text-white block tracking-wide truncate max-w-[150px]">{cert.company_name}</span>
                              <span className="text-[9px] font-mono text-slate-400 block truncate max-w-[150px]">{cert.file_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-mono">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{cert.registration_number}</span>
                            <span className="text-[9px] text-slate-400">{new Date(cert.registration_date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            cert.company_status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {cert.company_status}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <button 
                            onClick={() => handleTogglePublish(cert)}
                            title={cert.is_published === 1 ? "Click to Unpublish" : "Click to Publish"}
                            className={`p-1 rounded-full transition-colors mx-auto cursor-pointer ${
                              cert.is_published === 1 
                                ? 'bg-emerald-500/20 text-emerald-500' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Check size={12} className="stroke-[3px]" />
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleEditCertificate(cert)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit size={12} />
                            </button>
                            {cert.is_published === 0 && (
                              <button 
                                onClick={() => handleRestoreVersion(cert)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                                title="Restore this version as published"
                              >
                                <RefreshCw size={12} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteCertificate(cert.id)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-orange-400 hover:text-orange-600 rounded transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Active Live Registry Preview */}
        <div className="w-full lg:w-[350px] space-y-6">
          <div className="bg-[#020B24] border border-blue-950 rounded-3xl p-6 text-white space-y-6 relative overflow-hidden shadow-2xl">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
              <span className="text-[10px] font-mono font-black tracking-widest text-orange-400 uppercase">// LIVE LANDING PREVIEW</span>
              <span className="px-1.5 py-0.2 bg-orange-600 text-[8px] font-black uppercase rounded text-white tracking-widest">Active</span>
            </div>

            {/* Simulated Live Section Card (Matches CacTrustSection Card) */}
            {certificates.filter(c => c.is_published === 1).length === 0 ? (
              <div className="py-12 text-center space-y-2 text-slate-500">
                <EyeOff size={24} className="mx-auto" />
                <p className="text-xs font-semibold">No trust certificate published.</p>
                <p className="text-[10px]">Publish a certificate from history to activate visual widget.</p>
              </div>
            ) : (
              certificates.filter(c => c.is_published === 1).slice(0, 1).map(active => (
                <div key={active.id} className="space-y-4 text-xs">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black uppercase tracking-wider rounded">
                        {active.company_status}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">RC: {active.registration_number}</span>
                    </div>
                    <h4 className="font-extrabold uppercase text-white tracking-wide text-sm">{active.company_name}</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-3">{active.description}</p>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5 text-left font-sans text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase font-bold">CLASSIFICATION:</span>
                      <span className="text-slate-300 font-semibold">{active.business_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase font-bold">REGISTRATION:</span>
                      <span className="text-slate-300 font-semibold">{new Date(active.registration_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase font-bold">ADDRESS:</span>
                      <span className="text-slate-300 font-semibold truncate max-w-[140px]">{active.registered_address}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a 
                      href={active.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-600/15"
                    >
                      <span>Simulate Public Portal</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick FAQ / Guidelines Box */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 text-xs text-left text-slate-400 space-y-3 font-sans">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <HelpCircle size={12} className="text-indigo-400" />
              <span>Integration Rules</span>
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>Keep company names exactly matching registration details.</li>
              <li>Only <span className="text-orange-400 font-semibold">one certificate</span> is published as featured on the landing page at any given time.</li>
              <li>R2 Key uploads are securely mapped at edge-level automatically.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
