
// factor by which to modify canvas width and height
var scaleCanvas = 1;

var fitCanvas = function () {
  // the canvas element
  var playArea = document.querySelector('#game-canvas');


  var container = document.querySelector('#game-canvas-container');
  var containerWidth = container.offsetWidth;
  var containerHeight = container.offsetHeight;

  var playAreaWidth = playArea.width;
  var playAreaHeight = playArea.height;

  var scaleWidth = containerWidth / playAreaWidth;
  var scaleHeight = containerHeight / playAreaHeight;
  scaleCanvas = (scaleHeight < scaleWidth) ? scaleHeight : scaleWidth;

  var newPlayAreaWidth = playAreaWidth * scaleCanvas;
  var newPlayAreaHeight = playAreaHeight * scaleCanvas;

  var left = (containerWidth - newPlayAreaWidth) / 2;
  var top = (containerHeight - newPlayAreaHeight) / 2;

  // resize and position the canvas
  playArea.width = parseInt(newPlayAreaWidth, 10);
  playArea.height = parseInt(newPlayAreaHeight, 10);
  playArea.style.top = top + 'px';
  playArea.style.left = left + 'px';
};


var postScale = function(){

  window.onresize = fitCanvas;
  fitCanvas();
}