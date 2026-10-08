(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");

  if (nav && toggle) {
    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  const revealTargets = document.querySelectorAll(
    ".section-head, .service-panel, .studio-copy, .studio-card, .code-row, .contact-intro, .contact-tile, .contact-form"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!name || !email || !message) {
        status.textContent = "Please complete all fields before sending.";
        return;
      }

      const subject = encodeURIComponent(`Project enquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      );

      status.textContent = "Opening your email client…";
      window.location.href = `mailto:info@hub-class.com?subject=${subject}&body=${body}`;
      form.reset();
    });
  }

  const canvas = document.getElementById("water-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let animationId = 0;
  let pointerX = 0.5;
  let pointerY = 0.45;

  const waves = [
    { amplitude: 18, wavelength: 0.008, speed: 0.018, opacity: 0.1, yFactor: 0.62 },
    { amplitude: 28, wavelength: 0.0055, speed: 0.012, opacity: 0.14, yFactor: 0.7 },
    { amplitude: 40, wavelength: 0.0038, speed: 0.008, opacity: 0.18, yFactor: 0.78 },
  ];

  const ripples = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const addRipple = (x, y) => {
    ripples.push({
      x,
      y,
      radius: 8,
      max: 180 + Math.random() * 80,
      alpha: 0.35,
    });
    if (ripples.length > 8) ripples.shift();
  };

  const drawBackground = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#02080f");
    gradient.addColorStop(0.45, "#041421");
    gradient.addColorStop(1, "#031018");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
      width * pointerX,
      height * pointerY,
      0,
      width * pointerX,
      height * pointerY,
      Math.max(width, height) * 0.45
    );
    glow.addColorStop(0, "rgba(56, 189, 248, 0.16)");
    glow.addColorStop(0.45, "rgba(45, 212, 191, 0.07)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  };

  const drawWave = (wave, index) => {
    const baseY = height * wave.yFactor;
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x <= width; x += 8) {
      const sway =
        Math.sin(x * wave.wavelength + frame * wave.speed + index) * wave.amplitude +
        Math.sin(x * wave.wavelength * 0.45 - frame * wave.speed * 0.7) * (wave.amplitude * 0.35);
      const y = baseY + sway;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    const fill = ctx.createLinearGradient(0, baseY - 80, 0, height);
    fill.addColorStop(0, `rgba(56, 189, 248, ${wave.opacity})`);
    fill.addColorStop(0.5, `rgba(20, 184, 166, ${wave.opacity * 0.7})`);
    fill.addColorStop(1, "rgba(2, 8, 15, 0.9)");
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const drawRipples = () => {
    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      const ripple = ripples[i];
      ripple.radius += 2.4;
      ripple.alpha *= 0.97;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(94, 234, 212, ${ripple.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${ripple.alpha * 0.55})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (ripple.radius > ripple.max || ripple.alpha < 0.02) {
        ripples.splice(i, 1);
      }
    }
  };

  const drawCaustics = () => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i += 1) {
      const x = ((Math.sin(frame * 0.004 + i * 1.7) + 1) / 2) * width;
      const y = height * (0.55 + i * 0.06) + Math.cos(frame * 0.01 + i) * 18;
      const radius = 40 + i * 18;
      const blob = ctx.createRadialGradient(x, y, 0, x, y, radius);
      blob.addColorStop(0, "rgba(94, 234, 212, 0.05)");
      blob.addColorStop(1, "transparent");
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const render = () => {
    frame += 1;
    drawBackground();
    drawCaustics();
    waves.forEach(drawWave);
    drawRipples();
    animationId = window.requestAnimationFrame(render);
  };

  window.addEventListener("resize", resize, { passive: true });

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX / Math.max(width, 1);
      pointerY = event.clientY / Math.max(height, 1);
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    (event) => {
      addRipple(event.clientX, event.clientY);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationId);
    } else {
      animationId = window.requestAnimationFrame(render);
    }
  });

  resize();
  render();
})();
