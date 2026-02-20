(function(){
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const menuBtn = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  // Theme (saved)
  function setTheme(theme){
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if(themeBtn) themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
  }
  const saved = localStorage.getItem("theme");
  setTheme(saved || "dark");

  themeBtn?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "light" ? "dark" : "light");
  });

  // Mobile menu
  menuBtn?.addEventListener("click", () => {
    const open = !mobileNav.hasAttribute("hidden");
    if(open){
      mobileNav.setAttribute("hidden", "");
      menuBtn.setAttribute("aria-expanded", "false");
    }else{
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

  // Highlight active link
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll('.nav a, #mobileNav a').forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if(href === path) a.classList.add("active");
  });

  // Tabs (Squad page)
  const tablist = document.querySelector("[data-tabs]");
  if(tablist){
    const tabs = Array.from(tablist.querySelectorAll("[role='tab']"));
    const panels = Array.from(document.querySelectorAll("[role='tabpanel']"));

    function activate(id){
      tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.tab === id)));
      panels.forEach(p => {
        if(p.dataset.panel === id) p.classList.remove("hidden");
        else p.classList.add("hidden");
      });
    }

    tabs.forEach(t => {
      t.addEventListener("click", () => activate(t.dataset.tab));
    });

    // Default
    const defaultTab = tabs.find(t => t.getAttribute("aria-selected") === "true")?.dataset.tab || tabs[0]?.dataset.tab;
    if(defaultTab) activate(defaultTab);
  }

  // Ticket form demo submit
  const form = document.querySelector("form[data-demo-form]");
  const toast = document.getElementById("toast");
  function showToast(msg){
    if(!toast) return alert(msg);
    toast.textContent = msg;
    toast.classList.remove("hidden");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.add("hidden"), 2600);
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const required = form.querySelectorAll("[required]");
    for(const el of required){
      if(!el.value){
        el.focus();
        showToast("Please fill all required fields.");
        return;
      }
    }
    showToast("Demo form: nothing is sent. Your input was validated locally ✅");
    form.reset();
  });

  // Footer year
  const y = document.getElementById("year");
  if(y) y.textContent = new Date().getFullYear();
})();
