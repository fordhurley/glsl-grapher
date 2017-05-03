(function() {
  "use strict";

  var GrapherMaterial2D = function(options) {
    this.shaderFunc = options.shaderFunc;

    this.limits = options.limits;
    if (this.limits === undefined) {
      this.limits = new THREE.Box3(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 1)
      );
    }

    this.overColor = options.overColor;
    if (this.overColor === undefined) {
      this.overColor = 0xffffff;
    }
    this.overColor = new THREE.Color(this.overColor);

    this.underColor = options.underColor;
    if (this.underColor === undefined) {
      this.underColor = 0x0000ff;
    }
    this.underColor = new THREE.Color(this.underColor);

    THREE.ShaderMaterial.call(this, {
      uniforms: {
        minLimit: {value: this.limits.min},
        maxLimit: {value: this.limits.max},
        overColor: {value: this.overColor},
        underColor: {value: this.underColor},
      },
      vertexShader: `
        varying vec2 vUV;
        uniform vec2 minLimit;
        uniform vec2 maxLimit;
        void main() {
          // Linear mapping to range:
          vUV = mix(minLimit, maxLimit, uv);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUV;
        uniform vec3 overColor;
        uniform vec3 underColor;

        ${this.shaderFunc}

        void main() {
          float over = step(y(vUV.x), vUV.y); // 0 if under, 1 if over
          vec3 color = mix(underColor, overColor, over);

          // Indicate quadrants:
          if (vUV.x < 0.0) {
            color *= 0.9;
          }
          if (vUV.y < 0.0) {
            color *= 0.9;
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  };

  GrapherMaterial2D.prototype = Object.create(THREE.ShaderMaterial.prototype);

  window.GrapherMaterial2D = GrapherMaterial2D;
})();
