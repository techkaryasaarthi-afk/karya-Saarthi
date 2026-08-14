/**
 * Karya Saarthi - Professional 3D Animations Framework
 * Pure JS animations: scroll reveals, 3D tilt, card flip, counters,
 * confetti, hover lift, staggered fade-in, parallax, and smooth page load.
 * No external dependencies.
 */
(function () {
  "use strict";

  // ───────────────────────────────────────────────────────
  // 1. Smooth Page Load — body fades in
  // ───────────────────────────────────────────────────────
  function initPageLoad() {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s ease";
    requestAnimationFrame(function () {
      document.body.style.opacity = "1";
    });
  }

  // ───────────────────────────────────────────────────────
  // 2. Scroll Reveal (GSAP ScrollTrigger-like)
  //    Any element with class .scroll-reveal fades + slides up
  //    when it enters the viewport.
  // ───────────────────────────────────────────────────────
  function initScrollReveal() {
    var elements = document.querySelectorAll(".scroll-reveal");
    if (!elements.length) return;

    // Set initial hidden state via inline styles
    elements.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(40px)";
      el.style.transition =
        "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ───────────────────────────────────────────────────────
  // 3. 3D Card Tilt Effect (.tilt-3d)
  //    Cards tilt toward mouse position using CSS perspective.
  // ───────────────────────────────────────────────────────
  function initTilt3D() {
    var cards = document.querySelectorAll(".tilt-3d");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.style.transition = "transform 0.15s ease-out";
      card.style.transformStyle = "preserve-3d";
      card.style.willChange = "transform";

      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left; // mouse x within card
        var y = e.clientY - rect.top; // mouse y within card
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        // Max tilt of 12 degrees
        var tiltX = ((y - centerY) / centerY) * -12;
        var tiltY = ((x - centerX) / centerX) * 12;

        card.style.transform =
          "perspective(800px) rotateX(" +
          tiltX +
          "deg) rotateY(" +
          tiltY +
          "deg) scale3d(1.03,1.03,1.03)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform =
          "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      });
    });
  }

  // ───────────────────────────────────────────────────────
  // 4. 3D Card Flip (.flip-card)
  //    Front shows title, back shows apply button.
  //    Requires markup:
  //      <div class="flip-card">
  //        <div class="flip-card-inner">
  //          <div class="flip-card-front">...</div>
  //          <div class="flip-card-back">...</div>
  //        </div>
  //      </div>
  // ───────────────────────────────────────────────────────
  function initFlipCards() {
    var flipCards = document.querySelectorAll(".flip-card");
    if (!flipCards.length) return;

    // Inject flip-card CSS once
    var style = document.createElement("style");
    style.textContent =
      ".flip-card{perspective:1000px;cursor:pointer}" +
      ".flip-card-inner{position:relative;width:100%;height:100%;transition:transform 0.6s cubic-bezier(0.22,1,0.36,1);transform-style:preserve-3d}" +
      ".flip-card:hover .flip-card-inner{transform:rotateY(180deg)}" +
      ".flip-card-front,.flip-card-back{position:absolute;width:100%;height:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:inherit}" +
      ".flip-card-back{transform:rotateY(180deg);display:flex;align-items:center;justify-content:center}";
    document.head.appendChild(style);
  }

  // ───────────────────────────────────────────────────────
  // 5. Animated Counters (.counter-animate)
  //    Counts up from 0 to data-target when visible.
  // ───────────────────────────────────────────────────────
  function initCounters() {
    var counters = document.querySelectorAll(".counter-animate");
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(function (el) {
      el.textContent = "0";
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var duration = 2000; // 2 seconds
    var start = 0;
    var startTime = null;

    // Determine suffix (e.g., "+", "%", "k")
    var suffix = el.getAttribute("data-suffix") || "";

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // ───────────────────────────────────────────────────────
  // 6. Confetti Burst (window.launchConfetti)
  //    Fires colorful confetti via canvas for 2.5 seconds.
  // ───────────────────────────────────────────────────────
  window.launchConfetti = function () {
    var canvas = document.createElement("canvas");
    canvas.id = "ks-confetti-canvas";
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999";
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F1948A", "#82E0AA",
    ];

    var particles = [];
    var PARTICLE_COUNT = 150;

    // Create particles
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 18 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.3 + Math.random() * 0.2,
        opacity: 1,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }

    var startTime = Date.now();
    var DURATION = 2500;

    function render() {
      var elapsed = Date.now() - startTime;
      if (elapsed > DURATION) {
        canvas.remove();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fade out in last 500ms
      var fadeStart = DURATION - 500;

      particles.forEach(function (p) {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;

        if (elapsed > fadeStart) {
          p.opacity = 1 - (elapsed - fadeStart) / 500;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(p.opacity, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  };

  // ───────────────────────────────────────────────────────
  // 7. Hover Lift (.hover-lift)
  //    Card lifts up with 3D shadow depth on hover.
  // ───────────────────────────────────────────────────────
  function initHoverLift() {
    var style = document.createElement("style");
    style.textContent =
      ".hover-lift{transition:transform 0.3s cubic-bezier(0.22,1,0.36,1),box-shadow 0.3s cubic-bezier(0.22,1,0.36,1);will-change:transform}" +
      ".hover-lift:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 40px rgba(0,0,0,0.12),0 8px 16px rgba(0,0,0,0.08)}";
    document.head.appendChild(style);
  }

  // ───────────────────────────────────────────────────────
  // 8. Staggered Fade-In (.stagger-children)
  //    Children animate in one by one, 100ms delay each.
  // ───────────────────────────────────────────────────────
  function initStaggeredFadeIn() {
    var containers = document.querySelectorAll(".stagger-children");
    if (!containers.length) return;

    containers.forEach(function (container) {
      var children = container.children;
      for (var i = 0; i < children.length; i++) {
        children[i].style.opacity = "0";
        children[i].style.transform = "translateY(20px)";
        children[i].style.transition =
          "opacity 0.5s ease, transform 0.5s ease";
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var children = entry.target.children;
            for (var i = 0; i < children.length; i++) {
              (function (child, delay) {
                setTimeout(function () {
                  child.style.opacity = "1";
                  child.style.transform = "translateY(0)";
                }, delay);
              })(children[i], i * 100);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    containers.forEach(function (container) {
      observer.observe(container);
    });
  }

  // ───────────────────────────────────────────────────────
  // 9. Parallax Background (.parallax-bg)
  //    Subtle parallax scroll effect on background sections.
  // ───────────────────────────────────────────────────────
  function initParallax() {
    var elements = document.querySelectorAll(".parallax-bg");
    if (!elements.length) return;

    var ticking = false;

    function updateParallax() {
      var scrollY = window.pageYOffset;

      elements.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var speed = parseFloat(el.getAttribute("data-parallax-speed")) || 0.3;

        // Only process elements near viewport
        if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
          var offset = (scrollY - el.offsetTop) * speed;
          el.style.backgroundPositionY = offset + "px";
        }
      });

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // ───────────────────────────────────────────────────────
  // Initialize all animations on DOMContentLoaded
  // ───────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    initPageLoad();
    initScrollReveal();
    initTilt3D();
    initFlipCards();
    initCounters();
    initHoverLift();
    initStaggeredFadeIn();
    initParallax();
  });
})();
