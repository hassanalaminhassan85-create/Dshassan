import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, ShieldCheck, Edit, Trash2, Check, X, Eye, 
  RefreshCw, FileText, Calendar, Building, Globe, CheckCircle2,
  ExternalLink, AlertTriangle, Loader2, ArrowUp, ArrowDown, Settings, 
  EyeOff, Plus, HelpCircle, FileDigit, Shield, ListCollapse
} from 'lucide-react';
import { 
  apiGetRecognitionCertificates, 
  apiSaveRecognitionCertificate, 
  apiDeleteRecognitionCertificate, 
  apiToggleRecognitionPublish, 
  apiUploadRecognitionFile,
  RecognitionCertificate 
} from '../lib/api';

// Supported Categories
const CATEGORIES = [
  'Awards',
  'Professional Certifications',
  'Government Recognition',
  'Industry Recognition',
  'Technology Certifications',
  'Strategic Partnerships',
  'Memberships',
  'Appreciation Certificates',
  'Other Recognitions'
];

export const RecognitionAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [certificates, setCertificates] = useState<RecognitionCertificate[]>([]);
  const [editingCert, setEditingCert] = useState<Partial<RecognitionCertificate> | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await apiGetRecognitionCertificates(true); // true = admin mode (gets unpublished too)
      setCertificates(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching admin recognition certificates:', err);
      setError('Could not connect to Cloudflare D1. Running in local fallback.');
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

  // Drag & Drop
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
    if (file.size > 15 * 1024 * 1024) { // 15MB
      showNotification('File exceeds 15MB limit.', true);
      return;
    }
    setSelectedFile(file);
    showNotification(`Selected file for upload: ${file.name}`);
  };

  // R2 Uploader
  const handleFileUpload = async (): Promise<any> => {
    if (!selectedFile) return null;
    try {
      setUploading(true);
      const res = await apiUploadRecognitionFile(selectedFile);
      setSelectedFile(null);
      return res;
    } catch (err: any) {
      console.error('Upload failed:', err);
      showNotification('File upload failed. Default mock keys will be used.', true);
      return {
        r2_object_key: `recognition/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type
      };
    } finally {
      setUploading(false);
    }
  };

  const handleNewCertificate = () => {
    setEditingCert({
      title: '',
      category: 'Awards',
      issuing_organization: 'DS Tech Accreditor Consortium',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      certificate_number: '',
      description: '',
      verification_url: '',
      r2_object_key: '',
      thumbnail_key: '',
      file_name: '',
      file_size: 0,
      mime_type: '',
      is_published: 1,
      display_order: 0
    });
    setSelectedFile(null);
  };

  const handleEditCertificate = (cert: RecognitionCertificate) => {
    setEditingCert({ ...cert });
    setSelectedFile(null);
  };

  const handleCancelEdit = () => {
    setEditingCert(null);
    setSelectedFile(null);
  };

  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    if (!editingCert.title || !editingCert.category || !editingCert.issuing_organization || !editingCert.issue_date) {
      showNotification('Please fill in all mandatory fields (*).', true);
      return;
    }

    try {
      setLoading(true);
      
      // Perform R2 Upload if new file selected
      let fileMeta = null;
      if (selectedFile) {
        fileMeta = await handleFileUpload();
      }

      const certToSave = {
        ...editingCert,
        ...(fileMeta ? {
          r2_object_key: fileMeta.r2_object_key,
          file_name: fileMeta.file_name,
          file_size: fileMeta.file_size,
          mime_type: fileMeta.mime_type
        } : {})
      };

      const result = await apiSaveRecognitionCertificate(certToSave);
      
      // Dispatch standard broad window event for live active sessions
      window.dispatchEvent(new CustomEvent('RECOGNITION_CERTIFICATE_SAVED', { detail: result }));

      showNotification(`Successfully saved: "${result.title}"`);
      setEditingCert(null);
      fetchCertificates();
    } catch (err: any) {
      console.error('Error saving certificate:', err);
      showNotification('Could not save recognition certificate to D1 database.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertificate = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete: "${title}"?\nThis will remove the database metadata row.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiDeleteRecognitionCertificate(id);
      
      // Dispatch broad sync event
      window.dispatchEvent(new CustomEvent('RECOGNITION_CERTIFICATE_DELETED', { detail: id }));

      showNotification(`Deleted: "${title}"`);
      fetchCertificates();
    } catch (err: any) {
      console.error('Error deleting certificate:', err);
      showNotification('Failed to delete certificate.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentVal: number, title: string) => {
    const newVal = currentVal === 1 ? 0 : 1;
    try {
      await apiToggleRecognitionPublish(id, newVal === 1);
      
      // Dispatch broad sync event
      window.dispatchEvent(new CustomEvent('RECOGNITION_PUBLISH_TOGGLED', { detail: { id, is_published: newVal } }));

      showNotification(`"${title}" is now ${newVal === 1 ? 'Published' : 'Draft'}`);
      
      // Update local state quickly
      setCertificates(prev => prev.map(c => c.id === id ? { ...c, is_published: newVal } : c));
    } catch (err: any) {
      console.error('Failed to toggle publish status:', err);
      showNotification('Failed to update publish state.', true);
    }
  };

  const filteredCerts = certificates.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(query) || 
                          c.issuing_organization.toLowerCase().includes(query) ||
                          (c.certificate_number || '').toLowerCase().includes(query);
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full bg-[#000a21] text-slate-100 p-4 md:p-8 rounded-3xl border border-indigo-950 shadow-3xl">
      <div className="space-y-8">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-950 pb-6">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Shield size={14} />
              <span>Enterprise Admin Console Hub</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-serif uppercase tracking-tight text-slate-100">
              Recognition & Certs Management
            </h2>
            <p className="text-xs text-slate-400">
              Create, replace, update, publish, or delete corporate certificates, awards, and strategic partnerships.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={fetchCertificates}
              className="p-2 bg-[#031336] hover:bg-slate-800 rounded-lg text-slate-300 transition-colors border border-slate-800"
              title="Refresh D1 Database sync"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <button
              onClick={handleNewCertificate}
              disabled={!!editingCert}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase rounded-lg shadow-lg disabled:opacity-50 transition-all"
            >
              <Plus size={15} />
              Add Certificate
            </button>
          </div>
        </div>

        {/* Global Notifications Panel */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl flex items-center gap-3 text-rose-300 text-xs"
            >
              <AlertTriangle className="shrink-0 text-rose-400" size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-xs"
            >
              <CheckCircle2 className="shrink-0 text-emerald-400 animate-pulse" size={16} />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal-like Edit Form */}
        <AnimatePresence>
          {editingCert && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#031336]/80 border border-orange-500/40 p-6 rounded-2xl shadow-2xl backdrop-blur-md text-left space-y-6"
            >
              <div className="flex items-center justify-between border-b border-indigo-950/80 pb-3">
                <h3 className="text-sm md:text-base font-bold font-serif uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Settings size={16} className="animate-spin" />
                  {editingCert.id ? 'Modify Credential Row' : 'Configure New Certification'}
                </h3>
                <button 
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCertificate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left Fields Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Certificate Title <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCert.title || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                      placeholder="e.g. Global Digital Agency of the Year"
                      className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Category <span className="text-orange-500">*</span>
                      </label>
                      <select
                        value={editingCert.category || 'Awards'}
                        onChange={(e) => setEditingCert({ ...editingCert, category: e.target.value })}
                        className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Ref Number
                      </label>
                      <input
                        type="text"
                        value={editingCert.certificate_number || ''}
                        onChange={(e) => setEditingCert({ ...editingCert, certificate_number: e.target.value })}
                        placeholder="Ref: CF-EDGE-PART-8832"
                        className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Issuing Organization <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCert.issuing_organization || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, issuing_organization: e.target.value })}
                      placeholder="e.g. Google Developer Agency Network"
                      className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Issue Date <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={editingCert.issue_date || ''}
                        onChange={(e) => setEditingCert({ ...editingCert, issue_date: e.target.value })}
                        className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={editingCert.expiry_date || ''}
                        onChange={(e) => setEditingCert({ ...editingCert, expiry_date: e.target.value })}
                        className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={editingCert.display_order !== undefined ? editingCert.display_order : 0}
                        onChange={(e) => setEditingCert({ ...editingCert, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="form-is-published"
                        checked={editingCert.is_published === 1}
                        onChange={(e) => setEditingCert({ ...editingCert, is_published: e.target.checked ? 1 : 0 })}
                        className="rounded bg-[#01091b] border-slate-800 text-orange-500 focus:ring-orange-500/20 w-4 h-4"
                      />
                      <label htmlFor="form-is-published" className="text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer">
                        Publish Live
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Files & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Online Verification URL
                    </label>
                    <input
                      type="url"
                      value={editingCert.verification_url || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, verification_url: e.target.value })}
                      placeholder="https://verify.accreditor.org/id/..."
                      className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Document/Image Upload (PDF, PNG, JPG) <span className="text-orange-500">*</span>
                    </label>
                    
                    {/* Drag and Drop Box */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        dragActive ? 'border-orange-500 bg-orange-500/5' : 'border-indigo-950 bg-[#01091b]/50 hover:bg-[#01091b]/80'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        className="hidden"
                      />
                      <Upload className="mx-auto w-8 h-8 text-slate-500 group-hover:text-orange-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-300">
                        Drag and drop certificate document, or <span className="text-orange-400 font-bold">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        PDF, PNG, JPG maximum file size limit: 15MB.
                      </p>
                    </div>

                    {/* Selected/Existing file display badge & live document preview */}
                    {selectedFile ? (
                      <div className="mt-2 flex items-center justify-between bg-[#01091b] border border-orange-500/30 px-3 py-2 rounded-lg text-xs">
                        <span className="text-slate-200 font-mono truncate">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedFile(null)}
                          className="text-rose-500 hover:text-rose-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : editingCert.file_name ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between bg-[#01091b] border border-emerald-500/30 px-3 py-2 rounded-lg text-xs">
                          <span className="text-emerald-400 font-mono truncate">Current file: {editingCert.file_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">D1/R2 Secured</span>
                        </div>
                        {/* Live Image Preview of the Certificate */}
                        {editingCert.r2_object_key && (
                          <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-800 bg-[#01091b]/40 flex items-center justify-center">
                            {editingCert.file_name.toLowerCase().match(/\.(pdf)$/) ? (
                              <div className="flex flex-col items-center gap-1.5 py-3">
                                <FileText className="h-8 w-8 text-orange-500 animate-pulse" />
                                <span className="text-[10px] text-slate-400 font-mono">Secured PDF Document</span>
                              </div>
                            ) : (
                              <img 
                                src={`/api/recognition/file?key=${encodeURIComponent(editingCert.r2_object_key)}`}
                                alt="Certificate Preview" 
                                className="w-full h-full object-contain" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="absolute top-1 left-1 bg-[#01091b] text-[8px] font-mono font-bold text-slate-300 px-1.5 py-0.5 rounded shadow">
                              LIVE FILE PREVIEW (R2 SECURED)
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Brief Description / Award Scope Summary
                    </label>
                    <textarea
                      rows={3}
                      value={editingCert.description || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                      placeholder="Provide a detailed summary of why this award was granted, accreditation parameters, and secure technology capabilities..."
                      className="w-full bg-[#01091b] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 border-t border-indigo-950/80 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-[#01091b] border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-black uppercase rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase rounded-lg shadow-lg disabled:opacity-50 transition-all"
                  >
                    {(loading || uploading) ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        Publish Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and List view of certificates */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#01091b] p-4 rounded-xl border border-indigo-950">
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search award title, ref..."
                className="w-full bg-[#031336]/40 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#031336]/40 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Database Grid Table */}
          {loading && certificates.length === 0 ? (
            <div className="p-12 text-center bg-[#031336]/20 border border-indigo-950/40 rounded-xl">
              <Loader2 className="animate-spin text-orange-500 mx-auto w-8 h-8 mb-3" />
              <p className="text-xs text-slate-400">Accessing Cloudflare D1 encrypted secure networks...</p>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="p-12 text-center bg-[#031336]/20 border border-indigo-950/40 rounded-xl">
              <FileText className="text-slate-500 mx-auto w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs text-slate-400">No matching recognition metadata found in the registry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-indigo-950 bg-[#01091b]/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#031336] text-slate-300 font-mono border-b border-indigo-950 uppercase tracking-wider">
                    <th className="p-4">Title / Organization</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Ref / Issue Date</th>
                    <th className="p-4">Display Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/60">
                  {filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-[#031336]/25 transition-colors">
                      <td className="p-4 space-y-1">
                        <div className="font-bold text-slate-100 font-serif line-clamp-1">{cert.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Building size={10} className="text-orange-500" />
                          {cert.issuing_organization}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
                          {cert.category}
                        </span>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="font-mono text-slate-200">{cert.certificate_number || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Issued: {cert.issue_date}</div>
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {cert.display_order}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(cert.id, cert.is_published, cert.title)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                            cert.is_published === 1
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {cert.is_published === 1 ? (
                            <>
                              <Eye size={10} />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff size={10} />
                              Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditCertificate(cert)}
                            className="p-1.5 bg-[#031336] hover:bg-orange-500/10 hover:text-orange-400 rounded border border-indigo-950 text-slate-300 transition-all"
                            title="Edit metadata record"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id, cert.title)}
                            className="p-1.5 bg-[#031336] hover:bg-rose-950 hover:text-rose-400 rounded border border-indigo-950 text-slate-300 transition-all"
                            title="Delete permanently"
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
    </div>
  );
};
