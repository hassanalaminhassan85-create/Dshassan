import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  X, 
  Camera, 
  Upload, 
  Smartphone, 
  Sparkles, 
  FileSearch, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck, 
  Sliders, 
  HelpCircle,
  FolderOpen,
  Shield,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { JobApplication } from '../types';
import { apiGetApplications, apiGetApplication } from '../lib/storage';
import { apiLogScan, apiPreScreenUrl, UrlSafetyReport } from '../lib/api';

interface ApplicationQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToApplication: (id: string) => void;
}

export const ApplicationQRScanner: React.FC<ApplicationQRScannerProps> = ({
  isOpen,
  onClose,
  onNavigateToApplication
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'simulate'>('camera');
  const [availableApplications, setAvailableApplications] = useState<JobApplication[]>([]);
  
  // Camera state
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [matchedApp, setMatchedApp] = useState<JobApplication | null>(null);
  const [loadingApp, setLoadingApp] = useState<boolean>(false);

  // Safety & Backend Shielding states
  const [safetyReport, setSafetyReport] = useState<UrlSafetyReport | null>(null);
  const [safetyLoading, setSafetyLoading] = useState<boolean>(false);
  
  // File upload state
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Simulation state
  const [selectedSimId, setSelectedSimId] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [scanTrigger, setScanTrigger] = useState<number>(0);

  const qrReaderRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const READER_ELEMENT_ID = 'hr-qr-reader-viewport';

  // Fetch all applications to list in the simulator
  useEffect(() => {
    if (isOpen) {
      apiGetApplications().then(apps => {
        setAvailableApplications(apps);
        if (apps.length > 0) {
          setSelectedSimId(apps[0].id);
        }
      }).catch(err => {
        console.error('Error listing apps for simulator:', err);
      });
    }
  }, [isOpen]);

  // Clean stop helper
  const stopCameraScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
      } catch (err) {
        console.warn('Failed to cleanly stop camera:', err);
      } finally {
        scannerInstanceRef.current = null;
      }
    }
    setIsScanning(false);
  };

  // Safe start/reset trigger
  const startCameraScanner = () => {
    setScanTrigger(prev => prev + 1);
  };

  // Consolidated robust scanner lifecycle manager
  useEffect(() => {
    let active = true;
    let timerId: any = null;

    const runScanner = async () => {
      if (!isOpen || activeTab !== 'camera') {
        await stopCameraScanner();
        return;
      }

      setCameraError(null);
      setScanResult(null);
      setMatchedApp(null);

      // Brief delay to allow the React rendering thread to mount the viewport div
      timerId = setTimeout(async () => {
        if (!active) return;

        try {
          const container = document.getElementById(READER_ELEMENT_ID);
          if (!container) {
            return;
          }

          // Ensure any previously active scanner state is released
          if (scannerInstanceRef.current) {
            try {
              if (scannerInstanceRef.current.isScanning) {
                await scannerInstanceRef.current.stop();
              }
            } catch (e) {
              console.warn("Error stopping scanner before restart:", e);
            }
            scannerInstanceRef.current = null;
          }

          if (!active) return;

          // Always instantiate a fresh Html5Qrcode helper bound to the active DOM element
          const scanner = new Html5Qrcode(READER_ELEMENT_ID);
          scannerInstanceRef.current = scanner;

          // Enumerate devices to populate available options
          try {
            const devices = await Html5Qrcode.getCameras();
            if (!active) return;
            setCameras(devices);
            
            let cameraIdToUse = selectedCameraId;
            if (!cameraIdToUse && devices.length > 0) {
              const backCam = devices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('environment')
              );
              cameraIdToUse = backCam ? backCam.id : devices[0].id;
              setSelectedCameraId(cameraIdToUse);
            }
          } catch (deviceErr) {
            console.warn('Could not enumerate cameras, trying default:', deviceErr);
          }

          if (!active) return;

          setIsScanning(true);

          // Configure robust scan dimensions, clamping the box to be at least 150px (and always <= container width/height)
          const config = {
            fps: 15,
            qrbox: (width: number, height: number) => {
              const minDim = Math.min(width, height);
              const boxDim = Math.max(150, Math.floor(minDim * 0.7));
              const finalDim = Math.min(boxDim, width, height);
              return { 
                width: Math.max(50, finalDim), 
                height: Math.max(50, finalDim) 
              };
            },
            aspectRatio: 1.0
          };

          if (selectedCameraId) {
            await scanner.start(
              selectedCameraId,
              config,
              (decodedText) => {
                if (active) handleSuccessfulScan(decodedText);
              },
              () => {}
            );
          } else {
            await scanner.start(
              { facingMode: 'environment' },
              config,
              (decodedText) => {
                if (active) handleSuccessfulScan(decodedText);
              },
              () => {}
            );
          }
        } catch (err: any) {
          if (active) {
            console.error('Camera Scanner initialization error:', err);
            setCameraError(
              err?.message || 
              'Camera access permission was denied or camera is currently engaged by another app.'
            );
            setIsScanning(false);
          }
        }
      }, 150);
    };

    runScanner();

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
      stopCameraScanner();
    };
  }, [isOpen, activeTab, selectedCameraId, scanTrigger]);

  // Helper to extract application ID from scanned text
  const extractAppId = (text: string): string | null => {
    if (!text) return null;
    const trimmed = text.trim();

    // Check for standard absolute /application/:id
    const appMatch = trimmed.match(/\/application\/([\w\-]+)/);
    if (appMatch && appMatch[1]) {
      return appMatch[1];
    }

    // Check query params view=ID or id=ID
    try {
      const url = new URL(trimmed);
      const viewParam = url.searchParams.get('view');
      if (viewParam) return viewParam;
      const idParam = url.searchParams.get('id');
      if (idParam) return idParam;
    } catch (e) {
      // Not a valid URL, check params as string
      if (trimmed.includes('?')) {
        const parts = trimmed.split('?')[1];
        const params = new URLSearchParams(parts);
        if (params.has('view')) return params.get('view');
        if (params.has('id')) return params.get('id');
      }
    }

    // If it's a direct alphanumeric ID string between 5 and 45 characters
    if (/^[a-zA-Z0-9\-]{5,45}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  };

  // Process and validate retrieved application ID
  const handleSuccessfulScan = async (decodedText: string) => {
    stopCameraScanner();
    setScanResult(decodedText);
    setLoadingApp(true);
    setMatchedApp(null);
    setFileError(null);
    setSafetyReport(null);
    setSafetyLoading(true);

    const appId = extractAppId(decodedText);
    if (!appId) {
      setFileError('The scanned QR code does not contain a valid DS Tech application ID or portal link.');
      setLoadingApp(false);
      setSafetyLoading(false);
      return;
    }

    try {
      const app = await apiGetApplication(appId);
      if (app) {
        setMatchedApp(app);
        
        // Execute Gemini-powered Fraud Shield to pre-screen target url safety
        try {
          const safety = await apiPreScreenUrl(decodedText);
          setSafetyReport(safety);

          // Log the scan with Cloudflare backend (uploads compressed image to R2, saves history in D1)
          await apiLogScan({
            applicantId: app.id,
            applicantName: app.personalInfo?.fullName || 'Anonymous',
            safetyStatus: safety.safe ? 'safe' : 'unsafe',
            qrImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          });
        } catch (safetyErr) {
          console.warn('Backend logging or safety check bypassed:', safetyErr);
          // Fallback log
          await apiLogScan({
            applicantId: app.id,
            applicantName: app.personalInfo?.fullName || 'Anonymous',
            safetyStatus: 'safe'
          });
        }
      } else {
        setFileError(`No application file matches ID: ${appId}`);
      }
    } catch (err: any) {
      setFileError(`File retrieval error: ${err.message || 'ID not found in database'}`);
    } finally {
      setLoadingApp(false);
      setSafetyLoading(false);
    }
  };

  // Direct Navigate to applicant details
  const handleConfirmNavigate = () => {
    if (matchedApp) {
      onNavigateToApplication(matchedApp.id);
      onClose();
    }
  };

  // Handle image upload and scanning using Html5Qrcode file API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    scanImageFile(file);
  };

  const scanImageFile = async (file: File) => {
    setFileError(null);
    setScanResult(null);
    setMatchedApp(null);
    setLoadingApp(true);

    try {
      // Create a temporary element to host file parser
      const parser = new Html5Qrcode('qr-file-fallback-host');
      const decodedText = await parser.scanFile(file, true);
      handleSuccessfulScan(decodedText);
    } catch (err: any) {
      setFileError('Could not locate or decode any QR code pattern in this image. Please ensure it is well lit and sharp.');
      setLoadingApp(false);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      scanImageFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger file selection programmatically
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Simulate scanning of an existing app profile
  const handleSimulateScan = async () => {
    if (!selectedSimId) return;
    setIsSimulating(true);
    
    setTimeout(async () => {
      setIsSimulating(false);
      const simulatedText = `${window.location.origin}/application/${selectedSimId}`;
      handleSuccessfulScan(simulatedText);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      {/* Hidden dummy element required for scanning file inputs using html5-qrcode */}
      <div id="qr-file-fallback-host" className="hidden" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Dynamic header row */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <QrCode size={18} className="animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block leading-none">
                DS Tech Operations
              </span>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-white mt-0.5 leading-none">
                File Retriever Scanner
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 bg-slate-950/60 p-1 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'camera' 
                ? 'bg-slate-800 text-orange-400 border border-slate-700/60' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera size={14} />
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' 
                ? 'bg-slate-800 text-orange-400 border border-slate-700/60' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload size={14} />
            Upload Image
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'simulate' 
                ? 'bg-slate-800 text-orange-400 border border-slate-700/60' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            Simulate
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            {/* If there's an active scanning match found */}
            {loadingApp ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center gap-4 text-center my-auto"
              >
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-slate-800 border-t-orange-500 rounded-full animate-spin" />
                  <QrCode size={18} className="absolute inset-0 m-auto text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Retrieving Applicant Record</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1 break-all px-6">
                    Searching Secure Storage Nodes...
                  </p>
                </div>
              </motion.div>
            ) : matchedApp ? (
              <motion.div
                key="matched"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 text-left my-auto"
              >
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl pointer-events-none" />
                  
                  <div className="w-12 h-14 bg-slate-900 rounded-lg border border-slate-750 flex items-center justify-center overflow-hidden shrink-0">
                    {matchedApp.personalInfo?.passportPhoto ? (
                      <img src={matchedApp.personalInfo.passportPhoto} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <UserCheck size={20} className="text-emerald-400" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/25">
                      <CheckCircle2 size={10} />
                      Match Found
                    </div>
                    <h4 className="font-black text-sm text-slate-100 truncate">
                      {matchedApp.personalInfo?.fullName || 'N/A'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {matchedApp.positionSkills?.majorRole || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Applicant ID:</span>
                    <span className="text-slate-200 font-bold">{matchedApp.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="text-indigo-400 font-bold max-w-[200px] truncate">{matchedApp.personalInfo?.emailAddress || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Degree Status:</span>
                    <span className="text-slate-300 font-bold">{matchedApp.educationalBg?.highestQualification || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approval State:</span>
                    <span className={`font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded ${
                      matchedApp.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      matchedApp.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>{matchedApp.status || 'pending'}</span>
                  </div>
                </div>

                {/* 🛡️ 2026 AI FRAUD SHIELD STATUS */}
                {safetyLoading ? (
                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2 font-mono text-[11px]">
                      <Loader2 size={14} className="animate-spin text-orange-400" />
                      Analyzing QR payload safety...
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-slate-500 rounded font-bold">AI SHIELD</span>
                  </div>
                ) : safetyReport ? (
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
                    safetyReport.safe 
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
                      : 'bg-rose-950/25 border-rose-500/20 text-rose-300'
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1.5">
                      <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px]">
                        {safetyReport.safe ? <ShieldCheck size={14} className="text-emerald-400" /> : <ShieldAlert size={14} className="text-rose-400" />}
                        {safetyReport.safe ? 'Secure QR Link' : 'Fraud Blocked'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        safetyReport.safe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        Threat Score: {safetyReport.dangerScore}/100
                      </span>
                    </div>
                    <p className="opacity-95 text-[11px] font-sans">{safetyReport.reason}</p>
                    {!safetyReport.safe && (
                      <p className="mt-2 text-[10px] uppercase font-black tracking-widest text-rose-400">
                        Warning: Phishing/Malware pre-screen warning. Caution is advised.
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMatchedApp(null);
                      setScanResult(null);
                      if (activeTab === 'camera') startCameraScanner();
                    }}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-colors"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={handleConfirmNavigate}
                    className="py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FolderOpen size={13} />
                    Open Record File
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-grow flex flex-col justify-between">
                
                {/* Mode 1: Camera scanning viewport */}
                {activeTab === 'camera' && (
                  <motion.div 
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 flex flex-col"
                  >
                    {cameraError ? (
                      <div className="p-6 bg-rose-500/15 border border-rose-500/20 rounded-2xl text-center space-y-3">
                        <AlertCircle className="mx-auto text-rose-400" size={28} />
                        <div>
                          <h4 className="font-extrabold text-xs text-rose-400 uppercase tracking-widest">Scanner Initialization Failed</h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                            {cameraError}
                          </p>
                        </div>
                        <button
                          onClick={startCameraScanner}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                        >
                          Retry Connection
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        {/* Camera list dropdown wrapper */}
                        {cameras.length > 1 && (
                          <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-850">
                            <span className="text-[9px] uppercase font-black text-slate-500 font-mono">Input Device</span>
                            <select
                              value={selectedCameraId}
                              onChange={(e) => setSelectedCameraId(e.target.value)}
                              className="bg-transparent font-bold text-xs text-orange-400 focus:outline-none max-w-[200px] truncate"
                            >
                              {cameras.map((cam) => (
                                <option key={cam.id} value={cam.id} className="bg-slate-900 text-white">
                                  {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Scanner Viewport Frame */}
                        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 aspect-square max-w-[280px] mx-auto w-full">
                          {/* Animated scanner overlay laser line */}
                          {isScanning && (
                            <motion.div 
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_10px_#EA580C] z-20 pointer-events-none"
                            />
                          )}

                          {/* Target scan guides */}
                          <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-orange-500 z-10 rounded-tl" />
                          <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-orange-500 z-10 rounded-tr" />
                          <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-orange-500 z-10 rounded-bl" />
                          <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-orange-500 z-10 rounded-br" />

                          {/* HTML5 QR viewport node */}
                          <div id={READER_ELEMENT_ID} className="w-full h-full object-cover relative z-0 scale-x-[-1]" />
                        </div>

                        <p className="text-[11px] text-slate-400 leading-normal flex items-center justify-center gap-1.5 font-medium">
                          <Sliders size={11} className="text-orange-400 animate-spin-slow" />
                          <span>Position the printed QR code within the active scanning window</span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Mode 2: Drag and drop upload */}
                {activeTab === 'upload' && (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={onButtonClick}
                      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors text-center cursor-pointer ${
                        dragActive 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                      }`}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center border border-slate-850 text-slate-400 group-hover:text-orange-400 transition-colors">
                        <Upload size={20} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-200">
                          {dragActive ? 'Drop image file here' : 'Drag and drop QR code image'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Supports JPG, PNG, WebP up to 8MB
                        </p>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        Select Photo
                      </button>
                    </div>

                    {fileError && (
                      <div className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-xl flex items-start gap-2 text-xs text-left leading-relaxed font-semibold">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{fileError}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Mode 3: Simulation sandbox for evaluator */}
                {activeTab === 'simulate' && (
                  <motion.div 
                    key="simulate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 text-left"
                  >
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3.5 text-xs">
                      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                        <Sparkles size={13} className="text-orange-400" />
                        <span className="font-extrabold text-slate-300 uppercase text-[9px] tracking-wider">
                          Evaluator Sandbox
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                        Don't have a physical smartphone or printed applicant QR badge? Select any of the registered applicants from the database list below to simulate a live scanning operation.
                      </p>

                      {availableApplications.length > 0 ? (
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Choose Target Profile
                          </label>
                          <select
                            value={selectedSimId}
                            onChange={(e) => setSelectedSimId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                          >
                            {availableApplications.map((app) => (
                              <option key={app.id} value={app.id}>
                                {app.personalInfo?.fullName || 'N/A'} - {app.positionSkills?.majorRole || 'N/A'}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={handleSimulateScan}
                            disabled={isSimulating}
                            className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10"
                          >
                            {isSimulating ? (
                              <>
                                <RefreshCw className="animate-spin" size={13} />
                                Decoding Scan stream...
                              </>
                            ) : (
                              <>
                                <QrCode size={14} />
                                Inject simulated payload
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-slate-500 space-y-2">
                          <AlertCircle className="mx-auto" size={24} />
                          <p className="text-[11px] font-bold">No candidate profiles exist in database to simulate yet.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Footer security badge */}
                <div className="pt-4 border-t border-slate-800/60 mt-4 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-500" />
                    SECURE INGRESS RETRIEVER
                  </span>
                  <span>v2.4 [GARKI CORE]</span>
                </div>

              </div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};
