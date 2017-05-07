(function() {

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

      var scale = this.graph.material.limits.getSize().divide(this.graph.scale);

      var delta = currPoint.clone().sub(this.prevPoint);
      delta.multiply(scale);

      this.graph.material.limits.min.sub(delta);
      this.graph.material.limits.max.sub(delta);
      this.graph.setLimits(this.graph.material.limits);

      this.prevPoint = currPoint;
    },

    pointerUp: function(e) {
      this.dragging = false;
      this.prevPoint = null;

      event.preventDefault();
    },

    scroll: function(e) {
      event.preventDefault();

      var zoomAmount = this.graph.material.limits.getSize().multiplyScalar(0.025);
      if (event.deltaY < 0) {
        zoomAmount.negate();
      }

      this.graph.material.limits.expandByVector(zoomAmount);
      this.graph.setLimits(this.graph.material.limits);
    },
  };

  window.GraphControls = GraphControls;
})();
