define(function() {
  /** Class representing the canvas. */
  class Canvas {
    /**
    * Create a canvas instance.
    * @param {string} elementId - Id of the canvas element.
    * @param {object} Options object.
    */
    constructor(elementId, options) {
      this.canvas = document.getElementById(elementId);
      this.context = this.canvas.getContext("2d");
      this.screenX = this.canvas.width;
      this.screenY = this.canvas.height;
      this.screenDisplacementX = 0;
      this.screenDisplacementY = 0;
      this.isDragging = false;
      this.centerX = 0;
      this.centerY = 0;
      this.pixelsPerUnit = 10;
      this.objects = [];
      self = this;
      self.initialize();
    }

    /** Initializes event listeners on canvas object. Is called from constructor. */
    initialize() {
      this.canvas.addEventListener('mousedown', function(event) {
        if(event.offsetX < self.screenX && event.offsetY < self.screenY) {
          self.isDragging = true;
        }
      });

      document.addEventListener('mouseup', function(event) {
        self.isDragging = false;
      });

      this.canvas.addEventListener('mousemove', function(event) {
        if(self.isDragging) {
          self.screenDisplacementX = self.screenDisplacementX + event.movementX;
          self.screenDisplacementY = self.screenDisplacementY + event.movementY;
          self.computeCenter();
          self.redraw();
        }
      });

      this.canvas.addEventListener('mousewheel', function(event) {
        if(event.deltaY !== 0 && event.deltaY !== NaN) {
          self.pixelsPerUnit *= Math.sign(event.deltaY) > 0 ? 0.909 : 1.1;
          self.context.setTransform(1, 0, 0, 1, 0, 0);
          self.centerScreen();
          self.redraw();
        }
      });
    }

    /**
    * Adds drawable object to canvas.
    * @param {Drawable} obj
    */
    addObject(obj) {
      self.objects.push(obj);
    };

    /**
    * Center the view at given coordinates.
    * @param {integer} x - The x position.
    * @param {integer} y - The y position.
    */
    moveCenter(x, y) {
      this.screenDisplacementX = -Number.parseInt(self.screenX / 2) + x;
      this.screenDisplacementY = -Number.parseInt(self.screenY / 2) + y;
      this.computeCenter();
    }

    /** Center the view at 0,0. */
    centerScreen() {
      self.moveCenter(0,0);
    };

    /** Computes the displaced center. */
    computeCenter() {
      self.centerX = self.screenX + self.screenDisplacementX;
      self.centerY = self.screenY + self.screenDisplacementY;
    };

    /** Clears the canvas. */
    clear() {
      self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
    };

    /** Clears and draws all objects. */
    redraw() {
      self.clear();
      self.draw();
    };

    /** Draw all objects. */
    draw() {
      this.objects.forEach(function(obj) {
        if(obj.inBounds(self.centerX, self.centerY, self.screenX, self.screenY)) {
          obj.draw(self.context, self.centerX, self.centerY, self.screenX, self.screenY, self.pixelsPerUnit);
        }
      });
    };
  }
  return Canvas;
});
