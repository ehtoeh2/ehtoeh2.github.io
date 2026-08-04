const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navToggleLabel = navToggle?.querySelector(".sr-only");
const copyButton = document.querySelector("[data-copy-email]");
const copyStatus = document.querySelector("[data-copy-status]");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 24);
};

const setNavigationOpen = (open) => {
  if (!nav || !navToggle) return;

  nav.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);

  if (navToggleLabel) {
    navToggleLabel.textContent = open ? "Close navigation" : "Open navigation";
  }
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

navToggle?.addEventListener("click", () => {
  setNavigationOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setNavigationOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNavigationOpen(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setNavigationOpen(false);
});

copyButton?.addEventListener("click", async () => {
  const email = "ehtoeh2@korea.ac.kr";

  try {
    await navigator.clipboard.writeText(email);
    if (copyStatus) copyStatus.textContent = "Email copied.";
  } catch {
    if (copyStatus) copyStatus.textContent = email;
  }

  window.setTimeout(() => {
    if (copyStatus) copyStatus.textContent = "";
  }, 2600);
});
