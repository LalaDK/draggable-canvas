define(["lib/drawable"], function(Drawable) {
  class ScreenCross extends Drawable {
    /**
    * Create a cross across the screen;
    */
    constructor(positionX, positionY) {
      super(positionX, positionY);
    }

    draw(canvas) {
      canvas.context.strokeStyle = "blue";
      canvas.context.lineWidth = 1;
      canvas.context.beginPath();
      canvas.context.moveTo(canvas.centerX - canvas.screenX, canvas.screenY / 2);
      canvas.context.lineTo(canvas.centerX + canvas.screenX, canvas.screenY / 2);
      canvas.context.stroke();
      canvas.context.moveTo(canvas.screenX / 2, canvas.screenY - canvas.screenY);
      canvas.context.lineTo(canvas.screenX / 2, canvas.screenY + canvas.screenY);
      canvas.context.stroke();
      canvas.context.closePath();
    }

    inBounds() {
      return true;
    }
  }
  return ScreenCross;
});
