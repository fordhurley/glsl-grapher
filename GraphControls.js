(function() {

  // This is largely based on:
  // https://github.com/mrdoob/three.js/blob/7ac632bf/examples/js/controls/TransformControls.js

  var GraphControls = function(graph, domElement) {
    this.graph = graph;
    this.domElement = domElement;

    this.limits = graph.material.limits.clone();
    this.dragging = false;

    domElement.addEventListener("mousedown", this.pointerDown.bind(this), false);
    domElement.addEventListener("touchstart", this.pointerDown.bind(this), false);

    domElement.addEventListener("mousemove", this.pointerMove.bind(this), false);
    domElement.addEventListener("touchmove", this.pointerMove.bind(this), false);

    domElement.addEventListener("mouseup", this.pointerUp.bind(this), false);
    domElement.addEventListener("mouseout", this.pointerUp.bind(this), false);
    domElement.addEventListener("touchend", this.pointerUp.bind(this), false);
    domElement.addEventListener("touchcancel", this.pointerUp.bind(this), false);
    domElement.addEventListener("touchleave", this.pointerUp.bind(this), false);

    domElement.addEventListener("mousewheel", this.scroll.bind(this), false);
  };

  GraphControls.prototype = {
    pointerDown: function(e) {
      if (this.dragging) { return; }
      this.dragging = true;

      event.preventDefault();
    },

    pointerMove: function(e) {
      if (!this.dragging) { return; }

      event.preventDefault();

      var pointer = event.changedTouches ? event.changedTouches[0] : event;
      var scale = this.limits.getSize().divide(this.graph.scale);

      this.limits.min.x -= pointer.movementX * scale.x;
      this.limits.max.x -= pointer.movementX * scale.x;
      this.limits.min.y += pointer.movementY * scale.y;
      this.limits.max.y += pointer.movementY * scale.y;
      this.graph.setLimits(this.limits);
    },

    pointerUp: function(e) {
      this.dragging = false;

      event.preventDefault();
    },

    scroll: function(e) {
      event.preventDefault();

      var zoomAmount = this.limits.getSize().multiplyScalar(0.025);
      if (event.deltaY < 0) {
        zoomAmount.negate();
      }

      this.limits.expandByVector(zoomAmount);
      this.graph.setLimits(this.limits);
    },
  };

  window.GraphControls = GraphControls;
})();
