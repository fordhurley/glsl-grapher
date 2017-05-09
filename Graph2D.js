/* global THREE, GraphMaterial2D, GraphAxes2D */

(function() {
  "use strict";

  var Graph2D = function(options) {
    THREE.Mesh.call(this,
      new THREE.PlaneGeometry(1, 1),
      new GraphMaterial2D({
        shaderFunc: options.shaderFunc,
        limits: options.limits,
        color: options.color,
      })
    );

    this.axes = new GraphAxes2D(this.material.limits);
    this.add(this.axes);
  };

  Graph2D.prototype = Object.create(THREE.Mesh.prototype);

  Graph2D.prototype.getLimits = function() {
    return this.material.limits;
  };

  Graph2D.prototype.setLimits = function(limits) {
    this.material.limits.copy(limits);
    this.axes.setLimits(limits);
    this.dispatchEvent({type: "changed:limits", limits: limits});
  };

  Graph2D.prototype.setShaderFunc = function(shaderFunc) {
    this.material.setShaderFunc(shaderFunc);
    this.dispatchEvent({type: "changed:shaderFunc", shaderFunc: shaderFunc});
  };

  window.Graph2D = Graph2D;
})();
