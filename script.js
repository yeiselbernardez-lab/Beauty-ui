const focusData = {
  skin: {
    title: "Skin Care",
    progress: 72,
    heading: "Hydration + Protection",
    text: "Stay consistent with your routine to keep healthy, glowing skin.",
    steps: [
      "Gentle cleanser with lukewarm water",
      "Vitamin C serum for morning glow",
      "Broad-spectrum SPF 50 sunscreen",
    ],
    tip: "Pair sunscreen with antioxidants to reduce visible signs of photo-aging.",
  },
  mindset: {
    title: "Mindset",
    progress: 65,
    heading: "Confidence Ritual",
    text: "A calm mind enhances your natural beauty and daily energy.",
    steps: [
      "5-minute guided breathing",
      "Write one self-appreciation sentence",
      "Mirror affirmations before bed",
    ],
    tip: "Consistency beats intensity: short daily rituals build lasting confidence.",
  },
  fitness: {
    title: "Fitness",
    progress: 58,
    heading: "Tone + Posture",
    text: "Movement improves circulation and gives your skin a healthy appearance.",
    steps: [
      "12-minute mobility warmup",
      "20-minute bodyweight strength circuit",
      "3-minute posture reset stretch",
    ],
    tip: "Focus on posture while walking; it instantly improves your overall presence.",
  },
  nutrition: {
    title: "Nutrition",
    progress: 79,
    heading: "Nourish for Glow",
    text: "Balanced meals support clearer skin and steady daily mood.",
    steps: [
      "Protein + colorful vegetables at lunch",
      "Hydrate with 2 liters of water",
      "Omega-3 rich dinner choice",
    ],
    tip: "Build each plate around protein first, then add fiber and healthy fats.",
  },
};

const homeScreen = document.getElementById("homeScreen");
const detailScreen = document.getElementById("detailScreen");
const goDetailsBtn = document.getElementById("goDetailsBtn");
const backBtn = document.getElementById("backBtn");
const switchFocusBtn = document.getElementById("switchFocusBtn");
const focusButtons = Array.from(document.querySelectorAll(".focus-btn"));

const detailTitle = document.getElementById("detailTitle");
const progressValue = document.getElementById("progressValue");
const progressHeading = document.getElementById("progressHeading");
const progressText = document.getElementById("progressText");
const routineList = document.getElementById("routineList");
const tipText = document.getElementById("tipText");
const progressRing = document.getElementById("progressRing");

let selectedFocus = "skin";

function renderDetails() {
  const data = focusData[selectedFocus];
  if (!data) return;

  detailTitle.textContent = data.title;
  progressValue.textContent = `${data.progress}%`;
  progressHeading.textContent = data.heading;
  progressText.textContent = data.text;
  tipText.textContent = data.tip;
  progressRing.style.setProperty("--progress", `${data.progress}%`);

  routineList.innerHTML = "";
  data.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    routineList.appendChild(li);
  });
}

function setSelectedFocus(focusKey) {
  if (!focusData[focusKey]) return;
  selectedFocus = focusKey;

  focusButtons.forEach((button) => {
    const isSelected = button.dataset.focus === focusKey;
    button.classList.toggle("is-selected", isSelected);
  });

  renderDetails();
}

function showDetailsScreen() {
  homeScreen.classList.remove("is-active");
  detailScreen.classList.add("is-active");
  detailScreen.setAttribute("aria-hidden", "false");
  homeScreen.setAttribute("aria-hidden", "true");
}

function showHomeScreen() {
  detailScreen.classList.remove("is-active");
  homeScreen.classList.add("is-active");
  homeScreen.setAttribute("aria-hidden", "false");
  detailScreen.setAttribute("aria-hidden", "true");
}

focusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSelectedFocus(button.dataset.focus);
  });
});

goDetailsBtn.addEventListener("click", showDetailsScreen);
backBtn.addEventListener("click", showHomeScreen);
switchFocusBtn.addEventListener("click", showHomeScreen);

renderDetails();
