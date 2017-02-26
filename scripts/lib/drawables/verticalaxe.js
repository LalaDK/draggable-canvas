define(["lib/drawable"], function(Drawable) {
  class VerticalAxe extends Drawable {
    constructor(color) {
      super();
      this.color = color;
    }
    draw(context, centerX, centerY, screenX, screenY) {
      context.beginPath();
      context.strokeStyle = this.color || "red";
      context.lineWidth = 1;
      context.moveTo(centerX, 0);
      context.lineTo(centerX, screenY);
      context.stroke();
      context.closePath();
    }
    inBounds(centerX, centerY, screenX, screenY) {
      return centerX >= 0 && centerX <= screenX;
    }
  }
  return VerticalAxe;
});
