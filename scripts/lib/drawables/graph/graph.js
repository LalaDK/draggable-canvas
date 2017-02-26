define(["lib/drawable"], function(Drawable) {
  class Graph extends Drawable {
    /**
    * Create a Graph instance.
    * @param {function} equation - function representation an eqaution in the form of function(x) {return x * x;}.
    * @param {string} color - string representing a color
    * @param {integer} thickness - an integer representing the line thickness
    */
    constructor(equation, color, thickness) {
      super();
      this.equation = equation;
      this.color = color || "blue";
      this.thickness = thickness || 1;
    }
    draw(context, centerX, centerY, screenX, screenY, pixelsPerUnit) {
      context.strokeStyle = this.color;
      context.lineWidth = this.thickness;
      context.moveTo(centerX, centerY);
      context.beginPath();
      var min = -Math.floor(((centerX / pixelsPerUnit)) + 1); // Lowest visible X coordinate
      var max = Math.floor((screenX - centerX) / pixelsPerUnit) + 1; // Highest visible X coordinate
      var numberOfPointsPerStep = ((max - min) / 500);
      for(var x = min; x <= max; x+= numberOfPointsPerStep) {
        var result = this.equation(x);
        if(result === -0) {
          result = 0;
        }
        context.lineTo(centerX + (x * pixelsPerUnit), centerY + (-result * pixelsPerUnit));
      }
      context.lineJoin = 'round';
      context.stroke();
      context.closePath();
      context.lineWidth = 1;
    }
  }
  return Graph;
});
