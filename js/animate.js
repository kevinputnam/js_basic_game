// Pseudocode
// 1. Load the sprite sheet image
// 2. Initialize variables for the current frame and the total number of frames
// 3. Create a function to draw a frame
// 4. In the draw function, clear the canvas, draw the current frame, and then increment the current frame
// 5. If the current frame is the last one, loop back to the first frame
// 6. Use requestAnimationFrame to call the draw function again

// Actual Code
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var sprite = new Image();
sprite.src = 'spritesheet.png'; // replace with your sprite sheet

var frameIndex = 0;
var totalFrames = 10; // replace with your total frames

var spriteWidth = sprite.width / totalFrames;
var spriteHeight = sprite.height;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sprite, frameIndex * spriteWidth, 0, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
    
    frameIndex = (frameIndex + 1) % totalFrames;
    
    requestAnimationFrame(draw);
}

sprite.onload = draw;