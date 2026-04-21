const screenButtons = document.querySelectorAll(".bottom-nav__item");
const screens = document.querySelectorAll(".screen");
const focusButtons = document.querySelectorAll(".nav-card");
const topActionButtons = document.querySelectorAll(".top-action");
const challengeButton = document.getElementById("challenge-button");
const editProfileButton = document.getElementById("edit-profile-btn");

const dynamicTitle = document.getElementById("dynamic-title");
const dynamicDescription = document.getElementById("dynamic-description");
const ritualCategories = document.getElementById("ritual-categories");
const ritualList = document.getElementById("ritual-list");
const ritualListTitle = document.getElementById("ritual-list-title");
const clearRitualsButton = document.getElementById("clear-rituals-btn");
const selectionSummary = document.getElementById("selection-summary");
const selectionCount = document.getElementById("selection-count");
const feedbackArea = document.getElementById("interaction-feedback");

const ritualCatalog = {
  "Skin Care": {
    description:
      "Glow-focused rituals for hydration, barrier health, brightening, and long-term skin comfort.",
    rituals: [
      "Double cleanse at night",
      "Gentle gel cleanse in the morning",
      "Hydrating toner layering",
      "Vitamin C serum application",
      "Niacinamide balancing treatment",
      "Ceramide barrier moisturizer",
      "Daily broad-spectrum SPF 50",
      "Weekly enzyme exfoliation",
      "Cooling under-eye patches",
      "Face massage with gua sha",
      "Overnight moisture sleeping mask",
      "Lip scrub and balm ritual",
      "Targeted spot treatment",
      "Neck and chest skincare extension",
      "Weekly sheet mask hydration",
    ],
  },
  Makeup: {
    description:
      "Polished rituals to prep, apply, refresh, and remove makeup while caring for skin.",
    rituals: [
      "Hydrating primer prep",
      "Color-correct base routine",
      "Lightweight skin tint blend",
      "Concealer spot-correct pass",
      "Cream blush layering",
      "Soft contour definition",
      "Highlighter glow placement",
      "Brow shape and set",
      "Neutral eye shadow blend",
      "Tightline eyeliner technique",
      "Lengthening mascara coat",
      "Lip liner + gloss combo",
      "Makeup setting mist seal",
      "Midday touch-up ritual",
      "Gentle makeup removal sequence",
    ],
  },
  "Hair Care": {
    description:
      "Scalp, strand, and styling rituals designed for stronger, shinier, low-damage hair.",
    rituals: [
      "Scalp oil pre-wash massage",
      "Sulfate-free cleansing routine",
      "Deep conditioner once weekly",
      "Protein mask treatment",
      "Leave-in conditioner application",
      "Heat protectant before styling",
      "Microfiber towel drying",
      "Low-heat blowout method",
      "Weekly clarifying wash",
      "Silk pillowcase protection",
      "Overnight braid preservation",
      "Frizz-control serum finish",
      "Edge and baby hair care",
      "Split-end trimming schedule",
      "Scalp tonic hydration",
    ],
  },
  "Nail Care": {
    description:
      "Fingernail and cuticle rituals to build strength, cleanliness, and a healthy polished look.",
    rituals: [
      "Gentle nail cleansing",
      "Weekly nail shaping session",
      "Cuticle softening soak",
      "Cuticle oil massage",
      "Strengthening base coat",
      "Breathable polish application",
      "Top-coat sealing routine",
      "Nail bed hydration cream",
      "Buffing for natural shine",
      "Hands SPF protection",
      "Night hand mask ritual",
      "Biotin-support meal planning",
      "Acetone-free polish removal",
      "Sanitized tool care routine",
      "Hangnail prevention treatment",
    ],
  },
  Hygiene: {
    description:
      "Daily freshness and body-care rituals for cleanliness, confidence, and personal comfort.",
    rituals: [
      "Morning body cleanse",
      "Evening refresh shower",
      "Gentle body exfoliation",
      "Moisturizing body lotion",
      "Underarm care routine",
      "Oral care two-minute brushing",
      "Tongue and floss ritual",
      "Hydrating hand-wash follow-up",
      "Clean towel replacement cycle",
      "Workout hygiene reset",
      "Intimate care best-practice cleanse",
      "Foot wash and dry ritual",
      "Fresh clothing rotation",
      "Bedding hygiene schedule",
      "Nighttime oral care complete",
    ],
  },
  Wellness: {
    description:
      "Mind-body rituals that support stress relief, sleep quality, movement, and emotional balance.",
    rituals: [
      "Morning breathwork set",
      "5-minute gratitude journaling",
      "Gentle wake-up stretches",
      "Hydration tracking habit",
      "Balanced breakfast ritual",
      "Midday movement break",
      "Posture reset reminder",
      "Sunlight exposure walk",
      "Digital detox interval",
      "Evening herbal tea unwind",
      "Guided meditation session",
      "Foam rolling tension release",
      "Sleep wind-down routine",
      "Weekly self-reflection check-in",
      "Affirmation and intention setting",
    ],
  },
};

