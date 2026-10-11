(function () {
  "use strict";

  /* ----- sticky nav active section ----- */
  var sections = document.querySelectorAll(".chapter[id]");
  var navLinks = document.querySelectorAll(".nav-links a[href^='#']");

  function updateActiveNav() {
    var scrollY = window.scrollY + 80;
    var current = "";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollY) {
        current = sec.id;
      }
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href").slice(1);
      link.classList.toggle("active", href === current);
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ----- quiz ----- */
  var quizzes = document.querySelectorAll(".quiz-item");

  quizzes.forEach(function (item) {
    var answer = item.getAttribute("data-answer");
    var explain = item.getAttribute("data-explain") || "";
    var opts = item.querySelectorAll(".quiz-opt");
    var feedback = item.querySelector(".quiz-feedback");
    var revealBtn = item.querySelector(".quiz-reveal");
    var answered = false;

    opts.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var choice = btn.getAttribute("data-opt");
        var correct = choice === answer;

        opts.forEach(function (o) {
          o.disabled = true;
          if (o.getAttribute("data-opt") === answer) {
            o.classList.add("correct");
          } else if (o === btn && !correct) {
            o.classList.add("wrong");
          }
        });

        if (feedback) {
          feedback.classList.add("show", correct ? "ok" : "bad");
          feedback.textContent = correct
            ? "答对了。" + (explain ? " " + explain : "")
            : "还差一点。" + (explain ? " " + explain : " 正解是 " + answer.toUpperCase() + "。");
        }
      });
    });

    if (revealBtn) {
      revealBtn.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        opts.forEach(function (o) {
          o.disabled = true;
          if (o.getAttribute("data-opt") === answer) {
            o.classList.add("correct");
          }
        });
        if (feedback) {
          feedback.classList.add("show", "ok");
          feedback.textContent =
            "答案：" + answer.toUpperCase() + "。" + (explain ? " " + explain : "");
        }
        revealBtn.style.display = "none";
      });
    }
  });

  /* ----- checklist persistence ----- */
  var checks = document.querySelectorAll(".check-list input[type='checkbox']");
  var storageKey = "makue-checklist-" + (location.pathname.split("/").pop() || "index");

  function loadChecks() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      checks.forEach(function (cb, i) {
        if (saved[i]) {
          cb.checked = true;
          var label = cb.nextElementSibling;
          if (label) label.classList.add("done");
        }
      });
    } catch (e) {
      /* ignore */
    }
  }

  function saveChecks() {
    var data = {};
    checks.forEach(function (cb, i) {
      data[i] = cb.checked;
    });
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      /* ignore */
    }
  }

  checks.forEach(function (cb) {
    cb.addEventListener("change", function () {
      var label = cb.nextElementSibling;
      if (label) label.classList.toggle("done", cb.checked);
      saveChecks();
    });
  });

  loadChecks();
})();
