/* global THREE */

(function() {
  "use strict";

  var DPR = window.devicePixelRatio;
  var SIZE = 64; // in px
  // FIXME: this is for scaling from the size of the texture to the canvas. This
  // should come from the graph in some way.
  var SCALE = new THREE.Vector2(0.5, 1).multiplyScalar(1/2048);

  var GraphLabel = function(text) {
    this.canvas = document.createElement("canvas");
    this.canvas.height = SIZE*DPR * 2;
    this.context = this.canvas.getContext("2d");

    this.texture = new THREE.Texture(this.canvas);

    var geometry = new THREE.PlaneGeometry(1, 1);
    var material = new THREE.MeshBasicMaterial({
      transparent: true,
      map: this.texture,
      color: "red",
    });
    THREE.Mesh.call(this, geometry, material);

    this.setText(text || "");
  };

  GraphLabel.prototype = Object.create(THREE.Mesh.prototype);

  GraphLabel.prototype.setText = function(text) {
    if (this.text === text) { return; }
    this.text = text;

    this.setupContext();
    this.canvas.width = this.context.measureText(this.text).width * 2;
    // For some reason, measuring text seems to be clearing all of the font
    // settings, but running this again seems to work well enough:
    this.setupContext();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillText(this.text, this.canvas.width/2, this.canvas.height/2);

    this.scale.set(
      this.canvas.width/DPR * SCALE.x,
      this.canvas.height/DPR * SCALE.y,
      1
    );

    this.texture.needsUpdate = true;
    this.material.needsUpdate = true;
  };

  GraphLabel.prototype.setupContext = function() {
    this.context.font = SIZE*DPR + "px sans-serif";
    this.context.textBaseline = "middle";
    this.context.textAlign = "center";
    this.context.fillStyle = "black";
  };

  window.GraphLabel = GraphLabel;
})();
