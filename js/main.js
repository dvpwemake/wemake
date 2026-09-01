(function () {
  "use strict";

  var yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Contact links: never print the address in HTML; assemble mailto at runtime
     to reduce bulk address harvesting. Label must stay generic (Contact us). */
  function contactMailto(subject) {
    var local = ["con", "tact"].join("");
    var domain = ["wemake", "cloud"].join(".");
    var href = "mailto:" + local + "@" + domain;
    if (subject) {
      href += "?subject=" + encodeURIComponent(subject);
    }
    return href;
  }

  document.querySelectorAll("[data-contact]").forEach(function (el) {
    var subject = el.getAttribute("data-contact") || "WeMake Inquiry";
    el.setAttribute("href", contactMailto(subject));
    el.addEventListener("click", function () {
      /* ensure href is current even if DOM was cloned */
      el.setAttribute("href", contactMailto(subject));
    });
  });

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Hero carousel */
  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dotsRoot = document.querySelector("[data-hero-dots]");
    var prevBtn = document.querySelector("[data-hero-prev]");
    var nextBtn = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    var intervalMs = 5500;

    function goTo(i) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === index);
        slide.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      if (dotsRoot) {
        Array.prototype.forEach.call(dotsRoot.children, function (dot, n) {
          dot.classList.toggle("is-active", n === index);
          dot.setAttribute("aria-current", n === index ? "true" : "false");
        });
      }
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function start() {
      stop();
      if (slides.length < 2) return;
      timer = window.setInterval(next, intervalMs);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (dotsRoot) {
      slides.forEach(function (_, n) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hero-dot" + (n === 0 ? " is-active" : "");
        btn.setAttribute("aria-label", "Go to slide " + (n + 1));
        btn.addEventListener("click", function () {
          goTo(n);
          start();
        });
        dotsRoot.appendChild(btn);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); start(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); start(); });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    goTo(0);
    start();
  }

  /* CoC card: current daily editorial hero from chronicleofconvergence.com */
  (function loadCocHero() {
    var imgs = document.querySelectorAll("[data-coc-hero]");
    if (!imgs.length) return;
    fetch("https://chronicleofconvergence.com/data/editorial.json", {
      cache: "no-cache",
      mode: "cors"
    })
      .then(function (r) {
        if (!r.ok) throw new Error("editorial.json " + r.status);
        return r.json();
      })
      .then(function (pack) {
        var pub = pack && pack.published;
        var url = pub && pub.heroImage;
        if (!url) return;
        var alt = (pub.title ? pub.title + ". " : "") + "Chronicle of Convergence";
        Array.prototype.forEach.call(imgs, function (img) {
          img.src = url;
          img.alt = alt;
        });
      })
      .catch(function () {
        /* keep the last known hero src already in the markup */
      });
  })();
})();
