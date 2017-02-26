define(["lib/drawable"], function(Drawable) {
  class AxeLabels extends Drawable {
    constructor() {
      super();
    }
    draw(canvas) {
      var stepDistance = canvas.pixelsPerUnitHorizontal;
      var multiplier = 1;
      if(stepDistance < 30) {
        multiplier = Math.floor(30 / stepDistance);
      }
      var stepWidth = 10;
      var textDistance = stepWidth;
      // Horizontal lines
      canvas.context.textAlign = "center";
      for(var x = canvas.centerX; x >= -canvas.screenX; x -= stepDistance * multiplier) {
        var number = Math.round((x - canvas.centerX) / stepDistance);
        canvas.context.beginPath();
        canvas.context.strokeStyle = "green";
        canvas.context.moveTo(x, canvas.centerY - stepWidth);
        canvas.context.lineTo(x, canvas.centerY + stepWidth);
        canvas.context.stroke();
        canvas.context.closePath();
        if(number < 0) {
          canvas.context.strokeText(number.toString(), x, canvas.centerY + stepWidth + textDistance);
        }
      }

      for(var x = canvas.centerX; x <= canvas.screenX; x += stepDistance * multiplier) {
        var number = Math.round((x - canvas.centerX) / stepDistance);
        canvas.context.beginPath();
        canvas.context.moveTo(x, canvas.centerY - stepWidth);
        canvas.context.lineTo(x, canvas.centerY + stepWidth);
        canvas.context.stroke();
        if(number > 0) {
          canvas.context.strokeText(number.toString(), x, canvas.centerY + stepWidth + textDistance);
        }
      }
      for(var y = canvas.centerY; y <= canvas.screenY; y += stepDistance * multiplier) {
        var number = -Math.round((y - canvas.centerY) / stepDistance);
        canvas.context.beginPath();
        canvas.context.moveTo(canvas.centerX - stepWidth, y);
        canvas.context.lineTo(canvas.centerX + stepWidth, y);
        canvas.context.stroke();
        if(number < 0) {
          canvas.context.strokeText(number.toString(), canvas.centerX - stepWidth - textDistance, y);
        }
      }
      for(var y = canvas.centerY; y >= 0; y -= stepDistance * multiplier) {
        var number = -Math.round((y - canvas.centerY) / stepDistance);
        canvas.context.beginPath();
        canvas.context.moveTo(canvas.centerX - stepWidth, y);
        canvas.context.lineTo(canvas.centerX + stepWidth, y);
        canvas.context.stroke();
        if(number > 0) {
          canvas.context.strokeText(number.toString(), canvas.centerX + stepWidth + textDistance, y);
        }
      }
    }
  }
  return AxeLabels;
});
