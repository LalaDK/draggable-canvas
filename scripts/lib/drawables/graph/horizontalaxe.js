define(["lib/drawable"], function(Drawable) {
  class HorizontalAxe extends Drawable {
    constructor(color) {
      super();
      this.color = color;
    }
    draw(canvas) {
      canvas.context.strokeStyle = this.color || "red";
      canvas.context.lineWidth = 1;
      canvas.context.beginPath();
      canvas.context.moveTo(0, canvas.centerY);
      canvas.context.lineTo(canvas.screenX, canvas.centerY);
      canvas.context.stroke();
      canvas.context.closePath();
    }
    inBounds(canvas) {
      return canvas.centerY >= 0 && canvas.centerY <= canvas.screenY;
    }
  }
  return HorizontalAxe;
});
