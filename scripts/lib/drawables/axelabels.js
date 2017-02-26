define(["lib/drawable"], function(Drawable) {
  class AxeLabels extends Drawable {
    constructor() {
      super();
    }
    draw(context, centerX, centerY, screenX, screenY, pixelsPerUnit) {
      var stepDistance = pixelsPerUnit;
      var multiplier = 1;
      if(stepDistance < 30) {
        multiplier = Math.floor(30 / stepDistance);
      }

      var stepWidth = 10;
      var textDistance = stepWidth;
      // Horizontal lines
      context.textAlign = "center";
      for(var x = centerX; x >= -screenX; x -= stepDistance * multiplier) {
        var number = Math.round((x - centerX) / stepDistance);
        context.beginPath();
        context.strokeStyle = "green";
        context.moveTo(x, centerY - stepWidth);
        context.lineTo(x, centerY + stepWidth);
        context.stroke();
        context.closePath();
        if(number < 0) {
          context.strokeText(number.toString(), x, centerY + stepWidth + textDistance);
        }
      }

      for(var x = centerX; x <= screenX; x += stepDistance * multiplier) {
        var number = Math.round((x - centerX) / stepDistance);
        context.beginPath();
        context.moveTo(x, centerY - stepWidth);
        context.lineTo(x, centerY + stepWidth);
        context.stroke();
        if(number > 0) {
          context.strokeText(number.toString(), x, centerY + stepWidth + textDistance);
        }
      }
      for(var y = centerY; y <= screenY; y += stepDistance * multiplier) {
        var number = -Math.round((y - centerY) / stepDistance);
        context.beginPath();
        context.moveTo(centerX - stepWidth, y);
        context.lineTo(centerX + stepWidth, y);
        context.stroke();
        if(number < 0) {
          context.strokeText(number.toString(), centerX - stepWidth - textDistance, y);
        }
      }
      for(var y = centerY; y >= 0; y -= stepDistance * multiplier) {
        var number = -Math.round((y - centerY) / stepDistance);
        context.beginPath();
        context.moveTo(centerX - stepWidth, y);
        context.lineTo(centerX + stepWidth, y);
        context.stroke();
        if(number > 0) {
          context.strokeText(number.toString(), centerX + stepWidth + textDistance, y);
        }
      }
    }
  }
  return AxeLabels;
});
