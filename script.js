const screenButtons = document.querySelectorAll("[data-screen-target]");
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".top-nav .nav-btn");
const topicCards = document.querySelectorAll(".option-card");

const focusTitle = document.getElementById("focus-title");
const focusDescription = document.getElementById("focus-description");
const focusSteps = document.getElementById("focus-steps");
const focusStreak = document.getElementById("focus-streak");
const focusChallenge = document.getElementById("focus-challenge");
const focusBoost = document.getElementById("focus-boost");

const topicContent = {
  skincare: {
    title: "Skincare Ritual Plan",
    description: "A gentle routine for hydrated, bright skin with simple steps.",
    steps: [
      "Cleanse with a soft, non-stripping gel.",
      "Apply vitamin C serum and moisturize.",
      "Use broad-spectrum SPF and reapply at midday.",
      "Night: cleanse, add hydrating serum, and lock in moisture."
    ],
    streak: "7 days",
    challenge: "Hydrate + SPF",
    boost: "Your skin is thanking you."
  },
  fitness: {
    title: "Body Confidence Plan",
    description: "Short movement sessions that tone your body and improve posture.",
    steps: [
      "10-minute activation stretch after waking up.",
      "20-minute strength circuit focused on core and legs.",
      "5-minute posture reset every afternoon.",
      "Evening walk for recovery and stress relief."
    ],
    streak: "5 days",
    challenge: "Core + cardio",
    boost: "Strength looks incredible on you."
  },
  mindset: {
    title: "Mindset Reset Plan",
    description: "Micro-habits that support confidence, calm focus, and self-trust.",
    steps: [
      "Journal one win and one intention.",
      "Practice a 3-minute breathing session.",
      "Replace one negative thought with a kind reframe.",
      "End the day with gratitude reflections."
    ],
    streak: "10 days",
    challenge: "No self-criticism day",
    boost: "Your inner voice is becoming powerful."
  },
  style: {
    title: "Personal Style Plan",
    description: "Create polished outfits quickly with a signature color palette.",
    steps: [
      "Choose one statement piece for today's look.",
      "Build around it with two neutral basics.",
      "Add one accessory that expresses your mood.",
      "Take a mirror photo to track favorite combinations."
    ],
    streak: "4 days",
    challenge: "One bold accessory",
    boost: "Your style feels effortlessly you."
  }
};

function setActiveScreen(targetId) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === targetId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.getAttribute("data-screen-target") === targetId
    );
  });
}

function renderTopic(topicKey) {
  const content = topicContent[topicKey];
  if (!content) return;

  focusTitle.textContent = content.title;
  focusDescription.textContent = content.description;
  focusStreak.textContent = content.streak;
  focusChallenge.textContent = content.challenge;
  focusBoost.textContent = content.boost;

  focusSteps.replaceChildren();
  content.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    focusSteps.append(li);
  });

  topicCards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.topic === topicKey);
  });
}

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetScreen = button.getAttribute("data-screen-target");
    if (targetScreen) {
      setActiveScreen(targetScreen);
    }
  });
});

topicCards.forEach((card) => {
  card.addEventListener("click", () => {
    const selectedTopic = card.dataset.topic;
    renderTopic(selectedTopic);
    setActiveScreen("focus-screen");
  });
});

renderTopic("skincare");
