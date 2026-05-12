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
const feedbackArea = document.getElementById("interaction-feedback");
const profileNameHeading = document.getElementById("profile-name");
const profileMeta = document.getElementById("profile-meta");
const homeWelcomeTitle = document.getElementById("home-welcome-title");
const profileForm = document.getElementById("profile-form");
const profileNameInput = document.getElementById("profile-name-input");
const profileEmailInput = document.getElementById("profile-email-input");
const profilesList = document.getElementById("profiles-list");
const profileCount = document.getElementById("profile-count");
const refreshProfilesButton = document.getElementById("refresh-profiles-btn");
const authEmailInput = document.getElementById("auth-email-input");
const authPasswordInput = document.getElementById("auth-password-input");
const signUpButton = document.getElementById("signup-btn");
const loginButton = document.getElementById("login-btn");
const logoutButton = document.getElementById("logout-btn");
const authSessionText = document.getElementById("auth-session-text");

const state = {
  categories: [],
  ritualsByCategoryName: new Map(),
  selectedRitualIds: new Set(),
  selectedByCategoryName: new Map(),
  activeCategoryName: "Skin Care",
  authUser: null,
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
}

function normalizeProfile(record) {
  return {
    id: record.id,
    name: record.name ?? record.display_name ?? "Unnamed Profile",
    email: record.email ?? "no-email@example.com",
    createdAt: record.created_at ? new Date(record.created_at) : null,
  };
}

function setAuthUi(user) {
  state.authUser = user ?? null;
  if (!authSessionText) return;

  if (state.authUser) {
    authSessionText.textContent = `Logged in as ${state.authUser.email}`;
    if (logoutButton) logoutButton.disabled = false;
  } else {
    authSessionText.textContent = "Not logged in";
    if (logoutButton) logoutButton.disabled = true;
  }
}

function getAuthCredentials() {
  const email = authEmailInput?.value.trim().toLowerCase();
  const password = authPasswordInput?.value ?? "";

  if (!email || !password) {
    showFeedback("Enter auth email and password first.");
    return null;
  }

  if (password.length < 6) {
    showFeedback("Auth password must be at least 6 characters.");
    return null;
  }

  return { email, password };
}

function renderProfiles(profiles) {
  profilesList.innerHTML = "";

  if (!profiles || profiles.length === 0) {
    if (profileNameHeading) {
      profileNameHeading.textContent = "No profile saved yet";
    }
    if (profileMeta) {
      profileMeta.textContent = "Save a profile below to test Supabase integration.";
    }
    if (profileCount) {
      profileCount.textContent = "0";
    }
    const empty = document.createElement("li");
    empty.textContent = "No profiles found in database.";
    profilesList.appendChild(empty);
    if (homeWelcomeTitle) {
      homeWelcomeTitle.textContent = "Welcome";
    }
    return;
  }

  const normalizedProfiles = profiles.map(normalizeProfile);
  const latestProfile = normalizedProfiles[0];

  if (profileNameHeading) {
    profileNameHeading.textContent = latestProfile.name;
  }
  if (profileMeta) {
    profileMeta.textContent = `${latestProfile.email} • Saved ${
      latestProfile.createdAt ? latestProfile.createdAt.toLocaleString() : "just now"
    }`;
  }
  if (homeWelcomeTitle) {
    homeWelcomeTitle.textContent = `Welcome, ${latestProfile.name}`;
  }
  if (profileCount) {
    profileCount.textContent = String(normalizedProfiles.length);
  }

  normalizedProfiles.forEach((profile) => {
    const li = document.createElement("li");
    li.textContent = `${profile.name} (${profile.email})`;
    profilesList.appendChild(li);
  });
}

async function fetchProfiles() {
  console.log("[Supabase][Profiles][Step 1] Starting profile fetch query");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase][Profiles][Error] Fetch failed:", error);
    showFeedback(`Could not load profiles: ${error.message}`);
    return;
  }

  console.log("[Supabase][Profiles][Step 2] Fetch successful:", data);
  renderProfiles(data ?? []);
}

