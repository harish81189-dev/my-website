/* ============================================================================
   PORTFOLIO SCRIPT
   ----------------------------------------------------------------------------
   Everything here is plain ("vanilla") JavaScript — no libraries.
   We wrap the code in an IIFE: a function that runs immediately. That keeps
   our variables private so they can't clash with other scripts later.
   ========================================================================== */
(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     HELPER: a short name for "find the first element matching this CSS selector"
     document.querySelector('.nav-toggle') works just like CSS selectors.
     ------------------------------------------------------------------------ */
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  /* ==========================================================================
     1. STICKY HEADER — add a glassy background after scrolling
     ========================================================================== */
  const header = $("#header");
  const backToTop = $("#backToTop");

  function onScroll() {
    const scrolled = window.scrollY > 20;

    // .classList.toggle(name, force) adds the class if on, removes it if off
    header.classList.toggle("is-scrolled", scrolled);
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  }

  // passive: true tells the browser we never block scrolling → smoother
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load in case the page is already scrolled

  /* ==========================================================================
     2. MOBILE MENU
     ========================================================================== */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    // Let the page scroll again (we lock it while the menu is open)
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  navToggle.addEventListener("click", toggleMenu);

  // Close the menu after tapping any link inside it (mobile UX)
  $$(".nav-link", navMenu).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  // Tapping anywhere outside the open menu closes it
  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("is-open")) return;
    if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
    closeMenu();
  });

  // If the window is resized back to desktop width, make sure the menu resets
  window.addEventListener("resize", () => {
    if (window.innerWidth > 840) closeMenu();
  });

  /* ==========================================================================
     3. ACTIVE NAV LINK WHILE SCROLLING
     IntersectionObserver watches elements and tells us when they enter/leave
     the viewport. Much cheaper for the browser than checking on every scroll.
     ========================================================================== */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navLinks.forEach((link) => {
          const matches = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("is-active", matches);
          if (matches) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      });
    },
    {
      // Trigger when a section covers the middle band of the screen
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ==========================================================================
     4. REVEAL ON SCROLL
     Every element with class="reveal" fades in the first time it's seen.
     We unobserve after revealing so the animation only plays once.
     ========================================================================== */
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ==========================================================================
     5. SKILL BARS
     The width lives in data-width="90" in the HTML. When a bar becomes
     visible we copy that number into the style. CSS transitions handle the
     smooth fill, so we get a nice animation for free.
     ========================================================================== */
  const barObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        bar.style.width = `${bar.dataset.width}%`;
        observer.unobserve(bar);
      });
    },
    { threshold: 0.4 }
  );

  $$(".progress-bar").forEach((bar) => barObserver.observe(bar));

  /* ==========================================================================
     6. COUNTING NUMBERS
     data-count="18" and data-suffix="+" in the HTML.
     requestAnimationFrame runs a function before every repaint (~60x/second),
     which is the correct way to animate things in the browser.
     ========================================================================== */
  function animateCount(element) {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || "";
    const duration = 1400; // milliseconds
    const start = performance.now();

    function step(now) {
      // progress goes from 0 → 1 over `duration` ms
      const progress = Math.min((now - start) / duration, 1);
      // easeOutQuad makes it fast at the start and gentle at the end
      const eased = 1 - (1 - progress) * (1 - progress);
      element.textContent = Math.round(eased * target) + suffix;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  $$(".stat-number[data-count]").forEach((el) => counterObserver.observe(el));

  /* ==========================================================================
     7. TYPING EFFECT IN THE HERO
     Cycles through a list of roles, typing and deleting each one.
     ========================================================================== */
  const typedText = $("#typedText");
  const roles = [
    "Front-End Developer",
    "UI Enthusiast",
    "JavaScript Learner",
    "Problem Solver",
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length; // start with the first role fully typed
  let deleting = true;             // ...then begin by deleting it
  const TYPE_SPEED = 90;           // ms per character while typing
  const DELETE_SPEED = 45;         // ms per character while deleting
  const HOLD_TIME = 1800;          // pause when a word is complete

  function typeLoop() {
    const current = roles[roleIndex];

    if (deleting) {
      charIndex--;
      typedText.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length; // loop back to the start
        setTimeout(typeLoop, 300);
        return;
      }
      setTimeout(typeLoop, DELETE_SPEED);
    } else {
      charIndex++;
      typedText.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, HOLD_TIME);
        return;
      }
      setTimeout(typeLoop, TYPE_SPEED);
    }
  }

  // Respect reduced-motion users: keep the static first role instead
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typedText && !prefersReducedMotion) {
    setTimeout(typeLoop, HOLD_TIME);
  }

  /* ==========================================================================
     8. CONTACT FORM VALIDATION
     There is no backend here, so on success we show a friendly message and
     log the values to the console. To make it real later, send the data to a
     service like Formspree or your own server with fetch().
     ========================================================================== */
  const form = $("#contactForm");
  const status = $("#formStatus");
  const submitBtn = $("#submitBtn");

  if (form) {
    // A small map: field id → { error element, rule function }
    const fields = {
      name: {
        input: $("#name"),
        error: $("#nameError"),
        validate: (value) =>
          value.trim().length < 2 ? "Please enter at least 2 characters." : "",
      },
      email: {
        input: $("#email"),
        error: $("#emailError"),
        validate: (value) => {
          // Simple pattern: something@something.something
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!value.trim()) return "Please enter your email address.";
          if (!emailPattern.test(value.trim())) return "That doesn't look like a valid email.";
          return "";
        },
      },
      subject: {
        input: $("#subject"),
        error: $("#subjectError"),
        validate: (value) =>
          value.trim().length < 3 ? "Please add a short subject line." : "",
      },
      message: {
        input: $("#message"),
        error: $("#messageError"),
        validate: (value) =>
          value.trim().length < 10 ? "Tell me a little more (10+ characters)." : "",
      },
    };

    // Show or hide the error text for one field
    function checkField(key) {
      const field = fields[key];
      const message = field.validate(field.input.value);

      field.error.textContent = message;
      field.input.classList.toggle("is-invalid", Boolean(message));
      field.input.setAttribute("aria-invalid", message ? "true" : "false");

      return !message; // true means valid
    }

    // Validate while typing, but only after the user has typed something,
    // so we don't yell at them before they start.
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      field.input.addEventListener("blur", () => checkField(key));
      field.input.addEventListener("input", () => {
        if (field.input.classList.contains("is-invalid")) checkField(key);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault(); // stop the browser from reloading the page

      // .map() turns our object keys into an array of true/false, then
      // .every() tells us if ALL of them are true.
      const allValid = Object.keys(fields).map(checkField).every(Boolean);

      if (!allValid) {
        status.textContent = "Please fix the highlighted fields.";
        status.classList.add("is-error");
        // Move focus to the first problem so keyboard users aren't lost
        const firstInvalid = $(".is-invalid", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // "Send" it — simulated here so the demo works offline
      const data = {
        name: $("#name").value.trim(),
        email: $("#email").value.trim(),
        subject: $("#subject").value.trim(),
        message: $("#message").value.trim(),
      };

      submitBtn.disabled = true;
      status.classList.remove("is-error");
      status.textContent = "Sending...";

      setTimeout(() => {
        console.log("Form submitted:", data);
        status.textContent = `Thanks, ${data.name.split(" ")[0]}! Your message is on its way.`;
        form.reset();
        submitBtn.disabled = false;
        // Clear any leftover error styles
        $$(".is-invalid", form).forEach((el) => el.classList.remove("is-invalid"));
      }, 900);
    });
  }

  /* ==========================================================================
     9. BACK TO TOP
     ========================================================================== */
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ==========================================================================
     10. FOOTER YEAR — always current, never out of date
     ========================================================================== */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ==========================================================================
     11. NICE TOUCH: subtle mouse-follow glow on desktop
     Skipped on touch devices and for reduced-motion users.
     ========================================================================== */
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover && !prefersReducedMotion) {
    const glow = document.createElement("div");
    glow.style.cssText = `
      position: fixed; top: 0; left: 0; width: 420px; height: 420px;
      border-radius: 50%; pointer-events: none; z-index: 0; opacity: 0;
      background: radial-gradient(circle, rgba(99,102,241,0.13), transparent 65%);
      transform: translate(-50%, -50%); transition: opacity 0.5s ease;
    `;
    document.body.appendChild(glow);

    window.addEventListener("mousemove", (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
      glow.style.opacity = "1";
    });

    document.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });
  }
})();
