import MovingDirection from "./MovingDirection.js";

export default class Enemy {
  constructor(x, y, size, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.scareAboutToExpireDefault = 10;
    this.scareAboutToExpire = this.scareAboutToExpireDefault;

    this.movingDirection = Math.floor(
      Math.random() * Object.keys(MovingDirection).length
    );
    this.directionTimerDefault = this.#random(5, 7);
    this.directionTimer = this.directionTimerDefault;

    this.markForDeletion = false;

    this.#loadGhostImage();
  }

  #random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  #move() {
    if (!this.tileMap.checkCollision(this.x, this.y, this.movingDirection)) {
      switch (this.movingDirection) {
        case MovingDirection.up:
          this.y -= this.velocity;
          break;
        case MovingDirection.down:
          this.y += this.velocity;
          break;
        case MovingDirection.left:
          this.x -= this.velocity;
          break;
        case MovingDirection.right:
          this.x += this.velocity;
          break;
      }
    }
  }

  update() {
    this.#move();
    this.#changeDirection();
  }

  #changeDirection() {
    this.directionTimer--;
    let newMoveDirection = null;
    if (this.directionTimer == 0) {
      this.directionTimer = this.directionTimerDefault;
      newMoveDirection = Math.floor(
        Math.random() * Object.keys(MovingDirection).length
      );
    }

    if (newMoveDirection !== null && this.movingDirection != newMoveDirection) {
      if (
        Number.isInteger(this.x / this.size) &&
        Number.isInteger(this.y / this.size)
      ) {
        if (!this.tileMap.checkCollision(this.x, this.y, newMoveDirection))
          this.movingDirection = newMoveDirection;
      }
    }
  }

  draw(c, pacman) {
    if (pacman.powerDotActive) {
      this.#setImageWhenPowerDotActive(pacman);
    } else this.image = this.normalGhost;
    c.drawImage(this.image, this.x, this.y, this.size, this.size);
  }

  #setImageWhenPowerDotActive(pacman) {
    if (pacman.powerDotAboutToExpire) {
      --this.scareAboutToExpire;
      if (this.scareAboutToExpire <= 0) {
        this.scareAboutToExpire = this.scareAboutToExpireDefault;

        if (this.image === this.scaredGhost) this.image = this.scaredGhost2;
        else this.image = this.scaredGhost;
      }
    } else this.image = this.scaredGhost;
  }

  #loadGhostImage() {
    this.normalGhost = new Image();
    this.normalGhost.src = "./images/ghost.png";

    this.scaredGhost = new Image();
    this.scaredGhost.src = "./images/scaredGhost.png";

    this.scaredGhost2 = new Image();
    this.scaredGhost2.src = "./images/scaredGhost2.png";

    this.image = this.normalGhost;
  }
}
