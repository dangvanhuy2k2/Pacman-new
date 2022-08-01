import TileMap from "./TileMap.js";

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");

  const c = canvas.getContext("2d");
  const tileSize = 32;
  const tileMap = new TileMap(tileSize);
  const velocity = 2;
  const pacman = tileMap.getPacman(velocity);
  let enemies = tileMap.getEnemies(velocity);

  let gameOver = false;
  let gameWin = false;

  let gameOverSound = new Audio("../sounds/gameOver.wav");
  let gameWinSound = new Audio("../sounds/gameWin.wav");

  const animate = () => {
    tileMap.draw(c);
    pacman.draw(c);
    pacman.update(gameOver, gameWin);
    enemies.forEach((enemy) => {
      enemy.draw(c, pacman);
      pacman.isMoving && enemy.update();
    });
    enemies = enemies.filter((enemy) => !enemy.markForDeletion);
    checkGameOver();
    checkGameWin();
    drawGameEnd();

    requestAnimationFrame(animate);
  };

  const checkGameOver = () => {
    if (!gameOver) {
      gameOver = isGameOver();
      if (gameOver) gameOverSound.play();
    }
  };

  const checkGameWin = () => {
    if (!gameWin) {
      gameWin = tileMap.checkMapEmpty();
      if (gameWin) gameWinSound.play();
    }
  };

  function drawGameEnd() {
    if (gameOver || gameWin) {
      let text = " You Win!";
      if (gameOver) {
        text = "Game Over";
      }

      c.fillStyle = "black";
      c.fillRect(0, canvas.height / 3.2, canvas.width, 80);

      c.font = "75px comic sans";
      const gradient = c.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop("0", "magenta");
      gradient.addColorStop("0.5", "blue");
      gradient.addColorStop("1.0", "red");

      c.fillStyle = gradient;
      c.fillText(text, 10, canvas.height / 2);
    }
  }

  const isGameOver = () =>
    enemies.some((enemy) => pacman.checkCollision(enemy));

  tileMap.setCanvasSize(canvas);
  animate();
});
