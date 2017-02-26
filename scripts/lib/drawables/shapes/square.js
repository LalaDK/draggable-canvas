define(["lib/drawable"], function(Drawable) {
  class Square extends Drawable {
    /**
    * Create a Graph instance.
    * @param {integer} position x - position x
    * @param {integer} position y - position y
    * @param {integer} width - width of the square
    * @param {integer} height - height of the square
    * @param {string} strokeColor - string representing the stroke color
    * @param {string} fillColor - string representing the fill color
    * @param {integer} thickness - an integer representing the border thickness
    */
    constructor(positionX, positionY, width, height, strokeColor, fillColor, borderThickness) {
      super(positionX, positionY);
      this.width = width;
      this.height = height;
      this.strokeColor = strokeColor;
      this.fillColor = fillColor;
      this.borderThickness = borderThickness;
    }

    draw(canvas) {
      var positionX = this.positionX * canvas.pixelsPerUnitHorizontal;
      var positionY = -(this.positionY * canvas.pixelsPerUnitVertical);
      var width = this.width * canvas.pixelsPerUnitHorizontal;
      var height = -(this.height * canvas.pixelsPerUnitVertical);

      canvas.context.fillStyle = this.fillColor || "black";
      canvas.context.fillRect(canvas.centerX + positionX, canvas.centerY + positionY, width, height);
      canvas.context.beginPath();
      canvas.context.strokeStyle = this.strokeColor || "red";
      canvas.context.lineWidth = this.borderThickness;
      canvas.context.strokeRect(canvas.centerX + positionX, canvas.centerY + positionY, width, height);
      canvas.context.closePath();
      canvas.context.lineWidth = 1;
    }

    inBounds() {
      return true;
    }
  }
  return Square;
});
