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
      limits.min.x = parseFloat(labels.x.min.textContent);
      limits.max.x = parseFloat(labels.x.max.textContent);
      limits.min.y = parseFloat(labels.y.min.textContent);
      limits.max.y = parseFloat(labels.y.max.textContent);
      graph.setLimits(limits);
    }

    [labels.x.min, labels.x.max, labels.y.min, labels.y.max].forEach(function(label) {
      label.addEventListener("focus", function(e) {
        // Select text: http://stackoverflow.com/a/3806004/576932
        setTimeout(function() {
          var sel;
          var range;
          if (window.getSelection && document.createRange) {
            range = document.createRange();
            range.selectNodeContents(label);
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          } else if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(label);
            range.select();
          }
        }, 1);
      });
      label.addEventListener("blur", updateLimitsFromLabels);
      label.addEventListener("keydown", function(e) {
        if (e.which === 13) {
          e.preventDefault();
          label.blur();
        }
      });
    });

    function updateLabelsFromLimits() {
      var limits = graph.getLimits();
      labels.x.min.textContent = limits.min.x.toPrecision(3);
      labels.x.max.textContent = limits.max.x.toPrecision(3);
      labels.y.min.textContent = limits.min.y.toPrecision(3);
      labels.y.max.textContent = limits.max.y.toPrecision(3);
    }

    updateLabelsFromLimits();

    return {
      updateLimitsFromLabels: updateLimitsFromLabels,
      updateLabelsFromLimits: updateLabelsFromLimits,
    };
  }

  function loadGraph(editor, graph, shaderFunc, limits) {
    limits = limits || new THREE.Box2(
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 1)
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
    var graph = new Graph2D({
      canvas: canvas,
      shaderFunc: editor.getValue(),
      limits: new THREE.Box2(
        new THREE.Vector2(-2, -2),
        new THREE.Vector2(2, 2)
      ),
      color: 0x3483BE,
    });
    var labels = setupLabels(graph);

    var controls = new GraphControls(graph, canvas);
    controls.attachListeners();

    editor.getSession().on("change", function(e) {
      clearURLHash();
      graph.setShaderFunc(editor.getValue());
      resizeEditor(editor);
    });

    graph.addEventListener("changed:limits", function(e) {
      localStorage.setItem("limits", JSON.stringify(e.limits));
      labels.updateLabelsFromLimits();
    });

    graph.addEventListener("changed:shaderFunc", function(e) {
      localStorage.setItem("shaderFunc", e.shaderFunc);
    });

    window.addEventListener("resize", function(e) {
      graph.resize();
      resizeEditor(editor);
    });

    document.querySelectorAll(".example").forEach(function(link) {
      var name = link.hash.slice(1);
      link.addEventListener("click", function(e) {
        loadExample(editor, graph, name);
      });
    });

    document.querySelectorAll(".limit-presets img").forEach(function(button) {
      button.addEventListener("click", function(e) {
        var limits = graph.getLimits();
        switch (this.className) {
          case "negative-one-to-one":
            limits.min.x = limits.min.y = -1;
            limits.max.x = limits.max.y = 1;
            break;
          case "zero-to-one":
          default:
            limits.min.x = limits.min.y = 0;
            limits.max.x = limits.max.y = 1;
        }
        graph.setLimits(limits);
      });
    });

    loadGraphIfNeeded(editor, graph);
    resizeEditor(editor);
    graph.render();
  });
})();
