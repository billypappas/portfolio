/**
 * main.js — Vasileios Pappas Portfolio
 *
 * Features:
 *  1. Smart sticky navbar   — shrinks and adds shadow on scroll
 *  2. Active nav link       — highlights the link for the current section
 *  3. Mobile hamburger menu — toggles nav panel open/closed
 *  4. Scroll-in animations  — fade + rise sections via IntersectionObserver
 *  5. Skill bar animation   — fills bars when Skills section enters viewport
 *  6. Project filter tabs   — shows/hides cards by category
 *  7. Contact form validation — inline errors + success feedback
 *  8. Dynamic footer year   — keeps copyright current automatically
 *
 * Author : Vasileios Pappas
 * Revised: 2026
 */

'use strict';   // Catch accidental globals and silent errors

/* ================================================
   UTILITY HELPERS
   ================================================ */

/**
 * Shorthand querySelector — returns the first match or null.
 * @param {string} selector  CSS selector
 * @param {Element} [root]   Search root (defaults to document)
 * @returns {Element|null}
 */
function qs(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Shorthand querySelectorAll — returns a NodeList.
 * @param {string} selector
 * @param {Element} [root]
 * @returns {NodeList}
 */
function qsAll(selector, root = document) {
  return root.querySelectorAll(selector);
}


/* ================================================
   1. SMART STICKY NAVBAR
   Adds .nav-scrolled when the user scrolls down > 10px.
   CSS handles the visual change (height, shadow, blur).
   ================================================ */
(function initSmartNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  /**
   * Toggle the .nav-scrolled class based on current scroll position.
   * Threshold of 10px prevents flickering at the very top.
   */
  function onScroll() {
    const isScrolled = window.scrollY > 10;
    navbar.classList.toggle('nav-scrolled', isScrolled);
  }

  // Listen for scroll — passive:true tells the browser we won't preventDefault,
  // allowing it to optimise the scroll pipeline.
  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load to set the correct state if the page is reloaded mid-scroll.
  onScroll();
}());


/* ================================================
   2. ACTIVE NAV LINK (SECTION HIGHLIGHT)
   Uses IntersectionObserver to know which section
   is currently in view, then marks the matching
   nav link as .active.
   ================================================ */
(function initActiveNavLinks() {
  const navLinks = qsAll('.nav-link');
  if (!navLinks.length) return;

  // Build a map: sectionId → nav anchor element
  const linkMap = {};
  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap[href.slice(1)] = link;  // remove the leading '#'
    }
  });

  // Track which section is currently visible
  let currentSectionId = '';

  /**
   * Mark a nav link as active; deactivate all others.
   * @param {string} sectionId
   */
  function setActiveLink(sectionId) {
    if (sectionId === currentSectionId) return;
    currentSectionId = sectionId;

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      link.setAttribute('aria-current', 'false');
    });

    const activeLink = linkMap[sectionId];
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  // Observe every section that has an id
  const sections = qsAll('section[id]');

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      // Trigger when the section occupies the middle 40% of the viewport
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
}());


/* ================================================
   3. MOBILE HAMBURGER MENU
   Toggles .nav-open on the nav links list and
   updates aria-expanded on the toggle button.
   Closes the menu when a link is tapped.
   ================================================ */
(function initMobileMenu() {
  const toggle   = qs('#nav-toggle');
  const navLinks = qs('#nav-links');
  if (!toggle || !navLinks) return;

  /**
   * Open or close the mobile navigation panel.
   * @param {boolean} [forceClose]  Pass true to always close.
   */
  function toggleMenu(forceClose) {
    const isOpen = navLinks.classList.contains('nav-open');
    const shouldOpen = forceClose ? false : !isOpen;

    navLinks.classList.toggle('nav-open', shouldOpen);
    toggle.setAttribute('aria-expanded', String(shouldOpen));
  }

  // Toggle on button click
  toggle.addEventListener('click', function () {
    toggleMenu();
  });

  // Close menu when any nav link is clicked (smooth scroll will handle navigation)
  navLinks.addEventListener('click', function (event) {
    if (event.target.classList.contains('nav-link')) {
      toggleMenu(true);
    }
  });

  // Close menu if user clicks outside the navbar
  document.addEventListener('click', function (event) {
    const navbar = qs('#navbar');
    if (navbar && !navbar.contains(event.target)) {
      toggleMenu(true);
    }
  });
}());


/* ================================================
   4. SCROLL-IN ANIMATIONS (FADE + RISE)
   Every element with class .fade-in starts invisible
   (handled in CSS). IntersectionObserver adds
   .is-visible when the element enters the viewport,
   triggering the CSS transition.
   ================================================ */
(function initScrollAnimations() {
  const animatedElements = qsAll('.fade-in');
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Once visible, stop observing — no need to re-animate
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // Start animation when 15% of the element enters the screen
      threshold: 0.15,
    }
  );

  animatedElements.forEach(function (el) {
    observer.observe(el);
  });
}());


/* ================================================
   5. SKILL BAR ANIMATION
   When the Skills section enters the viewport,
   each .skill-fill bar is animated to its target
   width (stored in the data-width attribute).
   ================================================ */
