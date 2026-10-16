import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { CrmSettings } from '../../server/crmStore';

interface CrmSettingsViewProps {
  authToken: string;
}

export const CrmSettingsView: React.FC<CrmSettingsViewProps> = ({ authToken }) => {
  const [settings, setSettings] = useState<CrmSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/crm/settings', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.warn('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [authToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      setSavedSuccess(false);
      const res = await fetch('/api/crm/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs">
        Loading settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 font-mono text-xs max-w-4xl">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase">
              System Settings & Tracking Configuration
            </h2>
            <p className="text-[11px] text-slate-400">
              Manage telemetry parameters, privacy thresholds, session timeout, and excluded routes.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>CRM configuration settings successfully updated and persisted.</span>
        </div>
      )}

      {/* Section 1: General & Ingestion */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        <h3 className="text-xs font-bold uppercase text-white pb-2 border-b border-white/10 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          General Telemetry Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div>
              <span className="font-bold text-white block">Website Tracking Engine</span>
              <span className="text-[10px] text-slate-400">Enable or pause ingestion across public website</span>
            </div>
            <input
              type="checkbox"
              checked={settings.tracking_enabled}
              onChange={(e) => setSettings({ ...settings, tracking_enabled: e.target.checked })}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-white block">Default Timezone</span>
            <input
              type="text"
              value={settings.default_timezone}
              onChange={(e) => setSettings({ ...settings, default_timezone: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-white block">Session Inactivity Timeout (Minutes)</span>
            <input
              type="number"
              min={5}
              max={120}
              value={settings.session_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, session_timeout_minutes: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-white block">Data Retention Period (Days)</span>
            <input
              type="number"
              min={30}
              max={730}
              value={settings.data_retention_days}
              onChange={(e) => setSettings({ ...settings, data_retention_days: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Privacy & Compliance */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        <h3 className="text-xs font-bold uppercase text-white pb-2 border-b border-white/10 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Privacy & Data Minimization (NDPR & GDPR-Friendly)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div>
              <span className="font-bold text-white block">IP Anonymization</span>
              <span className="text-[10px] text-slate-400">Mask client IP addresses; store only city/country metadata</span>
            </div>
            <input
              type="checkbox"
              checked={settings.ip_anonymization}
              onChange={(e) => setSettings({ ...settings, ip_anonymization: e.target.checked })}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div>
              <span className="font-bold text-white block">Strict Consent Gate</span>
              <span className="text-[10px] text-slate-400">Require cookie consent before tracking telemetry</span>
            </div>
            <input
              type="checkbox"
              checked={settings.require_consent}
              onChange={(e) => setSettings({ ...settings, require_consent: e.target.checked })}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Event Instrumentation */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        <h3 className="text-xs font-bold uppercase text-white pb-2 border-b border-white/10 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          Interaction Event Capture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div>
              <span className="font-bold text-white block">Track Form Starts</span>
              <span className="text-[10px] text-slate-400">Log initial field focus</span>
            </div>
            <input
              type="checkbox"
              checked={settings.track_form_starts}
              onChange={(e) => setSettings({ ...settings, track_form_starts: e.target.checked })}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div>
              <span className="font-bold text-white block">Track CTA Buttons</span>
              <span className="text-[10px] text-slate-400">WhatsApp, calls & CTAs</span>
            </div>
            <input
              type="checkbox"
              checked={settings.track_button_clicks}
              onChange={(e) => setSettings({ ...settings, track_button_clicks: e.target.checked })}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div>
              <span className="font-bold text-white block">Outbound Links</span>
              <span className="text-[10px] text-slate-400">Track external clicks</span>
            </div>
            <input
              type="checkbox"
              checked={settings.track_outbound_links}
              onChange={(e) => setSettings({ ...settings, track_outbound_links: e.target.checked })}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
