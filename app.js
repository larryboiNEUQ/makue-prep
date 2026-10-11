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

  /* ----- quiz (multiple choice, if any remain) ----- */
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

  /* ----- coding drills ----- */
  function norm(s) {
    return String(s || "")
      .replace(/O\s*\(\s*n\s*\*\s*n\s*\)/gi, "O(n^2)")
      .replace(/O\s*\(\s*n\s*²\s*\)/gi, "O(n^2)")
      .replace(/O\s*\(\s*n\s*\^\s*2\s*\)/gi, "O(n^2)")
      .replace(/\s+/g, " ")
      .trim();
  }

  function showDrillFeedback(el, ok, msg) {
    el.classList.remove("ok", "bad", "show");
    el.classList.add("show", ok ? "ok" : "bad");
    el.textContent = msg;
  }

  function evalStudent(code, extras) {
    // eslint-disable-next-line no-new-func
    var fn = new Function(
      extras || "",
      code +
        "\n;return { filterAllowed: typeof filterAllowed!=='undefined'?filterAllowed:undefined, hasDuplicate: typeof hasDuplicate!=='undefined'?hasDuplicate:undefined, indexById: typeof indexById!=='undefined'?indexById:undefined, getName: typeof getName!=='undefined'?getName:undefined };"
    );
    return fn();
  }

  function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  var checkers = {
    "count-steps": function (code) {
      var t = norm(code);
      var hasNn =
        /约\s*n\s*\*\s*n/.test(t) ||
        /约\s*n\s*²/.test(t) ||
        /约\s*n\s*\^\s*2/.test(t) ||
        /约\s*n\s*x\s*n/i.test(t);
      var hasBigO =
        /O\s*\(\s*n\s*\*\s*n\s*\)/i.test(code) ||
        /O\s*\(\s*n\s*²\s*\)/i.test(code) ||
        /O\s*\(\s*n\s*\^\s*2\s*\)/i.test(code) ||
        /O\s*\(\s*n\s*x\s*n\s*\)/i.test(code);
      if (/\?\?\?/.test(code)) {
        return { ok: false, msg: "还有 ??? 没填。内层比较约 n*n 次，复杂度 O(n²)。" };
      }
      if (hasNn && hasBigO) {
        return { ok: true, msg: "正确：双层循环约 n×n 次比较，粗粒度 O(n²)。" };
      }
      if (hasNn || hasBigO) {
        return {
          ok: false,
          msg: "还差一半：注释里写清「约 n*n 次」，并在末行写 O(n*n) 或 O(n²)。",
        };
      }
      return { ok: false, msg: "请把 ??? 换成 n*n，并把复杂度写成 O(n*n) 或 O(n²)。" };
    },

    "rewrite-set": function (code) {
      if (/\.includes\s*\(/.test(code)) {
        return {
          ok: false,
          msg: "还在用 includes。请 new Set(allowed)，再在循环里用 .has(id)。",
        };
      }
      if (!/new\s+Set\s*\(/.test(code) || !/\.has\s*\(/.test(code)) {
        return { ok: false, msg: "需要出现 new Set(...) 以及 .has(...)。" };
      }
      try {
        var api = evalStudent(code);
        if (typeof api.filterAllowed !== "function") {
          return { ok: false, msg: "请保留名为 filterAllowed 的函数。" };
        }
        var r1 = api.filterAllowed(["a", "b", "c", "d"], ["b", "d", "x"]);
        var r2 = api.filterAllowed([], ["a"]);
        var r3 = api.filterAllowed(["a", "a"], ["a"]);
        if (!arraysEqual(r1, ["b", "d"])) {
          return { ok: false, msg: "用例失败：filterAllowed(['a','b','c','d'], ['b','d','x']) 应返回 ['b','d']。" };
        }
        if (!arraysEqual(r2, [])) {
          return { ok: false, msg: "空 incoming 应返回 []。" };
        }
        if (!arraysEqual(r3, ["a", "a"])) {
          return { ok: false, msg: "应保留 incoming 原顺序与重复，只按 allowed 过滤。" };
        }
        return { ok: true, msg: "通过：用 Set 过滤，避免循环里 includes。" };
      } catch (e) {
        return { ok: false, msg: "运行出错：" + (e && e.message ? e.message : String(e)) };
      }
    },

    "array-costs": function (code) {
      var lines = code.split("\n");
      var answers = [];
      lines.forEach(function (line) {
        var m = line.match(/\/\/\s*(.+)\s*$/);
        if (m) answers.push(norm(m[1]));
      });
      if (answers.length < 3) {
        return { ok: false, msg: "请给三行都写上 // O(...) 注释。" };
      }
      function isO1(s) {
        return /^O\s*\(\s*1\s*\)$/i.test(s);
      }
      function isOn(s) {
        return /^O\s*\(\s*n\s*\)$/i.test(s);
      }
      function isOn2(s) {
        return /^O\(n\^2\)$/i.test(s) || /^O\s*\(\s*n\s*\*\s*n\s*\)$/i.test(s);
      }
      // Re-normalize each from raw for O(n^2) detection
      var a0 = answers[0];
      var a1 = answers[1];
      var a2 = answers[2];
      if (isO1(a0) && isOn(a1) && isOn2(a2)) {
        return { ok: true, msg: "正确：下标 O(1)，单次 includes O(n)，循环里 includes ≈ O(n²)。" };
      }
      return {
        ok: false,
        msg: "期望依次为 O(1)、O(n)、O(n*n)（或 O(n²)）。现在读到：" + answers.slice(0, 3).join("；"),
      };
    },

    "has-duplicate": function (code) {
      if (/for\s*\([^)]+\)\s*\{[^}]*for\s*\(/.test(code.replace(/\n/g, " "))) {
        return { ok: false, msg: "请避免双重循环；用 Set 做一次扫描即可。" };
      }
      if (!/Set/.test(code)) {
        return { ok: false, msg: "请使用 Set（new Set 或 Set 相关写法）。" };
      }
      try {
        var api = evalStudent(code);
        if (typeof api.hasDuplicate !== "function") {
          return { ok: false, msg: "请保留名为 hasDuplicate 的函数。" };
        }
        if (api.hasDuplicate([1, 2, 3, 1]) !== true) {
          return { ok: false, msg: "hasDuplicate([1,2,3,1]) 应为 true。" };
        }
        if (api.hasDuplicate([1, 2, 3]) !== false) {
          return { ok: false, msg: "hasDuplicate([1,2,3]) 应为 false。" };
        }
        if (api.hasDuplicate([]) !== false) {
          return { ok: false, msg: "空数组应为 false。" };
        }
        return { ok: true, msg: "通过：用 Set 在约 O(n) 内查出重复。" };
      } catch (e) {
        return { ok: false, msg: "运行出错：" + (e && e.message ? e.message : String(e)) };
      }
    },

    "index-by-id": function (code) {
      try {
        var api = evalStudent(code);
        if (typeof api.indexById !== "function" || typeof api.getName !== "function") {
          return { ok: false, msg: "请实现 indexById 与 getName 两个函数。" };
        }
        var users = [
          { id: "u1", name: "阿树" },
          { id: "u2", name: "小陈" },
        ];
        var byId = api.indexById(users);
        if (!(byId instanceof Map)) {
          return { ok: false, msg: "indexById 应返回 Map 实例。" };
        }
        if (!byId.get("u2") || byId.get("u2").name !== "小陈") {
          return { ok: false, msg: "Map 应按 id 存整行 user。" };
        }
        if (api.getName(byId, "u1") !== "阿树") {
          return { ok: false, msg: "getName(byId,'u1') 应返回「阿树」。" };
        }
        if (api.getName(byId, "nope") !== null) {
          return { ok: false, msg: "找不到时应返回 null。" };
        }
        return { ok: true, msg: "通过：Map 索引 + getName 正确。" };
      } catch (e) {
        return { ok: false, msg: "运行出错：" + (e && e.message ? e.message : String(e)) };
      }
    },

    "review-comment": function (code) {
      var t = code.toLowerCase();
      var mentionsCost =
        /o\s*\(\s*n/.test(t) ||
        /n\s*²/.test(code) ||
        /n\s*\*\s*n/.test(t) ||
        /平方/.test(code) ||
        /复杂度/.test(code) ||
        /nested|nest|热路径|慢|expensive|quadratic/i.test(code);
      var mentionsSet = /\bset\b/i.test(code) || /集合/.test(code);
      var mentionsHas = /\.has\b/i.test(code) || /has\s*\(/i.test(code) || /改成|建议|换成|replace|prefer/i.test(code);
      if (/在此写审查评论/.test(code) && code.trim().length < 40) {
        return { ok: false, msg: "请写下你的审查评论（不要只留占位提示）。" };
      }
      if (mentionsCost && mentionsSet) {
        return {
          ok: true,
          msg: "要点齐了：点出代价/规模，并建议用 Set。审查时再补一句「n 很小且只查一次可暂留」就更完整。",
        };
      }
      if (!mentionsCost) {
        return { ok: false, msg: "请提到复杂度或「会随 n 变慢 / 热路径」这类问题。" };
      }
      if (!mentionsSet) {
        return { ok: false, msg: "请给出可执行建议：例如先 new Set(existing) 再 has。" };
      }
      if (!mentionsHas) {
        return { ok: false, msg: "建议里写清改法（Set + has）会更落地。" };
      }
      return { ok: false, msg: "再写具体一点：问题（O(n²)/includes）+ 建议（Set.has）。" };
    },
  };

  document.querySelectorAll(".drill").forEach(function (drill) {
    var id = drill.getAttribute("data-drill");
    var ta = drill.querySelector(".code-input");
    var feedback = drill.querySelector(".drill-feedback");
    var sol = drill.querySelector(".drill-solution");
    var checkBtn = drill.querySelector(".drill-check");
    var toggleBtn = drill.querySelector(".drill-toggle-sol");

    if (checkBtn && ta && feedback) {
      checkBtn.addEventListener("click", function () {
        var checker = checkers[id];
        if (!checker) {
          showDrillFeedback(feedback, false, "未找到该练习的检查器。");
          return;
        }
        var result = checker(ta.value);
        showDrillFeedback(feedback, result.ok, result.msg);
      });
    }

    if (toggleBtn && sol) {
      toggleBtn.addEventListener("click", function () {
        var open = sol.classList.toggle("show");
        toggleBtn.textContent = open ? "收起参考答案" : "看参考答案";
        if (id === "review-comment") {
          toggleBtn.textContent = open ? "收起示例评论" : "看示例评论";
        }
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
