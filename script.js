(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════
  // CHANGE THIS DATE to when your relationship started (local time).
  // Format: year, month (1–12), day
  // Example: June 14, 2024 → new Date(2024, 5, 14)
  // ═══════════════════════════════════════════════════════════════════
  const RELATIONSHIP_START = new Date(2024, 5, 14, 0, 0, 0, 0);

  const HEART_MESSAGES = [
    "I love you",
    "You're beautiful",
    "You make me smile",
    "Forever yours",
    "My favorite person",
    "So lucky to have you",
    "You light up my world",
    "Always thinking of you",
    "You're my home",
    "Every day with you",
    "You mean everything",
    "Can't wait to see you",
    "You're my sunshine",
    "Holding you close",
    "Sweet dreams, love",
  ];

  const HEART_COUNT = 18;

  const POLAROID_COUNT = 16;
  const POLAROID_IMAGES = Array.from(
    { length: POLAROID_COUNT },
    (_, i) => `images/pic${i + 1}.jpg`
  );

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateTimer() {
    const daysEl = document.getElementById("timer-days");
    const hoursEl = document.getElementById("timer-hours");
    const minutesEl = document.getElementById("timer-minutes");
    const secondsEl = document.getElementById("timer-seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const now = new Date();
    let diff = now - RELATIONSHIP_START;

    if (diff < 0) diff = 0;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = days;
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickMessage(index) {
    return HEART_MESSAGES[index % HEART_MESSAGES.length];
  }

  function createFloatingHearts() {
    const field = document.getElementById("heart-field");
    if (!field) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < HEART_COUNT; i++) {
      const heart = document.createElement("button");
      heart.type = "button";
      heart.className = "floating-heart";
      heart.setAttribute("aria-label", pickMessage(i));

      const duration = randomBetween(14, 26);
      const delay = randomBetween(0, 20);
      const left = randomBetween(2, 96);
      const size = randomBetween(0.85, 1.35);

      heart.style.left = `${left}%`;
      heart.style.animationDuration = `${duration}s`;
      heart.style.animationDelay = `-${delay}s`;
      heart.style.fontSize = `${size}rem`;

      heart.textContent = "♥";

      const tooltip = document.createElement("span");
      tooltip.className = "heart-tooltip";
      tooltip.textContent = pickMessage(i);
      heart.appendChild(tooltip);

      fragment.appendChild(heart);
    }

    field.appendChild(fragment);
  }

  function initPolaroid() {
    const polaroid = document.getElementById("polaroid");
    const img = document.getElementById("polaroid-img");
    if (!polaroid || !img) return;

    let currentIndex = 0;

    polaroid.addEventListener("click", function () {
      currentIndex = (currentIndex + 1) % POLAROID_COUNT;
      img.src = POLAROID_IMAGES[currentIndex];
      img.alt = `Memory ${currentIndex + 1} of ${POLAROID_COUNT}`;
    });
  }

  function initTimer() {
    updateTimer();
    setInterval(updateTimer, 1000);
  }

  function init() {
    createFloatingHearts();
    initPolaroid();
    initTimer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
