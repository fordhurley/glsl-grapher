/* global THREE, GraphMaterial2D, GraphAxes2D */

(function() {
  "use strict";

  var Graph2D = function(options) {
    THREE.EventDispatcher.call(this);

    this.canvas = options.canvas;

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
    this.renderer.setClearColor(0xf9f9f9);

    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 100);
    this.camera.position.z = 50;

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new GraphMaterial2D({
        shaderFunc: options.shaderFunc,
        limits: options.limits,
        color: options.color,
      })
    );
    this.scene.add(this.plane);

    this.axes = new GraphAxes2D(this.plane.material.limits);
    this.scene.add(this.axes);

    this.resize();
  };

  Graph2D.prototype = Object.create(THREE.EventDispatcher.prototype);

  Object.assign(Graph2D.prototype, {
    render: function() {
      this.renderer.render(this.scene, this.camera);
    },

    resize: function() {
      this.canvas.style = "";
      var style = window.getComputedStyle(this.canvas);
      var width = parseInt(style.width, 10);
      var height = parseInt(style.height, 10);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);
      this.render();
    },

    getLimits: function() {
      return this.plane.material.limits;
    },

    setLimits: function(limits) {
      this.plane.material.limits.copy(limits);
      this.axes.setLimits(limits);
      this.render();
      this.dispatchEvent({type: "changed:limits", limits: limits});
    },

    setShaderFunc: function(shaderFunc) {
      this.plane.material.setShaderFunc(shaderFunc);
      this.render();
      this.dispatchEvent({type: "changed:shaderFunc", shaderFunc: shaderFunc});
    },
  });

  window.Graph2D = Graph2D;
})();
