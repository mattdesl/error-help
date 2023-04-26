function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // setup colors and styles
  background("white");

  stroke("black");
  noFill();
  circle(width / 2, height / 2, 250);

  const radius = a;
  circle(width / 2, height / 2, radius);
}
