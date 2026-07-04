import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, User, Shield, Eye, Bell, Palette, Globe, HelpCircle,
  Link2, Briefcase, Cpu, Code, CreditCard, Search, RotateCcw,
  Download, Upload, Save, Check, AlertTriangle, FileText,
  Bookmark, Star, Clock, Trash2, ShieldAlert, Key, Info, CheckCircle,
  Copy, ChevronRight, Laptop, Activity, Plus, Play, Lock, UserCheck, RefreshCw,
  CheckCircle2, AlertCircle
} from 'lucide-react';

import { apiUpdateProfile } from '../lib/api';

interface CandidateEnterpriseSettingsProps {
  currentUser: { fullName: string; email: string; id: string; role?: string; profilePhoto?: string } | null;
  onClose?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

// 12 Settings Categories
interface SettingCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

const SETTING_CATEGORIES: SettingCategory[] = [
  { id: 'profile', title: 'Account & Profile', icon: User, description: 'Manage emails, custom URLs, active login sessions, and account recovery.' },
  { id: 'security', title: 'Security & Auth', icon: Shield, description: 'Passkeys, biometrics, two-factor (MFA), quantum encryption, and security logs.' },
  { id: 'privacy', title: 'Privacy & Data', icon: Eye, description: 'Collection preferences, cookies consent, GDPR/CCPA, and direct data export.' },
  { id: 'notifications', title: 'Notification Rules', icon: Bell, description: 'System alert triggers, frequency modes, quiet hours, and priority levels.' },
  { id: 'appearance', title: 'Theme & Appearance', icon: Palette, description: 'Dark/light modes, custom presets, font customization, and accessibility options.' },
  { id: 'language', title: 'Language & Locale', icon: Globe, description: '50+ localized interfaces, date/time format, translation quality, and currencies.' },
  { id: 'channels', title: 'Notification Channels', icon: Link2, description: 'Slack, Discord, MS Teams, Telegram, and developer webhook notifications.' },
  { id: 'integrations', title: 'Integrations & APIs', icon: Cpu, description: 'Sync LinkedIn, GitHub, Google/Outlook Calendar, and API key configurations.' },
  { id: 'career', title: 'Career & Goals', icon: Briefcase, description: 'Preferred roles, salary expectations, relocation parameters, and skills to track.' },
  { id: 'ai', title: 'AI & Personalization', icon: Settings, description: 'Model selector, AI response style, coaching frequency, and serendipity levels.' },
  { id: 'advanced', title: 'Advanced & Beta', icon: Code, description: 'Developer mode toggle, experimental feature access, and automated JSON rules.' },
  { id: 'billing', title: 'Billing & Quotas', icon: CreditCard, description: 'Subscription plan, auto-renewal controls, invoices, and API usage quotas.' }
];

// Audit Log structure
interface AuditLogEntry {
  id: string;
  timestamp: string;
  key: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
}

// Backup structure
interface BackupItem {
  id: string;
  name: string;
  date: string;
  size: string;
  data: string;
}

export const CandidateEnterpriseSettings: React.FC<CandidateEnterpriseSettingsProps> = ({
  currentUser,
  onClose,
  isDarkMode,
  setIsDarkMode,
  onProfileUpdated
}) => {
  // Profile photo custom/preset states
  const [profilePhoto, setProfilePhoto] = useState<string>(currentUser?.profilePhoto || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<boolean>(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image size must be smaller than 2MB.");
      return;
    }

    setPhotoError(null);
    setPhotoSuccess(false);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const resultBase64 = reader.result;
        setProfilePhoto(resultBase64);
        saveProfilePhoto(resultBase64);
      }
    };
    reader.onerror = () => {
      setPhotoError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const saveProfilePhoto = async (photoValue: string) => {
    if (!currentUser?.id) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);
    setPhotoSuccess(false);
    try {
      const res = await apiUpdateProfile({
        userId: currentUser.id,
        profilePhoto: photoValue
      });
      if (res.success) {
        setPhotoSuccess(true);
        if (onProfileUpdated) {
          onProfileUpdated(res.user);
        }
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        setTimeout(() => setPhotoSuccess(false), 3000);
      } else {
        throw new Error("Could not serialize and write profile photo.");
      }
    } catch (err: any) {
      setPhotoError(err.message || "Failed to update profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const applyPresetAvatar = (gradientClass: string) => {
    // Generate a high-contrast inline SVG representing the selected preset
    const initials = currentUser?.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'DS';
    const svgString = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231E40AF"/><stop offset="100%" stop-color="%23EA580C"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><text x="50%" y="55%" font-family="Inter, sans-serif" font-weight="900" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    setProfilePhoto(svgString);
    saveProfilePhoto(svgString);
  };

  // Initialize setting keys with state values
  const [settings, setSettings] = useState<Record<string, any>>({
    // Category 1: Profile
    email: currentUser?.email || 'candidate2026@dstech.com',
    phone: '+1 (555) 019-2831',
    profileVisibility: 'recruiter-only',
    customUrl: 'https://dstech.careers/ngozi-balogun',
    accountRecovery: 'email-phone',
    sessionTimeout: '30',
    verificationStatus: 'Verified Level 3',
    isProfilePublic: false,

    // Category 2: Security
    mfaEnabled: true,
    mfaMethod: 'authenticator',
    fingerprintAuth: true,
    faceAuth: true,
    irisAuth: false,
    voiceAuth: false,
    behavioralBiometrics: true,
    securityQuestion: 'What was your first project platform?',
    securityAnswer: 'D1 Ledger v1',
    ipWhitelist: '192.168.1.1, 10.0.0.12',
    loginAttemptAlerts: true,
    suspiciousActivityAlerts: true,
    quantumEncryption: true,
    passwordlessAuth: true,
    zeroKnowledgeProof: true,

    // Category 3: Privacy
    dataCollection: true,
    thirdPartySharing: false,
    cookiesEssential: true,
    cookiesAnalytics: true,
    cookiesMarketing: false,
    trackingPixelOptOut: true,
    analyticsDataOptOut: false,
    personalizationData: true,
    locationPermission: true,
    cameraPermission: true,
    microphonePermission: true,
    contactsPermission: false,
    calendarPermission: true,
    dataRetentionYears: '7',
    gdprConsent: true,
    ccpaConsent: true,

    // Category 4: Notifications
    emailNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: 'daily',
    notifyAppStatus: true,
    notifyInterviews: true,
    notifyCourseEnrollment: true,
    notifyJobRecs: true,
    notifySkillRecs: true,
    notifyMarketAlerts: true,
    notifyMentorship: true,
    notifyNetwork: true,
    notifyAchievements: true,
    notifyReminders: true,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    notificationSound: 'chime-cyber',
    notificationPreview: 'sender-only',
    notificationGrouping: 'category',
    notificationPriority: 'high-only',

    // Category 5: Theme & Appearance
    autoThemeSystem: true,
    colorTheme: 'indigo-elite',
    fontSize: 'medium',
    fontFamily: 'Space Grotesk',
    highContrast: false,
    reducedMotion: false,
    accessibilityFont: false,
    colorBlindnessMode: 'none',
    customPrimaryColor: '#6366f1',
    customSecondaryColor: '#f97316',
    gradientBackground: 'deep-space',
    sidebarPosition: 'left',
    sidebarCollapsed: false,
    viewMode: 'comfortable',

    // Category 6: Language
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'USD',
    numberFormat: 'us',
    textDirection: 'ltr',
    keyboardLayout: 'us-qwerty',
    spellCheckLang: 'en-US',
    autoTranslation: true,
    translationQuality: 'high-neural',

    // Category 7: Notification Channels
    emailChannel: true,
    smsChannel: true,
    pushChannel: true,
    inAppChannel: true,
    slackIntegration: false,
    teamsIntegration: false,
    discordIntegration: true,
    telegramIntegration: false,
    whatsappIntegration: false,
    webhookUrl: 'https://api.dstech.careers/webhooks/notifications',
    notificationRoutingRule: 'critical-to-all',
    notificationEscalationEnabled: true,

    // Category 8: Integrations
    linkedinSync: true,
    githubSync: true,
    googleCalendarSync: true,
    outlookCalendarSync: false,
    gmailIntegration: true,
    slackWorkspace: 'D1TechLabs',
    teamsWorkspace: '',
    zapierEnabled: true,
    iftttEnabled: false,
    apiKey: 'ds_live_9a8f7c6b5d4e3c2b1a547',
    oauthPermissionsApproved: true,

    // Category 9: Career Preferences
    targetRoles: 'Senior Cloud Architect, Lead AI Cryptographer',
    preferredIndustries: 'FinTech, Security, Decentralized Identity',
    preferredCompanySizes: '50-200, 200-1000',
    workArrangement: 'remote',
    salaryExpectation: '185,000',
    desiredBenefits: 'Healthcare, Equity Options, Unlimited PTO, Tech Stipend',
    shortTermGoal: 'Certify on Quantum-Resistant Ledger Deployments',
    longTermGoal: 'VP of Engineering or Chief Security Architect',
    skillsToDevelop: 'Rust, WebAssembly, Advanced BCI Protocols',
    noticePeriodDays: '30',
    visaSponsorshipRequired: false,
    relocationWillingness: 'no',
    travelFrequency: 'minimal',

    // Category 10: AI
    aiRecommendations: true,
    aiLearningStyle: 'adaptive-visual',
    aiModelSelection: 'gemini-1.5-pro-neural',
    aiResponseStyle: 'technical',
    aiResponseLength: 'detailed',
    personalizationLevel: 'aggressive',
    dataDrivenRecs: true,
    serendipityLevel: 'moderate',
    aiCoachingEnabled: true,
    aiPracticeFrequency: 'weekly',
    aiCareerGuidance: true,
    mlUpdatesFrequency: 'daily',
    aiExplainability: true,
    aiBiasMitigation: true,

    // Category 11: Advanced
    betaFeaturesOptIn: true,
    experimentalFeatures: true,
    featureAnnouncements: true,
    earlyAccessProgram: true,
    advancedMode: true,
    developerMode: true,
    apiAccessEnabled: true,

    // Category 12: Billing
    currentPlan: 'DS Enterprise Gold Elite',
    billingCycle: 'annual',
    paymentMethod: 'Visa ending in 8890',
    billingAddress: '128 Innovation Way, Suite 400, London',
    renewalDate: '2027-01-15',
    autoRenewal: true,
    storageQuota: '500 GB',
    apiRateLimit: '50,000 requests/day'
  });

  // Track pristine/default state for Reset
  const defaultSettings = useRef<Record<string, any>>({ ...settings });

  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('profile');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  
  // Custom interactive systems state
  const [bookmarkedSettings, setBookmarkedSettings] = useState<string[]>(['mfaEnabled', 'quantumEncryption', 'colorTheme']);
  const [settingsHistory, setSettingsHistory] = useState<string[]>(['profile', 'security']);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: 'log-1', timestamp: '2026-06-29 01:22:15', key: 'quantumEncryption', oldValue: 'false', newValue: 'true', ipAddress: '192.168.1.45' },
    { id: 'log-2', timestamp: '2026-06-29 01:40:02', key: 'colorTheme', oldValue: 'slate', newValue: 'indigo-elite', ipAddress: '192.168.1.45' }
  ]);
  const [backups, setBackups] = useState<BackupItem[]>([
    { id: 'bk-1', name: 'Standard Candidate Preset', date: '2026-06-28 14:15:20', size: '2.4 KB', data: JSON.stringify(defaultSettings.current, null, 2) }
  ]);

  // JSON Advanced Editor Mode
  const [showJsonEditor, setShowJsonEditor] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Settings profile templates
  const [activeProfile, setActiveProfile] = useState<string>('custom');

  // Change history rollback support
  const [undoStack, setUndoStack] = useState<{ key: string; prevValue: any }[]>([]);

  // Search filter options
  const [recentlyChangedOnly, setRecentlyChangedOnly] = useState<boolean>(false);
  const [starredOnly, setStarredOnly] = useState<boolean>(false);

  // Password confirmation modal for sensitive settings
  const [isConfirmPasswordOpen, setIsConfirmPasswordOpen] = useState<boolean>(false);
  const [pendingSensitiveChange, setPendingSensitiveChange] = useState<{ key: string; value: any } | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification sound simulator helper
  const playNotificationSound = (sound: string) => {
    console.log(`Simulated playback for premium audio theme: ${sound}`);
  };

  // Synchronize system-wide dark mode with parent state when settings page changes it
  useEffect(() => {
    if (settings.colorTheme === 'light-classic') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
    }
  }, [settings.colorTheme, setIsDarkMode]);

  // Automated Autosave handler with visual feedback on change
  const updateSetting = (key: string, value: any, isSensitive = false) => {
    if (isSensitive) {
      setPendingSensitiveChange({ key, value });
      setIsConfirmPasswordOpen(true);
      return;
    }

    // Push current key/value to undo stack
    setUndoStack(prev => [{ key, prevValue: settings[key] }, ...prev.slice(0, 19)]);

    // Trigger visual saving status
    setSaveStatus('saving');

    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      
      // Update Settings History if not already tracked
      if (!settingsHistory.includes(activeCategory)) {
        setSettingsHistory(hist => [activeCategory, ...hist.slice(0, 4)]);
      }

      // Add to audit logs
      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        key,
        oldValue: String(prev[key]),
        newValue: String(value),
        ipAddress: '192.168.1.104'
      };
      setAuditLogs(logs => [newLog, ...logs.slice(0, 49)]);

      return updated;
    });

    setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const nextUndo = [...undoStack];
    const { key, prevValue } = nextUndo[0];
    nextUndo.shift();
    setUndoStack(nextUndo);

    setSettings(prev => ({ ...prev, [key]: prevValue }));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const handleSensitiveConfirm = () => {
    if (passwordInput === 'admin' || passwordInput.length >= 4) {
      if (pendingSensitiveChange) {
        const { key, value } = pendingSensitiveChange;
        updateSetting(key, value, false);
      }
      setIsConfirmPasswordOpen(false);
      setPasswordInput('');
      setPasswordError(null);
      setPendingSensitiveChange(null);
    } else {
      setPasswordError('Invalid verification passcode. Sensitive operations locked.');
    }
  };

  const toggleBookmark = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedSettings(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you absolutely sure you want to revert all 12 categories back to factory defaults?')) {
      setSettings({ ...defaultSettings.current });
      setUndoStack([]);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ds_candidate_settings_secure_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setSettings(prev => ({ ...prev, ...parsed }));
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
          alert('Secure settings JSON package imported successfully!');
        } catch (err) {
          alert('Could not parse JSON. Ensure file is correctly formatted.');
        }
      };
    }
  };

  const handleProfilePresetSelect = (profile: string) => {
    setActiveProfile(profile);
    if (profile === 'work') {
      setSettings(prev => ({
        ...prev,
        profileVisibility: 'public',
        isProfilePublic: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        mfaEnabled: true,
        personalizationData: true,
        aiModelSelection: 'gemini-1.5-pro-neural'
      }));
    } else if (profile === 'anonymous') {
      setSettings(prev => ({
        ...prev,
        profileVisibility: 'private',
        isProfilePublic: false,
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
        dataCollection: false,
        thirdPartySharing: false,
        cookiesAnalytics: false,
        cookiesMarketing: false,
        trackingPixelOptOut: true,
        analyticsDataOptOut: true,
        quantumEncryption: true,
        zeroKnowledgeProof: true
      }));
    } else if (profile === 'playground') {
      setSettings(prev => ({
        ...prev,
        betaFeaturesOptIn: true,
        experimentalFeatures: true,
        advancedMode: true,
        developerMode: true,
        colorTheme: 'cyberpunk-neon',
        fontSize: 'large',
        fontFamily: 'JetBrains Mono'
      }));
    }
  };

  const handleCreateBackup = () => {
    const name = prompt('Enter a name for your settings backup:', `Candidate Core Backup - ${new Date().toLocaleDateString()}`);
    if (!name) return;
    const newBackup: BackupItem = {
      id: `bk-${Date.now()}`,
      name,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      size: `${(JSON.stringify(settings).length / 1024).toFixed(1)} KB`,
      data: JSON.stringify(settings)
    };
    setBackups(prev => [newBackup, ...prev]);
  };

  const handleRestoreBackup = (backup: BackupItem) => {
    if (window.confirm(`Restore settings from backup: "${backup.name}"?`)) {
      try {
        const parsed = JSON.parse(backup.data);
        setSettings(parsed);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        alert('Restoration error: backup state corrupted.');
      }
    }
  };

  const handleDeleteBackup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBackups(prev => prev.filter(b => b.id !== id));
  };

  const applyJsonEditor = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setSettings(parsed);
      setJsonError(null);
      setShowJsonEditor(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setJsonError(`JSON Syntax Error: ${err.message}`);
    }
  };

  // Build a list of all settings with metadata to allow global search highlighting
  const searchableSettings = [
    // Profile
    { key: 'email', label: 'Email Address Management', category: 'profile', type: 'text', help: 'Set primary contact address for secure application communications.' },
    { key: 'phone', label: 'Phone Number Verification', category: 'profile', type: 'text', help: 'Secure endpoint for two-factor authentication fallback alerts.' },
    { key: 'profileVisibility', label: 'Profile Visibility Level', category: 'profile', type: 'select', options: ['public', 'private', 'recruiter-only'], help: 'Toggle access controls for candidate bio search algorithms.' },
    { key: 'customUrl', label: 'Profile URL Customization', category: 'profile', type: 'text', help: 'Unique endpoint address for employer presentation views.' },
    { key: 'sessionTimeout', label: 'Session Timeout Buffer (Minutes)', category: 'profile', type: 'number', help: 'Auto-exit time for high-security container tokens.' },
    
    // Security
    { key: 'mfaEnabled', label: 'Multi-Factor Authentication (MFA)', category: 'security', type: 'toggle', help: 'Require separate security code verification on all login portals.' },
    { key: 'fingerprintAuth', label: 'Biometric Touch ID Authentication', category: 'security', type: 'toggle', help: 'Register physical device hardware signatures.' },
    { key: 'faceAuth', label: 'Face ID Verification', category: 'security', type: 'toggle', help: 'Analyze facial geometry parameters during authentication operations.' },
    { key: 'quantumEncryption', label: 'Quantum-Resistant Ledger Cryptography', category: 'security', type: 'toggle', help: 'Encrypt user profiles using next-gen lattice cryptology signatures.' },
    { key: 'passwordlessAuth', label: 'Passwordless Authentication Options', category: 'security', type: 'toggle', help: 'Enable FIDO2 WebAuthn authentication without entering a password.' },
    { key: 'zeroKnowledgeProof', label: 'Zero-Knowledge Proof Verification', category: 'security', type: 'toggle', help: 'Authenticate credentials without exposing raw private secrets.' },

    // Privacy
    { key: 'dataCollection', label: 'Analytical Data Collection', category: 'privacy', type: 'toggle', help: 'Allow secure collection of performance metrics for system refinement.' },
    { key: 'thirdPartySharing', label: 'Third-Party Recruiting Integrations', category: 'privacy', type: 'toggle', help: 'Expose credentials to external career partners.' },
    { key: 'trackingPixelOptOut', label: 'Marketing Pixel Protection', category: 'privacy', type: 'toggle', help: 'Block marketing telemetry tags and trackers.' },
    { key: 'dataRetentionYears', label: 'Retention Threshold (Years)', category: 'privacy', type: 'slider', min: 1, max: 10, help: 'Duration data is retained in active D1 server tables.' },

    // Notifications
    { key: 'emailNotifications', label: 'Master Email Notifications', category: 'notifications', type: 'toggle', help: 'Send digital correspondence updates directly to linked email inbox.' },
    { key: 'inAppNotifications', label: 'Interactive In-App Alerts', category: 'notifications', type: 'toggle', help: 'Display status modifications inside the telemetry dashboard.' },
    { key: 'notificationFrequency', label: 'Delivery Schedule Cadence', category: 'notifications', type: 'select', options: ['real-time', 'daily', 'weekly'], help: 'Interval for consolidating recommendations and market insights.' },
    { key: 'quietHoursEnabled', label: 'Do Not Disturb Quiet Hours', category: 'notifications', type: 'toggle', help: 'Silence non-critical push notifications during preset periods.' },

    // Appearance
    { key: 'colorTheme', label: 'Color Space Preset Theme', category: 'appearance', type: 'select', options: ['indigo-elite', 'cyberpunk-neon', 'emerald-matrix', 'light-classic'], help: 'Select primary visual atmosphere configuration.' },
    { key: 'fontSize', label: 'Text Size Scaling', category: 'appearance', type: 'select', options: ['small', 'medium', 'large', 'xl'], help: 'Calibrate interface typography readability.' },
    { key: 'fontFamily', label: 'System Typeface Family', category: 'appearance', type: 'select', options: ['Space Grotesk', 'Inter', 'JetBrains Mono'], help: 'Adjust typography system.' },
    { key: 'highContrast', label: 'High Contrast Mode', category: 'appearance', type: 'toggle', help: 'Increase contrast ratio compliance for readability.' },
    { key: 'reducedMotion', label: 'Reduced Motion Prefs', category: 'appearance', type: 'toggle', help: 'Deactivate background animations and page sweeps.' },

    // Language
    { key: 'language', label: 'System Interface Language', category: 'language', type: 'select', options: ['en', 'fr', 'yo', 'ha', 'es', 'zh'], help: 'Configure default localized phrasing.' },
    { key: 'dateFormat', label: 'Default Date Format', category: 'language', type: 'select', options: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'], help: 'Change calendar serialization rules.' },

    // Channels
    { key: 'webhookUrl', label: 'Developer Webhook Endpoint URL', category: 'channels', type: 'text', help: 'Send raw notification payloads to a server endpoint for automation.' },
    { key: 'discordIntegration', label: 'Discord Bot Communications Channel', category: 'channels', type: 'toggle', help: 'Direct critical interview alerts to a Discord server channel.' },

    // Integrations
    { key: 'linkedinSync', label: 'LinkedIn Profile Synchronization', category: 'integrations', type: 'toggle', help: 'Import experience, endorsements, and bio summaries on demand.' },
    { key: 'githubSync', label: 'GitHub Contributions Scanner', category: 'integrations', type: 'toggle', help: 'Analyze repository impact factors and commit cadence weights.' },
    { key: 'apiKey', label: 'DS Public API Key Signature', category: 'integrations', type: 'text', help: 'Secure secret token used to programmatically interface with your candidate scorecard.' },

    // Career
    { key: 'targetRoles', label: 'Target Professional Roles', category: 'career', type: 'text', help: 'Positions matched by autonomous application agents.' },
    { key: 'workArrangement', label: 'Preferred Workspace Arrangements', category: 'career', type: 'select', options: ['remote', 'hybrid', 'onsite'], help: 'Desired remote-vs-office split rules.' },
    { key: 'salaryExpectation', label: 'Minimum Total Compensation (USD)', category: 'career', type: 'text', help: 'Target starting financial parameters for negotiating agents.' },

    // AI
    { key: 'aiModelSelection', label: 'LLM Orchestrator Intelligence Model', category: 'ai', type: 'select', options: ['gemini-1.5-pro-neural', 'gemini-1.5-flash-speed', 'claude-3.5-sonnet'], help: 'Set core reasoning engine for roadmaps and interview simulations.' },
    { key: 'aiResponseStyle', label: 'AI Output Style Personality', category: 'ai', type: 'select', options: ['technical', 'formal', 'casual'], help: 'Calibrate guidance tone of AI coaching avatars.' },

    // Advanced
    { key: 'developerMode', label: 'System Developer Sandbox Mode', category: 'advanced', type: 'toggle', help: 'Unlock internal API access, console logs, and JSON editing tools.' },
    { key: 'betaFeaturesOptIn', label: 'Early-Access Feature Preview Program', category: 'advanced', type: 'toggle', help: 'Opt into next-generation experimental modules before public releases.' },

    // Billing
    { key: 'currentPlan', label: 'Active Subscription Plan Tier', category: 'billing', type: 'text', readonly: true, help: 'Enterprise authorization level for advanced prediction tools.' }
  ];

  // Filters results based on user preferences and search keywords
  const filteredSettings = searchableSettings.filter(item => {
    // Category filter matching active view unless there is a search query
    const categoryMatch = searchQuery ? true : item.category === activeCategory;
    
    // Keyword match
    const keywordMatch = searchQuery ? (
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.help.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(settings[item.key] || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;

    // Filter by bookmarks
    const starredMatch = starredOnly ? bookmarkedSettings.includes(item.key) : true;

    // Filter by recently changed (exists in undo stack)
    const recentlyChangedMatch = recentlyChangedOnly ? undoStack.some(u => u.key === item.key) : true;

    return categoryMatch && keywordMatch && starredMatch && recentlyChangedMatch;
  });

  return (
    <div 
      id="extraordinary-settings-view" 
      className={`relative w-full transition-all duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} flex flex-col`}
    >
      {/* Top Utility Indicator & Save Hub */}
      <div id="settings-save-header" className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <Settings className="text-orange-500 animate-spin-slow" size={22} />
            <h2 className="text-lg font-black tracking-tight uppercase bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">
              Enterprise Configuration Console
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            DS Tech Candidate Security & Calibration • 12 Active Modules
          </p>
        </div>

        {/* Global Save Controls and Undo Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {undoStack.length > 0 && (
            <button
              id="btn-undo-change"
              onClick={handleUndo}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600/40 transition-colors"
            >
              <RotateCcw size={11} /> Undo Change ({undoStack.length})
            </button>
          )}

          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-bold rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              Auto-Sealing Ledger Block...
            </div>
          )}

          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-xl animate-bounce">
              <Check size={11} /> Cryptographic Seal Written ({lastSavedTime})
            </div>
          )}

          {saveStatus === 'idle' && (
            <div className={`text-[9px] font-mono border rounded-xl px-2.5 py-1.5 ${isDarkMode ? 'text-slate-500 bg-black/40 border-white/5' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
              SECURE LOCAL MEMORY SYNC: ACTIVE
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className={`px-3.5 py-1.5 border text-[10px] font-extrabold uppercase rounded-xl transition-all ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Close Console
            </button>
          )}
        </div>
      </div>

      {/* Profile/Environment Presets Row */}
      <div id="settings-preset-presets" className={`rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 mb-6 border ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2">
          <Info size={13} className="text-orange-400 shrink-0" />
          <span className={`text-[10px] font-extrabold uppercase tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Rapid Presets:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'custom', label: 'Custom Sandbox' },
            { id: 'work', label: 'Maximum Opportunities (Public)' },
            { id: 'anonymous', label: 'Stealth Cryptographer (High Privacy)' },
            { id: 'playground', label: 'Experimental Developer (All Betas)' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleProfilePresetSelect(p.id)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${
                activeProfile === p.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                  : isDarkMode 
                    ? 'bg-black/30 border-slate-800 text-slate-400 hover:text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: Sidebar Category Selector & Advanced Tools */}
        <div id="settings-left-rail" className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Navigation Box with search */}
          <div className={`rounded-2xl p-4 flex flex-col gap-4 border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            
            {/* Global Settings Search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                id="inp-settings-search"
                type="text"
                placeholder="Search settings, keys, descriptions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-8 py-2 rounded-xl text-[11px] focus:outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-black/40 border-white/10 focus:border-indigo-500 text-indigo-200' 
                    : 'bg-slate-100 border-slate-200 focus:border-indigo-500 text-slate-800'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[9px] font-black text-slate-400 uppercase hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sub-Filters */}
            <div className={`flex items-center gap-3 border-b pb-2.5 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <button
                onClick={() => setStarredOnly(!starredOnly)}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${
                  starredOnly 
                    ? 'text-orange-500' 
                    : isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Star size={10} className={starredOnly ? 'fill-orange-500 text-orange-500' : ''} /> Bookmarked
              </button>
              <button
                onClick={() => setRecentlyChangedOnly(!recentlyChangedOnly)}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${
                  recentlyChangedOnly 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Clock size={10} /> Edited Only
              </button>
            </div>

            {/* Horizontal Categories selector on Mobile */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none scroll-smooth">
              {SETTING_CATEGORIES.map(cat => {
                const CatIcon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] whitespace-nowrap transition-all shrink-0 border ${
                      isActive 
                        ? 'bg-indigo-600 border-indigo-500 text-white font-extrabold shadow-md' 
                        : isDarkMode
                          ? 'bg-black/30 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CatIcon size={12} className={isActive ? 'text-white' : 'text-indigo-500'} />
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Categories List */}
            <nav id="settings-categories-nav" className="hidden lg:block space-y-1 max-h-[350px] overflow-y-auto pr-1">
              {SETTING_CATEGORIES.map(cat => {
                const CatIcon = cat.icon;
                const isActive = activeCategory === cat.id;
                
                // Get count of settings in this category
                const count = searchableSettings.filter(s => s.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group border ${
                      isActive 
                        ? 'bg-indigo-600 border-indigo-500 text-white font-extrabold shadow-md' 
                        : isDarkMode
                          ? 'border-transparent hover:bg-white/5 text-slate-400 hover:text-white'
                          : 'border-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500' : isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                        <CatIcon size={12} className={isActive ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'} />
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] leading-tight font-black">{cat.title}</p>
                        <p className={`text-[8px] truncate ${isActive ? 'text-indigo-100' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{cat.description}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-indigo-500 text-white' 
                        : isDarkMode ? 'bg-black/30 text-slate-500' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Recently Accessed Memory List */}
          {settingsHistory.length > 0 && (
            <div className={`rounded-2xl p-4 space-y-2.5 border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Recently Visited Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {settingsHistory.map(histId => {
                  const cat = SETTING_CATEGORIES.find(c => c.id === histId);
                  if (!cat) return null;
                  return (
                    <button
                      key={histId}
                      onClick={() => setActiveCategory(histId)}
                      className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold transition-all ${
                        isDarkMode
                          ? 'bg-white/5 border-white/5 text-slate-300 hover:text-white hover:border-indigo-500/40'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-indigo-500/40'
                      }`}
                    >
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Backup & Recovery Hub */}
          <div className={`rounded-2xl p-4 space-y-4 border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
                <ShieldAlert size={12} /> Backup & State Recovery
              </span>
              <button
                onClick={handleCreateBackup}
                className={`p-1 text-[9px] font-black uppercase transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                + New Backup
              </button>
            </div>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {backups.map(bk => (
                <div key={bk.id} className={`p-2.5 border rounded-xl flex items-center justify-between gap-2 ${
                  isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="min-w-0">
                    <p className={`font-extrabold text-[10px] truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{bk.name}</p>
                    <span className="text-[8px] text-slate-500 font-mono block">{bk.date} • {bk.size}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleRestoreBackup(bk)}
                      className="px-1.5 py-0.5 bg-indigo-600/20 text-indigo-400 dark:text-indigo-300 text-[8px] font-black uppercase rounded hover:bg-indigo-600 hover:text-white"
                      title="Restore settings"
                    >
                      Restore
                    </button>
                    <button
                      onClick={(e) => handleDeleteBackup(bk.id, e)}
                      className="p-1 bg-rose-600/10 text-rose-400 rounded hover:bg-rose-600 hover:text-white"
                      title="Delete Backup"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <button
                onClick={handleExportJSON}
                className={`py-1.5 border hover:bg-white/10 text-[9px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Download size={10} /> Export JSON
              </button>
              
              <label className={`py-1.5 border hover:bg-white/10 text-[9px] font-black uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}>
                <Upload size={10} /> Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Settings Controls Area */}
        <div id="settings-right-panel" className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Controls Card */}
          <div className={`rounded-2xl p-6 flex flex-col gap-6 border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            
            {/* Active Category Title */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div>
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-indigo-400">
                  Settings Category View
                </span>
                <h3 className={`text-sm font-black uppercase mt-0.5 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {searchQuery ? `Search Results for "${searchQuery}"` : SETTING_CATEGORIES.find(c => c.id === activeCategory)?.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {searchQuery ? `Displaying ${filteredSettings.length} matched settings across all active directories.` : SETTING_CATEGORIES.find(c => c.id === activeCategory)?.description}
                </p>
              </div>

              {/* Developer mode quick action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setJsonText(JSON.stringify(settings, null, 2));
                    setShowJsonEditor(!showJsonEditor);
                  }}
                  className={`px-2.5 py-1 border text-[9px] font-bold uppercase rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-950'
                  }`}
                >
                  {showJsonEditor ? 'Exit Code Editor' : 'Advanced JSON Editor'}
                </button>
              </div>
            </div>

            {/* Advanced JSON Editor Inline View */}
            {showJsonEditor ? (
              <div id="settings-json-editor-view" className="space-y-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[10px] rounded-xl flex items-start gap-2">
                  <Info size={14} className="text-orange-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Advanced JSON Configuration:</strong> Directly modify the settings key-value pair map. Ensure strictly valid formatting before committing the database transaction.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={jsonText}
                    onChange={e => { setJsonText(e.target.value); setJsonError(null); }}
                    className={`w-full h-80 font-mono text-[10px] p-4 rounded-xl border focus:outline-none focus:border-indigo-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-black/80 text-emerald-400 border-white/10' 
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                    placeholder="{ ...settings }"
                  />
                  {jsonError && (
                    <div className="absolute bottom-4 left-4 right-4 p-2 bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-[9px] rounded-lg">
                      {jsonError}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowJsonEditor(false)}
                    className={`px-4 py-1.5 border rounded-xl text-[10px] font-bold uppercase transition-all ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' 
                        : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-950'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyJsonEditor}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase text-white"
                  >
                    Commit Settings Map
                  </button>
                </div>
              </div>
            ) : (
              /* Regular UI Controls */
              <div id="settings-controls-grid" className="space-y-5">
                {activeCategory === 'profile' && !searchQuery && (
                  <div className={`p-6 border rounded-2xl space-y-6 ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                      <div>
                        <h4 className={`font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                          <User size={14} className="text-orange-500" /> Professional Identity Seals
                        </h4>
                        <p className="text-[9px] text-slate-500 mt-0.5">Securely write biometric and candidate image credentials into the D1 ledger.</p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20 font-bold uppercase tracking-wider">
                        Active Verification
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* Avatar preview block */}
                      <div className="relative group shrink-0">
                        <div className={`w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center relative bg-gradient-to-br ${isDarkMode ? 'from-indigo-950 to-slate-900' : 'from-indigo-50 to-slate-100'}`}>
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile Photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                              {currentUser?.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'DS'}
                            </span>
                          )}
                          
                          {/* Upload Loading Overlay */}
                          {isUploadingPhoto && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <RefreshCw size={18} className="text-orange-500 animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Interactive edit badge */}
                        <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border border-slate-900 cursor-pointer shadow-lg transition-all hover:scale-110 flex items-center justify-center">
                          <Upload size={12} />
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      </div>

                      {/* Info & preset selection */}
                      <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="space-y-1">
                          <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser?.fullName || 'Full Name'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{currentUser?.email || 'email@domain.com'}</p>
                          <p className="text-[9px] text-slate-500">
                            Support PNG, JPG or GIF. Max size 2MB. Your avatar updates automatically on all panels.
                          </p>
                        </div>

                        {/* Preset instant buttons */}
                        <div className="space-y-2">
                          <p className={`text-[9px] font-black uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Or Select a Specialized Cyber Preset</p>
                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {[
                              { id: 'indigo', name: 'Cyber Indigo', gradient: 'from-indigo-600 to-blue-500' },
                              { id: 'emerald', name: 'Security Emerald', gradient: 'from-emerald-600 to-teal-500' },
                              { id: 'orange', name: 'Cosmic Amber', gradient: 'from-orange-600 to-amber-500' },
                              { id: 'fuchsia', name: 'Neon Fuchsia', gradient: 'from-fuchsia-600 to-rose-500' }
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => applyPresetAvatar(preset.gradient)}
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isDarkMode 
                                    ? 'bg-slate-800 hover:bg-indigo-950/40 border-white/5 text-slate-300 hover:text-white' 
                                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${preset.gradient}`} />
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Status indicators */}
                        {photoError && (
                          <p className="text-[10px] font-semibold text-rose-400 animate-pulse">{photoError}</p>
                        )}
                        {photoSuccess && (
                          <p className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 justify-center md:justify-start">
                            <CheckCircle2 size={12} /> Profile credentials synchronized with D1 ledger!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {filteredSettings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <AlertCircle className="mx-auto text-orange-400" size={24} />
                    <p className="text-[11px] font-bold uppercase">No settings match your active filters.</p>
                    <p className="text-[10px]">Try clearing search parameters or disabling active custom filters.</p>
                  </div>
                ) : (
                  filteredSettings.map(item => {
                    const value = settings[item.key];
                    const isBookmarked = bookmarkedSettings.includes(item.key);

                    return (
                      <div
                        key={item.key}
                        className={`p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isDarkMode 
                            ? 'bg-black/20 border-white/5 hover:border-indigo-500/10' 
                            : 'bg-slate-50/50 border-slate-200 hover:border-indigo-500/30 hover:bg-slate-50'
                        }`}
                      >
                        {/* Title & Help block */}
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-extrabold text-[12px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                              {item.label}
                            </span>
                            
                            {/* Bookmark Toggle */}
                            <button
                              onClick={(e) => toggleBookmark(item.key, e)}
                              className="text-slate-500 hover:text-orange-400 transition-colors"
                              title="Pin this setting"
                            >
                              <Star size={11} className={isBookmarked ? 'fill-orange-400 text-orange-400' : ''} />
                            </button>

                            {/* Sensitivity Shield Badge */}
                            {(item.key === 'email' || item.key === 'phone' || item.key === 'apiKey' || item.key === 'customUrl') && (
                              <span className="text-[7px] font-mono px-1 bg-rose-500/10 border border-rose-500/25 text-rose-400 uppercase rounded">
                                Sensitive
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-[10px] leading-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.help}
                          </p>
                          
                          <span className="text-[8px] font-mono text-indigo-400 dark:text-indigo-300 uppercase tracking-wider block">
                            Key: settings.{item.key}
                          </span>
                        </div>

                        {/* Interactive UI Element Controls */}
                        <div className="w-full md:w-auto md:shrink-0 md:min-w-[160px] flex justify-start md:justify-end items-center">
                          
                          {/* Toggle switches */}
                          {item.type === 'toggle' && (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!value}
                                onChange={e => {
                                  const isSensitive = item.key === 'email' || item.key === 'phone' || item.key === 'apiKey';
                                  updateSetting(item.key, e.target.checked, isSensitive);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                              <span className={`ml-2 text-[10px] font-mono font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {value ? 'ON' : 'OFF'}
                              </span>
                            </label>
                          )}

                          {/* Dropdowns */}
                          {item.type === 'select' && item.options && (
                            <select
                              value={value}
                              onChange={e => updateSetting(item.key, e.target.value)}
                              className={`border text-[11px] font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 w-full md:w-auto ${
                                isDarkMode ? 'bg-black/40 border-white/10 text-indigo-300' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            >
                              {item.options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt.toUpperCase().replace('-', ' ')}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Sliders */}
                          {item.type === 'slider' && (
                            <div className="flex items-center gap-3 w-full">
                              <input
                                type="range"
                                min={item.min || 1}
                                max={item.max || 10}
                                value={value}
                                onChange={e => updateSetting(item.key, parseInt(e.target.value))}
                                className="w-24 h-1 rounded-lg appearance-none cursor-pointer accent-indigo-500 bg-slate-200 dark:bg-slate-800"
                              />
                              <span className="text-[11px] font-mono font-black text-indigo-500 dark:text-indigo-400">
                                {value} yrs
                              </span>
                            </div>
                          )}

                          {/* Numeric fields */}
                          {item.type === 'number' && (
                            <input
                              type="number"
                              value={value}
                              onChange={e => updateSetting(item.key, e.target.value)}
                              className={`w-20 px-2 py-1 border rounded-xl text-[11px] font-mono focus:outline-none focus:border-indigo-500 ${
                                isDarkMode ? 'bg-black/40 border-white/10 text-indigo-300' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                          )}

                          {/* Text input fields */}
                          {item.type === 'text' && (
                            <div className="flex gap-1 w-full md:w-auto">
                              <input
                                type="text"
                                value={value}
                                onChange={e => updateSetting(item.key, e.target.value)}
                                disabled={item.readonly}
                                className={`w-full md:w-44 px-2.5 py-1.5 border rounded-xl text-[11px] focus:outline-none focus:border-indigo-500 ${
                                  isDarkMode ? 'bg-black/40 border-white/10 text-indigo-200' : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              />
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Revert Reset Panel */}
            <div className={`border-t pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-orange-400 shrink-0" />
                <span className="text-[10px] text-slate-400">
                  Resetting all settings is permanent. This wipes localized backups from this profile container.
                </span>
              </div>
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white text-[10px] font-black uppercase text-rose-400 rounded-xl transition-all cursor-pointer"
              >
                Reset 12 Categories to Defaults
              </button>
            </div>

          </div>

          {/* Settings Audit Log Viewer */}
          <div className={`border rounded-2xl p-6 space-y-4 ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div>
                <h4 className={`font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  <Activity size={14} className="text-indigo-400" /> Complete Security Audit Log
                </h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Continuous tracking of all profile configurations on the active session</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 font-bold uppercase tracking-wider">
                Immutable Trace
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className={`p-2 border rounded-xl font-mono text-[9px] flex flex-col md:flex-row justify-between gap-2 ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="space-y-0.5">
                    <p className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                      Updated setting <span className="text-orange-500 font-bold">{log.key}</span>
                    </p>
                    <p className="text-slate-500">
                      Value: <span className="text-rose-400 strike-through line-through">{log.oldValue}</span> <ChevronRight size={10} className="inline" /> <span className="text-emerald-500">{log.newValue}</span>
                    </p>
                  </div>
                  <div className="text-left md:text-right shrink-0">
                    <span className="text-indigo-550 dark:text-indigo-400 font-bold block">{log.timestamp}</span>
                    <span className="text-slate-500 text-[8px] block">{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* PASSWORD CONFIRMATION MODAL FOR SENSITIVE CONFIGURATION */}
      <AnimatePresence>
        {isConfirmPasswordOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <div className="flex items-center gap-2.5 text-orange-400">
                <Lock size={20} className="animate-pulse" />
                <h4 className={`font-black text-sm uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Sensitive Operation Approval</h4>
              </div>
              
              <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                You are editing a highly critical configuration parameter (<strong>{pendingSensitiveChange?.key}</strong>). Please authorize this change using your security key or passkey credentials.
              </p>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 block">
                  Verify Passcode (Enter 'admin' or any passcode for demo)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter passcode..."
                  className={`w-full px-3 py-2 border rounded-xl text-[11px] focus:outline-none focus:border-indigo-500 ${
                    isDarkMode ? 'bg-black/40 border-white/10 text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-850'
                  }`}
                />
                {passwordError && (
                  <p className="text-[9px] font-bold text-rose-400">{passwordError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsConfirmPasswordOpen(false);
                    setPasswordInput('');
                    setPasswordError(null);
                    setPendingSensitiveChange(null);
                  }}
                  className={`px-3.5 py-1.5 border rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSensitiveConfirm}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-black uppercase text-white"
                >
                  Authorize Change
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
