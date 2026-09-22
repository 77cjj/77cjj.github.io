(() => {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.note-card[data-category]')];
  const empty = document.querySelector('.empty-message');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter;
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      let visible = 0;
      for (const card of cards) {
        card.hidden = selected !== '全部' && card.dataset.category !== selected;
        if (!card.hidden) visible += 1;
      }
      if (empty) empty.hidden = visible !== 0;
    });
  }

  const canvas = document.getElementById('signal-field');
  const host = canvas?.parentElement;
  if (!canvas || !host) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastDraw = 0;
  let visible = true;
  const pointer = { x: -1000, y: -1000 };

  function resize() {
    const box = host.getBoundingClientRect();
    width = box.width;
    height = box.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(0);
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    const gap = width < 450 ? 22 : 25;
    const columns = Math.ceil(width / gap);
    const rows = Math.ceil(height / gap);
    const centerX = width * 0.51;
    const centerY = height * 0.51;
    for (let row = 0; row <= rows; row += 1) {
      for (let column = 0; column <= columns; column += 1) {
        const x = column * gap + (width % gap) / 2;
        const y = row * gap + (height % gap) / 2;
        const radial = Math.hypot(x - centerX, y - centerY);
        const nearPointer = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / 135);
        const wave = reducedMotion.matches ? 0 : Math.sin(radial * 0.028 - time * 0.0007) * 0.08;
        const alpha = Math.min(0.86, 0.22 + Math.max(0, 1 - radial / (width * 0.7)) * 0.25 + nearPointer * 0.46 + wave);
        const radius = 1.1 + nearPointer * 1.7 + Math.max(0, 1 - radial / 220) * 0.45;
        context.beginPath();
        context.fillStyle = `rgba(239,242,234,${Math.max(0.08, alpha)})`;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function animate(time) {
    if (!visible || reducedMotion.matches || document.hidden) return;
    if (time - lastDraw > 32) {
      draw(time);
      lastDraw = time;
    }
    frame = requestAnimationFrame(animate);
  }
  function restart() {
    cancelAnimationFrame(frame);
    draw(0);
    if (visible && !reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(animate);
  }

  host.addEventListener('pointermove', (event) => {
    const box = host.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    if (reducedMotion.matches) draw(0);
  });
  host.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; if (reducedMotion.matches) draw(0); });
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); }).observe(host);
  reducedMotion.addEventListener('change', restart);
  document.addEventListener('visibilitychange', restart);
  resize();
  restart();
})();
