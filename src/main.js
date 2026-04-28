import { supabase } from "./supabaseClient.js";
import { ritualCatalog as fallbackCatalog } from "./ritualCatalog.js";
import "../styles.css";

const DEMO_PROFILE_ID = "11111111-1111-1111-1111-111111111111";

const screenButtons = document.querySelectorAll(".bottom-nav__item");
const screens = document.querySelectorAll(".screen");
const focusButtons = document.querySelectorAll(".nav-card");
const topActionButtons = document.querySelectorAll(".top-action");

const dynamicTitle = document.getElementById("dynamic-title");
const dynamicDescription = document.getElementById("dynamic-description");
const ritualCategories = document.getElementById("ritual-categories");
const ritualListTitle = document.getElementById("ritual-list-title");
const ritualList = document.getElementById("ritual-list");
const selectionSummary = document.getElementById("selection-summary");
const selectionCount = document.getElementById("selection-count");
const refreshRitualsButton = document.getElementById("refresh-rituals-btn");
const clearRitualsButton = document.getElementById("clear-rituals-btn");
const challengeButton = document.getElementById("challenge-button");
const editProfileButton = document.getElementById("edit-profile-btn");
const profileRitualCount = document.getElementById("profile-ritual-count");
const feedbackArea = document.getElementById("interaction-feedback");
const profileNameHeading = document.getElementById("profile-name");
const profileMeta = document.getElementById("profile-meta");
const profileUsernameText = document.getElementById("profile-username-text");
const usernameForm = document.getElementById("username-form");
const usernameInput = document.getElementById("username-input");
const saveUsernameButton = document.getElementById("save-username-btn");

const state = {
  categories: [],
  ritualsByCategoryName: new Map(),
  selectedRitualIds: new Set(),
  selectedByCategoryName: new Map(),
  activeCategoryName: "Skin Care",
  profile: null,
};

function showFeedback(message) {
  if (!feedbackArea) return;
  feedbackArea.textContent = message;
  feedbackArea.classList.add("is-visible");
  window.clearTimeout(showFeedback.hideTimer);
  showFeedback.hideTimer = window.setTimeout(() => {
    feedbackArea.classList.remove("is-visible");
  }, 2200);
}

function setActiveScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === screenId);
  });

  screenButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screen === screenId);
  });
}

function getRitualsForCategory(categoryName) {
  return state.ritualsByCategoryName.get(categoryName) ?? [];
}

function getTotalAvailableRituals() {
  return Array.from(state.ritualsByCategoryName.values()).reduce(
    (total, rituals) => total + rituals.length,
    0,
  );
}

function recalculateSelectedByCategory() {
  const next = new Map();
  state.categories.forEach((category) => next.set(category.name, new Set()));

  state.categories.forEach((category) => {
    const rituals = getRitualsForCategory(category.name);
    const set = next.get(category.name);
    rituals.forEach((ritual) => {
      if (state.selectedRitualIds.has(ritual.id)) {
        set.add(ritual.id);
      }
    });
  });

  state.selectedByCategoryName = next;
}

function updateSummary() {
  const totalSelected = state.selectedRitualIds.size;
  const categoriesUsed = Array.from(state.selectedByCategoryName.values()).filter(
    (selectedSet) => selectedSet.size > 0,
  ).length;
  const totalAvailable = Math.max(getTotalAvailableRituals(), 1);
  const progress = Math.min((totalSelected / totalAvailable) * 100, 100);

  selectionSummary.textContent = `${totalSelected} ritual${totalSelected === 1 ? "" : "s"} saved across ${categoriesUsed} categor${
    categoriesUsed === 1 ? "y" : "ies"
  }.`;
  selectionCount.textContent = totalSelected > 99 ? "99+" : String(totalSelected);
  selectionCount.style.setProperty("--progress-angle", `${progress}%`);

  if (profileRitualCount) {
    profileRitualCount.textContent = String(totalSelected);
  }
}

function applyProfileToUi(profile) {
  const displayName = profile?.display_name ?? "Mia Thomson";
  const username = profile?.username ? `@${profile.username}` : "@not-set";
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : "2025";

  if (profileNameHeading) {
    profileNameHeading.textContent = displayName;
  }
  if (profileMeta) {
    profileMeta.textContent = `Glow Member • Joined ${memberSince}`;
  }
  if (profileUsernameText) {
    profileUsernameText.textContent = username;
  }
  if (usernameInput && profile?.username) {
    usernameInput.value = profile.username;
  }
}

async function ensureDemoProfileExists() {
  const defaultProfile = {
    id: DEMO_PROFILE_ID,
    display_name: "Mia Thomson",
    username: "miaglow",
    email: "mia@example.com",
    age_group: "25-34",
    skin_type: "Combination",
    goals: "Glow, confidence, and routine consistency",
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(defaultProfile, { onConflict: "id" });

  return error;
}

async function loadProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name,username,created_at")
    .eq("id", DEMO_PROFILE_ID)
    .maybeSingle();

  if (error) {
    showFeedback(`Could not load profile: ${error.message}`);
    return;
  }

  state.profile = data;
  applyProfileToUi(data);
}

