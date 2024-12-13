let cols = 6; // starting number of column
let rows = 5; // starting number of rows
let cellWidth, cellHeight; // size of each square, height and width

let clickCount = 0; 
let level = 0;
let redCol, redRow;
let whiteOpacityGrid = []; // store white layer into an array
let expanding = false; // flag more to prevent multiple expanding 
let clickDisabled = false; // flag more click during timeout
let showRedOverlay = false; // flag to control red overlay display

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

    if (!expanding) {
      showRedOverlay = true; // show red overlay
      expanding = true; // prevent multiple expanding triggers
      clickDisabled = true; // disable more clicks
      setTimeout(() => {
        //reset everything
        showRedOverlay = false; 
        expandGrid(); 
        expanding = false; 
        clickDisabled = false;
      }, 3000); // 3-second delay
    }
  }

  // Draw the red overlay if the flag is true
  if (showRedOverlay) {
    setTimeout(() => {
      fill(0, 100, 100, 50); 
      noStroke();
      rect(0, 0, width, height);
      fill(200)
      textSize(40)
      text('yay',((width/2)-30),height/2)
    }, 1000); // 3-second delay

  }
}

function levelCounter() {
  let totalSquare = cols * rows;
  textSize(30);
  fill(0, 100, 50); 
  noStroke(); 
  text(`Level ${level}`, 20, 45);
}

function clickCounter() {
  let totalSquare = cols * rows;
  textSize(20);
  fill(0, 100, 50); 
  noStroke(); 
  text(`You guessed ${clickCount}/${totalSquare} times`, 20, 80);
}

function createGrid() {
  //nested for loop to make grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Calculate the distance to the red square
      let distance = dist(i, j, redCol, redRow);

      // Map the distance to hue (closer = red, further = other hues)
      let hue = map(distance, 0, dist(0, 0, cols, rows), 0, 100); // Hue range from red (0) to other hues (100)

      //random position for red square
      if (i === redCol && j === redRow) {
        fill(0, 100, 100); // Red square (max saturation, max brightness)
      } else {
        fill(hue, 100, 100); // Transitioning hues with full saturation and brightness
      }

      stroke(0, 100, 100);
      rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);

      // white layer over each colored grid
      fill(100, whiteOpacityGrid[i][j]);
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
      whiteOpacityGrid[i][j] = 255;
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

  //see which square is clicked
  if (clickedCol >= 0 && clickedCol < cols && clickedRow >= 0 && clickedRow < rows) {
   //turn opacity from array to 0
    whiteOpacityGrid[clickedCol][clickedRow] = 0;

    // Calculate distance to the red square
    let distance = dist(clickedCol, clickedRow, redCol, redRow);

    // Map distance to frequency
    let maxDistance = dist(0, 0, cols, rows);
    let frequency = map(distance, 0, maxDistance, 1000, 200);

    // Play the note
    synth.triggerAttackRelease(frequency, "8n");

    redraw(); // Redraw the canvas to update the change
  }
}

function expandGrid() {
  // add rows and column by 1
  cols += 1;
  rows += 1;

  // Reinitialize the grid with new dimensions
  initializeGrid();
  redraw(); // Redraw the canvas with the updated grid
}

function checkForRed() {
  // Get the center coordinates of the red square
  let centerX = redCol * cellWidth + cellWidth / 2;
  let centerY = redRow * cellHeight + cellHeight / 2;

  //use get to see if red is found
  let colorAtCenter = get(centerX, centerY);

  // Check if the color matches red
  if (colorAtCenter[0] === 255 && colorAtCenter[1] === 0 && colorAtCenter[2] === 0) {
    return true; //stop function execution
  }
  return false;
}