(function () {
  "use strict";

  // Relationship start: September 19, 2025 at midnight, Calgary (MDT, UTC−6)
  const RELATIONSHIP_START = new Date("2025-09-19T00:00:00-06:00");

  // ═══════════════════════════════════════════════════════════════════
  // CHANGE THIS to your next visit — Calgary time (MDT, UTC−6)
  // Example: July 4, 2026 → "2026-07-04T00:00:00-06:00"
  // ═══════════════════════════════════════════════════════════════════
  const NEXT_MEET_DATE = new Date("2026-08-15T00:00:00-06:00");

  const HEART_COMPLIMENTS = [
    "Your eyes",
    "your eyelashes",
    "your smile",
    "your nose",
    "your cheeks",
    "your toes",
    "your big biceps",
    "your skinny waist",
    "your big butt",
    "your lips",
    "your freckles",
    "your stomach scars",
    "your belly",
    "your hair",
    "your legs",
    "your hands",
    "your glasses",
    "how you hug me",
    "how you kiss me",
    "when you have wavy hair",
    "your kindness for others",
    "how much you love me",
    "how happy you make me",
    "your faith",
    "your strong morals",
    "how safe you make me feel",
    "how understanding you are",
    "your patience",
    "how comfortable you make me feel",
    "you don't ever judge me",
    "your honesty",
    "you bring me closer to God",
    "you make sure my actions are Christ-like",
    "you drive me around",
    "the way you hold my hand",
    "your communication skills",
    "your humility",
    "your love for others",
    "how caring you are",
    "your love for Tipi and other animals",
    "how empathetic you are",
    "you hold me accountable",
    "you hold my hand while I drive",
    "when you tickle me",
    "your giggling",
  ];

  const HEART_SPRITES = [
    "decorations/pinkheart.png",
    "decorations/purpleheart.png",
    "decorations/darkpinkheart.png",
  ];

  const HEART_COUNT = 18;
  const OBSTACLE_PADDING = 28;
  const HEART_SPEED = 0.45;

  const POLAROID_COUNT = 16;
  const POLAROID_IMAGES = Array.from(
    { length: POLAROID_COUNT },
    (_, i) => `images/pic${i + 1}.jpg`
  );

  let hearts = [];
  let heartAnimationId = null;
  let reducedMotion = false;

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomCompliment() {
    return HEART_COMPLIMENTS[Math.floor(Math.random() * HEART_COMPLIMENTS.length)];
  }

  function buildHeartSpritePool() {
    const perType = HEART_COUNT / HEART_SPRITES.length;
    const pool = [];

    HEART_SPRITES.forEach(function (src) {
      for (let i = 0; i < perType; i++) {
        pool.push(src);
      }
    });

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }

    return pool;
  }

  function splitMonthsDaysHoursMinutes(fromDate, toDate) {
    let months = 0;
    let cursor = new Date(fromDate.getTime());

    while (true) {
      const next = new Date(cursor.getTime());
      next.setMonth(next.getMonth() + 1);
      if (next > toDate) break;
      months += 1;
      cursor = next;
    }

    let remainingMs = toDate.getTime() - cursor.getTime();
    if (remainingMs < 0) remainingMs = 0;

    const days = Math.floor(remainingMs / 86400000);
    remainingMs -= days * 86400000;
    const hours = Math.floor(remainingMs / 3600000);
    remainingMs -= hours * 3600000;
    const minutes = Math.floor(remainingMs / 60000);

    return { months: months, days: days, hours: hours, minutes: minutes };
  }

  function setTimerDisplay(prefix, values) {
    document.getElementById(prefix + "-months").textContent = values.months;
    document.getElementById(prefix + "-days").textContent = values.days;
    document.getElementById(prefix + "-hours").textContent = pad(values.hours);
    document.getElementById(prefix + "-minutes").textContent = pad(values.minutes);
  }

  function zeroTimerDisplay(prefix) {
    setTimerDisplay(prefix, { months: 0, days: 0, hours: 0, minutes: 0 });
  }

  function updateTogetherTimer() {
    if (!document.getElementById("timer-months")) return;

    const now = new Date();
    if (now < RELATIONSHIP_START) {
      zeroTimerDisplay("timer");
      return;
    }

    setTimerDisplay("timer", splitMonthsDaysHoursMinutes(RELATIONSHIP_START, now));
  }

  function updateCountdownTimer() {
    if (!document.getElementById("countdown-months")) return;

    const now = new Date();
    if (now >= NEXT_MEET_DATE) {
      zeroTimerDisplay("countdown");
      return;
    }

    setTimerDisplay("countdown", splitMonthsDaysHoursMinutes(now, NEXT_MEET_DATE));
  }

  function initTimers() {
    if (!document.getElementById("timer-months")) return;
    updateTogetherTimer();
    updateCountdownTimer();
    setInterval(function () {
      updateTogetherTimer();
      updateCountdownTimer();
    }, 1000);
  }

  function getObstacleRects() {
    const zones = document.querySelectorAll("[data-ui-zone]");
    const rects = [];

    zones.forEach(function (zone) {
      const box = zone.getBoundingClientRect();
      rects.push({
        left: box.left - OBSTACLE_PADDING,
        top: box.top - OBSTACLE_PADDING,
        right: box.right + OBSTACLE_PADDING,
        bottom: box.bottom + OBSTACLE_PADDING,
      });
    });

    return rects;
  }

  function pointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function isValidSpawn(x, y, radius, obstacles) {
    if (x - radius < 0 || y - radius < 0) return false;
    if (x + radius > window.innerWidth || y + radius > window.innerHeight) return false;

    for (let i = 0; i < obstacles.length; i++) {
      if (pointInRect(x, y, obstacles[i])) return false;
    }
    return true;
  }

  function spawnPosition(radius, obstacles) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const x = randomBetween(radius, window.innerWidth - radius);
      const y = randomBetween(radius, window.innerHeight - radius);
      if (isValidSpawn(x, y, radius, obstacles)) {
        return { x: x, y: y };
      }
    }
    return {
      x: randomBetween(radius, window.innerWidth - radius),
      y: radius + 8,
    };
  }

  function resolveCircleRect(x, y, vx, vy, radius, rect) {
    const closestX = Math.max(rect.left, Math.min(x, rect.right));
    const closestY = Math.max(rect.top, Math.min(y, rect.bottom));
    const dx = x - closestX;
    const dy = y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq >= radius * radius) {
      return { x: x, y: y, vx: vx, vy: vy };
    }

    if (distSq === 0) {
      const toLeft = x - rect.left;
      const toRight = rect.right - x;
      const toTop = y - rect.top;
      const toBottom = rect.bottom - y;
      const minDist = Math.min(toLeft, toRight, toTop, toBottom);

      if (minDist === toLeft) {
        x = rect.left - radius;
        vx = -Math.abs(vx);
      } else if (minDist === toRight) {
        x = rect.right + radius;
        vx = Math.abs(vx);
      } else if (minDist === toTop) {
        y = rect.top - radius;
        vy = -Math.abs(vy);
      } else {
        y = rect.bottom + radius;
        vy = Math.abs(vy);
      }
      return { x: x, y: y, vx: vx, vy: vy };
    }

    const dist = Math.sqrt(distSq);
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = radius - dist;

    x += nx * overlap;
    y += ny * overlap;

    const dot = vx * nx + vy * ny;
    if (dot < 0) {
      vx -= 2 * dot * nx;
      vy -= 2 * dot * ny;
    }

    return { x: x, y: y, vx: vx, vy: vy };
  }

  function bounceOffWalls(x, y, vx, vy, radius) {
    if (x < radius) {
      x = radius;
      vx = Math.abs(vx);
    }
    if (x > window.innerWidth - radius) {
      x = window.innerWidth - radius;
      vx = -Math.abs(vx);
    }
    if (y < radius) {
      y = radius;
      vy = Math.abs(vy);
    }
    if (y > window.innerHeight - radius) {
      y = window.innerHeight - radius;
      vy = -Math.abs(vy);
    }
    return { x: x, y: y, vx: vx, vy: vy };
  }

  function animateHearts() {
    const obstacles = getObstacleRects();
    const speed = reducedMotion ? HEART_SPEED * 0.35 : HEART_SPEED;

    hearts.forEach(function (heart) {
      if (heart.paused) return;

      let x = heart.x + heart.vx * speed;
      let y = heart.y + heart.vy * speed;
      let vx = heart.vx;
      let vy = heart.vy;

      const wall = bounceOffWalls(x, y, vx, vy, heart.radius);
      x = wall.x;
      y = wall.y;
      vx = wall.vx;
      vy = wall.vy;

      for (let i = 0; i < obstacles.length; i++) {
        const resolved = resolveCircleRect(x, y, vx, vy, heart.radius, obstacles[i]);
        x = resolved.x;
        y = resolved.y;
        vx = resolved.vx;
        vy = resolved.vy;
      }

      heart.x = x;
      heart.y = y;
      heart.vx = vx;
      heart.vy = vy;

      heart.el.style.left = x - heart.radius + "px";
      heart.el.style.top = y - heart.radius + "px";
    });

    heartAnimationId = requestAnimationFrame(animateHearts);
  }

  function createFloatingHearts() {
    const field = document.getElementById("heart-field");
    if (!field) return;

    const obstacles = getObstacleRects();
    const fragment = document.createDocumentFragment();
    const spritePool = buildHeartSpritePool();

    for (let i = 0; i < HEART_COUNT; i++) {
      const compliment = randomCompliment();
      const heart = document.createElement("button");
      heart.type = "button";
      heart.className = "floating-heart";
      heart.setAttribute("aria-label", compliment);

      const sizePx = randomBetween(44, 62);
      const radius = sizePx / 2;
      const pos = spawnPosition(radius, obstacles);
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(0.6, 1.2);

      heart.style.width = sizePx + "px";
      heart.style.height = sizePx + "px";

      const glyph = document.createElement("img");
      glyph.className = "heart-glyph";
      glyph.src = spritePool[i];
      glyph.alt = "";
      glyph.draggable = false;
      heart.appendChild(glyph);

      const tooltip = document.createElement("span");
      tooltip.className = "heart-tooltip";
      tooltip.textContent = compliment;
      heart.appendChild(tooltip);

      const heartObj = {
        el: heart,
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: radius,
        paused: false,
        tooltip: tooltip,
      };

      heartObj.el.style.left = pos.x - radius + "px";
      heartObj.el.style.top = pos.y - radius + "px";

      heartObj.el.addEventListener("mouseenter", function () {
        heartObj.paused = true;
        heartObj.el.classList.add("is-hovered");
        heartObj.tooltip.textContent = randomCompliment();
      });

      heartObj.el.addEventListener("mouseleave", function () {
        heartObj.paused = false;
        heartObj.el.classList.remove("is-hovered");
      });

      heartObj.el.addEventListener("focus", function () {
        heartObj.paused = true;
        heartObj.el.classList.add("is-hovered");
        heartObj.tooltip.textContent = randomCompliment();
      });

      heartObj.el.addEventListener("blur", function () {
        heartObj.paused = false;
        heartObj.el.classList.remove("is-hovered");
      });

      fragment.appendChild(heart);
      hearts.push(heartObj);
    }

    field.appendChild(fragment);

    if (!reducedMotion) {
      heartAnimationId = requestAnimationFrame(animateHearts);
    }
  }

  function initPolaroid() {
    const polaroid = document.getElementById("polaroid");
    const img = document.getElementById("polaroid-img");
    if (!polaroid || !img) return;

    let currentIndex = 0;
    let isChanging = false;

    polaroid.addEventListener("click", function () {
      if (isChanging) return;
      isChanging = true;
      polaroid.classList.add("polaroid--changing");

      window.setTimeout(function () {
        currentIndex = (currentIndex + 1) % POLAROID_COUNT;
        img.src = POLAROID_IMAGES[currentIndex];
        img.alt = "Memory " + (currentIndex + 1) + " of " + POLAROID_COUNT;

        requestAnimationFrame(function () {
          polaroid.classList.remove("polaroid--changing");
          isChanging = false;
        });
      }, 180);
    });
  }

  function init() {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    createFloatingHearts();
    initPolaroid();
    initTimers();

    window.addEventListener("resize", function () {
      const obstacles = getObstacleRects();
      hearts.forEach(function (heart) {
        if (!isValidSpawn(heart.x, heart.y, heart.radius, obstacles)) {
          const pos = spawnPosition(heart.radius, obstacles);
          heart.x = pos.x;
          heart.y = pos.y;
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
