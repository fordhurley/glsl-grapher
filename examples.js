/* global THREE */

window.GRAPH_EXAMPLES = {
  step: {
    shaderFunc: "float y(float x) {\n  return step(0.5, x);\n}",
  },

  smoothstep: {
    shaderFunc: "float y(float x) {\n  return smoothstep(0.0, 1.0, x);\n}",
  },

  multiSmoothstep: {
    shaderFunc: [
      "float y(float x) {",
      "  return smoothstep(0.0, 0.5, x) - smoothstep(0.5, 1.0, x);",
      "}",
    ].join("\n"),
  },

  gradientNoise: {
    shaderFunc: `vec2 vec2Random(vec2 st) {
  st = vec2(dot(st, vec2(0.040,-0.250)),
  dot(st, vec2(269.5,183.3)));
  return -1.0 + 2.0 * fract(sin(st) * 43758.633);
}

float gradientNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  vec2 u = smoothstep(0.0, 1.0, f);

  return mix(mix(dot(vec2Random(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                 dot(vec2Random(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
             mix(dot(vec2Random(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                 dot(vec2Random(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
}

float y(float x) {
  return gradientNoise(vec2(x, 1.0));
}`,
    limits: new THREE.Box2(new THREE.Vector2(0, -1), new THREE.Vector2(20, 1)),
  },
};
