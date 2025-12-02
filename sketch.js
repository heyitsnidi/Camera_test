let video;
let flowerStage = 0; 
// 0 = seedling, 1 = growing plant, 2 = blooming flower, 3 = fading/decay
let flowerSize = 0;
let maxFlowerSize = 150;
let decayTimer = 0;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  angleMode(DEGREES);
}

function draw() {
  background(220);

  // Flip video so it behaves like a mirror
  translate(width, 0);
  scale(-1, 1);
  
  image(video, 0, 0, width, height);

  // Get user horizontal position (average brightness weighted x)
  let xPos = getUserHorizontalPosition();

  // Calculate zone based on xPos: right (zone1), middle (zone2), left (zone3)
  let zoneWidth = width / 3;
  let zone = 0;
  if (xPos > 2 * zoneWidth) {
    zone = 1; // Right zone - growing plant
  } else if (xPos > zoneWidth) {
    zone = 2; // Middle zone - blooming flower
  } else {
    zone = 3; // Left zone - fading flower
  }

  // Update flower stage and size based on zone
  updateFlowerStage(zone);
  
  // Draw flower at center bottom of canvas
  drawFlower(width / 2, height * 0.75);
}

function getUserHorizontalPosition() {
  video.loadPixels();
  let sumBrightness = 0;
  let sumBrightnessX = 0;

  // Scan row at height/2 for brightness weighted x position
  let y = int(video.height / 2);
  for (let x = 0; x < video.width; x++) {
    let index = (y * video.width + x) * 4;
    let r = video.pixels[index];
    let g = video.pixels[index + 1];
    let b = video.pixels[index + 2];
    let brightness = (r + g + b) / 3;
    sumBrightness += brightness;
    sumBrightnessX += brightness * x;
  }
  let avgX = sumBrightness > 0 ? sumBrightnessX / sumBrightness : width / 2;
  return map(avgX, 0, video.width, 0, width);
}

function updateFlowerStage(zone) {
  if (zone === 1) {
    // Growing plant
    flowerStage = 1;
    flowerSize = lerp(flowerSize, maxFlowerSize * 0.5, 0.05);
    decayTimer = 0;
  } else if (zone === 2) {
    // Blooming flower
    flowerStage = 2;
    flowerSize = lerp(flowerSize, maxFlowerSize, 0.05);
    decayTimer = 0;
  } else if (zone === 3) {
    // Decay
    flowerStage = 3;
    decayTimer += 0.05;
    flowerSize = lerp(flowerSize, 0, 0.05);
  } else {
    // Default - seedling small
    flowerStage = 0;
    flowerSize = lerp(flowerSize, maxFlowerSize * 0.1, 0.05);
    decayTimer = 0;
  }
}

function drawFlower(x, y) {
  push();
  translate(x, y);
  noStroke();

  // Draw stem if plant or beyond
  if (flowerStage > 0) {
    stroke(34,139,34);
    strokeWeight(6);
    line(0, 0, 0, -flowerSize);
  }

  noStroke();
  if (flowerStage === 1) {
    // Growing plant - draw small leaves
    fill(34, 139, 34, 200);
    ellipse(-10, -flowerSize * 0.5, flowerSize * 0.2, flowerSize * 0.4);
    ellipse(10, -flowerSize * 0.7, flowerSize * 0.2, flowerSize * 0.4);
  } else if (flowerStage === 2) {
    // Blooming flower - draw petals and center
    drawPetals(flowerSize);
    fill(255, 204, 0);
    ellipse(0, -flowerSize, flowerSize * 0.4, flowerSize * 0.4);
  } else if (flowerStage === 3) {
    // Decay - faded petals and center
    let fadeAlpha = map(decayTimer, 0, 20, 255, 0);
    fill(150, 50, 50, fadeAlpha);
    drawPetals(flowerSize * 0.8, fadeAlpha);
    fill(150, 100, 20, fadeAlpha);
    ellipse(0, -flowerSize * 0.8, flowerSize * 0.3, flowerSize * 0.3);
  }
  pop();
}

function drawPetals(size, alpha = 255) {
  fill(255, 100, 150, alpha);
  for (let angle = 0; angle < 360; angle += 45) {
    push();
    rotate(angle);
    ellipse(0, -size * 0.8, size * 0.4, size * 0.8);
    pop();
  }
}
