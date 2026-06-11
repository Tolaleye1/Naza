/* ================================================================
   DEVICE TIER SYSTEM — Advanced hardware detection
   Must be loaded FIRST (synchronously) before any engine
   ================================================================ */

'use strict';

window.DeviceTier = (function() {

  function detect() {
    var ua      = navigator.userAgent;
    var mobile  = /Mobi|Android|iPhone|iPad/i.test(ua);
    var cores   = navigator.hardwareConcurrency || 2;
    var mem     = navigator.deviceMemory || 4;
    var touch   = navigator.maxTouchPoints > 1;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return 'low';
    if (mobile || cores <= 2 || mem <= 2) return 'low';
    if (touch  || cores <= 4 || mem <= 4) return 'mid';
    return 'high';
  }

  var tier = detect();

  document.documentElement.classList.add('tier-' + tier);

  return { tier: tier };
})();