(function initSkillBars() {
  const skillsSection = qs('#skills');
  if (!skillsSection) return;

  let animated = false;   // Ensure bars only animate once

  /**
   * Set each bar's width to its data-width value,
   * triggering the CSS transition.
   */
  function animateBars() {
    if (animated) return;
    animated = true;

    const bars = qsAll('.skill-fill', skillsSection);
    bars.forEach(function (bar) {
      const targetWidth = bar.getAttribute('data-width');
      if (targetWidth) {
        // Small timeout so the section transition finishes first
        setTimeout(function () {
          bar.style.width = targetWidth + '%';
        }, 250);
      }
    });
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateBars();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(skillsSection);
}());


/* ================================================
   6. PROJECT FILTER TABS
   Clicking a filter button:
     - Sets it as .active  (CSS styles the active pill)
     - Shows cards whose data-category matches the filter
     - Hides all other cards (adds .hidden class)
     - "all" filter shows every card
   ================================================ */
(function initProjectFilter() {
  const filterButtons = qsAll('.filter-btn');
  const projectCards  = qsAll('.project-card');
  if (!filterButtons.length || !projectCards.length) return;

  /**
   * Filter cards by category.
   * @param {string} filterValue  "all" or a category name
   */
  function filterProjects(filterValue) {
    projectCards.forEach(function (card) {
      const category = card.getAttribute('data-category');

      if (filterValue === 'all' || category === filterValue) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  /**
   * Update button active state and ARIA attributes.
   * @param {Element} activeButton  The button that was clicked
   */
  function setActiveFilter(activeButton) {
    filterButtons.forEach(function (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-selected', 'true');
  }

  // Attach click listeners to each filter button
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filterValue = button.getAttribute('data-filter');
      setActiveFilter(button);
      filterProjects(filterValue);
    });
  });
}());


/* ================================================
   7. CONTACT FORM VALIDATION
   Validates on submit:
     - Name    : required, minimum 2 characters
     - Email   : required, valid format (RFC-compatible regex)
     - Message : required, minimum 20 characters
   Shows inline per-field errors and a top-level
   success/failure banner after submission.
   ================================================ */
(function initContactForm() {
  const form = qs('#contact-form');
  if (!form) return;

  // --- DOM references ---
  const nameInput    = qs('#name',     form);
  const emailInput   = qs('#email',    form);
  const messageInput = qs('#message',  form);
  const nameError    = qs('#name-error',    form);
  const emailError   = qs('#email-error',   form);
  const messageError = qs('#message-error', form);
  const feedback     = qs('#form-feedback', form);

  /**
   * Email validation regex — matches standard email formats.
   * Deliberately simple: real validation happens server-side.
   * @type {RegExp}
   */
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---- Helpers ---- */

  /**
   * Mark a field as invalid and display an error message.
   * @param {HTMLElement} inputEl   The input/textarea element
   * @param {HTMLElement} errorEl   The span that shows the error
   * @param {string}      message   Human-readable error text
   */
  function showError(inputEl, errorEl, message) {
    inputEl.classList.add('is-invalid');
    errorEl.textContent = message;
  }

  /**
   * Clear invalid state and error text for a field.
   * @param {HTMLElement} inputEl
   * @param {HTMLElement} errorEl
   */
  function clearError(inputEl, errorEl) {
    inputEl.classList.remove('is-invalid');
    errorEl.textContent = '';
  }

  /**
   * Validate the entire form.
   * @returns {boolean}  true if the form is valid
   */
  function validateForm() {
    let isValid = true;

    // Name validation
    const nameValue = nameInput.value.trim();
    if (!nameValue) {
      showError(nameInput, nameError, 'Name is required.');
      isValid = false;
    } else if (nameValue.length < 2) {
      showError(nameInput, nameError, 'Name must be at least 2 characters.');
      isValid = false;
    } else {
      clearError(nameInput, nameError);
    }

    // Email validation
    const emailValue = emailInput.value.trim();
    if (!emailValue) {
      showError(emailInput, emailError, 'Email address is required.');
      isValid = false;
    } else if (!EMAIL_REGEX.test(emailValue)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(emailInput, emailError);
    }

    // Message validation
    const messageValue = messageInput.value.trim();
    if (!messageValue) {
      showError(messageInput, messageError, 'Message is required.');
      isValid = false;
    } else if (messageValue.length < 20) {
      showError(
        messageInput,
        messageError,
        'Message must be at least 20 characters.'
      );
      isValid = false;
    } else {
      clearError(messageInput, messageError);
    }

    return isValid;
  }

  /**
   * Display the top-level feedback banner.
   * @param {string} type     'success' or 'error'
   * @param {string} message  Text to display
   */
  function showFeedback(type, message) {
    feedback.textContent    = message;
    feedback.className      = 'form-feedback ' + type;  // applies display:block via CSS
    feedback.style.display  = 'block';

    // Auto-hide after 5 seconds
    setTimeout(function () {
      feedback.style.display = 'none';
      feedback.textContent   = '';
      feedback.className     = 'form-feedback';
    }, 5000);
  }

  /* ---- Live validation — clear errors as user types ---- */
  [nameInput, emailInput, messageInput].forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.classList.contains('is-invalid')) {
        // Optimistically clear the error; full check runs on submit
        const errorEl = qs('#' + input.id + '-error', form);
        if (errorEl) clearError(input, errorEl);
      }
    });
  });

  /* ---- Form submission handler ---- */
  form.addEventListener('submit', function (event) {
    // Always prevent the default browser navigation
    event.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      // Focus the first invalid field for accessibility
      const firstInvalid = qs('.is-invalid', form);
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // --- Simulate sending (replace with real fetch/AJAX when backend is ready) ---
    const submitButton = qs('[type="submit"]', form);
    submitButton.textContent = 'Sending…';
    submitButton.disabled    = true;

    // Mimic a short network delay
    setTimeout(function () {
      // Success path
      showFeedback(
        'success',
        '✓ Message sent! I\'ll get back to you within 24 hours.'
      );
      form.reset();

      // Restore button
      submitButton.textContent = 'Send Message';
      submitButton.disabled    = false;
    }, 1200);
  });
}());


/* ================================================
   8. DYNAMIC FOOTER YEAR
   Keeps the copyright year current without manual
   edits every January.
   ================================================ */
(function initFooterYear() {
  const yearSpan = qs('#footer-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}());
