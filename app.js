(() => {
  // ---------- Theme (default DARK) ----------
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");

  const THEME_KEY = "theme_pref_v2"; // new key to avoid old saved light mode

  function setTheme(theme){
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeBtn) themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
  }

  // Default to dark unless user explicitly changed it (under the new key)
  setTheme(localStorage.getItem(THEME_KEY) || "dark");

  themeBtn?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "light" ? "dark" : "light");
  });

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  menuBtn?.addEventListener("click", () => {
    const open = !mobileNav.hasAttribute("hidden");
    if (open){
      mobileNav.setAttribute("hidden", "");
      menuBtn.setAttribute("aria-expanded", "false");
    } else {
      mobileNav.removeAttribute("hidden");
      menuBtn.setAttribute("aria-expanded", "true");
    }
  });

  mobileNav?.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileNav.setAttribute("hidden", "");
      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  // ---------- Active nav highlight ----------
  const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a, #mobileNav a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === currentFile) a.classList.add("active");
  });

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // ---------- Tickets (local success message) ----------
  const form = document.querySelector("form[data-demo-form]");
  if (form){
    const msg = document.getElementById("formMsg");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const name = form.querySelector("#name")?.value?.trim() || "Thanks";
      if (msg){
        msg.textContent = `Thanks ${name}! Your request was received ✅`;
        msg.classList.add("show");
      }

      form.reset();
      setTimeout(() => msg?.classList.remove("show"), 3200);
    });
  }

  // ---------- Players ----------
  const playersBody = document.getElementById("playersBody");
  if (!playersBody) return;

  const countEl = document.getElementById("playersCount");
  const searchEl = document.getElementById("search");
  const sortEl = document.getElementById("sort");
  const chips = Array.from(document.querySelectorAll("[data-pos]"));

  const FALLBACK_PLAYERS = [
    { name:"Robert Lewandowski", number:9, nationality:"Poland", age:36, position:"Forward" },
    { name:"Ferran Torres", number:7, nationality:"Spain", age:24, position:"Forward" },
    { name:"João Félix", number:14, nationality:"Portugal", age:25, position:"Forward" },
    { name:"Raphinha", number:11, nationality:"Brazil", age:29, position:"Forward" },
    { name:"Lamine Yamal", number:27, nationality:"Spain", age:17, position:"Forward" },

    { name:"Pedri", number:8, nationality:"Spain", age:22, position:"Midfielder" },
    { name:"İlkay Gündoğan", number:22, nationality:"Germany", age:34, position:"Midfielder" },
    { name:"Sergi Roberto", number:20, nationality:"Spain", age:31, position:"Midfielder" },
    { name:"Gavi", number:6, nationality:"Spain", age:19, position:"Midfielder" },
    { name:"Frenkie De Jong", number:21, nationality:"Netherlands", age:26, position:"Midfielder" },
    { name:"Oriol Romeu", number:18, nationality:"Spain", age:32, position:"Midfielder" },
    { name:"Abdelrahman Alashel", number:30, nationality:"Jordan", age:21, position:"Midfielder" },

    { name:"Andreas Christensen", number:15, nationality:"Denmark", age:29, position:"Defender" },
    { name:"Alejandro Balde", number:3, nationality:"Spain", age:19, position:"Defender" },
    { name:"Ronald Araújo", number:4, nationality:"Uruguay", age:24, position:"Defender" },
    { name:"João Cancelo", number:2, nationality:"Portugal", age:28, position:"Defender" },
    { name:"Jules Koundé", number:23, nationality:"France", age:25, position:"Defender" },
    { name:"Marcos Alonso", number:17, nationality:"Spain", age:33, position:"Defender" },

    { name:"Marc-André ter Stegen", number:1, nationality:"Germany", age:31, position:"Goalkeeper" },
    { name:"Iñaki Peña", number:13, nationality:"Spain", age:24, position:"Goalkeeper" },
    { name:"Ander Astralaga", number:26, nationality:"Spain", age:20, position:"Goalkeeper" }
  ];

  async function loadPlayers(){
    try{
      const res = await fetch("data/players.json", { cache: "no-store" });
      if(!res.ok) throw new Error("Bad response");
      const data = await res.json();
      if(!Array.isArray(data)) throw new Error("Bad JSON");
      return data;
    }catch{
      return FALLBACK_PLAYERS;
    }
  }

  let allPlayers = [];
  let state = { pos: "All", q: "", sort: "name-asc" };

  function normalize(s){ return String(s || "").toLowerCase().trim(); }

  function applyFilterSort(players){
    let out = [...players];

    if(state.pos !== "All"){
      out = out.filter(p => p.position === state.pos);
    }

    if(state.q){
      const q = normalize(state.q);
      out = out.filter(p =>
        normalize(p.name).includes(q) ||
        normalize(p.nationality).includes(q) ||
        String(p.number).includes(q)
      );
    }

    const [key, dir] = state.sort.split("-");
    const mul = dir === "desc" ? -1 : 1;

    out.sort((a,b) => {
      let va = a[key];
      let vb = b[key];
      if(key === "name" || key === "nationality" || key === "position"){
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
        return va.localeCompare(vb) * mul;
      }
      return (Number(va) - Number(vb)) * mul;
    });

    return out;
  }

  function render(players){
    playersBody.innerHTML = players.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.number}</td>
        <td>${p.nationality}</td>
        <td>${p.age}</td>
        <td><span class="pill">${p.position}</span></td>
      </tr>
    `).join("");

    if(countEl) countEl.textContent = `${players.length} players`;
  }

  function setChipActive(){
    chips.forEach(c => c.classList.toggle("active", c.dataset.pos === state.pos));
  }

  chips.forEach(c => {
    c.addEventListener("click", () => {
      state.pos = c.dataset.pos;
      setChipActive();
      render(applyFilterSort(allPlayers));
    });
  });

  searchEl?.addEventListener("input", () => {
    state.q = searchEl.value;
    render(applyFilterSort(allPlayers));
  });

  sortEl?.addEventListener("change", () => {
    state.sort = sortEl.value;
    render(applyFilterSort(allPlayers));
  });

  (async () => {
    allPlayers = await loadPlayers();
    setChipActive();
    render(applyFilterSort(allPlayers));
  })();
})();
