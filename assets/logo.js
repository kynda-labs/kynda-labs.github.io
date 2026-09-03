/* Kynda Labs particle logo — the approved animation, unchanged.
   Motion constants, density, easing, wander, monochrome, reduced-motion,
   Retina scaling and hidden-tab pausing are exactly as in the preview.
   One integration change: rebuilds are keyed on canvas WIDTH only, so a
   mobile address bar showing/hiding (which changes viewport height) does
   not re-scatter the particles. In the preview the container height was
   fixed, so this preserves its effective behavior. */
(() => {
  const canvas = document.getElementById('ks-logo');
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [];
  let raf = 0;
  let last = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let builtWidth = -1;

  function seededNoise(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function build() {
    cancelAnimationFrame(raf);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = rect.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const mask = document.createElement('canvas');
    const m = mask.getContext('2d');
    mask.width = Math.round(width);
    mask.height = Math.round(height);
    const compact = width < 560;
    const text = compact ? 'KYNDΛ' : 'KYNDΛ LABS';
    const size = Math.min(compact ? width * .245 : width * .122, compact ? 88 : 112);
    m.fillStyle = '#000';
    m.textAlign = 'center';
    m.textBaseline = 'middle';
    m.font = `500 ${size}px Arial, Helvetica, sans-serif`;
    m.fillText(text, width / 2, height / 2);
    const pixels = m.getImageData(0, 0, mask.width, mask.height).data;
    const step = compact ? 3 : 3;
    const homes = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] > 90) homes.push([x, y]);
      }
    }
    const max = compact ? 3100 : 5200;
    const stride = Math.max(1, Math.ceil(homes.length / max));
    particles = homes.filter((_, i) => i % stride === 0).map((home, i) => {
      const a = seededNoise(i + 9) * Math.PI * 2;
      const far = seededNoise(i + 29) < .055;
      const spread = far ? 22 + seededNoise(i + 31) * 48 : 1 + seededNoise(i + 37) * 6;
      return {
        x: home[0] + Math.cos(a) * spread,
        y: home[1] + Math.sin(a) * spread,
        hx: home[0], hy: home[1],
        phase: seededNoise(i + 53) * Math.PI * 2,
        phase2: seededNoise(i + 71) * Math.PI * 2,
        radius: .42 + seededNoise(i + 89) * .78,
        alpha: .22 + seededNoise(i + 97) * .62,
        wander: far ? 7 + seededNoise(i + 101) * 10 : .7 + seededNoise(i + 103) * 2.4,
        speed: .22 + seededNoise(i + 107) * .48
      };
    });
    draw(0);
    if (!reduced) raf = requestAnimationFrame(loop);
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const breath = Math.sin(t * .00032 * p.speed + p.phase);
      const sway = Math.cos(t * .00025 * p.speed + p.phase2);
      const tx = p.hx + breath * p.wander + Math.sin(t * .00011 + p.phase2) * p.wander * .45;
      const ty = p.hy + sway * p.wander * .62 + Math.cos(t * .00014 + p.phase) * p.wander * .33;
      p.x += (tx - p.x) * .028;
      p.y += (ty - p.y) * .028;
      const shimmer = .78 + .22 * Math.sin(t * .0011 + p.phase * 2);
      ctx.globalAlpha = p.alpha * shimmer;
      ctx.fillStyle = '#0d0d0d';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (t - last > 33) {
      draw(t);
      last = t;
    }
    raf = requestAnimationFrame(loop);
  }

  const observer = new ResizeObserver(() => {
    const w = Math.round(canvas.getBoundingClientRect().width);
    if (w === builtWidth) return;
    builtWidth = w;
    build();
  });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
  });
})();
