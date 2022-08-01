import MovingDirection from "./MovingDirection.js";

export default class Pacman {
  constructor(x, y, size, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocity = velocity;
    this.tileMap = tileMap;
    this.images = [];
    this.pacmanImageIdx = 0;

    this.pacmanRotation = this.Rotation.right;

    this.currentMovingDirection = null;
    this.requestMovingDirection = null;
    window.addEventListener("keydown", this.#keydown);

    this.wakaSound = new Audio();
    this.wakaSound.src = "./sounds/waka.wav";
    this.powerSound = new Audio();
    this.powerSound.src = "./sounds/power_dot.wav";
    this.eatGhostSound = new Audio();
    this.powerSound.src = "./sounds/eat_ghost.wav";

    this.pacmanAnimationTimer = null;
    this.pacmanAnimationTimerDefault = 10;

    this.isMoving = false;

    this.powerDotActive = false;
    this.powerDotAboutToExpire = false;
    this.timers = [];

    this.#loadPacmanImage();
  }

  Rotation = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  update(gameOver, gameWin) {
    if (gameOver || gameWin) return;
    this.#move();
    this.#animate();
    this.#eatDot();
  }

  draw(c) {
    const radius = this.size / 2;

    c.save();
    c.translate(this.x + radius, this.y + radius);
    c.rotate((this.pacmanRotation * 90 * Math.PI) / 180);

    c.drawImage(
      this.images[this.pacmanImageIdx],
      0 - radius,
      0 - radius,
      this.size,
      this.size
    );
    c.restore();
  }

  checkCollision(enemy) {
    if (
      this.x < enemy.x + enemy.size &&
      this.x + this.size > enemy.x &&
      this.y < enemy.y + enemy.size &&
      this.size + this.y > enemy.y
    ) {
      if (this.powerDotActive) {
        enemy.markForDeletion = true;
        this.eatGhostSound.play();
        return false;
      } else return true;
    }

    return false;
  }

  #loadPacmanImage() {
    const pacmanImage0 = new Image();
    pacmanImage0.src = "./images/pac0.png";

    const pacmanImage1 = new Image();
    pacmanImage1.src = "./images/pac1.png";

    const pacmanImage2 = new Image();
    pacmanImage2.src = "./images/pac2.png";

    const pacmanImage3 = new Image();
    pacmanImage3.src = "./images/pac1.png";

    this.images = [pacmanImage0, pacmanImage1, pacmanImage2, pacmanImage3];
  }

  #keydown = ({ key }) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key))
      this.isMoving = true;

    switch (key) {
      case "ArrowUp": {
        if (this.currentMovingDirection === MovingDirection.down)
          this.currentMovingDirection = MovingDirection.up;
        this.requestMovingDirection = MovingDirection.up;
        break;
      }

      case "ArrowDown": {
        if (this.currentMovingDirection === MovingDirection.up)
          this.currentMovingDirection = MovingDirection.down;
        this.requestMovingDirection = MovingDirection.down;
        break;
      }

      case "ArrowLeft": {
        if (this.currentMovingDirection === MovingDirection.right)
          this.currentMovingDirection = MovingDirection.left;
        this.requestMovingDirection = MovingDirection.left;
        break;
      }

      case "ArrowRight": {
        if (this.currentMovingDirection === MovingDirection.left)
          this.currentMovingDirection = MovingDirection.right;
        this.requestMovingDirection = MovingDirection.right;
        break;
      }
    }
  };

  #move() {
    if (this.currentMovingDirection !== this.requestMovingDirection) {
      if (
        Number.isInteger(this.x / this.size) &&
        Number.isInteger(this.y / this.size)
      ) {
        if (
          !this.tileMap.checkCollision(
            this.x,
            this.y,
            this.requestMovingDirection
          )
        )
          this.currentMovingDirection = this.requestMovingDirection;
      }
    }

    if (
      this.tileMap.checkCollision(this.x, this.y, this.currentMovingDirection)
    ) {
      this.pacmanAnimationTimer = null;
      this.pacmanImageIdx = 1;
      return;
    } else if (
      this.pacmanAnimationTimer === null &&
      this.currentMovingDirection !== null
    )
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;

    switch (this.currentMovingDirection) {
      case MovingDirection.up: {
        this.y -= this.velocity;
        this.pacmanRotation = this.Rotation.up;
        break;
      }
      case MovingDirection.down: {
        this.y += this.velocity;
        this.pacmanRotation = this.Rotation.down;
        break;
      }
      case MovingDirection.left: {
        this.x -= this.velocity;
        this.pacmanRotation = this.Rotation.left;
        break;
      }
      case MovingDirection.right: {
        this.x += this.velocity;
        this.pacmanRotation = this.Rotation.right;
        break;
      }
    }
  }

  #animate() {
    if (this.pacmanAnimationTimer === null) return;
    --this.pacmanAnimationTimer;
    if (this.pacmanAnimationTimer === 0) {
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
      ++this.pacmanImageIdx;
      if (this.pacmanImageIdx >= this.images.length) this.pacmanImageIdx = 0;
    }
  }

  #eatDot() {
    const result = this.tileMap.eatDot(this.x, this.y);
    if (result !== -1) {
      if (result === 0) {
        if (this.isMoving) this.wakaSound.play();
      } else if (result === 7) {
        if (this.isMoving) {
          this.wakaSound.pause();
          this.powerSound.play();
        }

        this.powerDotActive = true;
        this.powerDotAboutToExpire = false;
        this.timers.forEach((timerId) => clearTimeout(timerId));

        this.timers = [];

        let powerDotTimerId = setTimeout(() => {
          this.powerDotAboutToExpire = false;
          this.powerDotActive = false;
        }, 1000 * 6);

        this.timers.push(powerDotTimerId);

        let powerDotAboutToExpireTimerId = setTimeout(() => {
          this.powerDotAboutToExpire = true;
        }, 1000 * 3);

        this.timers.push(powerDotAboutToExpireTimerId);
      }
    }
  }
}
