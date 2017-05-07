(function() {
  "use strict";

  function makeFragmentShader(shaderFunc) {
    return `
      varying vec2 vUV;
      uniform vec3 color;

      ${shaderFunc}

      void main() {
        if (y(vUV.x) < vUV.y) {
          discard;
        }
        gl_FragColor = vec4(color, 1.0);
      }
    `
  }

  var GraphMaterial2D = function(options) {
    this.shaderFunc = options.shaderFunc;

    this.limits = options.limits;
    if (this.limits === undefined) {
      this.limits = new THREE.Box2(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 1)
      );
    }

    this.color = options.color;
    if (this.color === undefined) {
      this.color = 0x0000ff;
    }
    this.color = new THREE.Color(this.color);

    THREE.RawShaderMaterial.call(this, {
      uniforms: {
        minLimit: {value: this.limits.min},
        maxLimit: {value: this.limits.max},
        color: {value: this.color},
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
      fragmentShader: makeFragmentShader(this.shaderFunc),
    });
  };

  GraphMaterial2D.prototype = Object.create(THREE.ShaderMaterial.prototype);

  GraphMaterial2D.prototype.setShaderFunc = function(shaderFunc) {
    this.shaderFunc = shaderFunc;
    this.fragmentShader = makeFragmentShader(this.shaderFunc);
    this.needsUpdate = true;
  }

  window.GraphMaterial2D = GraphMaterial2D;
})();
