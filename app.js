(function () {
  const D = window.PORTFOLIO;
  const root = document.documentElement;
  const reduceMotionPref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const link = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text || url)}</a>`;
  const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;
  const fmtMonth = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

  // ---------- Mode switching ----------
  function setMode(mode) {
    root.dataset.mode = mode;
    window.scrollTo(0, 0);
    try { localStorage.setItem("mode", mode); } catch (e) {}
    history.replaceState(null, "", "#" + mode);
    document.title = mode === "terminal" ? `${D.handle}@portfolio: ~` : `${D.name} · ${D.role}`;
    if (mode === "terminal") input.focus({ preventScroll: true });
  }

  // ---------- Hero (terminal page) ----------
  function renderHero() {
    const c = D.contact;
    document.getElementById("hero").innerHTML = `
      <div>
        <p class="hero-cmd"><span class="p">~$</span> whoami</p>
        <h1 class="hero-name">${esc(D.name)}<span class="cursor" aria-hidden="true"></span></h1>
        <p class="hero-role">${esc(D.role)}</p>
        <p class="hero-meta">${esc(D.location)} · ${esc(D.tagline)}</p>
        <nav class="hero-links" aria-label="Links">
          ${link(c.github, "github")}
          ${link(c.linkedin, "linkedin")}
          ${link(D.blog.url, "blog")}
          ${D.resume ? link(D.resume, "résumé.pdf") : ""}
          <a href="mailto:${esc(c.email)}">email</a>
        </nav>
      </div>
      <dl class="hero-stats">
        ${D.stats.map((st) => `<div><dt>${esc(st.value)}</dt><dd>${esc(st.label)}</dd></div>`).join("")}
      </dl>`;
    document.getElementById("term-footer").innerHTML =
      `© ${new Date().getFullYear()} ${esc(D.name)} · plain HTML, CSS and JS · ${link(D.source, "view source")}`;
  }

  // ---------- Window controls ----------
  const win = document.getElementById("term-window");

  function closeTerminal() {
    win.classList.add("closing");
    setTimeout(() => {
      win.classList.remove("closing", "minimized", "maximized");
      document.body.classList.remove("term-max");
      setMode("simple");
    }, 180);
  }

  function toggleMaximize() {
    win.classList.remove("minimized");
    const max = win.classList.toggle("maximized");
    document.body.classList.toggle("term-max", max);
    input.focus({ preventScroll: true });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    e.stopPropagation();
    const action = btn.dataset.action;
    if (action === "close") closeTerminal();
    else if (action === "minimize") {
      win.classList.remove("maximized");
      document.body.classList.remove("term-max");
      win.classList.toggle("minimized");
    } else if (action === "maximize") toggleMaximize();
    else if (action === "terminal") setMode("terminal");
  });

  // Clicking a minimized window restores it; double-clicking the title bar maximizes, like macOS.
  win.addEventListener("click", (e) => {
    if (win.classList.contains("minimized") && !e.target.closest("[data-action]")) {
      win.classList.remove("minimized");
      input.focus({ preventScroll: true });
    }
  });
  document.querySelector(".term-bar").addEventListener("dblclick", (e) => {
    if (!e.target.closest("[data-action]")) toggleMaximize();
  });

  // ---------- Simple mode ----------
  function renderSimple() {
    const c = D.contact;
    const n = (i) => String(i).padStart(2, "0");
    const sections = [
      ["about", "About", `
        <div class="s-prose">${D.about.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`],
      ["experience", "Experience", `
        <ol class="s-timeline">
          ${D.experience.map((e) => `
            <li class="s-job">
              <p class="s-period">${esc(e.period)}</p>
              <div>
                <h3>${esc(e.role)}</h3>
                <p class="s-company">${esc(e.company)}</p>
                <ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
              </div>
            </li>`).join("")}
        </ol>`],
      ["projects", "Selected projects", `
        <div class="s-projects">
          ${D.projects.map((p) => `
            <article class="s-card">
              <p class="s-stack">${esc(p.stack)}</p>
              <h3>${esc(p.name)}</h3>
              <p>${esc(p.summary)}</p>
              ${p.url
                ? `<a class="s-arrow" href="${esc(p.url)}" target="_blank" rel="noopener">View on GitHub <span aria-hidden="true">→</span></a>`
                : `<span class="s-muted">Private repository</span>`}
            </article>`).join("")}
        </div>`],
      ["writing", "Writing", `
        <ul class="s-posts">
          ${D.blog.posts.map((b) => `
            <li><a href="${esc(b.url)}" target="_blank" rel="noopener">
              <span class="s-post-title">${esc(b.title)}</span>
              <span class="s-post-date">${esc(fmtMonth(b.date))}</span>
            </a></li>`).join("")}
        </ul>
        <a class="s-arrow" href="${esc(D.blog.url)}" target="_blank" rel="noopener">All posts on Hashnode <span aria-hidden="true">→</span></a>`],
      ["skills", "Toolkit", `
        <dl class="s-skills">
          ${Object.entries(D.skills).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v.map(esc).join(" · ")}</dd></div>`).join("")}
        </dl>`],
      ["education", "Education", `
        <ol class="s-timeline">
          ${D.education.map((e) => `
            <li class="s-job">
              <p class="s-period">${esc(e.period)}</p>
              <div>
                <h3>${esc(e.degree)}</h3>
                <p class="s-company">${esc(e.school)} · ${esc(e.note)}</p>
              </div>
            </li>`).join("")}
        </ol>`],
    ];

    document.getElementById("simple").innerHTML = `
      <nav class="s-nav" aria-label="Sections">
        <a class="s-mark" href="#simple" aria-label="Top">${esc(D.name.split(" ").map((w) => w[0]).join(""))}</a>
        <div class="s-nav-links">
          ${[["about", "About"], ["experience", "Experience"], ["projects", "Projects"], ["writing", "Writing"]].map(([id, label]) => `<a href="#s-${id}">${label}</a>`).join("")}
          <a href="#s-contact">Contact</a>
        </div>
        <button type="button" class="s-term" data-action="terminal">&gt;_ terminal</button>
      </nav>

      <header class="s-hero reveal">
        <p class="s-eyebrow">${esc(D.role)}</p>
        <h1>${esc(D.name)}</h1>
        <p class="s-lede">${esc(D.tagline)}</p>
        <p class="s-loc">${esc(D.location)}</p>
        <dl class="s-stats">
          ${D.stats.map((st) => `<div><dt>${esc(st.value)}</dt><dd>${esc(st.label)}</dd></div>`).join("")}
        </dl>
      </header>

      ${sections.map(([id, title, html], i) => `
        <section id="s-${id}" class="s-section reveal">
          <h2><span>${n(i + 1)}</span>${esc(title)}</h2>
          <div class="s-body">${html}</div>
        </section>`).join("")}

      <section id="s-contact" class="s-contact reveal">
        <p class="s-eyebrow">${n(sections.length + 1)} — Contact</p>
        <h2>Let's build something reliable.</h2>
        <a class="s-email" href="mailto:${esc(c.email)}">${esc(c.email)}</a>
        <div class="s-links">
          ${link(c.github, "GitHub")}
          ${link(c.linkedin, "LinkedIn")}
          ${link(D.blog.url, "Blog")}
          ${D.resume ? link(D.resume, "Résumé (PDF)") : ""}
        </div>
      </section>

      <footer class="s-footer">© ${new Date().getFullYear()} ${esc(D.name)} · ${link(D.source, "Source")}</footer>`;

    // Section links scroll in-page without touching the #simple/#terminal hash.
    document.querySelectorAll('.s-nav a[href^="#s-"], .s-mark').forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = a.classList.contains("s-mark") ? document.body : document.querySelector(a.getAttribute("href"));
      target.scrollIntoView({ behavior: reduceMotionPref ? "auto" : "smooth" });
    }));

    // Gentle fade-in as sections enter the viewport.
    const items = document.querySelectorAll("#simple .reveal");
    if (reduceMotionPref || !("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -10% 0px" });
    items.forEach((el) => io.observe(el));
  }


  // ---------- Terminal mode ----------
  const out = document.getElementById("term-output");
  const form = document.getElementById("term-form");
  const input = document.getElementById("term-input");
  const body = document.getElementById("term-body");
  const promptText = `${D.handle}@portfolio:~$`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelector(".prompt").textContent = promptText;
  document.querySelector(".term-title").textContent = `${D.handle}@portfolio: ~`;

  // Short deterministic "commit hash" so git-log output is stable between visits.
  const hash = (s) => {
    let h = 2166136261;
    for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
  };
  const plain = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent; };
  const k = (key) => span("c-blue", `"${key}"`);
  const str = (s) => span("c-green", `"${s}"`);
  const now = new Date();
  const lsDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).replace(",", "") + "  " + d.getFullYear();
  const humanSize = (n) => (n < 1024 ? `${n}` : `${(n / 1024).toFixed(1)}K`).padStart(5);

  // ----- Output formats -----
  const views = {
    about: () => [
      span("c-yellow", `# ${D.name}`),
      span("c-dim", `> ${D.role}`),
      span("c-dim", `> ${D.location}`),
      "",
      ...D.about.map(esc).join("\n\n").split("\n"),
    ].join("\n"),

    projects: () => {
      const rows = D.projects.map((p, i) => {
        const last = i === D.projects.length - 1;
        const src = p.url ? link(p.url, "↗ github") : span("c-dim", "(private)");
        return `${last ? "└── " : "├── "}${span("c-blue", p.name + "/")}  ${span("c-dim", `[${p.stack}]`)}  ${src}\n` +
          `${last ? "    " : "│   "}└── ${esc(p.summary)}`;
      });
      return `${span("c-blue", "projects/")}\n${rows.join("\n")}\n\n${D.projects.length} directories\n${span("c-dim", "Tip: 'open 1' opens a project.")}`;
    },

    experience: (args = []) => {
      const n = D.experience.length;
      if (args.includes("--oneline")) {
        return D.experience.map((e) =>
          `${span("c-yellow", hash(e.company + e.period))} feat: ${esc(e.role)} @ ${esc(e.company)} ${span("c-dim", `(${e.period})`)}`
        ).join("\n");
      }
      return D.experience.map((e, i) => {
        const ref = i === 0 ? ` (${span("c-green", "HEAD -> main")})` : i === n - 1 ? ` (${span("c-yellow", "tag: v0.1.0")})` : "";
        return `${span("c-yellow", `commit ${hash(e.company + e.period)}`)}${ref}\n` +
          `Author: ${esc(D.name)} &lt;${esc(D.contact.email)}&gt;\n` +
          `Date:   ${esc(e.period)}\n\n` +
          `    feat: ${esc(e.role)} @ ${esc(e.company)}\n\n` +
          e.highlights.map((h) => `    - ${esc(h)}`).join("\n");
      }).join("\n\n");
    },

    blog: () => {
      const rows = D.blog.posts.map((b) => {
        const d = new Date(b.date + "T00:00:00");
        return `${span("c-dim", "-rw-r--r--  1 " + D.handle + "  " + lsDate(d))}  ${link(b.url, b.title)}`;
      });
      return `total ${D.blog.posts.length}\n${rows.join("\n")}\n\n${span("c-dim", "All posts:")} ${link(D.blog.url)}`;
    },

    skills: () => {
      const entries = Object.entries(D.skills);
      return "{\n" + entries.map(([key, list], i) =>
        `  ${k(key.toLowerCase())}: [${list.map(str).join(", ")}]${i < entries.length - 1 ? "," : ""}`
      ).join("\n") + "\n}";
    },

    education: () => D.education.map((e) =>
      `- ${span("c-blue", "degree")}: ${esc(e.degree)}\n` +
      `  ${span("c-blue", "school")}: ${esc(e.school)}\n` +
      `  ${span("c-blue", "period")}: ${esc(e.period)}\n` +
      `  ${span("c-blue", "note")}:   ${esc(e.note)}`
    ).join("\n"),

    contact: () => {
      const c = D.contact;
      const rows = [
        [k("email"), `<a href="mailto:${esc(c.email)}">${str(c.email)}</a>`],
        [k("github"), `<a href="${esc(c.github)}" target="_blank" rel="noopener">${str(c.github)}</a>`],
        [k("linkedin"), `<a href="${esc(c.linkedin)}" target="_blank" rel="noopener">${str(c.linkedin)}</a>`],
        [k("blog"), `<a href="${esc(D.blog.url)}" target="_blank" rel="noopener">${str(D.blog.url)}</a>`],
      ];
      return `${span("c-dim", `$ curl -i ${location.host || "localhost"}/api/contact`)}\n` +
        `${span("c-green", "HTTP/2 200")}\n${span("c-dim", "content-type: application/json")}\n\n` +
        "{\n" + rows.map(([a, b], i) => `  ${a}: ${b}${i < rows.length - 1 ? "," : ""}`).join("\n") + "\n}";
    },

    resume: () => (D.resume ? `${span("c-dim", "Downloading…")} ${link(D.resume)}` : span("c-dim", "No résumé linked yet.")),
  };

  // Fake filesystem: each entry maps to a view.
  const FILES = [
    { name: ".git/", dir: true, hidden: true, view: "experience" },
    { name: "projects/", dir: true, view: "projects" },
    { name: "blog/", dir: true, view: "blog" },
    { name: "about.md", view: "about" },
    { name: "skills.json", view: "skills" },
    { name: "education.yml", view: "education" },
    { name: "contact.json", view: "contact" },
    { name: "resume.pdf", view: "resume", binary: true },
  ];
  const findFile = (name) => FILES.find((f) => f.name === name || f.name === name + "/" || f.name.replace(/\/$/, "") === name.replace(/\/$/, ""));

  function ls(args) {
    const flags = args.filter((a) => a.startsWith("-")).join("");
    const target = args.find((a) => !a.startsWith("-"));
    if (target) {
      const f = findFile(target);
      if (!f) return span("c-red", `ls: ${target}: No such file or directory`);
      return f.dir ? views[f.view]() : esc(f.name);
    }
    const files = FILES.filter((f) => !f.hidden || flags.includes("a"));
    const name = (f) => (f.dir ? span("c-blue", f.name) : esc(f.name));
    if (!flags.includes("l")) return files.map(name).join("   ");
    const rows = files.map((f) => {
      const perms = f.dir ? "drwxr-xr-x" : "-rw-r--r--";
      const size = f.binary ? "48K" : humanSize(new Blob([plain(views[f.view]())]).size);
      return `${span("c-dim", `${perms}  1 ${D.handle}  staff  ${size.padStart(5)}  ${lsDate(now)}`)}  ${name(f)}`;
    });
    return `total ${files.length}\n${rows.join("\n")}`;
  }

  function cat(args) {
    if (!args.length) return span("c-red", "usage: cat <file>   (try 'ls')");
    return args.map((a) => {
      const f = findFile(a);
      if (!f) return span("c-red", `cat: ${a}: No such file or directory`);
      if (f.dir) return span("c-red", `cat: ${a}: Is a directory`) + ` (try ${span("c-green", "ls " + a)})`;
      if (f.binary) return `cat: ${esc(a)}: binary file. Try ${span("c-green", "resume")} to download it.`;
      return views[f.view]();
    }).join("\n\n");
  }

  // ----- Commands -----
  const commands = {
    help: { desc: "show this help", run: () => {
      const visible = Object.entries(commands).filter(([, c]) => !c.hidden);
      return "Usage: &lt;command&gt; [args]\n\n" + visible.map(([name, c]) =>
        `  ${span("c-green", (c.usage || name).padEnd(17))}${esc(c.desc.padEnd(26))}${c.eq ? span("c-dim", c.eq) : ""}`
      ).join("\n") + `\n\n${span("c-dim", "Tab completes · ↑/↓ history · Ctrl+L clears · Esc skips typing")}`;
    } },
    about: { desc: "who I am", eq: "cat about.md", run: () => views.about() },
    projects: { desc: "things I've built", eq: "tree projects/", run: () => views.projects() },
    experience: { desc: "where I've worked", eq: "git log", run: (a) => views.experience(a) },
    blog: { desc: "things I've written", eq: "ls -lt blog/", run: () => views.blog() },
    skills: { desc: "tools I use", eq: "cat skills.json", run: () => views.skills() },
    education: { desc: "where I studied", eq: "cat education.yml", run: () => views.education() },
    contact: { desc: "how to reach me", eq: "curl /api/contact", run: () => views.contact() },
    resume: { desc: "download my résumé", run: () => views.resume() },
    ls: { usage: "ls [-la] [dir]", desc: "list files", run: ls },
    cat: { usage: "cat <file>", desc: "print a file", run: cat },
    cd: { usage: "cd <dir>", desc: "change directory", run: (args) => {
      const t = args[0];
      if (!t || t === "~" || t === ".." || t === "/" || t === ".") return null;
      const f = findFile(t);
      if (!f) return span("c-red", `cd: no such file or directory: ${t}`);
      if (!f.dir) return span("c-red", `cd: not a directory: ${t}`);
      return views[f.view]();
    } },
    open: { usage: "open <n>", desc: "open a project on GitHub", run: (args) => {
      const p = D.projects[parseInt(args[0], 10) - 1];
      if (!p) return span("c-red", `usage: open <1-${D.projects.length}>`);
      if (!p.url) return `${esc(p.name)} is a private repo. Ask me about it: ${span("c-green", "contact")}`;
      window.open(p.url, "_blank", "noopener");
      return `Opening ${esc(p.name)}…`;
    } },
    git: { usage: "git log|status", desc: "career history", run: (args) => {
      if (args[0] === "log") return views.experience(args.slice(1));
      if (args[0] === "status") return `On branch main\nYour career is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`;
      return `git: '${esc(args[0] || "")}' is not supported here. Try ${span("c-green", "git log")} or ${span("c-green", "git log --oneline")}.`;
    } },
    clear: { desc: "clear the screen", run: () => { out.innerHTML = ""; return null; } },
    simple: { desc: "switch to the simple view", run: () => ({ html: "Switching to simple view…", then: () => setMode("simple") }) },
    whoami: { hidden: true, run: () => "guest — but welcome anyway." },
    pwd: { hidden: true, run: () => `/home/${esc(D.handle)}` },
    sudo: { hidden: true, run: () => span("c-red", "guest is not in the sudoers file. This incident will be reported.") },
  };

  // Common guesses people type first.
  const aliases = { "?": "help", man: "help", gui: "simple", exit: "simple", posts: "blog", tree: "projects" };

  // ----- Typewriter output -----
  let skipTyping = false;
  let busy = 0;
  let queue = Promise.resolve();

  const scrollDown = () => { body.scrollTop = body.scrollHeight; };

  // Types HTML one character at a time, keeping links and colors intact.
  // Speed scales so short replies feel typed and long ones finish in ~1.5s.
  function typeInto(dest, html) {
    const src = document.createElement("div");
    src.innerHTML = html;
    const jobs = [];
    (function clone(from, to) {
      for (const n of from.childNodes) {
        if (n.nodeType === Node.TEXT_NODE) {
          const t = document.createTextNode("");
          to.appendChild(t);
          jobs.push([t, n.data]);
        } else {
          const c = n.cloneNode(false);
          to.appendChild(c);
          clone(n, c);
        }
      }
    })(src, dest);

    const total = jobs.reduce((sum, [, s]) => sum + s.length, 0);
    const msPerChar = Math.min(14, 1500 / Math.max(total, 1));
    const start = performance.now();
    let j = 0, pos = 0, typed = 0;

    return new Promise((resolve) => {
      function step() {
        const t = performance.now();
        const due = skipTyping || reduceMotion ? total : Math.floor((t - start) / msPerChar) + 1;
        while (typed < due && j < jobs.length) {
          const [node, text] = jobs[j];
          const take = Math.min(due - typed, text.length - pos);
          node.data += text.slice(pos, pos + take);
          pos += take;
          typed += take;
          if (pos >= text.length) { j++; pos = 0; }
        }
        scrollDown();
        if (j < jobs.length) setTimeout(step, 16);
        else resolve();
      }
      step();
    });
  }

  function print(html, { cls, instant } = {}) {
    const div = document.createElement("div");
    if (cls) div.className = cls;
    out.appendChild(div);
    if (instant) { div.innerHTML = html; scrollDown(); return Promise.resolve(); }
    return typeInto(div, html);
  }

  // Runs output jobs in order; a new command fast-forwards whatever is still typing.
  function enqueue(job) {
    if (busy) skipTyping = true;
    busy++;
    queue = queue.then(() => { skipTyping = false; return job(); }).finally(() => { busy--; });
  }

  const cmdHistory = [];
  let hIndex = 0;

  function run(raw) {
    const line = raw.trim();
    enqueue(async () => {
      await print(`<span class="p">${esc(promptText)}</span> ${esc(line)}`, { cls: "cmd-echo", instant: true });
      if (!line) return;
      const resolved = aliases[line.toLowerCase()] || line;
      const [name, ...args] = resolved.split(/\s+/);
      const cmd = commands[name.toLowerCase()];
      let result = cmd ? cmd.run(args) : `${span("c-red", "command not found:")} ${esc(name)}. Type ${span("c-green", "help")}.`;
      if (result === null) return;
      if (typeof result === "string") result = { html: result };
      await print(result.html + "\n");
      if (result.then) setTimeout(result.then, 400);
    });
    if (line) { cmdHistory.push(line); hIndex = cmdHistory.length; }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value);
    input.value = "";
  });

  function complete(value) {
    const parts = value.split(" ");
    if (parts.length === 1) {
      return Object.keys(commands).filter((c) => !commands[c].hidden && c.startsWith(value.toLowerCase()));
    }
    const prefix = parts.slice(0, -1).join(" ") + " ";
    const last = parts[parts.length - 1];
    return FILES.filter((f) => !f.hidden && f.name.startsWith(last)).map((f) => prefix + f.name);
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !busy && win.classList.contains("maximized")) toggleMaximize();
    if (busy && e.key !== "Enter") skipTyping = true;
    if (e.key === "ArrowUp" && hIndex > 0) {
      e.preventDefault();
      input.value = cmdHistory[--hIndex];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIndex = Math.min(cmdHistory.length, hIndex + 1);
      input.value = cmdHistory[hIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = complete(input.value);
      if (matches.length === 1) input.value = matches[0];
      else if (matches.length > 1) {
        const shown = matches.map((m) => m.split(" ").pop());
        print(`<span class="p">${esc(promptText)}</span> ${esc(input.value)}\n${esc(shown.join("  "))}`, { instant: true });
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = "";
    }
  });

  // Clicking the terminal focuses input (and skips typing), unless selecting text or clicking a link.
  body.addEventListener("click", (e) => {
    if (busy) skipTyping = true;
    if (e.target.closest("a") || window.getSelection().toString()) return;
    input.focus();
  });

  // Tap-friendly buttons for mobile and less keyboard-inclined visitors.
  const quick = document.querySelector(".quick");
  ["help", "ls", "about", "projects", "experience", "blog", "skills", "contact"].forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c;
    b.addEventListener("click", () => { run(c); input.focus({ preventScroll: true }); });
    quick.appendChild(b);
  });

  // ---------- Boot ----------
  renderHero();
  renderSimple();
  setMode(root.dataset.mode);
  enqueue(() => print(
    `${span("c-green", `Welcome! I'm ${D.name}.`)} This terminal is my portfolio.\n\n` +
    `Type ${span("c-green", "help")} to see commands, or ${span("c-green", "ls")} to look around.\n` +
    `${span("c-dim", "Not a terminal person? Click the red button above to close this window.")}\n`
  ));
})();