async function insertProfileWithFallback(name, email) {
  const insertAttempts = [
    {
      label: "name + display_name + email",
      payload: { name, display_name: name, email },
    },
    {
      label: "name + email",
      payload: { name, email },
    },
    {
      label: "display_name + email",
      payload: { display_name: name, email },
    },
  ];

  let lastError = null;

  for (const attempt of insertAttempts) {
    console.log(`[Supabase][Profiles][Step 2] Insert attempt via ${attempt.label}:`, attempt.payload);
    const { data, error } = await supabase
      .from("profiles")
      .insert(attempt.payload)
      .select("*")
      .single();

    if (!error) {
      console.log(`[Supabase][Profiles][Step 3] Insert successful via ${attempt.label}:`, data);
      return { data, error: null };
    }

    lastError = error;
    const message = (error.message || "").toLowerCase();
    const isMissingNameColumn = message.includes('column "name"');
    const isMissingDisplayNameColumn = message.includes('column "display_name"');
    const isDuplicateEmail = error.code === "23505" && message.includes("email");
    const isNotNullDisplayName = message.includes("display_name") && message.includes("not-null");

    console.warn(`[Supabase][Profiles][Warn] Insert attempt failed via ${attempt.label}:`, error);

    if (isMissingNameColumn || isMissingDisplayNameColumn || isNotNullDisplayName) {
      continue;
    }

    if (isDuplicateEmail) {
      console.log("[Supabase][Profiles][Step 3] Email exists, attempting update by email");
      const updateAttempts = [
        { label: "update name + display_name", payload: { name, display_name: name } },
        { label: "update name", payload: { name } },
        { label: "update display_name", payload: { display_name: name } },
      ];

      let updateLastError = null;
      for (const updateAttempt of updateAttempts) {
        const { data: updateData, error: updateError } = await supabase
          .from("profiles")
          .update(updateAttempt.payload)
          .eq("email", email)
          .select("*");

        if (!updateError && updateData && updateData.length > 0) {
          console.log(
            `[Supabase][Profiles][Step 4] Existing profile updated via ${updateAttempt.label}:`,
            updateData[0],
          );
          return { data: updateData[0], error: null };
        }

        updateLastError = updateError;
        if (!updateError) {
          continue;
        }

        const updateMessage = (updateError.message || "").toLowerCase();
        if (
          updateMessage.includes('column "name"') ||
          updateMessage.includes('column "display_name"')
        ) {
          continue;
        }
      }

      return { data: null, error: updateLastError ?? error };
    }

    return { data: null, error };
  }

  return { data: null, error: lastError };
}

async function saveProfile(event) {
  event.preventDefault();
  if (!profileNameInput || !profileEmailInput) return;

  const name = profileNameInput.value.trim();
  const email = profileEmailInput.value.trim().toLowerCase();
  if (!name || !email) {
    showFeedback("Please enter both name and email.");
    return;
  }

  console.log("[Supabase][Profiles][Step 1] Saving profile form payload:", { name, email });

  const { data, error } = await insertProfileWithFallback(name, email);

  if (error) {
    console.error("[Supabase][Profiles][Error] Insert failed:", error);
    showFeedback(`Could not save profile: ${error.message}`);
    return;
  }

  console.log("[Supabase][Profiles][Success] Insert complete:", data);
  profileForm.reset();
  showFeedback("Profile saved in Supabase.");
  await fetchProfiles();
}

async function handleSignUp() {
  const credentials = getAuthCredentials();
  if (!credentials) return;

  console.log("[Supabase][Auth][Step 1] Starting sign up request:", {
    email: credentials.email,
  });
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    console.error("[Supabase][Auth][Error] Sign up failed:", error);
    showFeedback(`Sign up failed: ${error.message}`);
    return;
  }

  console.log("[Supabase][Auth][Step 2] Sign up success:", data);
  setAuthUi(data.user ?? data.session?.user ?? null);
  showFeedback("Sign up successful. Check your email if confirmation is enabled.");
}

async function handleLogin() {
  const credentials = getAuthCredentials();
  if (!credentials) return;

  console.log("[Supabase][Auth][Step 1] Starting login request:", {
    email: credentials.email,
  });
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    console.error("[Supabase][Auth][Error] Login failed:", error);
    showFeedback(`Login failed: ${error.message}`);
    return;
  }

  console.log("[Supabase][Auth][Step 2] Login success:", data);
  setAuthUi(data.user ?? data.session?.user ?? null);
  showFeedback("Logged in successfully.");
}

async function handleLogout() {
  console.log("[Supabase][Auth][Step 1] Starting logout request");
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[Supabase][Auth][Error] Logout failed:", error);
    showFeedback(`Logout failed: ${error.message}`);
    return;
  }

  console.log("[Supabase][Auth][Step 2] Logout success");
  setAuthUi(null);
  showFeedback("Logged out.");
}

async function initializeAuth() {
  console.log("[Supabase][Auth][Init] Reading current session");
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("[Supabase][Auth][Error] Session read failed:", error);
    showFeedback(`Auth session error: ${error.message}`);
    return;
  }

  setAuthUi(data.session?.user ?? null);
  console.log("[Supabase][Auth][Init] Session loaded:", data.session);

  supabase.auth.onAuthStateChange((event, session) => {
    console.log("[Supabase][Auth][Event]", event, session);
    setAuthUi(session?.user ?? null);
  });
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

if (refreshProfilesButton) {
  refreshProfilesButton.addEventListener("click", fetchProfiles);
}

if (signUpButton) {
  signUpButton.addEventListener("click", handleSignUp);
}

if (loginButton) {
  loginButton.addEventListener("click", handleLogin);
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
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

if (profileForm) {
  profileForm.addEventListener("submit", saveProfile);
}

setAuthUi(null);

async function initializeApp() {
  console.log("[Supabase][Init] App initialization started");
  await initializeAuth();
  console.log("[Supabase][Init] Loading saved profiles from database");
  await fetchProfiles();
  console.log("[Supabase][Init] Loading categories and rituals");
  await initializeCatalog();
  console.log("[Supabase][Init] Loading saved ritual selections");
  await loadSavedRituals();
  console.log("[Supabase][Init] Initialization complete");
}

initializeApp();
