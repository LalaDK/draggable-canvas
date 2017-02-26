define(function() {
  class Canvas {
    constructor(elementId, options) {
      this.canvas = document.getElementById(elementId);
      this.canvas.width = 0.8 * Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      this.canvas.height =0.8 *  Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      this.context = this.canvas.getContext("2d");
      this.screenX = this.canvas.width;
      this.screenY = this.canvas.height;
      this.screenDisplacementX = 0;
      this.screenDisplacementY = 0;
      this.isDragging = false;
      this.centerX = 0;
      this.centerY = 0;
      this.pixelsPerUnit = 10;
      this.scale = 1;
      this.showGrid = true;
      this.context.scale(this.scale, this.scale);
      this.objects = [];
      self = this;
      self.initialize();
    }

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
          var movementX = event.movementX / self.scale;
          var movementY = event.movementY / self.scale;
          self.screenDisplacementX = self.screenDisplacementX + movementX;
          self.screenDisplacementY = self.screenDisplacementY + movementY;
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

    addObject(obj) {
      self.objects.push(obj);
    };

    moveCenter(x, y) {
      this.screenDisplacementX = -Number.parseInt(self.screenX / 2) + x;
      this.screenDisplacementY = -Number.parseInt(self.screenY / 2) + y;
      this.screenDisplacementX = (1 + (1 - (1 / this.scale))) * this.screenDisplacementX;
      this.screenDisplacementY = (1 + (1 - (1 / this.scale))) * this.screenDisplacementY;
      this.computeCenter();
    }

    centerScreen() {
      self.moveCenter(0,0);
    };

    computeCenter() {
      self.centerX = self.screenX + self.screenDisplacementX;
      self.centerY = self.screenY + self.screenDisplacementY;
    };

    clear() {
      self.context.clearRect(0, 0, self.canvas.width * self.scale, self.canvas.height * self.scale);
    };

    redraw() {
      self.clear();
      self.draw();
    };

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
