/* ================================================================
   DEVICE TIER SYSTEM — Advanced hardware detection
   Must be loaded FIRST (synchronously) before any engine
   ================================================================ */

'use strict';

window.DeviceTier = (function() {

  function detect() {
    var ua      = typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string' ? navigator.userAgent : '';
    var mobile  = /Mobi|Android|iPhone|iPad/i.test(ua);
    var cores   = typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 2;
    var mem     = typeof navigator !== 'undefined' && typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : 4;
    var touch   = typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number' ? navigator.maxTouchPoints > 1 : false;

    var prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    if (prefersReducedMotion) return 'low';
    if (mobile || cores <= 2 || mem <= 2) return 'low';
    if (touch && cores <= 4 && mem <= 4) return 'mid';
    return 'high';
  }

  var tier = detect();

  document.documentElement.classList.add('tier-' + tier);

  return { tier: tier };
})();
