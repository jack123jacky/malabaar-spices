// ============================================
// MALABAR SPICE - Main JavaScript
// ============================================

// ---- Navbar Mobile Toggle ----
function toggleMenu() {
  var links = document.getElementById("navLinks");
  var toggle = document.getElementById("menuToggle");
  if (links) links.classList.toggle("open");
  if (toggle) toggle.classList.toggle("open");
}

// Close menu on outside click
document.addEventListener("click", function(e) {
  var links = document.getElementById("navLinks");
  var toggle = document.getElementById("menuToggle");
  if (links && toggle && !links.contains(e.target) && !toggle.contains(e.target)) {
    links.classList.remove("open");
    toggle.classList.remove("open");
  }
});

// ---- Scroll-triggered Fade Animations ----
function initScrollAnimations() {
  var elements = document.querySelectorAll(".fade-up");
  if (!elements.length) return;

  // Immediately show elements already in viewport
  function checkVisible() {
    elements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 30) {
        el.classList.add("visible");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });

    elements.forEach(function(el) { observer.observe(el); });
  } else {
    // Fallback for older browsers
    elements.forEach(function(el) { el.classList.add("visible"); });
  }

  // Check immediately on load
  checkVisible();
  window.addEventListener("scroll", checkVisible, { passive: true });
}

// ---- Navbar scroll style ----
function initNavbarScroll() {
  var navbar = document.querySelector(".navbar");
  if (!navbar) return;
  window.addEventListener("scroll", function() {
    if (window.scrollY > 40) {
      navbar.style.background = "rgba(10,22,14,0.98)";
    } else {
      navbar.style.background = "rgba(15,31,22,0.95)";
    }
  }, { passive: true });
}

// ---- Menu Filter + Search ----
function filterMenu() {
  var category = document.getElementById("categoryFilter");
  var search   = document.getElementById("menuSearch");
  var cards    = document.querySelectorAll(".menu-card");

  if (!cards.length) return;

  var selectedCat = category ? category.value.toLowerCase() : "all";
  var searchVal   = search   ? search.value.toLowerCase().trim() : "";

  cards.forEach(function(card) {
    var cardCat  = (card.dataset.category || "").toLowerCase();
    var cardName = (card.dataset.name    || "").toLowerCase();

    var matchCat    = selectedCat === "all" || cardCat === selectedCat;
    var matchSearch = !searchVal || cardName.includes(searchVal);

    if (matchCat && matchSearch) {
      card.style.display = "";
      card.style.opacity = "1";
    } else {
      card.style.opacity = "0";
      setTimeout(function() {
        if (card.style.opacity === "0") card.style.display = "none";
      }, 220);
    }
  });
}

// ---- Reservation form handler ----
function handleReservation(e) {
  e.preventDefault();
  var form    = document.getElementById("reserveForm");
  var success = document.getElementById("formSuccess");
  if (form && success) {
    form.style.display = "none";
    success.style.display = "block";
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", function() {
  initScrollAnimations();
  initNavbarScroll();
});
