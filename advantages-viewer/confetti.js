(() => {
  const phone = document.querySelector('#app');
  const canvas = document.createElement('canvas');
  canvas.className = 'confettiCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  phone.append(canvas);
  const title = document.createElement('div');
  title.className = 'confettiTitle';
  title.innerHTML = '<span class="confettiTitleSource">Опубликовали\nобъявление!</span>';
  phone.append(title);
  const context = canvas.getContext('2d');
  const colors = ['#ff487d', '#ffcf24', '#20ccf6', '#9d59ff', '#74ef31'];
  let animation;
  function play() {
    cancelAnimationFrame(animation);
    title.getAnimations({ subtree: true }).forEach(effect => effect.cancel());
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      title.animate([{ opacity: 1 }], { duration: 0, fill: 'forwards' });
      return;
    }
    title.animate([
      { opacity: 0, transform: 'scale(.02) rotate(-12deg)' },
      { opacity: 1, transform: 'scale(1.04) rotate(3deg)', offset: .8 },
      { opacity: 1, transform: 'scale(1) rotate(-2deg)' }
    ], { duration: 340, delay: 850, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    const width = phone.clientWidth;
    const height = phone.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const particles = Array.from({ length: 100 }, (_, index) => {
      const side = index % 2;
      return {
        x: side ? width + 8 : -8, y: height * .8,
        vx: (side ? -1 : 1) * (75 + Math.random() * 210),
        vy: -(height * .95 + Math.random() * height * .3),
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - .5) * 9,
        flip: Math.random() * 6,
        size: 6 + Math.random() * 7,
        color: colors[index % colors.length],
        delay: Math.random() * .14
      };
    });
    let previous;
    let elapsed = 0;
    function frame(timestamp) {
      const dt = previous === undefined ? 0 : Math.min((timestamp - previous) / 1000, .035);
      previous = timestamp;
      elapsed += dt;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        if (elapsed < particle.delay) continue;
        particle.vx *= Math.exp(-1.4 * dt);
        particle.vy += (height * .68 - particle.vy * .75) * dt;
        particle.x += (particle.vx + Math.sin(elapsed * 3 + particle.flip) * 12) * dt;
        particle.y += particle.vy * dt;
        particle.angle += particle.spin * dt;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.angle);
        context.scale(1, Math.max(.12, Math.abs(Math.cos(elapsed * 7 + particle.flip))));
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * .65);
        context.restore();
      }
      if (elapsed < 5.5) animation = requestAnimationFrame(frame);
      else context.clearRect(0, 0, width, height);
    }
    animation = requestAnimationFrame(frame);
  }
  document.addEventListener('promo:confetti', play);
  document.addEventListener('promo:confetti-stop', () => {
    cancelAnimationFrame(animation);
    context.clearRect(0, 0, canvas.width, canvas.height);
    title.getAnimations({ subtree: true }).forEach(effect => effect.cancel());
  });
})();
