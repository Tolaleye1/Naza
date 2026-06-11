window.initMainSite = function() {
  const petals = document.getElementById('falling-petals');
  if (!petals) return;
  const symbols = ['🌸','🌺','🌷','🌼','🌹','🪷'];
  function spawnPetal() {
    const p = document.createElement('div');
    p.className = 'falling-petal';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.cssText = `left:${Math.random()*100}%;font-size:${Math.random()*0.8+0.8}rem;animation-duration:${Math.random()*6+6}s;animation-delay:${Math.random()*4}s;`;
    petals.appendChild(p);
    setTimeout(() => p.remove(), 14000);
  }
  setInterval(spawnPetal, 600);
  spawnPetal();

  // Reveal cards on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal-card').forEach(el => observer.observe(el));

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar-root');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 20);
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initMainSite?.());
} else {
  window.initMainSite();
}
