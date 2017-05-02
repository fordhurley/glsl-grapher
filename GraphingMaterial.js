(function() {
  "use strict";

  var GraphingMaterial = function(shaderFunc) {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        minUV: {value: new THREE.Vector2(-1, -1)},
        maxUV: {value: new THREE.Vector2(1, 1)},
      },
      vertexShader: `
        varying vec2 vUV;
        uniform vec2 minUV;
        uniform vec2 maxUV;
        void main() {
          vUV = uv * (maxUV - minUV) + minUV;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUV;

        ${shaderFunc}

        const vec3 blue = vec3(0.0, 0.0, 1.0);
        const vec3 white = vec3(1.0);

        void main() {
          vec3 color = mix(blue, white, step(y(vUV.x), vUV.y));
          if (vUV.x < 0.0) {
            color *= 0.75;
          }
          if (vUV.y < 0.0) {
            color *= 0.75;
          }
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  };

  GraphingMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

  window.GraphingMaterial = GraphingMaterial;
})();
