define(["lib/drawable"], function(Drawable) {
  class AxeLabels extends Drawable {
    constructor() {
      super();
    }
    draw(canvas) {
      var horizontalMultiplier = (canvas.pixelsPerUnitHorizontal < 30 ? Math.floor(30 / canvas.pixelsPerUnitHorizontal) : 1);
      var verticalMultiplier = (canvas.pixelsPerUnitVertical < 30 ? Math.floor(30 / canvas.pixelsPerUnitVertical) : 1);
      var stepWidth = 5;
      var textDistance = stepWidth + 5;

      // Horizontal lines
      canvas.context.textAlign = "center";
      canvas.context.strokeStyle = "red";
      for(var x = canvas.centerX; x >= -canvas.screenX; x -= canvas.pixelsPerUnitHorizontal * horizontalMultiplier) {
        var number = Math.round((x - canvas.centerX) / canvas.pixelsPerUnitHorizontal);
        canvas.context.beginPath();
        canvas.context.moveTo(x, canvas.centerY - stepWidth);
        canvas.context.lineTo(x, canvas.centerY + stepWidth);
        canvas.context.stroke();
        canvas.context.closePath();
        if(number < 0) {
          canvas.context.strokeText(number.toString(), x, canvas.centerY + stepWidth + textDistance);
        }
      }

      for(var x = canvas.centerX; x <= canvas.screenX; x += canvas.pixelsPerUnitHorizontal * horizontalMultiplier) {
        var number = Math.round((x - canvas.centerX) / canvas.pixelsPerUnitHorizontal);
        canvas.context.beginPath();
        canvas.context.moveTo(x, canvas.centerY - stepWidth);
        canvas.context.lineTo(x, canvas.centerY + stepWidth);
        canvas.context.stroke();
        if(number > 0) {
          canvas.context.strokeText(number.toString(), x, canvas.centerY + stepWidth + textDistance);
        }
      }

      // Vertical lines
      for(var y = canvas.centerY; y <= canvas.screenY; y += canvas.pixelsPerUnitVertical * verticalMultiplier) {
        var number = -Math.round((y - canvas.centerY) / canvas.pixelsPerUnitVertical);
        canvas.context.beginPath();
        canvas.context.moveTo(canvas.centerX - stepWidth, y);
        canvas.context.lineTo(canvas.centerX + stepWidth, y);
        canvas.context.stroke();
        if(number < 0) {
          canvas.context.strokeText(number.toString(), canvas.centerX - stepWidth - textDistance, y +3);
        }
      }
      for(var y = canvas.centerY; y >= 0; y -= canvas.pixelsPerUnitVertical * verticalMultiplier) {
        var number = -Math.round((y - canvas.centerY) / canvas.pixelsPerUnitVertical);
        canvas.context.beginPath();
        canvas.context.moveTo(canvas.centerX - stepWidth, y);
        canvas.context.lineTo(canvas.centerX + stepWidth, y);
        canvas.context.stroke();
        if(number > 0) {
          canvas.context.strokeText(number.toString(), canvas.centerX + stepWidth + textDistance, y + 3);
        }
      }
    }
  }
  return AxeLabels;
});
