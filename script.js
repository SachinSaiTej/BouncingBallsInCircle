let circle = document.getElementById("circle");
let ballColors = ["#FF5733", "#33FF57", "#5733FF", "#33C5FF", "#FF33B8", "#33FFB8", "#FFFC33", "#FF8333", "#8333FF", "#33FF99"];
let balls = [];
let ballCount = 10;
let ballRadius = 10; // Radius of each ball (half of the ball's width/height)

function randomColor() {
  return ballColors[Math.floor(Math.random() * ballColors.length)];
}

function randomSpeed() {
  return Math.random() * 2 + 1;
}

function createBall() {
  let ball = document.createElement("div");
  ball.classList.add("ball");
  ball.style.backgroundColor = randomColor();
  ball.radius = ballRadius;
  ball.x = Math.random() * (500 - 2 * ball.radius) + ball.radius;
  ball.y = Math.random() * (500 - 2 * ball.radius) + ball.radius;
  ball.dx = randomSpeed() * (Math.random() < 0.5 ? 1 : -1);
  ball.dy = randomSpeed() * (Math.random() < 0.5 ? 1 : -1);
  ball.style.left = `${ball.x - ball.radius}px`;
  ball.style.top = `${ball.y - ball.radius}px`;
  circle.appendChild(ball);
  balls.push(ball);
}

function startBouncing() {
  balls.forEach(ball => ball.remove());
  balls = [];

  let ballCountInput = document.getElementById("ballCount");
  ballCount = Math.min(Math.max(ballCountInput.value, 1), 50);

  for (let i = 0; i < ballCount; i++) {
    createBall();
  }

  requestAnimationFrame(updateBalls);
}

function updateBalls() {
  let circleRect = circle.getBoundingClientRect();
  let centerX = circleRect.width / 2;
  let centerY = circleRect.height / 2;
  let circleRadius = circleRect.width / 2; // Assuming circle is a perfect circle

  balls.forEach((ball, index) => {
    // Move each ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Calculate the distance of the ball's center from the center of the circle
    let distanceFromCenter = Math.sqrt((ball.x - centerX) ** 2 + (ball.y - centerY) ** 2);

    // Check if the ball has hit the edge of the circle
    if (distanceFromCenter + ball.radius >= circleRadius) {
      // Reflect the velocity based on the angle of the collision
      let angle = Math.atan2(ball.y - centerY, ball.x - centerX);
      ball.dx = -Math.cos(angle) * Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dy = -Math.sin(angle) * Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      
      // Correct the position so the ball stays inside the circle
      let overlap = distanceFromCenter + ball.radius - circleRadius;
      ball.x -= overlap * Math.cos(angle);
      ball.y -= overlap * Math.sin(angle);
    }

    // Check for collisions with other balls
    for (let i = index + 1; i < balls.length; i++) {
      let otherBall = balls[i];
      let dx = otherBall.x - ball.x;
      let dy = otherBall.y - ball.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius + otherBall.radius) {
        // Handle elastic collision using vector math
        handleBallCollision(ball, otherBall);
      }
    }

    // Update ball's position in the DOM
    ball.style.left = `${ball.x - ball.radius}px`;
    ball.style.top = `${ball.y - ball.radius}px`;
  });

  requestAnimationFrame(updateBalls);
}

function handleBallCollision(ball1, ball2) {
  let dx = ball2.x - ball1.x;
  let dy = ball2.y - ball1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  // Normal vector
  let nx = dx / distance;
  let ny = dy / distance;

  // Tangential vector
  let tx = -ny;
  let ty = nx;

  // Dot product tangential velocity for ball 1 and ball 2
  let dpTan1 = ball1.dx * tx + ball1.dy * ty;
  let dpTan2 = ball2.dx * tx + ball2.dy * ty;

  // Dot product normal velocity for ball 1 and ball 2
  let dpNorm1 = ball1.dx * nx + ball1.dy * ny;
  let dpNorm2 = ball2.dx * nx + ball2.dy * ny;

  // Conservation of momentum in 1D
  let m1 = dpNorm2;  // Velocity after collision for ball 1
  let m2 = dpNorm1;  // Velocity after collision for ball 2

  // Update velocities using the normal and tangential components
  ball1.dx = tx * dpTan1 + nx * m1;
  ball1.dy = ty * dpTan1 + ny * m1;
  ball2.dx = tx * dpTan2 + nx * m2;
  ball2.dy = ty * dpTan2 + ny * m2;

  // Separate the balls to prevent them from sticking together
  let overlap = (ball1.radius + ball2.radius) - distance;
  ball1.x -= overlap / 2 * nx;
  ball1.y -= overlap / 2 * ny;
  ball2.x += overlap / 2 * nx;
  ball2.y += overlap / 2 * ny;
}

// Start with default number of balls
startBouncing();
