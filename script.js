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

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const previousButton = carousel.querySelector("[data-carousel-previous]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const currentLabel = carousel.querySelector("[data-carousel-current]");
  const totalLabel = carousel.querySelector("[data-carousel-total]");
  const kickerLabel = carousel.querySelector("[data-carousel-kicker]");
  const captionLabel = carousel.querySelector("[data-carousel-caption]");
  const panels = Array.from(carousel.querySelectorAll("[data-carousel-panel]"));

  if (!slides.length) return;

  let currentIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let touchStartX = null;

  const showSlide = (nextIndex) => {
    currentIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));

    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.toggleAttribute("inert", !isActive);
    });

    panels.forEach((panel, index) => {
      const isActive = index === currentIndex;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
    });

    const activeSlide = slides[currentIndex];
    if (currentLabel) currentLabel.textContent = String(currentIndex + 1);
    if (totalLabel) totalLabel.textContent = String(slides.length);
    if (kickerLabel) kickerLabel.textContent = activeSlide.dataset.kicker || "";
    if (captionLabel) captionLabel.textContent = activeSlide.dataset.caption || "";

    if (previousButton) previousButton.disabled = currentIndex === 0;
    if (nextButton) nextButton.disabled = currentIndex === slides.length - 1;
  };

  carousel.classList.toggle("is-single", slides.length === 1);
  previousButton?.addEventListener("click", () => showSlide(currentIndex - 1));
  nextButton?.addEventListener("click", () => showSlide(currentIndex + 1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(currentIndex + 1);
    }
  });

  carousel.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches.length === 1 ? event.touches[0].clientX : null;
    },
    { passive: true },
  );

  carousel.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null || event.changedTouches.length !== 1) return;

      const distance = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;

      if (Math.abs(distance) < 44) return;
      carousel.dataset.lastSwipe = String(Date.now());
      showSlide(currentIndex + (distance < 0 ? 1 : -1));
    },
    { passive: true },
  );

  showSlide(currentIndex);
});

const imageLightbox = document.querySelector("[data-image-lightbox]");
const imageLightboxImage = imageLightbox?.querySelector("[data-image-lightbox-image]");
const imageLightboxClose = imageLightbox?.querySelector("[data-image-lightbox-close]");
const imageLightboxPrevious = imageLightbox?.querySelector("[data-image-lightbox-previous]");
const imageLightboxNext = imageLightbox?.querySelector("[data-image-lightbox-next]");
const imageLightboxCurrent = imageLightbox?.querySelector("[data-image-lightbox-current]");
const imageLightboxTotal = imageLightbox?.querySelector("[data-image-lightbox-total]");
let imageLightboxTrigger = null;
let imageLightboxImages = [];
let imageLightboxIndex = 0;

const renderImageLightbox = () => {
  const image = imageLightboxImages[imageLightboxIndex];
  if (!imageLightbox || !imageLightboxImage || !image) return;

  imageLightboxImage.src = image.currentSrc || image.src;
  imageLightboxImage.alt = image.alt;
  imageLightbox.classList.toggle("is-single", imageLightboxImages.length <= 1);

  if (imageLightboxCurrent) imageLightboxCurrent.textContent = String(imageLightboxIndex + 1);
  if (imageLightboxTotal) imageLightboxTotal.textContent = String(imageLightboxImages.length);
  if (imageLightboxPrevious) imageLightboxPrevious.disabled = imageLightboxIndex === 0;
  if (imageLightboxNext) {
    imageLightboxNext.disabled = imageLightboxIndex === imageLightboxImages.length - 1;
  }
};

const navigateImageLightbox = (direction) => {
  const nextIndex = Math.max(
    0,
    Math.min(imageLightboxIndex + direction, imageLightboxImages.length - 1),
  );
  if (nextIndex === imageLightboxIndex) return;

  const carousel = imageLightboxTrigger?.closest("[data-carousel]");
  const carouselControl = carousel?.querySelector(
    direction < 0 ? "[data-carousel-previous]" : "[data-carousel-next]",
  );
  carouselControl?.click();

  imageLightboxIndex = nextIndex;
  imageLightboxTrigger = imageLightboxImages[imageLightboxIndex];
  renderImageLightbox();
};

const cleanUpImageLightbox = () => {
  document.body.classList.remove("lightbox-open");
  imageLightboxImage?.removeAttribute("src");

  if (imageLightboxTrigger?.isConnected) {
    imageLightboxTrigger.focus({ preventScroll: true });
  }

  imageLightboxTrigger = null;
  imageLightboxImages = [];
  imageLightboxIndex = 0;
};

const closeImageLightbox = () => {
  if (!imageLightbox) return;

  if (imageLightbox.open && typeof imageLightbox.close === "function") {
    imageLightbox.close();
    return;
  }

  imageLightbox.removeAttribute("open");
  cleanUpImageLightbox();
};

const openImageLightbox = (image) => {
  if (!imageLightbox || !imageLightboxImage) return;

  const carousel = image.closest("[data-carousel]");
  const lastSwipe = Number(carousel?.dataset.lastSwipe || 0);
  if (Date.now() - lastSwipe < 500) return;

  imageLightboxTrigger = image;
  imageLightboxImages = Array.from(
    carousel?.querySelectorAll("[data-carousel-slide] img") || [image],
  );
  imageLightboxIndex = Math.max(0, imageLightboxImages.indexOf(image));
  renderImageLightbox();
  document.body.classList.add("lightbox-open");

  if (typeof imageLightbox.showModal === "function") {
    imageLightbox.showModal();
  } else {
    imageLightbox.setAttribute("open", "");
  }

  imageLightboxClose?.focus();
};

if (imageLightbox && imageLightboxImage) {
  document.querySelectorAll(".research-project-gallery .carousel-slide img").forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-haspopup", "dialog");
    image.setAttribute("aria-label", `Enlarge image: ${image.alt}`);
    image.setAttribute("draggable", "false");

    image.addEventListener("click", () => openImageLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openImageLightbox(image);
    });
  });

  imageLightboxClose?.addEventListener("click", closeImageLightbox);
  imageLightboxPrevious?.addEventListener("click", () => navigateImageLightbox(-1));
  imageLightboxNext?.addEventListener("click", () => navigateImageLightbox(1));
  imageLightboxImage.addEventListener("click", closeImageLightbox);
  imageLightbox.addEventListener("click", (event) => {
    if (event.target === imageLightbox) closeImageLightbox();
  });
  imageLightbox.addEventListener("close", cleanUpImageLightbox);
  document.addEventListener("keydown", (event) => {
    if (!imageLightbox.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeImageLightbox();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateImageLightbox(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateImageLightbox(1);
    }
  });
}
