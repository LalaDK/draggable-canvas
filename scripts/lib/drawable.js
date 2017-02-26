define(function() {
  class Drawable {
    /**
     * Create a point.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     */
    constructor(positionX, positionY) {
      this.positionX = positionX;
      this.positionY = positionY;
    }
    draw() {};
    /**
    * Checks if the object is visible in the view. If not, then it should not be drawn.
    * @param {integer} centerX - The x coordinate of the center
    * @param {integer} centerY - The y coordinate of the center
    * @param {integer} screenX - The width of the view
    * @param {integer} screenY - The height of the view
    */
    inBounds(centerX, centerY, screenX, screenY) {
      return true;
    };
  }
  return Drawable;
});
