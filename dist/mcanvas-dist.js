(function () {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("lib/requirejs/almond", function(){});

define('lib/canvas',[],function() {
  /** Class representing the canvas. */
  class Canvas {
    /**
    * Create a canvas instance.
    * @param {string} elementId - Id of the canvas element.
    * @param {object} Options object.
    */
    constructor(elementId, options) {
      console.log("elementId", elementId);
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

define('lib/drawable',[],function() {
  class Drawable {
    /**
     * Create a point.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     */
    constructor(positionX, positionY, isHidden) {
      this.positionX = positionX;
      this.positionY = positionY;
      this.isHidden = isHidden || false;
      this.id;
    }
    draw(canvasObj) {};
    /**
    * Checks if the object is visible in the view. If not, then it should not be drawn.
    * @param {Object} canvas object - Containing selected attributes from canvas instance
    */
    inBounds(canvasObj) {
      return true;
    };
  }
  return Drawable;
});

define('lib/drawables/graph/horizontalaxe',["lib/drawable"], function(Drawable) {
  class HorizontalAxe extends Drawable {
    constructor(color) {
      super();
      this.color = color;
    }
    draw(canvas) {
      canvas.context.strokeStyle = this.color || "red";
      canvas.context.lineWidth = 1;
      canvas.context.beginPath();
      canvas.context.moveTo(0, canvas.centerY);
      canvas.context.lineTo(canvas.screenX, canvas.centerY);
      canvas.context.stroke();
      canvas.context.closePath();
    }
    inBounds(canvas) {
      return canvas.centerY >= 0 && canvas.centerY <= canvas.screenY;
    }
  }
  return HorizontalAxe;
});

define('lib/drawables/graph/verticalaxe',["lib/drawable"], function(Drawable) {
  class VerticalAxe extends Drawable {
    constructor(color) {
      super();
      this.color = color;
    }
    draw(canvas) {
      canvas.context.beginPath();
      canvas.context.strokeStyle = this.color || "red";
      canvas.context.lineWidth = 1;
      canvas.context.moveTo(canvas.centerX, 0);
      canvas.context.lineTo(canvas.centerX, canvas.screenY);
      canvas.context.stroke();
      canvas.context.closePath();
    }
    inBounds(canvas) {
      return canvas.centerX >= 0 && canvas.centerX <= canvas.screenX;
    }
  }
  return VerticalAxe;
});

define('lib/drawables/graph/graph',["lib/drawable"], function(Drawable) {
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

define('lib/drawables/shapes/square',["lib/drawable"], function(Drawable) {
  class Square extends Drawable {
    /**
    * Create a Graph instance.
    * @param {integer} position x - position x
    * @param {integer} position y - position y
    * @param {integer} width - width of the square
    * @param {integer} height - height of the square
    * @param {string} strokeColor - string representing the stroke color
    * @param {string} fillColor - string representing the fill color
    * @param {integer} thickness - an integer representing the border thickness
    */
    constructor(positionX, positionY, width, height, strokeColor, fillColor, borderThickness) {
      super(positionX, positionY);
      this.width = width;
      this.height = height;
      this.strokeColor = strokeColor;
      this.fillColor = fillColor;
      this.borderThickness = borderThickness;
    }

    draw(canvas) {
      var positionX = this.positionX * canvas.pixelsPerUnitHorizontal;
      var positionY = -(this.positionY * canvas.pixelsPerUnitVertical);
      var width = this.width * canvas.pixelsPerUnitHorizontal;
      var height = -(this.height * canvas.pixelsPerUnitVertical);

      canvas.context.fillStyle = this.fillColor || "black";
      canvas.context.fillRect(canvas.centerX + positionX, canvas.centerY + positionY, width, height);
      canvas.context.beginPath();
      canvas.context.strokeStyle = this.strokeColor || "red";
      canvas.context.lineWidth = this.borderThickness;
      canvas.context.strokeRect(canvas.centerX + positionX, canvas.centerY + positionY, width, height);
      canvas.context.closePath();
      canvas.context.lineWidth = 1;
    }

    inBounds() {
      return true;
    }
  }
  return Square;
});

define('lib/drawables/graph/axelabels',["lib/drawable"], function(Drawable) {
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
      canvas.context.font = "8pt normal sans-serif";
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

define('lib/drawables/shapes/screencross',["lib/drawable"], function(Drawable) {
  class ScreenCross extends Drawable {
    /**
    * Create a cross across the screen;
    */
    constructor() {
      super();
    }

    draw(canvas) {
      canvas.context.strokeStyle = "blue";
      canvas.context.lineWidth = 1;
      canvas.context.beginPath();
      canvas.context.moveTo(canvas.centerX - canvas.screenX, canvas.screenY / 2);
      canvas.context.lineTo(canvas.centerX + canvas.screenX, canvas.screenY / 2);
      canvas.context.stroke();
      canvas.context.moveTo(canvas.screenX / 2, canvas.screenY - canvas.screenY);
      canvas.context.lineTo(canvas.screenX / 2, canvas.screenY + canvas.screenY);
      canvas.context.stroke();
      canvas.context.closePath();
    }

    inBounds() {
      return true;
    }
  }
  return ScreenCross;
});

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

define("main", function(){});

}());