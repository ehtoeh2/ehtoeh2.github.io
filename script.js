const header = document.querySelector("[data-header]");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const copyButton = document.querySelector("[data-copy-email]");
const copyStatus = document.querySelector("[data-copy-status]");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const sectionMap = navLinks
  .map((link) => {
    const id = link.getAttribute("href");
    return id && id.startsWith("#") ? [link, document.querySelector(id)] : null;
  })
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-30% 0px -55% 0px",
    threshold: [0.15, 0.35, 0.55],
  },
);

sectionMap.forEach(([, section]) => observer.observe(section));

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
