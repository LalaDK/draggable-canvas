define(["lib/drawable"], function(Drawable) {
  class Square extends Drawable {
    constructor(positionX, positionY, width, height, strokeColor, fillColor, borderThickness) {
      super(positionX, positionY);
      this.width = width;
      this.height = height;
      this.strokeColor = strokeColor;
      this.fillColor = fillColor;
      this.borderThickness = borderThickness;
    }

    draw(context, centerX, centerY, screenX, screenY, pixelsPerUnit) {
      var positionX = this.positionX * pixelsPerUnit;
      var positionY = this.positionY * pixelsPerUnit;
      var width = this.width * pixelsPerUnit;
      var height = this.height * pixelsPerUnit;

      context.fillStyle = this.fillColor || "black";
      context.fillRect(centerX + positionX, centerY + positionY, width, height);
      context.beginPath();
      context.strokeStyle = this.strokeColor || "red";
      context.lineWidth = this.borderThickness;
      context.strokeRect(centerX + positionX, centerY + positionY, width, height);
      context.closePath();
      context.lineWidth = 1;
    }

    inBounds(centerX, centerY, screenX, screenY) {
      return true;
    }
  }
  return Square;
});
