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

  /* ----- quiz (multiple choice) ----- */
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

  /* ----- fill-in-blank ----- */
  function normFill(s) {
    return String(s || "")
      .replace(/\s+/g, "")
      .replace(/Ｏ/g, "O")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/²/g, "^2")
      .replace(/×/gi, "*")
      .replace(/n\s*[xX]\s*n/g, "n*n")
      .replace(/nxn/gi, "n*n")
      .toLowerCase();
  }

  function normalizeComplexity(s) {
    var t = normFill(s);
    t = t.replace(/o\(n\*n\)/g, "o(n^2)");
    t = t.replace(/o\(n\^2\)/g, "o(n^2)");
    return t;
  }

  function answersMatch(user, acceptedRaw) {
    var accepted = String(acceptedRaw || "")
      .split("|")
      .map(function (a) {
        return a.trim();
      })
      .filter(Boolean);
    var u = normalizeComplexity(user);
    // also accept bare method names with optional leading dot
    var uMethod = u.replace(/^\./, "");
    for (var i = 0; i < accepted.length; i++) {
      var a = normalizeComplexity(accepted[i]);
      var aMethod = a.replace(/^\./, "");
      if (u === a || uMethod === aMethod) return true;
      // allow "set.has" style vs "has"
      if (uMethod === aMethod || uMethod.endsWith("." + aMethod) || aMethod.endsWith("." + uMethod)) {
        return true;
      }
    }
    return false;
  }

  function showFillFeedback(el, ok, msg) {
    el.classList.remove("ok", "bad", "show");
    el.classList.add("show", ok ? "ok" : "bad");
    el.textContent = msg;
  }

  document.querySelectorAll(".fill-item").forEach(function (item) {
    var accepted = item.getAttribute("data-answers") || "";
    var explain = item.getAttribute("data-explain") || "";
    var input = item.querySelector(".fill-input");
    var feedback = item.querySelector(".fill-feedback");
    var checkBtn = item.querySelector(".fill-check");
    var revealBtn = item.querySelector(".fill-reveal");
    var primary = accepted.split("|")[0] || "";

    function grade() {
      if (!input || !feedback) return;
      var val = input.value;
      if (!String(val).trim()) {
        showFillFeedback(feedback, false, "请先填写答案。");
        return;
      }
      if (answersMatch(val, accepted)) {
        input.classList.add("fill-ok");
        input.classList.remove("fill-bad");
        input.disabled = true;
        showFillFeedback(feedback, true, "正确。" + (explain ? " " + explain : ""));
        if (checkBtn) checkBtn.disabled = true;
      } else {
        input.classList.add("fill-bad");
        input.classList.remove("fill-ok");
        showFillFeedback(
          feedback,
          false,
          "再想想。" + (explain ? " " + explain : " 参考写法：" + primary)
        );
      }
    }

    if (checkBtn) {
      checkBtn.addEventListener("click", grade);
    }
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          grade();
        }
      });
    }
    if (revealBtn) {
      revealBtn.addEventListener("click", function () {
        if (input) {
          input.value = primary;
          input.classList.add("fill-ok");
          input.classList.remove("fill-bad");
          input.disabled = true;
        }
        if (feedback) {
          showFillFeedback(
            feedback,
            true,
            "答案示例：" + primary + "。" + (explain ? " " + explain : "")
          );
        }
        if (checkBtn) checkBtn.disabled = true;
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
