/* global THREE, ace, Graph2D, GraphControls, GRAPH_EXAMPLES */

(function() {
  "use strict";

  function setupEditor(elementID) {
    var editor = ace.edit("editor");
    editor.getSession().setMode("ace/mode/glsl");
    return editor;
  }

  function resizeEditor(editor) {
    var newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight;
    newHeight += editor.renderer.scrollBar.getWidth();
    newHeight = Math.max(newHeight, 100);
    editor.container.style.height = newHeight + "px";
    editor.resize();
  }

  function setupRenderer(canvas) {
    var style = window.getComputedStyle(canvas);
    var width = parseInt(style.width, 10);
    var height = parseInt(style.height, 10);
    var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xf9f9f9);

    var scene = new THREE.Scene();

    var camera = new THREE.OrthographicCamera(width/-2, width/2, height/2, height/-2, 1, 100);
    camera.position.z = 50;

    return {
      width: width,
      height: height,
      scene: scene,
      camera: camera,
      render: function() {
        renderer.render(scene, camera);
      },
      resize: function() {
        canvas.style = "";
        style = window.getComputedStyle(canvas);
        width = parseInt(style.width, 10);
        height = parseInt(style.height, 10);
        renderer.setSize(width, height);
        camera.left = -width/2;
        camera.right = width/2;
        camera.top = height/2;
        camera.bottom = -height/2;
        camera.updateProjectionMatrix();
        return {width: width, height: height};
      },
    };
  }

  function setupGraph(renderer, shaderFunc) {
    var graph = new Graph2D({
      shaderFunc: shaderFunc,
      limits: new THREE.Box2(
        new THREE.Vector2(-2*Math.PI, -2),
        new THREE.Vector2(2*Math.PI, 2)
      ),
      color: 0x3483BE,
    });
    graph.scale.set(renderer.width, renderer.height, 1);
    renderer.scene.add(graph);
    return graph;
  }

  function setupLabels(graph) {
    var labels = {
      x: {
        min: document.querySelector(".graph .x-labels .min"),
        max: document.querySelector(".graph .x-labels .max"),
      },
      y: {
        min: document.querySelector(".graph .y-labels .min"),
        max: document.querySelector(".graph .y-labels .max"),
      },
    };

    function updateLimitsFromLabels() {
      var limits = graph.getLimits();
      limits.min.x = parseFloat(labels.x.min.value);
      limits.max.x = parseFloat(labels.x.max.value);
      limits.min.y = parseFloat(labels.y.min.value);
      limits.max.y = parseFloat(labels.y.max.value);
      graph.setLimits(limits);
    }

    [labels.x.min, labels.x.max, labels.y.min, labels.y.max].forEach(function(label) {
      label.addEventListener("blur", updateLimitsFromLabels);
      label.addEventListener("keyup", function(e) {
        if (e.which === 13) { label.blur(); }
      });
    });

    function updateLabelsFromLimits() {
      var limits = graph.getLimits();
      labels.x.min.value = limits.min.x.toPrecision(3);
      labels.x.max.value = limits.max.x.toPrecision(3);
      labels.y.min.value = limits.min.y.toPrecision(3);
      labels.y.max.value = limits.max.y.toPrecision(3);

      var step = limits.getSize().multiplyScalar(0.1);
      labels.x.min.step = labels.x.max.step = step.x.toPrecision(2);
      labels.y.min.step = labels.y.max.step = step.y.toPrecision(2);
    }

    updateLabelsFromLimits();

    return {
      updateLimitsFromLabels: updateLimitsFromLabels,
      updateLabelsFromLimits: updateLabelsFromLimits,
    };
  }

  function loadGraph(editor, graph, shaderFunc, limits) {
    limits = limits || new THREE.Box2(
      new THREE.Vector2(-0.25, -0.25),
      new THREE.Vector2(1.25, 1.25)
    );
    editor.setValue(shaderFunc);
    editor.gotoLine(0, 0);
    graph.setLimits(limits);
  }

  function loadExample(editor, graph, name) {
    var example = GRAPH_EXAMPLES[name];
    if (!example) {
      console.warn("No example named:", name);
      return;
    }
    loadGraph(editor, graph, example.shaderFunc, example.limits);
  }

  function clearURLHash() {
    // Note that this seems a bit slow, so don't call it from a tight loop.
    history.replaceState("", document.title, window.location.pathname);
  }

  function getFromLocalStorage() {
    var shaderFunc = localStorage.getItem("shaderFunc");
    if (!shaderFunc) {
      return undefined;
    }
    var limits = localStorage.getItem("limits");
    if (limits) {
      limits = JSON.parse(limits);
      limits = new THREE.Box2(
        new THREE.Vector2(limits.min.x, limits.min.y),
        new THREE.Vector2(limits.max.x, limits.max.y)
      );
    }
    return {
      shaderFunc: shaderFunc,
      limits: limits,
    };
  }

  function loadGraphIfNeeded(editor, graph) {
    if (window.location.hash) {
      loadExample(editor, graph, window.location.hash.slice(1));
    } else {
      clearURLHash();
      var graphData = getFromLocalStorage();
      if (graphData) {
        loadGraph(editor, graph, graphData.shaderFunc, graphData.limits);
      }
    }
  }

  window.addEventListener("load", function() {
    var editor = setupEditor("editor");
    var canvas = document.querySelector(".graph canvas");
    var renderer = setupRenderer(canvas);
    var graph = setupGraph(renderer, editor.getValue());
    var labels = setupLabels(graph);

    var controls = new GraphControls(graph, canvas);
    controls.attachListeners();

    editor.getSession().on("change", function(e) {
      clearURLHash();
      graph.setShaderFunc(editor.getValue());
    });

    editor.getSession().on("change", resizeEditor.bind(window, editor));

    graph.addEventListener("changed:limits", function(e) {
      localStorage.setItem("limits", JSON.stringify(e.limits));
      labels.updateLabelsFromLimits();
      renderer.render();
    });

    graph.addEventListener("changed:shaderFunc", function(e) {
      localStorage.setItem("shaderFunc", e.shaderFunc);
      renderer.render();
    });

    window.addEventListener("resize", function(e) {
      var size = renderer.resize();
      graph.scale.set(size.width, size.height, 1);
      renderer.render();
      resizeEditor(editor);
    });

    document.querySelectorAll(".example").forEach(function(link) {
      var name = link.hash.slice(1);
      link.addEventListener("click", function(e) {
        loadExample(editor, graph, name);
      });
    });

    loadGraphIfNeeded(editor, graph);
    resizeEditor(editor);
    renderer.render();
  });
})();
