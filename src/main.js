require(["lib/canvas", "lib/drawable", "lib/drawables/graph/horizontalaxe", "lib/drawables/graph/verticalaxe", "lib/drawables/graph/graph", "lib/drawables/shapes/square", "lib/drawables/graph/axelabels", "lib/drawables/shapes/screencross"],
function(Canvas, Drawable, HorizontalAxe, VerticalAxe, Graph, Square, AxeLabels, ScreenCross ) {
  window.mCanvas = {
    createCanvas: function(elementId, options) {
      return new Canvas(elementId, options);
    },

    createAxeLabels: function() {
      return new AxeLabels();
    },

    createGraph: function(equation, color, thickness) {
      return new Graph(equation, color, thickness);
    },

    createHorizontalAxe: function(color) {
      return new HorizontalAxe(color);
    },

    createVerticalAxe: function(color) {
      return new VerticalAxe(color);
    },

    createScreenCross: function() {
      return new ScreenCross();
    },

    createSquare: function(positionX, positionY, width, height, strokeColor, fillColor, borderThickness) {
      return new Square(positionX, positionY, width, height, strokeColor, fillColor, borderThickness);
    }
  };
});
