/* global THREE, GraphLabel */

(function() {
  "use strict";

  var NUM_TICKS = 5;

  function graphToLocal(value, graphMin, graphMax) {
    return THREE.Math.mapLinear(value, graphMin, graphMax, -0.5, 0.5);
  }

  // Ispired by http://www.realtimerendering.com/resources/GraphicsGems/gems/Label.c
  function niceNum(value, round) {
    var exp = Math.floor(Math.log10(value));
    var fract = value / Math.pow(10, exp);
    var niceFract;
    if (round) {
      if (fract < 1.5) {
        niceFract = 1;
      } else if (fract < 3) {
        niceFract = 2;
      } else if (fract < 7) {
        niceFract = 5;
      } else {
        niceFract = 10;
      }
    } else if (fract <= 1) {
      niceFract = 1;
    } else if (fract <= 2) {
      niceFract = 2;
    } else if (fract <= 5) {
      niceFract = 5;
    } else {
      niceFract = 10;
    }
    return niceFract * Math.pow(10, exp);
  }

  function calculateTicks(min, max) {
    var range = max-min;
    var spacing = niceNum(range / (NUM_TICKS-1), true);
    return {
      min: Math.floor(min / spacing) * spacing + spacing,
      spacing: spacing,
    };
  }

  var GraphAxes2D = function(limits) {
    THREE.Object3D.call(this);

    var crossGeom = new THREE.Geometry();
    crossGeom.vertices.push(
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(2, 0, 0),
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(0, 2, 0)
    );

    this.axes = new THREE.LineSegments(
      crossGeom,
      new THREE.LineBasicMaterial({color: 0})
    );
    this.axes.position.z = 2;
    this.add(this.axes);

    this.gridLines = [];
    var line;
    var gridMaterial = new THREE.LineBasicMaterial({color: 0xaaaaaa});
    for (var i = 0; i < NUM_TICKS; i++) {
      line = new THREE.LineSegments(crossGeom, gridMaterial);
      line.position.z = 1; // under the axes
      this.add(line);
      line.xLabel = new GraphLabel(true);
      this.add(line.xLabel);
      line.yLabel = new GraphLabel(false);
      this.add(line.yLabel);
      this.gridLines.push(line);
    }

    this.setLimits(limits);
  };

  GraphAxes2D.prototype = Object.create(THREE.Object3D.prototype);

  GraphAxes2D.prototype.setLimits = function(limits) {
    this.limits = limits;

    this.axes.position.x = graphToLocal(0, limits.min.x, limits.max.x);
    this.axes.position.y = graphToLocal(0, limits.min.y, limits.max.y);

    var ticks = {
      x: calculateTicks(limits.min.x, limits.max.x),
      y: calculateTicks(limits.min.y, limits.max.y),
    };

    this.gridLines.forEach(function(line, i) {
      var x = ticks.x.min + i*ticks.x.spacing;
      var y = ticks.y.min + i*ticks.y.spacing;
      line.position.x = graphToLocal(x, limits.min.x, limits.max.x);
      line.position.y = graphToLocal(y, limits.min.y, limits.max.y);

      var text;
      line.xLabel.visible = x !== 0;
      if (line.xLabel.visible) {
        text = x.toString();
        if (text.length > 5) {
          text = x.toPrecision(3);
        }
        line.xLabel.setText(text);
        line.xLabel.position.x = graphToLocal(x, limits.min.x, limits.max.x);
        line.xLabel.position.y = graphToLocal(0, limits.min.y, limits.max.y);
      }

      line.yLabel.visible = y !== 0;
      if (line.yLabel.visible) {
        text = y.toString();
        if (text.length > 5) {
          text = y.toPrecision(3);
        }
        line.yLabel.setText(text);
        line.yLabel.position.x = graphToLocal(0, limits.min.x, limits.max.x);
        line.yLabel.position.y = graphToLocal(y, limits.min.y, limits.max.y);
      }
    });
  };

  window.GraphAxes2D = GraphAxes2D;
})();