async function saveUsername(event) {
  event.preventDefault();
  if (!usernameInput || !saveUsernameButton) return;

  const nextUsername = usernameInput.value.trim().toLowerCase();
  if (!nextUsername) {
    showFeedback("Please enter a username.");
    return;
  }

  const usernamePattern = /^[a-z0-9_]{3,30}$/;
  if (!usernamePattern.test(nextUsername)) {
    showFeedback("Use 3-30 chars: lowercase letters, numbers, underscores.");
    return;
  }

  saveUsernameButton.disabled = true;

  const { data, error } = await supabase
    .from("profiles")
    .update({ username: nextUsername })
    .eq("id", DEMO_PROFILE_ID)
    .select("id,display_name,username,created_at")
    .single();

  saveUsernameButton.disabled = false;

  if (error) {
    showFeedback(`Could not save username: ${error.message}`);
    return;
  }

  state.profile = data;
  applyProfileToUi(data);
  showFeedback("Username updated and saved in Supabase.");
}

function renderCategoryButtons() {
  ritualCategories.innerHTML = "";

  state.categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ritual-category-btn";
    btn.textContent = category.name;
    btn.dataset.category = category.name;
    btn.setAttribute("aria-pressed", String(category.name === state.activeCategoryName));

    if (category.name === state.activeCategoryName) {
      btn.classList.add("is-active");
    }

    btn.addEventListener("click", () => {
      state.activeCategoryName = category.name;
      renderCategoryButtons();
      renderRitualList();
      showFeedback(`Viewing ${category.name} rituals.`);
    });

    ritualCategories.appendChild(btn);
  });
}

function renderRitualList() {
  const activeCategory = state.categories.find(
    (category) => category.name === state.activeCategoryName,
  );
  const rituals = getRitualsForCategory(state.activeCategoryName);
  const selectedSet = state.selectedByCategoryName.get(state.activeCategoryName) ?? new Set();

  dynamicTitle.textContent = `${state.activeCategoryName} Rituals`;
  dynamicDescription.textContent =
    activeCategory?.description ??
    "Choose rituals you want to try and save them to your cloud routine.";
  ritualListTitle.textContent = `Try these ${state.activeCategoryName} rituals`;

  ritualList.innerHTML = "";

  rituals.forEach((ritual) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ritual-item";
    button.setAttribute("aria-pressed", String(selectedSet.has(ritual.id)));

    if (selectedSet.has(ritual.id)) {
      button.classList.add("is-selected");
    }

    button.innerHTML = `<span class="ritual-item__text">${ritual.name}</span><span class="ritual-item__check" aria-hidden="true">✓</span>`;

    button.addEventListener("click", async () => {
      button.disabled = true;
      const alreadySelected = state.selectedRitualIds.has(ritual.id);
      const error = alreadySelected
        ? await deleteRitualSelection(ritual.id)
        : await upsertRitualSelection(ritual.id);

      if (error) {
        showFeedback(`Database error: ${error.message}`);
      } else {
        if (alreadySelected) {
          state.selectedRitualIds.delete(ritual.id);
        } else {
          state.selectedRitualIds.add(ritual.id);
        }
        recalculateSelectedByCategory();
        renderRitualList();
        updateSummary();
        showFeedback(
          alreadySelected
            ? `${ritual.name} removed from your saved routine.`
            : `${ritual.name} added to your saved routine.`,
        );
      }

      button.disabled = false;
    });

    ritualList.appendChild(button);
  });
}

async function upsertRitualSelection(ritualId) {
  const { error } = await supabase.from("user_rituals").upsert(
    {
      profile_id: DEMO_PROFILE_ID,
      ritual_id: ritualId,
      status: "planned",
    },
    { onConflict: "profile_id,ritual_id" },
  );
  return error;
}

async function deleteRitualSelection(ritualId) {
  const { error } = await supabase
    .from("user_rituals")
    .delete()
    .eq("profile_id", DEMO_PROFILE_ID)
    .eq("ritual_id", ritualId);
  return error;
}

async function clearCategorySelections() {
  const rituals = getRitualsForCategory(state.activeCategoryName);
  const ritualIds = rituals.map((ritual) => ritual.id);
  if (ritualIds.length === 0) return;

  const { error } = await supabase
    .from("user_rituals")
    .delete()
    .eq("profile_id", DEMO_PROFILE_ID)
    .in("ritual_id", ritualIds);

  if (error) {
    showFeedback(`Unable to clear ${state.activeCategoryName}: ${error.message}`);
    return;
  }

  ritualIds.forEach((id) => state.selectedRitualIds.delete(id));
  recalculateSelectedByCategory();
  renderRitualList();
  updateSummary();
  showFeedback(`${state.activeCategoryName} rituals cleared.`);
}

async function loadSavedRituals() {
  const { data, error } = await supabase
    .from("user_rituals")
    .select("ritual_id")
    .eq("profile_id", DEMO_PROFILE_ID);

  if (error) {
    showFeedback(`Could not load saved rituals: ${error.message}`);
    return;
  }

  state.selectedRitualIds = new Set((data ?? []).map((row) => row.ritual_id));
  recalculateSelectedByCategory();
  renderRitualList();
  updateSummary();
  showFeedback("Saved rituals loaded from Supabase.");
}

