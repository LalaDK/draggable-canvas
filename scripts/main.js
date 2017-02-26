require([
  "lib/requirejs/domReady",
  "lib/canvas",
  "lib/drawable",
  "lib/drawables/graph/horizontalaxe",
  "lib/drawables/graph/verticalaxe",
  "lib/drawables/graph/graph",
  "lib/drawables/shapes/square",
  "lib/drawables/graph/axelabels"],
function(
  domReady,
  Canvas,
  Drawable,
  HorizontalAxe,
  VerticalAxe,
  Graph,
  Square,
  AxeLabels
) {
var myCanvas;

domReady(function() {
  myCanvas = new Canvas(0,0, "myCanvas");
  myCanvas.centerScreen();
  myCanvas.addObject(new HorizontalAxe());
  myCanvas.addObject(new VerticalAxe());
  myCanvas.addObject(new AxeLabels());
  //myCanvas.addObject(new Square(0,0, 10, 10, "red", "black", 1));
  myCanvas.addObject(new Graph(function(x) {return x;}, "blue", 2));
  myCanvas.addObject(new Graph(function(x) {return -0.1*x*x + 5;}, "green", 3));
  myCanvas.addObject(new Graph(function(x) {return Math.sin(x)* x;}, "orange", 1));
  myCanvas.addObject(new Graph(function(x) {return Math.sin(x);}, "red", 1));

  if(true) {
    for(var i = 0; i < 10; i++) {
      var x = Math.floor(Math.random() * myCanvas.screenX) - (myCanvas.screenX / 2);
      var y = Math.floor(Math.random() * myCanvas.screenY) - (myCanvas.screenY / 2);
      var width = Math.floor(Math.random() * 50 + 10);
      var height = Math.floor(Math.random() * 50 + 10);
      myCanvas.addObject(new Square(x, y, width, height, "blue", "yellow", Math.floor(Math.random()*5)));
    }
  }

  myCanvas.draw();
}, false);
});
