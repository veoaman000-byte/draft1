(function () {
  "use strict";

  var importButton = document.getElementById("importSrtButton");
  var fileInput = document.getElementById("srtFileInput");
  var sourceStatus = document.getElementById("sourceStatus");
  var generateButton = document.getElementById("generateCaptionsButton");
  var applyButton = document.getElementById("applyButton");
  var applyButtonWords = document.getElementById("applyButtonWords");
  var previewTarget = document.getElementById("captionPreview");
  var previewTargetWords = document.getElementById("captionPreviewWords");
  var controlsRoot = document.getElementById("layoutControls");
  var chipRoot = document.getElementById("wordChips");
  var modeRoot = document.getElementById("selectionModes");
  var blockListRoot = document.getElementById("captionBlockList");
  var instagramLink = document.getElementById("instagramLink");
  var model = window.DraftMotionCaptionModel.create();
  model._lastWordsPerCaption = model.getState().controls.wordsPerCaption;

  function setStatus(text) {
    if (sourceStatus) {
      sourceStatus.textContent = text;
    }
  }

  function bindImport() {
    if (!importButton || !fileInput) {
      return;
    }
    importButton.addEventListener("click", function () {
      fileInput.click();
    });
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      var reader;
      if (!file) {
        return;
      }
      reader = new FileReader();
      reader.onload = function () {
        var srtText = reader.result || "";
        var state = model.getState();
        var blocks = window.DraftMotionSrtParser.parseToBlocks(srtText, state.controls.wordsPerCaption);
        model._lastWordsPerCaption = state.controls.wordsPerCaption;
        model.setImportedSrt(file.name, srtText, blocks);
        setStatus(file.name + " imported - " + blocks.length + " blocks");
      };
      reader.onerror = function () {
        setStatus("Could not read SRT file.");
      };
      reader.readAsText(file);
    });
  }

  function bindWorkspaces() {
    var tabs = document.querySelectorAll("[data-workspace]");
    var panels = document.querySelectorAll("[data-workspace-panel]");
    var i;

    function activate(name) {
      var j;
      for (j = 0; j < tabs.length; j += 1) {
        tabs[j].className = tabs[j].getAttribute("data-workspace") === name ? "active" : "";
      }
      for (j = 0; j < panels.length; j += 1) {
        panels[j].className = panels[j].getAttribute("data-workspace-panel") === name ? "workspace active" : "workspace";
      }
    }

    for (i = 0; i < tabs.length; i += 1) {
      tabs[i].addEventListener("click", function () {
        activate(this.getAttribute("data-workspace"));
      });
    }
  }

  function bindInstagramLink() {
    var url = "https://www.instagram.com/grounded_bhim";
    if (!instagramLink) {
      return;
    }
    instagramLink.addEventListener("click", function () {
      if (window.cep && window.cep.util && window.cep.util.openURLInDefaultBrowser) {
        window.cep.util.openURLInDefaultBrowser(url);
        return;
      }
      window.open(url, "_blank");
    });
  }

  function renderPreviews(layoutData) {
    window.DraftMotionPreviewRenderer.render(previewTarget, layoutData);
    window.DraftMotionPreviewRenderer.render(previewTargetWords, layoutData);
  }

  bindImport();
  bindWorkspaces();
  bindInstagramLink();

  if (window.__adobe_cep__ && window.DraftMotionAeBridge) {
    window.DraftMotionAeBridge.ping(function (result) {
      if (!result.ok) {
        setStatus(result.message || "After Effects bridge is not ready.");
      }
    });
  }

  window.DraftMotionActionController.bind({
    generateButton: generateButton,
    applyButton: applyButton,
    applyButtons: [applyButton, applyButtonWords],
    getState: function () {
      return model.getState();
    },
    setBlocks: function (blocks) {
      model.setBlocks(blocks);
    },
    onStatus: setStatus
  });

  window.DraftMotionCaptionBlockList.bind(blockListRoot, model);
  window.DraftMotionLayoutControls.bind(controlsRoot, model);
  window.DraftMotionWordSelection.bind({
    chipRoot: chipRoot,
    modeRoot: modeRoot,
    model: model
  });

  model.subscribe(function (state) {
    if (state.sourceText && state.controls.wordsPerCaption !== model._lastWordsPerCaption) {
      model._lastWordsPerCaption = state.controls.wordsPerCaption;
      model.setBlocks(window.DraftMotionSrtParser.parseToBlocks(state.sourceText, state.controls.wordsPerCaption));
      return;
    }
    var layoutData = window.DraftMotionPreviewLayoutEngine.calculate(state);
    renderPreviews(layoutData);
    window.DraftMotionCaptionBlockList.render(blockListRoot, state);
    window.DraftMotionWordSelection.render(chipRoot, modeRoot, state);
  });

  window.DraftMotionCEP = {
    version: "1.0.0",
    model: model
  };
}());