async function fetchCategoriesAndRituals() {
  const [{ data: categories, error: categoriesError }, { data: rituals, error: ritualsError }] =
    await Promise.all([
      supabase
        .from("ritual_categories")
        .select("id,name,description,sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("rituals")
        .select("id,name,category_id,is_active")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

  if (categoriesError) return { error: categoriesError };
  if (ritualsError) return { error: ritualsError };

  return { categories: categories ?? [], rituals: rituals ?? [] };
}

async function seedCatalogFromFallbackIfNeeded() {
  const { categories, error } = await fetchCategoriesAndRituals();
  if (error) return error;
  if (categories.length > 0) return null;

  const categoryNames = Object.keys(fallbackCatalog);
  const categoryRows = categoryNames.map((name, index) => ({
    name,
    description: `${name} routines to support confidence and self-care consistency.`,
    sort_order: index + 1,
  }));

  const { error: categoryInsertError } = await supabase
    .from("ritual_categories")
    .upsert(categoryRows, { onConflict: "name" });
  if (categoryInsertError) return categoryInsertError;

  const { data: insertedCategories, error: insertedCategoriesError } = await supabase
    .from("ritual_categories")
    .select("id,name");
  if (insertedCategoriesError) return insertedCategoriesError;

  const categoryByName = new Map(insertedCategories.map((row) => [row.name, row.id]));
  const ritualRows = [];
  categoryNames.forEach((categoryName) => {
    const categoryId = categoryByName.get(categoryName);
    if (!categoryId) return;
    fallbackCatalog[categoryName].forEach((ritualName) => {
      ritualRows.push({
        category_id: categoryId,
        name: ritualName,
        description: `${ritualName} routine.`,
        time_of_day: "anytime",
        is_active: true,
      });
    });
  });

  if (ritualRows.length > 0) {
    const { error: ritualInsertError } = await supabase
      .from("rituals")
      .upsert(ritualRows, { onConflict: "category_id,name" });
    if (ritualInsertError) return ritualInsertError;
  }

  return null;
}

function hydrateCatalog(categories, rituals) {
  state.categories = categories;
  state.ritualsByCategoryName = new Map(categories.map((category) => [category.name, []]));

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  rituals.forEach((ritual) => {
    const categoryName = categoryNameById.get(ritual.category_id);
    if (!categoryName) return;
    const list = state.ritualsByCategoryName.get(categoryName);
    list.push({ id: ritual.id, name: ritual.name });
  });

  state.categories.forEach((category) => {
    const list = state.ritualsByCategoryName.get(category.name) ?? [];
    list.sort((a, b) => a.name.localeCompare(b.name));
    state.ritualsByCategoryName.set(category.name, list);
  });

  if (!state.ritualsByCategoryName.has(state.activeCategoryName)) {
    state.activeCategoryName = state.categories[0]?.name ?? state.activeCategoryName;
  }

  recalculateSelectedByCategory();
  renderCategoryButtons();
  renderRitualList();
  updateSummary();
}

async function initializeCatalog() {
  const seedError = await seedCatalogFromFallbackIfNeeded();
  if (seedError) {
    showFeedback(`Unable to initialize categories: ${seedError.message}`);
    return;
  }

  const { categories, rituals, error } = await fetchCategoriesAndRituals();
  if (error) {
    showFeedback(`Unable to load categories or rituals: ${error.message}`);
    return;
  }

  hydrateCatalog(categories, rituals);
}

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveScreen(button.dataset.screen);
  });
});

focusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFocus = button.dataset.focus;
    if (!state.ritualsByCategoryName.has(selectedFocus)) return;
    state.activeCategoryName = selectedFocus;
    renderCategoryButtons();
    renderRitualList();
    setActiveScreen("second-screen");
  });
});

topActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetScreen = button.dataset.screen;
    if (targetScreen) setActiveScreen(targetScreen);
  });
});

if (challengeButton) {
  challengeButton.addEventListener("click", () => {
    setActiveScreen("second-screen");
    showFeedback("Choose your rituals and build today's personal care challenge.");
  });
}

if (editProfileButton) {
  editProfileButton.addEventListener("click", () => {
    setActiveScreen("third-screen");
    usernameInput?.focus();
    showFeedback("Edit your username below and click Save Username.");
  });
}

if (refreshRitualsButton) {
  refreshRitualsButton.addEventListener("click", async () => {
    await initializeCatalog();
    await loadSavedRituals();
  });
}

if (clearRitualsButton) {
  clearRitualsButton.addEventListener("click", clearCategorySelections);
}

if (usernameForm) {
  usernameForm.addEventListener("submit", saveUsername);
}

async function initializeApp() {
  const profileInitError = await ensureDemoProfileExists();
  if (profileInitError) {
    showFeedback(`Profile setup error: ${profileInitError.message}`);
  }
  await loadProfile();
  await initializeCatalog();
  await loadSavedRituals();
}

initializeApp();
