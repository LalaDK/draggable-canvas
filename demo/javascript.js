$( document ).ready(function() {
  var element = document.getElementById("myCanvas");
  element.width = 0.8 * Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  element.height = 0.8 *  Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  var myCanvas = mCanvas.createCanvas("myCanvas");
  myCanvas.centerScreen();
  myCanvas.addObject(mCanvas.createHorizontalAxe());
  myCanvas.addObject(mCanvas.createVerticalAxe());
  myCanvas.addObject(mCanvas.createAxeLabels());
  myCanvas.addObject(mCanvas.createGraph(function(x) {return x;}, "blue", 2));
  myCanvas.addObject(mCanvas.createGraph(function(x) {return -0.1*x*x + 5;}, "green", 3));
  myCanvas.addObject(mCanvas.createGraph(function(x) {return Math.sin(x) * 5;}, "red", 1));
  for(var i = 0; i < 10; i++) {
    var x = Math.floor(Math.random() * myCanvas.screenX) - (myCanvas.screenX / 2);
    var y = Math.floor(Math.random() * myCanvas.screenY) - (myCanvas.screenY / 2);
    var width = Math.floor(Math.random() * 50 + 10);
    var height = Math.floor(Math.random() * 50 + 10);
    myCanvas.addObject(mCanvas.createSquare(x, y, width, height, "blue", "yellow", Math.floor(Math.random()*5)));
  }
  myCanvas.centerScreen(10,10);
  myCanvas.draw();
});
