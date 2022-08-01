import Enemy from "./Enemy.js";
import MovingDirection from "./MovingDirection.js";
import Pacman from "./Pacman.js";

export default class TileMap {
  constructor(tileSize, c) {
    this.tileSize = tileSize;

    this.yellowDot = new Image();
    this.yellowDot.src = "./images/yellowDot.png";

    this.pinkDot = new Image();
    this.pinkDot.src = "./images/pinkDot.png";

    this.wall = new Image();
    this.wall.src = "./images/wall.png";

    this.powerDot = this.pinkDot;
    this.powerDotAnimationTimerDefault = 50;
    this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault;
  }

  map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 7, 0, 0, 4, 0, 0, 0, 0, 0, 0, 7, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 6, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 7, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  draw(c) {
    this.map.forEach((row, y) => {
      row.forEach((symbol, x) => {
        if (symbol === 1) this.#drawWall(c, x, y, this.tileSize);
        else if (symbol === 0) this.#drawDot(c, x, y, this.tileSize);
        else if (symbol === 5) this.#drawBlank(c, x, y, this.tileSize);
        else if (symbol === 6)
          c.drawImage(
            this.pinkDot,
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        else this.#drawPowerDot(c, x, y, this.tileSize);
      });
    });
  }

  #drawBlank(c, x, y, size) {
    c.fillStyle = "black";
    c.fillRect(x * size, y * size, size, size);
  }

  #drawDot(c, x, y, size) {
    c.drawImage(
      this.yellowDot,
      x * this.tileSize,
      y * this.tileSize,
      size,
      size
    );
  }

  #drawPowerDot(c, x, y, size) {
    --this.powerDotAnimationTimer;
    if (this.powerDotAnimationTimer <= 0) {
      this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault;

      if (this.powerDot === this.pinkDot) this.powerDot = this.yellowDot;
      else this.powerDot = this.pinkDot;
    }
    c.drawImage(
      this.powerDot,
      x * this.tileSize,
      y * this.tileSize,
      size,
      size
    );
  }

  #drawWall(c, x, y, size) {
    c.drawImage(this.wall, x * this.tileSize, y * this.tileSize, size, size);
  }

  getPacman(velocity) {
    for (let row = 0; row < this.map.length; ++row) {
      for (let col = 0; col < this.map[0].length; ++col) {
        if (this.map[row][col] === 4) {
          this.map[row][col] = 0;
          return new Pacman(
            col * this.tileSize,
            row * this.tileSize,
            this.tileSize,
            velocity,
            this
          );
        }
      }
    }
  }

  getEnemies(velocity) {
    const enmies = [];
    for (let row = 0; row < this.map.length; ++row) {
      for (let col = 0; col < this.map[0].length; ++col) {
        if (this.map[row][col] === 6) {
          this.map[row][col] = 0;
          enmies.push(
            new Enemy(
              col * this.tileSize,
              row * this.tileSize,
              this.tileSize,
              velocity,
              this
            )
          );
        }
      }
    }
    return enmies;
  }

  checkCollision(x, y, direction) {
    if (direction == null) {
      return;
    }

    if (
      Number.isInteger(x / this.tileSize) &&
      Number.isInteger(y / this.tileSize)
    ) {
      let column = 0;
      let row = 0;
      let nextColumn = 0;
      let nextRow = 0;

      switch (direction) {
        case MovingDirection.right:
          nextColumn = x + this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;
          break;
        case MovingDirection.left:
          nextColumn = x - this.tileSize;
          column = nextColumn / this.tileSize;
          row = y / this.tileSize;
          break;
        case MovingDirection.up:
          nextRow = y - this.tileSize;
          row = nextRow / this.tileSize;
          column = x / this.tileSize;
          break;
        case MovingDirection.down:
          nextRow = y + this.tileSize;
          row = nextRow / this.tileSize;
          column = x / this.tileSize;
          break;
      }
      const tile = this.map[row][column];
      if (tile === 1) {
        return true;
      }
    }
    return false;
  }

  checkMapEmpty() {
    return this.map.every(
      (row) => !row.some((symbol) => symbol === 0 || symbol === 7)
    );
  }

  eatDot(x, y) {
    const col = x / this.tileSize;
    const row = y / this.tileSize;

    if (
      col < 0 ||
      col >= this.map[0].length ||
      row < 0 ||
      row >= this.map.length
    )
      return -1;

    if (Number.isInteger(row) && Number.isInteger(col)) {
      const numberEat = this.map[row][col];
      if (numberEat === 0 || numberEat === 7) {
        this.map[row][col] = 5;
        return numberEat;
      }
    }
    return -1;
  }

  setCanvasSize(canvas) {
    canvas.width = this.map[0].length * this.tileSize;
    canvas.height = this.map.length * this.tileSize;
  }
}
