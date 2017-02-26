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
    draw(canvas) {
      canvas.context.strokeStyle = this.color;
      canvas.context.lineWidth = this.thickness;
      canvas.context.moveTo(canvas.centerX, canvas.centerY);
      canvas.context.beginPath();
      var min = -Math.floor(((canvas.centerX / canvas.pixelsPerUnitHorizontal)) + 1); // Lowest visible X coordinate
      var max = Math.floor((canvas.screenX - canvas.centerX) / canvas.pixelsPerUnitHorizontal) + 1; // Highest visible X coordinate
      var numberOfPointsPerStep = ((max - min) / 500);
      for(var x = min; x <= max; x+= numberOfPointsPerStep) {
        var result = this.equation(x);
        if(result === -0) {
          result = 0;
        }
        canvas.context.lineTo(canvas.centerX + (x * canvas.pixelsPerUnitHorizontal), canvas.centerY + (-result * canvas.pixelsPerUnitVertical));
      }
      canvas.context.lineJoin = 'round';
      canvas.context.stroke();
      canvas.context.closePath();
      canvas.context.lineWidth = 1;
    }
  }
  return Graph;
});
