// DS TECH & DIGITAL MARKETING AGENCY LIMITED
// Enterprise Deployment Version Freshness & Auto-Reload Orchestrator

export interface DeploymentVersionInfo {
  version: string;
  buildId: string;
  buildTime: number;
  deployedAt: string;
}

// Global build identifier baked into the client bundle at build time
export const CLIENT_BUILD_ID: string = 
  typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dstech_runtime_fresh';

export const CLIENT_BUILD_TIME: number = 
  typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : Date.now();

const SESSION_RELOADED_KEY = 'dstech_last_reloaded_build_id';
const LAST_CHECK_KEY = 'dstech_last_version_check_time';

/**
 * Checks if the user is currently actively interacting with a form,
 * writing a statement/signature, or completing a financial checkout.
 * Used to ensure we NEVER reload a tab if doing so would lose user input!
 */
export function isUserBusyWithFormOrTransaction(): boolean {
  if (typeof document === 'undefined') return false;

  // 1. Check if user is focused inside an input, textarea, or select
  const activeEl = document.activeElement;
  if (activeEl) {
    const tagName = activeEl.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return true;
    }
    if (activeEl.getAttribute('contenteditable') === 'true') {
      return true;
    }
  }

  // 2. Check for active signature pad or drawing canvas
  const signatureCanvases = document.querySelectorAll('canvas');
  if (signatureCanvases.length > 0) {
    for (const canvas of Array.from(signatureCanvases)) {
      if (canvas.classList.contains('signature-pad') || canvas.closest('[data-signature-pad="true"]')) {
        return true;
      }
    }
  }

  // 3. Check for active payment modal or checkout process
  const activePaymentModal = document.querySelector('[data-payment-modal="true"], .paystack-modal-open');
  if (activePaymentModal) {
    return true;
  }

  // 4. Check if any form has dirty input (value > 0)
  const forms = document.querySelectorAll('form');
  for (const form of Array.from(forms)) {
    const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea');
    for (const input of Array.from(inputs)) {
      const el = input as HTMLInputElement | HTMLTextAreaElement;
      if (el.value && el.value.trim().length > 3) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Fetch the latest deployment descriptor directly from the server,
 * strictly bypassing any browser or intermediary caches.
 */
export async function fetchServerDeploymentVersion(): Promise<DeploymentVersionInfo | null> {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/version.json?_t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Fallback to /api/version if /version.json is unavailable
      const apiRes = await fetch(`/api/version?_t=${timestamp}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        cache: 'no-store'
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
      return null;
    }

    const data: DeploymentVersionInfo = await response.json();
    return data;
  } catch (err) {
    console.warn('[VersionFreshness] Server version check failed (likely offline):', err);
    return null;
  }
}

/**
 * Perform a complete deployment freshness audit.
 * Returns true if a newer deployment was detected.
 */
export async function checkDeploymentVersion(): Promise<{
  hasNewVersion: boolean;
  serverVersion?: DeploymentVersionInfo;
  isSafeToReload: boolean;
}> {
  const serverVersion = await fetchServerDeploymentVersion();
  if (!serverVersion || !serverVersion.buildId) {
    return { hasNewVersion: false, isSafeToReload: false };
  }

  // Record timestamp of this check
  try {
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
  } catch (e) {}

  // Compare build identifiers
  const hasNewVersion = serverVersion.buildId !== CLIENT_BUILD_ID;

  if (!hasNewVersion) {
    return { hasNewVersion: false, serverVersion, isSafeToReload: false };
  }

  console.log(`[VersionFreshness] 🚀 New deployment detected! Running: ${CLIENT_BUILD_ID} -> Latest: ${serverVersion.buildId}`);

  // Check if we already reloaded for this specific build to prevent infinite loops
  let alreadyReloadedForThisBuild = false;
  try {
    alreadyReloadedForThisBuild = sessionStorage.getItem(SESSION_RELOADED_KEY) === serverVersion.buildId;
  } catch (e) {}

  if (alreadyReloadedForThisBuild) {
    console.log('[VersionFreshness] Loop guard: Already reloaded once for this build in this tab session.');
    return { hasNewVersion: true, serverVersion, isSafeToReload: false };
  }

  // Check if the user is safe to reload right now
  const userIsBusy = isUserBusyWithFormOrTransaction();
  const isSafeToReload = !userIsBusy && !alreadyReloadedForThisBuild;

  return {
    hasNewVersion: true,
    serverVersion,
    isSafeToReload,
  };
}

/**
 * Execute a safe reload to the latest version.
 * Activates any waiting service worker and reloads the browser tab.
 */
export async function applyDeploymentUpdate(newBuildId?: string): Promise<void> {
  const targetBuildId = newBuildId || 'latest';
  
  try {
    sessionStorage.setItem(SESSION_RELOADED_KEY, targetBuildId);
  } catch (e) {}

  // 1. Tell Service Worker to activate immediately and clear old caches
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.waiting) {
          reg.waiting.postMessage('SKIP_WAITING');
        }
        if (reg.active) {
          reg.active.postMessage({ type: 'CLEAR_ALL_CACHES' });
        }
        // Force update check
        await reg.update().catch(() => {});
      }
    } catch (swErr) {
      console.warn('[VersionFreshness] Service worker update dispatch notice:', swErr);
    }
  }

  // 2. Perform fresh hard navigation reload
  console.log('[VersionFreshness] Seamlessly reloading to latest production version...');
  window.location.reload();
}

/**
 * Initialize global automatic version monitoring.
 * Monitors tab focus, visibility change, connectivity restoration, and periodic heartbeat.
 */
export function initDeploymentFreshnessMonitoring(
  onUpdateAvailable?: (version: DeploymentVersionInfo) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let isChecking = false;

  const runCheck = async () => {
    if (isChecking) return;
    isChecking = true;
    try {
      const result = await checkDeploymentVersion();
      if (result.hasNewVersion && result.serverVersion) {
        if (result.isSafeToReload) {
          console.log('[VersionFreshness] User is idle. Applying new production version automatically...');
          await applyDeploymentUpdate(result.serverVersion.buildId);
        } else {
          console.log('[VersionFreshness] User has active form input or transaction. Showing update toast...');
          if (onUpdateAvailable) {
            onUpdateAvailable(result.serverVersion);
          }
          window.dispatchEvent(
            new CustomEvent('dstech-update-available', {
              detail: result.serverVersion,
            })
          );
        }
      }
    } finally {
      isChecking = false;
    }
  };

  // 1. Initial check after 3 seconds of settling
  const initialTimer = setTimeout(runCheck, 3000);

  // 2. Periodic background check every 2.5 minutes
  const intervalId = setInterval(runCheck, 150000);

  // 3. Tab focus & visibility change (e.g. user returns from another tab or unlocks device)
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      runCheck();
    }
  };
  const handleFocus = () => runCheck();
  const handleOnline = () => {
    console.log('[VersionFreshness] Network reconnected. Checking deployment freshness...');
    setTimeout(runCheck, 1000);
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('online', handleOnline);

  // Return teardown function
  return () => {
    clearTimeout(initialTimer);
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('online', handleOnline);
  };
}