const categoryNames = Object.keys(ritualCatalog);
const selectedByCategory = Object.fromEntries(categoryNames.map((name) => [name, new Set()]));
let activeCategory = categoryNames[0];

function showFeedback(message) {
  if (!feedbackArea) return;

  feedbackArea.textContent = message;
  feedbackArea.classList.add("is-visible");
  window.clearTimeout(showFeedback.hideTimer);
  showFeedback.hideTimer = window.setTimeout(() => {
    feedbackArea.classList.remove("is-visible");
  }, 2100);
}

function getTotalSelections() {
  return Object.values(selectedByCategory).reduce((sum, selectionSet) => sum + selectionSet.size, 0);
}

function setActiveScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === screenId);
  });

  screenButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screen === screenId);
  });
}

function updateProgressSummary() {
  const total = getTotalSelections();
  const categoriesUsed = Object.values(selectedByCategory).filter((selectionSet) => selectionSet.size > 0).length;
  const totalOptions = categoryNames.length * 15;
  const progressPercent = Math.min((total / totalOptions) * 100, 100);

  selectionSummary.textContent = `${total} ritual${total === 1 ? "" : "s"} selected across ${categoriesUsed} categor${
    categoriesUsed === 1 ? "y" : "ies"
  }.`;
  selectionCount.textContent = total > 99 ? "99+" : String(total);
  selectionCount.dataset.progress = String(total);
  selectionCount.style.setProperty("--progress-angle", `${progressPercent}%`);
}

function renderRitualCategories() {
  ritualCategories.innerHTML = "";

  categoryNames.forEach((categoryName) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ritual-category-btn";
    button.textContent = categoryName;
    button.dataset.category = categoryName;
    button.setAttribute("aria-pressed", String(categoryName === activeCategory));

    if (categoryName === activeCategory) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      activeCategory = categoryName;
      updateCategoryView();
      showFeedback(`${categoryName} rituals ready to choose.`);
    });

    ritualCategories.appendChild(button);
  });
}

function renderRitualList() {
  const categoryData = ritualCatalog[activeCategory];
  const selectedRituals = selectedByCategory[activeCategory];

  ritualList.innerHTML = "";

  categoryData.rituals.forEach((ritualName) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "ritual-item";
    item.dataset.ritual = ritualName;
    item.setAttribute("aria-pressed", String(selectedRituals.has(ritualName)));

    if (selectedRituals.has(ritualName)) {
      item.classList.add("is-selected");
    }

    item.innerHTML = `<span class="ritual-item__text">${ritualName}</span><span class="ritual-item__check" aria-hidden="true">✓</span>`;

    item.addEventListener("click", () => {
      if (selectedRituals.has(ritualName)) {
        selectedRituals.delete(ritualName);
      } else {
        selectedRituals.add(ritualName);
      }

      updateCategoryView();
      showFeedback(
        selectedRituals.has(ritualName) ? `${ritualName} added to your plan.` : `${ritualName} removed from your plan.`,
      );
    });

    ritualList.appendChild(item);
  });
}

function updateCategoryView() {
  const categoryData = ritualCatalog[activeCategory];
  dynamicTitle.textContent = `${activeCategory} Rituals`;
  dynamicDescription.textContent = categoryData.description;
  ritualListTitle.textContent = `Try these ${activeCategory} rituals`;
  renderRitualCategories();
  renderRitualList();
  updateProgressSummary();
}

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveScreen(button.dataset.screen);
  });
});

topActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetScreen = button.dataset.screen;
    if (targetScreen) {
      setActiveScreen(targetScreen);
      showFeedback(`Opened ${targetScreen === "home-screen" ? "home" : "profile"} screen.`);
    }
  });
});

focusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFocus = button.dataset.focus;
    if (!ritualCatalog[selectedFocus]) return;

    activeCategory = selectedFocus;
    setActiveScreen("second-screen");
    updateCategoryView();
    showFeedback(`${selectedFocus} selected. Pick the rituals you want to try.`);
  });
});

if (challengeButton) {
  challengeButton.addEventListener("click", () => {
    setActiveScreen("second-screen");
    updateCategoryView();
    showFeedback("Choose your rituals and build today's personal care challenge.");
  });
}

if (clearRitualsButton) {
  clearRitualsButton.addEventListener("click", () => {
    Object.values(selectedByCategory).forEach((selectionSet) => selectionSet.clear());
    updateCategoryView();
    showFeedback("All selected rituals were cleared.");
  });
}

if (editProfileButton) {
  editProfileButton.addEventListener("click", () => {
    showFeedback("Profile editor coming soon. Your ritual preferences are saved.");
  });
}

updateCategoryView();
