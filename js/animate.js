// Pseudocode
// 1. Load the sprite sheet image
// 2. Initialize variables for the current frame and the total number of frames
// 3. Create a function to draw a frame
// 4. In the draw function, clear the canvas, draw the current frame, and then increment the current frame
// 5. If the current frame is the last one, loop back to the first frame
// 6. Use requestAnimationFrame to call the draw function again
var game_file = "game_data.json";
var game = null;
var playView = null;
var canvas = null;
var ctx = null;
var textFontSize = 10;
var textFont = textFontSize + "px courier";
var sprite = new Image();
sprite.src = 'assets/sprites/morgans.png';
var ctxScaling = 2;
var frameIndex = 0;

var spriteWidth = null;
var spriteHeight = null;
var framesPerRow = 3;
var frameRows = 4;
var animations = {};
var running = true;
var currentFrame = 0;
animations['down'] = [[0,0],[0,1],[0,2]];
animations['left'] = [[1,0],[1,0],[1,2]];
animations['right'] = [[2,0],[2,0],[2,2]];
animations['up'] = [[3,0],[3,0],[3,2]];
animation = animations['up'];
currentFrame = 0;

function load(){
  console.log(game_file);
  fetch(game_file).then(response => response.text()).then(respText => load_data(respText));
}

function load_data(text){
  var jstuff = JSON.parse(text);
  var run_button = document.getElementById('runbutton');
  run_button['disabled'] = false;
  createPlayContext();
}

function run(){
    running = true;
    var stop_button = document.getElementById('stopbutton');
    stop_button['disabled'] = false;
    spriteWidth = sprite.width / framesPerRow;
    spriteHeight = sprite.height / frameRows;
    animate();
}

function stop(){
    running = false;
    console.log("Stop!");
    var stop_button = document.getElementById('stopbutton');
    stop_button['disabled'] = true;
}

function loop(){
    setTimeout(() => animate(),100);
  }

function createPlayContext(){
    playView = document.getElementById('mapview');

    canvas = document.createElement("canvas");
    canvas.setAttribute('id','map');
    canvas.setAttribute('width','720');
    canvas.setAttribute('height','480');
    playView.append(canvas);

    ctx = canvas.getContext("2d");
    ctx.scale(ctxScaling,ctxScaling);
    ctx.imageSmoothingEnabled = false;
    ctx.font = textFont;
}

function animate(){
    var numFrames = animation.length;
    if (currentFrame >= numFrames){
        currentFrame = 0;
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(sprite, animation[currentFrame][1] * spriteWidth, spriteHeight * animation[currentFrame][0], spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
    currentFrame += 1;
    if (running){
      loop();
    }else{
      console.log("Stopping!");
    }

}