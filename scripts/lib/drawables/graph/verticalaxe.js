define(["lib/drawable"], function(Drawable) {
  class VerticalAxe extends Drawable {
    constructor(color) {
      super();
      this.color = color;
    }
    draw(canvas) {
      canvas.context.beginPath();
      canvas.context.strokeStyle = this.color || "red";
      canvas.context.lineWidth = 1;
      canvas.context.moveTo(canvas.centerX, 0);
      canvas.context.lineTo(canvas.centerX, canvas.screenY);
      canvas.context.stroke();
      canvas.context.closePath();
    }
    inBounds(canvas) {
      return canvas.centerX >= 0 && canvas.centerX <= canvas.screenX;
    }
  }
  return VerticalAxe;
});
