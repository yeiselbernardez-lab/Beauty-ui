import { supabase } from "./supabaseClient.js";
import "../styles.css";

const screenButtons = document.querySelectorAll(".bottom-nav__item");
const screens = document.querySelectorAll(".screen");
const focusButtons = document.querySelectorAll(".nav-card");

const dynamicTitle = document.getElementById("dynamic-title");
const dynamicDescription = document.getElementById("dynamic-description");
const ritualListTitle = document.getElementById("ritual-list-title");
const ritualList = document.getElementById("ritual-list");
const ritualSummary = document.getElementById("ritual-summary");
const refreshButton = document.getElementById("refresh-btn");
const saveCategoryButton = document.getElementById("save-category-btn");
const deleteCategoryButton = document.getElementById("delete-category-btn");
const statusBox = document.getElementById("status-box");
const loadingText = document.getElementById("loading-text");
const errorText = document.getElementById("error-text");

const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

const ritualCatalog = {
  "Skin Care": {
    description:
      "Glow-focused rituals for hydration, barrier health, brightening, and long-term comfort.",
    rituals: [
      "Double cleanse at night",
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
      "Hydrating mist refresh",
    ],
  },
  Makeup: {
    description:
      "Polished rituals to prep, apply, refresh, and remove makeup while keeping skin healthy.",
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
      "Deep conditioner weekly",
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
      "Weekly nail shaping",
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
      "Sanitized tool care",
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
      "Nighttime oral care",
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
const selectedByCategory = Object.fromEntries(
  categoryNames.map((name) => [name, new Set()]),
);

let activeCategory = categoryNames[0];

function setStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.className = `status status--${type}`;
}

function setActiveScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === screenId);
  });

  screenButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screen === screenId);
  });
}

function updateSummary() {
  const total = Object.values(selectedByCategory).reduce(
    (count, set) => count + set.size,
    0,
  );
  ritualSummary.textContent = `${total} ritual${total === 1 ? "" : "s"} selected`;
}

function renderRitualList() {
  ritualList.innerHTML = "";
  const data = ritualCatalog[activeCategory];
  const selectedSet = selectedByCategory[activeCategory];

  dynamicTitle.textContent = `${activeCategory} Rituals`;
  dynamicDescription.textContent = data.description;
  ritualListTitle.textContent = `Try these ${activeCategory} rituals`;

  data.rituals.forEach((ritualName) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ritual-item";
    btn.setAttribute("aria-pressed", selectedSet.has(ritualName) ? "true" : "false");

    if (selectedSet.has(ritualName)) {
      btn.classList.add("is-selected");
    }

    btn.innerHTML = `
      <span class="ritual-item__text">${ritualName}</span>
      <span class="ritual-item__check" aria-hidden="true">✓</span>
    `;

    btn.addEventListener("click", () => {
      if (selectedSet.has(ritualName)) {
        selectedSet.delete(ritualName);
      } else {
        selectedSet.add(ritualName);
      }
      renderRitualList();
      updateSummary();
    });

    ritualList.appendChild(btn);
  });
}

function setActiveCategory(category) {
  if (!ritualCatalog[category]) return;
  activeCategory = category;

  focusButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.focus === category);
  });

  renderRitualList();
}

function hydrateSelections(records) {
  Object.values(selectedByCategory).forEach((set) => set.clear());

  records.forEach((record) => {
    if (selectedByCategory[record.category]) {
      selectedByCategory[record.category].add(record.ritual_name);
    }
  });

  renderRitualList();
  updateSummary();
}

async function readRituals() {
  loadingText.hidden = false;
  errorText.hidden = true;

  const { data, error } = await supabase
    .from("user_rituals")
    .select("category, ritual_name, is_active")
    .eq("user_id", DEMO_USER_ID)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("ritual_name", { ascending: true });

  loadingText.hidden = true;

  if (error) {
    errorText.hidden = false;
    errorText.textContent = error.message;
    setStatus("Unable to load rituals from Supabase.", "error");
    return;
  }

  hydrateSelections(data ?? []);
  setStatus("Rituals loaded from Supabase.", "success");
}

async function createOrUpdateRitualsForCategory() {
  const selectedSet = selectedByCategory[activeCategory];
  const categoryRituals = ritualCatalog[activeCategory].rituals;

  const records = categoryRituals.map((ritualName) => ({
    user_id: DEMO_USER_ID,
    category: activeCategory,
    ritual_name: ritualName,
    is_active: selectedSet.has(ritualName),
  }));

  const { error } = await supabase.from("user_rituals").upsert(records, {
    onConflict: "user_id,category,ritual_name",
  });

  if (error) {
    setStatus(`Save failed: ${error.message}`, "error");
    return;
  }

  setStatus(`Saved ${activeCategory} rituals successfully.`, "success");
}

async function deleteRitualsForCategory() {
  const { error } = await supabase
    .from("user_rituals")
    .delete()
    .eq("user_id", DEMO_USER_ID)
    .eq("category", activeCategory);

  if (error) {
    setStatus(`Delete failed: ${error.message}`, "error");
    return;
  }

  selectedByCategory[activeCategory].clear();
  renderRitualList();
  updateSummary();
  setStatus(`${activeCategory} rituals deleted from database.`, "success");
}

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveScreen(button.dataset.screen);
  });
});

focusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.focus;
    setActiveCategory(category);
    setActiveScreen("second-screen");
  });
});

refreshButton.addEventListener("click", readRituals);
saveCategoryButton.addEventListener("click", createOrUpdateRitualsForCategory);
deleteCategoryButton.addEventListener("click", deleteRitualsForCategory);

setActiveCategory(activeCategory);
updateSummary();
setStatus("Connect Supabase and click Load from DB.", "info");
