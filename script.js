const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navToggleLabel = navToggle?.querySelector(".sr-only");
const copyEmailButton = document.querySelector("[data-copy-email]");

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

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("Unable to copy email");
  }
};

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.email;
  if (!email) return;

  const defaultLabel = copyEmailButton.textContent;

  try {
    await copyText(email);
    copyEmailButton.textContent = "Email copied";
  } catch {
    copyEmailButton.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    copyEmailButton.textContent = defaultLabel;
  }, 2200);
});
