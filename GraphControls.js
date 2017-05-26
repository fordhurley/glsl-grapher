/* global THREE */

(function() {
  "use strict";

  // This is largely based on:
  // https://github.com/mrdoob/three.js/blob/7ac632bf/examples/js/controls/TransformControls.js

  function pointerLocation(pointer, domElement) {
    var rect = domElement.getBoundingClientRect();
    var x = pointer.clientX - rect.left;
    var y = pointer.clientY - rect.top;
    return new THREE.Vector2(x, -y); // our coordinate system is flipped
  }

  var GraphControls = function(graph, domElement) {
    this.graph = graph;
    this.domElement = domElement;

    this.dragging = false;
    this.prevPoint = null;
  };

  GraphControls.prototype = {
    attachListeners: function() {
      this.domElement.addEventListener("mousedown", this.pointerDown.bind(this), false);
      this.domElement.addEventListener("touchstart", this.pointerDown.bind(this), false);

      this.domElement.addEventListener("mousemove", this.pointerMove.bind(this), false);
      this.domElement.addEventListener("touchmove", this.pointerMove.bind(this), false);

      this.domElement.addEventListener("mouseup", this.pointerUp.bind(this), false);
      this.domElement.addEventListener("mouseout", this.pointerUp.bind(this), false);
      this.domElement.addEventListener("touchend", this.pointerUp.bind(this), false);
      this.domElement.addEventListener("touchcancel", this.pointerUp.bind(this), false);
      this.domElement.addEventListener("touchleave", this.pointerUp.bind(this), false);

      this.domElement.addEventListener("mousewheel", this.scroll.bind(this), false);
    },

    pointerDown: function(e) {
      if (this.dragging) { return; }
      this.dragging = true;

      event.preventDefault();

      var pointer = event.changedTouches ? event.changedTouches[0] : event;
      this.prevPoint = pointerLocation(pointer, this.domElement);
    },

    pointerMove: function(e) {
      if (!this.dragging) { return; }

      event.preventDefault();

      var pointer = event.changedTouches ? event.changedTouches[0] : event;
      var currPoint = pointerLocation(pointer, this.domElement);

      var limits = this.graph.getLimits();
      var scale = limits.getSize();
      var size = this.graph.renderer.getSize();
      scale.x /= size.width;
      scale.y /= size.height;

      var delta = currPoint.clone().sub(this.prevPoint);
      delta.multiply(scale);

      limits.min.sub(delta);
      limits.max.sub(delta);
      this.graph.setLimits(limits);

      this.prevPoint = currPoint;
    },

    pointerUp: function(e) {
      this.dragging = false;
      this.prevPoint = null;

      event.preventDefault();
    },

    scroll: function(e) {
      event.preventDefault();

      var limits = this.graph.getLimits();

      var zoomAmount = limits.getSize().multiplyScalar(0.025);
      if (event.deltaY < 0) {
        zoomAmount.negate();
      }

      limits.expandByVector(zoomAmount);
      this.graph.setLimits(limits);
    },
  };

  window.GraphControls = GraphControls;
})();
