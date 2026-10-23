(function () {
  const D = window.PORTFOLIO;
  const root = document.documentElement;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const link = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text || url)}</a>`;
  const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;
  const fmtMonth = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

  // ---------- Mode switching ----------
  const toggle = document.getElementById("mode-toggle");

  function setMode(mode) {
    root.dataset.mode = mode;
    toggle.textContent = mode === "terminal" ? "Simple view" : "Terminal view";
    toggle.setAttribute("aria-label", mode === "terminal" ? "Switch to simple view" : "Switch to terminal view");
    try { localStorage.setItem("mode", mode); } catch (e) {}
    history.replaceState(null, "", "#" + mode);
    document.title = mode === "terminal" ? `${D.handle}@portfolio: ~` : `${D.name} · ${D.role}`;
    if (mode === "terminal") input.focus({ preventScroll: true });
  }

  toggle.addEventListener("click", () => setMode(root.dataset.mode === "terminal" ? "simple" : "terminal"));

  // ---------- Simple mode ----------
  function renderSimple() {
    const c = D.contact;
    document.getElementById("simple").innerHTML = `
      <header>
        <h1>${esc(D.name)}</h1>
        <p class="role">${esc(D.role)} · ${esc(D.location)}</p>
        <p class="tagline">${esc(D.tagline)}</p>
        <div class="links">
          <a href="mailto:${esc(c.email)}">Email</a>
          ${link(c.github, "GitHub")}
          ${link(c.linkedin, "LinkedIn")}
          ${link(D.blog.url, "Blog")}
          ${D.resume ? link(D.resume, "Résumé") : ""}
        </div>
      </header>
      <section>
        <h2>About</h2>
        ${D.about.map((p) => `<p>${esc(p)}</p>`).join("")}
      </section>
      <section>
        <h2>Projects</h2>
        ${D.projects.map((p) => `
          <div class="item">
            <div class="item-head">
              <span class="item-title">${p.url ? link(p.url, p.name) : esc(p.name)}</span>
              <span class="meta">${esc(p.stack)}${p.url ? "" : " · private repo"}</span>
            </div>
            <p>${esc(p.summary)}</p>
          </div>`).join("")}
      </section>
      <section>
        <h2>Writing</h2>
        ${D.blog.posts.map((b) => `
          <div class="item">
            <div class="item-head">
              <span>${link(b.url, b.title)}</span>
              <span class="meta">${esc(fmtMonth(b.date))}</span>
            </div>
          </div>`).join("")}
        <p class="more">${link(D.blog.url, "All posts →")}</p>
      </section>
      <section>
        <h2>Experience</h2>
        ${D.experience.map((e) => `
          <div class="item">
            <div class="item-head">
              <span class="item-title">${esc(e.role)}, ${esc(e.company)}</span>
              <span class="meta">${esc(e.period)}</span>
            </div>
            <ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
          </div>`).join("")}
      </section>
      <section>
        <h2>Skills</h2>
        <div class="tags">${Object.values(D.skills).flat().map((s) => `<span>${esc(s)}</span>`).join("")}</div>
      </section>
      <section>
        <h2>Education</h2>
        ${D.education.map((e) => `
          <div class="item">
            <div class="item-head">
              <span class="item-title">${esc(e.degree)}</span>
              <span class="meta">${esc(e.period)}</span>
            </div>
            <p class="meta">${esc(e.school)} · ${esc(e.note)}</p>
          </div>`).join("")}
      </section>`;
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
  renderSimple();
  setMode(root.dataset.mode);
  enqueue(() => print(
    `${span("c-green", `Welcome! I'm ${D.name}.`)} ${esc(D.tagline)}\n\n` +
    `Type ${span("c-green", "help")} to see commands, or ${span("c-green", "ls")} to look around.\n` +
    `${span("c-dim", "Not a terminal person? Use the 'Simple view' button at the top right.")}\n`
  ));
})();
