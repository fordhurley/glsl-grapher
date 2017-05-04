(function() {
  "use strict";

  var Grapher2D = function(options) {
    THREE.Object3D.call(this);

    this.graph = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new GrapherMaterial2D({
        shaderFunc: options.shaderFunc,
        limits: options.limits,
        overColor: options.overColor,
        underColor: options.underColor,
      })
    );
    this.add(this.graph);

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
    this.updateAxes();
    this.add(this.axes);
  };

  Grapher2D.prototype = Object.create(THREE.Object3D.prototype);

  Grapher2D.prototype.updateAxes = function() {
    var limits = this.graph.material.limits;
    var size = limits.getSize();
    this.axes.position.x = -limits.min.x / size.x - 0.5;
    this.axes.position.y = -limits.min.y / size.y - 0.5;
    this.axes.scale.set(2*size.x, 2*size.y, 1);
  };

  Grapher2D.prototype.setLimits = function(limits) {
    this.graph.material.limits.copy(limits);
    this.updateAxes();
  };

  window.Grapher2D = Grapher2D;

})();
