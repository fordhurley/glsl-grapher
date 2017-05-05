(function() {
  "use strict";

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

    var axesGeometry = new THREE.Geometry();
    axesGeometry.vertices.push(
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(0, 0.5, 0)
    );

    this.axes = new THREE.LineSegments(
      axesGeometry,
      new THREE.LineBasicMaterial({color: 0})
    );
    this.axes.position.z = 1;
    this.updateAxes();
    this.add(this.axes);
  };

  Graph2D.prototype = Object.create(THREE.Mesh.prototype);

  Graph2D.prototype.updateAxes = function() {
    var limits = this.material.limits;
    var size = limits.getSize();
    this.axes.position.x = -limits.min.x / size.x - 0.5;
    this.axes.position.y = -limits.min.y / size.y - 0.5;
    this.axes.scale.set(2*size.x, 2*size.y, 1);
  };

  Graph2D.prototype.setLimits = function(limits) {
    this.material.limits.copy(limits);
    this.updateAxes();
    this.dispatchEvent({type: "changed:limits", limits: limits});
  };

  window.Graph2D = Graph2D;

})();
