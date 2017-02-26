define(function() {
  class Drawable {
    constructor(positionX, positionY) {
      this.positionX = positionX;
      this.positionY = positionY;
    }
    draw() {};
    inBounds() {
      return true;
    };
  }
  return Drawable;
});
