define(["lib/drawable"], function(Drawable) {
  class HorizontalAxe extends Drawable {
    constructor(color) {
      super();
      this.color = color;
    }
    draw(context, centerX, centerY, screenX, screenY) {
      context.strokeStyle = this.color || "red";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, centerY);
      context.lineTo(screenX, centerY);
      context.stroke();
      context.closePath();
    }
    inBounds(centerX, centerY, screenX, screenY) {
      return centerY >= 0 && centerY <= screenY;
    }
  }
  return HorizontalAxe;
});
