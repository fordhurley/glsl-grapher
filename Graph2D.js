(function() {
  "use strict";

  function graphToLocal(value, graphMin, graphMax) {
    return THREE.Math.mapLinear(value, graphMin, graphMax, -0.5, 0.5);
  }

  var Graph2D = function(options) {
    THREE.Mesh.call(this,
      new THREE.PlaneGeometry(1, 1),
      new GraphMaterial2D({
        shaderFunc: options.shaderFunc,
        limits: options.limits,
        overColor: options.overColor,
        underColor: options.underColor,
      })
    );

    var crossGeom = new THREE.Geometry();
    crossGeom.vertices.push(
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(0, 0.5, 0)
    );

    this.axes = new THREE.LineSegments(
      crossGeom,
      new THREE.LineBasicMaterial({color: 0})
    );
    this.axes.position.z = 2;
    this.add(this.axes);

    // Indicate x=1 and y=1 with another set of lines:
    this.onesLines = new THREE.LineSegments(
      crossGeom,
      new THREE.LineBasicMaterial({color: 0xaaaaaa})
    );
    this.onesLines.position.z = 1; // under the axes, so that you see the axes if you zoom out
    this.add(this.onesLines);

    this.updateLines();
  };

  Graph2D.prototype = Object.create(THREE.Mesh.prototype);

  Graph2D.prototype.updateLines = function() {
    var limits = this.material.limits;
    this.axes.position.x = graphToLocal(0, limits.min.x, limits.max.x);
    this.axes.position.y = graphToLocal(0, limits.min.y, limits.max.y);
    this.onesLines.position.x = graphToLocal(1, limits.min.x, limits.max.x);
    this.onesLines.position.y = graphToLocal(1, limits.min.y, limits.max.y);

    var size = limits.getSize();
    this.axes.scale.set(2*size.x, 2*size.y, 1);
    this.onesLines.scale.copy(this.axes.scale);
  };

  Graph2D.prototype.setLimits = function(limits) {
    this.material.limits.copy(limits);
    this.updateLines();
    this.dispatchEvent({type: "changed:limits", limits: limits});
  };

  window.Graph2D = Graph2D;

})();
