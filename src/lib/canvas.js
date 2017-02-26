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
      this.pixelsPerUnitHorizontal = 10;
      this.pixelsPerUnitVertical = 10;
      this.objects = [];
      this.objectId = 0;
      self = this;
      self.initialize();
    }

    getUniqueId(){
        return this.objectId++;
    };
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

      this.canvas.addEventListener('wheel', function(event) {
        if(event.deltaY !== 0) {
          self.pixelsPerUnitHorizontal *= Math.sign(event.deltaY) > 0 ? 0.909 : 1.1;
          self.pixelsPerUnitVertical *= Math.sign(event.deltaY) > 0 ? 0.909 : 1.1;
          self.context.setTransform(1, 0, 0, 1, 0, 0);
          self.redraw();
        }
      });
    }

    /**
    * Adds drawable object to canvas.
    * @param {Drawable} obj
    */
    addObject(obj) {
      obj.id = this.getUniqueId();
      self.objects.push(obj);
    };

    /**
    * Removes drawable object.
    * @param {integer} identifier
    */
    removeObject(id) {
      var index = self.objects.findIndex(function(obj) {return obj.id === id;});
      if(index > -1) {
        self.objects.splice(index, 1);
        self.redraw();
      }
    };

    viewRangeByUnits(x1, x2, y1, y2) {
      if(x1 < x2 && y1 < y2) {
        var horizontalDistance = x2 - x1;
        var verticalDistance = y2 - y1;
        this.pixelsPerUnitHorizontal = this.screenX / horizontalDistance;
        this.pixelsPerUnitVertical = this.screenY / verticalDistance;
        this.moveCenter(-(self.centerX + (x1 * this.pixelsPerUnitHorizontal)), (self.centerY + (y1 * this.pixelsPerUnitVertical)));
        this.redraw();
      }
    }

    /**
    * Moves the view center relative to the current view center.
    * @param {integer} x - The x position.
    * @param {integer} y - The y position.
    */
    moveCenter(x, y) {
      this.screenDisplacementX = -(Number.parseInt(self.screenX / 2) + (x * this.pixelsPerUnitHorizontal));
      this.screenDisplacementY = (-Number.parseInt(self.screenY / 2) + (y * this.pixelsPerUnitVertical));
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
      var canvasObj = {
        context: self.context,
        centerX: self.centerX,
        centerY: self.centerY,
        screenX: self.screenX,
        screenY: self.screenY,
        pixelsPerUnitHorizontal: self.pixelsPerUnitHorizontal,
        pixelsPerUnitVertical: self.pixelsPerUnitVertical,
        removeObject: self.removeObject
      };
      this.objects.forEach(function(obj) {
        if(!obj.isHidden) {
          if(obj.inBounds(canvasObj)) {
            obj.draw(canvasObj);
          }
        }
      });
    };
  }
  return Canvas;
});
