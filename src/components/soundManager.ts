/**
 * soundManager.ts
 * Synthesizes high-fidelity ambient notification chimes using the native Web Audio API.
 * This completely avoids issues with broken file paths, CORS, or buffering latency.
 */

export function playNotificationSound(type: string = 'info') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // Resume context if suspended (browser security blocks autoplay)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'success') {
      // Elegant ascending C-major triad (glass bell ripple)
      const playBell = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        // Soft attack, rapid decay for glass quality
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      playBell(523.25, ctx.currentTime, 0.4);       // C5
      playBell(659.25, ctx.currentTime + 0.08, 0.4); // E5
      playBell(783.99, ctx.currentTime + 0.16, 0.5); // G5
      return;
    } 
    
    if (type === 'error') {
      // Low bass alert (neutral, clean)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180.00, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      return;
    } 
    
    if (type === 'warning') {
      // Double warning warning tones (middle-G double tap)
      const playBeep = (start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.00, start);
        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.12);
      };
      playBeep(ctx.currentTime);
      playBeep(ctx.currentTime + 0.15);
      return;
    } 
    
    if (type === 'application' || type === 'achievement') {
      // Dreamy, optimistic fifth chord
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);      // D5
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.06); // A5
      
      gain1.gain.setValueAtTime(0.05, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      gain2.gain.setValueAtTime(0.05, ctx.currentTime + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      
      osc1.start(); osc1.stop(ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.06); osc2.stop(ctx.currentTime + 0.5);
      return;
    }

    // Default: Soft warm bubble chime for general info
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn("Sound playback skipped (standard browser block on un-interacted tabs):", err);
  }
}
