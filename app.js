const screenButtons = document.querySelectorAll(".bottom-nav__item");
const screens = document.querySelectorAll(".screen");
const focusButtons = document.querySelectorAll(".nav-card");

const focusContent = {
  "Skin Care": {
    title: "Skin Care Focus",
    description:
      "Gentle cleanse, vitamin C serum, and SPF 50 for your daytime routine.",
    morning: ["Hydrating cleanser", "Antioxidant serum", "Moisturizer + SPF"],
    evening: ["Oil-based cleanser", "Barrier-repair cream", "Lip and eye hydration"],
  },
  Makeup: {
    title: "Makeup Focus",
    description:
      "Create a natural glow look that lasts from morning meetings to evening plans.",
    morning: ["Skin prep + primer", "Tinted base and concealer", "Cream blush + mascara"],
    evening: ["Refresh base with setting mist", "Soft liner and highlighter", "Hydrating lip tint"],
  },
  "Hair Care": {
    title: "Hair Care Focus",
    description:
      "Repair dryness and add shine with lightweight products and a low-heat routine.",
    morning: ["Scalp tonic massage", "Leave-in conditioner", "Heat protectant before styling"],
    evening: ["Gentle detangle + serum", "Silk wrap or braid", "Overnight moisture treatment"],
  },
  Wellness: {
    title: "Wellness Focus",
    description:
      "Build inner balance with short movement breaks, hydration, and mindful resets.",
    morning: ["5-minute stretch flow", "Hydration + vitamins", "Set one daily intention"],
    evening: ["Screen-free wind down", "Breathing exercise", "Reflect on one win"],
  },
};

const dynamicTitle = document.getElementById("dynamic-title");
const dynamicDescription = document.getElementById("dynamic-description");
const morningList = document.getElementById("morning-list");
const eveningList = document.getElementById("evening-list");
const editProfileButton = document.getElementById("edit-profile-btn");

function renderList(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function setActiveScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === screenId);
  });

  screenButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screen === screenId);
  });
}

function updateSecondScreen(focusKey) {
  const content = focusContent[focusKey];
  if (!content) return;

  dynamicTitle.textContent = content.title;
  dynamicDescription.textContent = content.description;
  renderList(morningList, content.morning);
  renderList(eveningList, content.evening);
}

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveScreen(button.dataset.screen);
  });
});

focusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFocus = button.dataset.focus;
    updateSecondScreen(selectedFocus);
    setActiveScreen("second-screen");
  });
});

if (editProfileButton) {
  editProfileButton.addEventListener("click", () => {
    window.alert("Profile editor coming soon. Your preferences are saved.");
  });
}
