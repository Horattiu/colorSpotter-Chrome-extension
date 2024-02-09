/////////////////////////////////////////////////////////////////////////////////////

// Initialization and Utility Functions
const colorList = document.querySelector(".all-colors");
const pickedColors = JSON.parse(localStorage.getItem("picked-colors") || "[]");

function rgbToHex(rgb) {
  return `#${rgb.map((color) => color.toString(16).padStart(2, "0")).join("")}`;
}

function generateRandomColor() {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
}

// Function to copy the color code to the clipboard
const copyColor = async (elem) => {
  const colorToCopy = elem.innerText || elem.dataset.color;
  const originalText = elem.innerText;
  elem.innerText = "Copied";
  try {
    await navigator.clipboard.writeText(colorToCopy);
    setTimeout(() => (elem.innerText = originalText), 1000); // Revert after 1 second
  } catch (error) {
    console.error("Failed to copy the color code:", error);
    elem.innerText = originalText;
  }
};

// Show Picked Colors
const showColors = () => {
  if (!pickedColors.length) return;
  colorList.innerHTML = pickedColors
    .map(
      (color) => `
      <li class="color">
        <span class="rect" style="background: ${color}; border: 1px solid ${
        color === "#ffffff" ? "#ccc" : color
      }"></span>
        <span class="value hex" data-color="${color}">${color}</span>
      </li>
    `
    )
    .join("");
  document
    .querySelector(".picked-colors")
    .classList.toggle("hide", pickedColors.length === 0);
  document.querySelectorAll(".color").forEach((li) => {
    li.addEventListener("click", (e) =>
      copyColor(e.currentTarget.lastElementChild)
    );
  });
};

// Activate Eye Dropper
const activateEyeDropper = async () => {
  document.body.style.display = "none";
  await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
  try {
    const eyeDropper = new EyeDropper();
    const { sRGBHex } = await eyeDropper.open();
    if (!pickedColors.includes(sRGBHex)) {
      pickedColors.push(sRGBHex);
      localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
      showColors();
    }
  } catch (error) {
    console.error("Failed to activate eye dropper:", error);
    alert("Failed to pick the color!");
  } finally {
    document.body.style.display = "block";
  }
};

// Clear All Colors
const clearAllColors = () => {
  pickedColors.length = 0;
  localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
  colorList.innerHTML = "";
  document.querySelector(".picked-colors").classList.add("hide"); // Hide the "Picked colors" header

  showColors();
};

// Color Generation and Display Logic
let colors = [];
let lockedColors = new Array(5).fill(false); // Array to track which colors are locked

function generateColors() {
  for (let i = 0; i < 5; i++) {
    if (!lockedColors[i]) {
      colors[i] = generateRandomColor();
    }
  }
  displayGeneratedColors();
}

function displayGeneratedColors() {
  const generatedColorPalette = document.querySelector(
    ".generated-color-palette"
  );
  generatedColorPalette.innerHTML = colors
    .map((color, index) => {
      const iconHTML = lockedColors[index]
        ? `<img src="./icons/padlock.png" alt="Locked" class="lock-icon" />`
        : `<img src="./icons/unlock.png" alt="Unlock" class="hover-icon" />`;
      return `<div class="color-container">
              <div class="generated-color${
                lockedColors[index] ? " locked" : ""
              }" 
                  style="background-color: rgb(${color.join(", ")});" 
                  data-color-index="${index}">
                  ${iconHTML}
              </div>
              <span class="hex-code" id="hex-code-${index}" style="display: none;"></span>
            </div>`;
    })
    .join("");
}

// Toggle Hex Codes Visibility
function toggleHexCodesVisibility() {
  const hexCodeElements = document.querySelectorAll(".hex-code");
  hexCodeElements.forEach((elem, index) => {
    if (elem.style.display === "none" || !elem.style.display) {
      const hexColor = rgbToHex(colors[index]);
      elem.innerText = hexColor;
      elem.style.display = "block";
    } else {
      elem.style.display = "none";
    }
  });
}

function toggleLockColor(index) {
  lockedColors[index] = !lockedColors[index];
  displayGeneratedColors();
}

// Event Listeners
document.querySelector(".clear-all").addEventListener("click", clearAllColors);
document
  .querySelector("#color-picker")
  .addEventListener("click", activateEyeDropper);
document
  .getElementById("generate-colors")
  .addEventListener("click", generateColors);
document
  .getElementById("find-code-button")
  .addEventListener("click", toggleHexCodesVisibility);
document
  .querySelector(".generated-color-palette")
  .addEventListener("click", function (event) {
    const target = event.target.closest(".generated-color");
    if (target) {
      const index = parseInt(target.dataset.colorIndex, 10);
      toggleLockColor(index);
    }
  });

// Initial Calls
showColors();
generateColors(); // Initial call to populate the color display
