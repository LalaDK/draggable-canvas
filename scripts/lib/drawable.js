define(function() {
  class Drawable {
    /**
     * Create a point.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     */
    constructor(positionX, positionY, isHidden) {
      this.positionX = positionX;
      this.positionY = positionY;
      this.isHidden = isHidden || false;
      this.id;
    }
    draw(canvasObj) {};
    /**
    * Checks if the object is visible in the view. If not, then it should not be drawn.
    * @param {Object} canvas object - Containing selected attributes from canvas instance
    */
    inBounds(canvasObj) {
      return true;
    };
  }
  return Drawable;
});
