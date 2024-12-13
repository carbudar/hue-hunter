let cols = 6; // Initial number of columns
let rows = 5; // Initial number of rows
let cellWidth, cellHeight; // Size of each cell, calculated dynamically

let clickCount = 0;
let level = 0;
let redCol, redRow;
let whiteOpacityGrid = []; // Store the opacity of each white square
let expanding = false; // Prevent multiple expansions while waiting
let clickDisabled = false; // Disable clicks during timeout

let showRedOverlay = false; // Flag to control red overlay display
// Tone.js synthesizer
let synth;

function setup() {
  createCanvas(windowWidth, windowHeight); // Make the canvas full screen

  synth = new Tone.Synth().toDestination(); // Initialize the synthesizer
  initializeGrid();
  noLoop(); // Stop the draw loop since the grid doesn't change unless redetected
}


function draw() {
  colorMode(HSB, 100); // Use HSB color mode
  createGrid();
  clickCounter();
  levelCounter();

  // Check if the red square is visible
  if (checkForRed()) {
    console.log("Red detected!");
    if (!expanding) {
      showRedOverlay = true; // Enable the red overlay
      expanding = true; // Prevent multiple triggers
      clickDisabled = true; // Disable further clicks
      setTimeout(() => {
        showRedOverlay = false; // Disable the red overlay
        expandGrid(); // Expand the grid after 3 seconds
        expanding = false; // Reset the flag
        clickDisabled = false; // Re-enable clicks
      }, 3000); // 3-second delay
    }
  } else {
    console.log("No red detected!");
  }

  // Draw the red overlay if the flag is true
  if (showRedOverlay) {

    setTimeout(() => {
      fill(0, 100, 100, 50); // Semi-transparent red overlay (HSB color)
      noStroke();
      rect(0, 0, width, height); // Cover the entire canvas
      fill(200)
      textSize(40)
      text('yay',((width/2)-30),height/2)
    }, 1000); // 3-second delay

  }
}

function levelCounter() {
  let totalSquare = cols * rows;
  textSize(30);
  fill(0, 100, 50); // Red text in HSB
  noStroke(); // Remove stroke around text
  text(`Level ${level}`, 20, 45);
}

function clickCounter() {
  let totalSquare = cols * rows;
  textSize(20);
  fill(0, 100, 50); // Red text in HSB
  noStroke(); // Remove stroke around text
  text(`You guessed ${clickCount}/${totalSquare} times`, 20, 80);
}

function createGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (
        mouseX > i * cellWidth &&
        mouseX < i * cellWidth + cellWidth &&
        mouseY > j * cellHeight &&
        mouseY < j * cellHeight + cellHeight
      ) {
        fill(240, 100, 100); // Blue square (HSB: hue 240 for blue)
      }
      // Calculate the distance to the red square
      let distance = dist(i, j, redCol, redRow);

      // Map the distance to hue (closer = red, further = other hues)
      let hue = map(distance, 0, dist(0, 0, cols, rows), 0, 100); // Hue range from red (0) to other hues (100)

      if (i === redCol && j === redRow) {
        fill(0, 100, 100); // Red square (max saturation, max brightness)
      } else {
        fill(hue, 100, 100); // Transitioning hues with full saturation and brightness
      }

      stroke(0, 100, 100);
      rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);

      // Add an additional white square with varying opacity
      fill(100, whiteOpacityGrid[i][j]); // White fill with opacity
      stroke(0, 100, 50);
      rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
    }
  }
}

function initializeGrid() {
  // Recalculate cell size based on current rows and columns
  cellWidth = width / cols;
  cellHeight = height / rows;

  // Reset the grid and opacity values
  whiteOpacityGrid = [];
  for (let i = 0; i < cols; i++) {
    whiteOpacityGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      whiteOpacityGrid[i][j] = 255; // Fully opaque
    }
  }

  // Randomly pick one red square
  redCol = floor(random(cols));
  redRow = floor(random(rows));
  
  clickCount = 0;
  level ++;
}

function mouseClicked() {
  if (clickDisabled) {
    console.log("Clicks are temporarily disabled.");
    return; // Do nothing if clicks are disabled
  }

  clickCount++;

  // Determine which square was clicked
  let clickedCol = floor(mouseX / cellWidth);
  let clickedRow = floor(mouseY / cellHeight);

  // Ensure the click is within the grid bounds
  if (clickedCol >= 0 && clickedCol < cols && clickedRow >= 0 && clickedRow < rows) {
    // Set the opacity of the clicked white square to 0 (make it invisible)
    whiteOpacityGrid[clickedCol][clickedRow] = 0;

    // Calculate distance to the red square
    let distance = dist(clickedCol, clickedRow, redCol, redRow);

    // Map distance to frequency (e.g., 200 Hz to 1000 Hz)
    let maxDistance = dist(0, 0, cols, rows);
    let frequency = map(distance, 0, maxDistance, 1000, 200);

    // Play the note
    synth.triggerAttackRelease(frequency, "8n");

    redraw(); // Redraw the canvas to update the change
  }
}

function checkForRed() {
  // Check if the red square's corresponding white square is fully transparent
  if (whiteOpacityGrid[redCol][redRow] === 0) {
    return true; // The red square is visible
  }
  return false; // The red square is still covered
}

function expandGrid() {
  // Increase rows and columns by 1
  cols += 1;
  rows += 1;

  // Reinitialize the grid with new dimensions
  initializeGrid();
  redraw(); // Redraw the canvas with the updated grid
}

function windowResized() {
  // Adjust the canvas size dynamically when the window is resized
  resizeCanvas(windowWidth, windowHeight);
  initializeGrid(); // Reinitialize the grid to fit the new canvas size
  redraw();
}
