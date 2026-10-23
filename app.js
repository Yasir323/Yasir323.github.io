(function () {
  const D = window.PORTFOLIO;
  const root = document.documentElement;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const link = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text || url)}</a>`;
  const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;

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
              <span class="meta">${esc(b.date)}</span>
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

  document.querySelector(".prompt").textContent = promptText;
  document.querySelector(".term-title").textContent = `${D.handle}@portfolio: ~`;

  const commands = {
    help: {
      desc: "list available commands",
      run: () => Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .map(([name, c]) => `  ${span("c-green", name.padEnd(12))}${esc(c.desc)}`)
        .join("\n"),
    },
    about: { desc: "who I am", run: () => `${span("c-yellow", D.name)} — ${esc(D.role)}, ${esc(D.location)}\n\n${D.about.map(esc).join("\n")}` },
    projects: {
      desc: "things I've built",
      run: () => D.projects.map((p, i) =>
        `${span("c-dim", `[${i + 1}]`)} ${span("c-blue", p.name)}  ${span("c-dim", p.stack)}  ${p.url ? link(p.url, "↗ source") : span("c-dim", "(private repo)")}\n    ${esc(p.summary)}`
      ).join("\n\n") + `\n\n${span("c-dim", "Tip: 'open 1' opens a project.")}`,
    },
    open: {
      desc: "open a project by number",
      run: (args) => {
        const p = D.projects[parseInt(args[0], 10) - 1];
        if (!p) return span("c-red", `usage: open <1-${D.projects.length}>`);
        if (!p.url) return `${esc(p.name)} is a private repo. Ask me about it: ${span("c-green", "contact")}`;
        window.open(p.url, "_blank", "noopener");
        return `Opening ${esc(p.name)}…`;
      },
    },
    experience: {
      desc: "where I've worked",
      run: () => D.experience.map((e) =>
        `${span("c-yellow", e.role)} @ ${esc(e.company)} ${span("c-dim", `(${e.period})`)}\n${e.highlights.map((h) => `  - ${esc(h)}`).join("\n")}`
      ).join("\n\n"),
    },
    skills: {
      desc: "tools I use",
      run: () => Object.entries(D.skills).map(([k, v]) => `${span("c-green", (k + ":").padEnd(12))}${esc(v.join(", "))}`).join("\n"),
    },
    blog: {
      desc: "things I've written",
      run: () => D.blog.posts.map((b) => `${span("c-dim", b.date.padEnd(10))}${link(b.url, b.title)}`).join("\n") + `\n\nAll posts: ${link(D.blog.url)}`,
    },
    education: {
      desc: "where I studied",
      run: () => D.education.map((e) => `${span("c-yellow", e.degree)} ${span("c-dim", `(${e.period})`)}\n  ${esc(e.school)} · ${esc(e.note)}`).join("\n\n"),
    },
    contact: {
      desc: "how to reach me",
      run: () => {
        const c = D.contact;
        return [
          `${span("c-green", "email".padEnd(10))}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`,
          `${span("c-green", "github".padEnd(10))}${link(c.github)}`,
          `${span("c-green", "linkedin".padEnd(10))}${link(c.linkedin)}`,
          `${span("c-green", "blog".padEnd(10))}${link(D.blog.url)}`,
        ].join("\n");
      },
    },
    resume: {
      desc: "download my résumé",
      run: () => (D.resume ? `Résumé: ${link(D.resume)}` : span("c-dim", "No résumé linked yet.")),
    },
    simple: { desc: "switch to the simple view", run: () => { setTimeout(() => setMode("simple"), 300); return "Switching to simple view…"; } },
    clear: { desc: "clear the screen", run: () => { out.innerHTML = ""; return null; } },
    whoami: { hidden: true, desc: "", run: () => "guest — but welcome anyway." },
    ls: { hidden: true, desc: "", run: () => span("c-blue", "projects/  ") + "blog/  about.md  experience.md  education.md  skills.md  contact.txt" + (D.resume ? "  resume.pdf" : "") },
    sudo: { hidden: true, desc: "", run: () => span("c-red", "Permission denied. Nice try though.") },
  };

  // Common aliases people try first.
  const aliases = { "?": "help", "ls blog": "blog", "cd blog": "blog", posts: "blog", "cat about.md": "about", "cd projects": "projects", "ls projects": "projects", gui: "simple", exit: "simple" };

  function print(html, cls) {
    const div = document.createElement("div");
    if (cls) div.className = cls;
    div.innerHTML = html;
    out.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  const cmdHistory = [];
  let hIndex = 0;

  function run(raw) {
    const line = raw.trim();
    print(`<span class="p">${esc(promptText)}</span> ${esc(line)}`, "cmd-echo");
    if (!line) return;
    cmdHistory.push(line);
    hIndex = cmdHistory.length;

    const resolved = aliases[line.toLowerCase()] || line;
    const [name, ...args] = resolved.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    const result = cmd ? cmd.run(args) : `${span("c-red", "command not found:")} ${esc(name)}. Type ${span("c-green", "help")}.`;
    if (result !== null) print(result + "\n");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hIndex > 0) {
      e.preventDefault();
      input.value = cmdHistory[--hIndex];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIndex = Math.min(cmdHistory.length, hIndex + 1);
      input.value = cmdHistory[hIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const v = input.value.toLowerCase();
      const matches = Object.keys(commands).filter((c) => !commands[c].hidden && c.startsWith(v));
      if (matches.length === 1) input.value = matches[0];
      else if (matches.length > 1) print(`<span class="p">${esc(promptText)}</span> ${esc(input.value)}\n${matches.join("  ")}`);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = "";
    }
  });

  // Clicking anywhere in the terminal focuses input, unless the user is selecting text or clicking a link.
  body.addEventListener("click", (e) => {
    if (e.target.closest("a") || window.getSelection().toString()) return;
    input.focus();
  });

  // Tap-friendly buttons for mobile and less keyboard-inclined visitors.
  const quick = document.querySelector(".quick");
  ["help", "about", "projects", "experience", "blog", "skills", "contact"].forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c;
    b.addEventListener("click", () => { run(c); input.focus({ preventScroll: true }); });
    quick.appendChild(b);
  });

  // ---------- Boot ----------
  renderSimple();
  print(
    `${span("c-green", `Welcome! I'm ${D.name}.`)} ${esc(D.tagline)}\n\n` +
    `Type ${span("c-green", "help")} to see commands, or tap one below.\n` +
    `${span("c-dim", "Not a terminal person? Use the 'Simple view' button at the top right.")}\n`
  );
  setMode(root.dataset.mode);
})();
