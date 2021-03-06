var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var musicBackground;
var sfxFire;
var sfxJump;

var score = 0;
var lives = 3;

var bullets = [];
var hit = false;

var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var gameState = STATE_SPLASH;

var MAP = {tw:50, th:15};
var TILE = 35;
var TILESET_TILE = TILE*2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;
var worldOffsetX = 0;

var LAYER_COUNT = 5;
var LAYER_PLATFORMS = 0;
var LAYER_LADDERS = 1;
var LAYER_BACKGROUND = 2;

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;

 // abitrary choice for 1m
var METER = TILE;
 // very exaggerated gravity (6x)
var GRAVITY = METER * 9.8 * 6;
 // max horizontal speed (10 tiles per second)
var MAXDX = METER * 10;
 // max vertical speed (15 tiles per second)
var MAXDY = METER * 15;
 // horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 2;
 // horizontal friction - take 1/6 second to stop from maxdx
var FRICTION = MAXDX * 6;
 // (a large) instantaneous jump impulse
var JUMP = METER * 1500;

//enemy variables
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

var enemies = [];

//array to hold simplified collision data
var cells = [];

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

var heartImage = document.createElement("img");
heartImage.src = "heartImage.png";

var scoreBox = document.createElement("img");
scoreBox.src = "scoreBox.png";

var livesBox = document.createElement("img");
livesBox.src = "livesBox.png";

var tileset = document.createElement("img");
tileset.src = "tileset_forTiled.png";

var player = new Player();
var keyboard = new Keyboard();
var enemy = new Enemy ();


function initialize() 
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) 
	{ 
		// initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++) 
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++) 
			{
				if(level1.layers[layerIdx].data[idx] != 0) 
				{
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1) 
				{
					// if we haven't set this cell's value, then set it to 0 now
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
			
			
		// add enemies
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
			idx++;
		}
	}
	
	cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++)
	{
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) 
			{
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
			}
			else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) 
			{
				// if we haven't set this cell's value, then set it to 0 now
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
			idx++;
		}
	}
		
	
	musicBackground = new Howl (
	{
		urls: ["background.ogg"],
		loop: true,
		buffer: true,
		volume: 0.5
	} );
	musicBackground.play();
	
	sfxFire = new Howl (
	{
		urls: ["fireEffect.ogg"],
		buffer: true,
		volume: 1,
		onend: function() {
			isSfxPlaying = false;
		}
	} );
	
	sfxJump = new Howl (
	{
		urls: ["Jump.ogg"],
		buffer: true,
		volume: 1,
		onend: function() {
			isSfxPlaying = false;
		}
	} );
	
	sfxFall = new Howl (
	{
		urls: ["fallsfx.ogg"],
		buffer: true,
		volume: 1,
		onend: function() {
			isSfxPlaying = false;
		}
	} );
	
	sfxSplat = new Howl (
	{
		urls: ["Splat.ogg"],
		buffer: true,
		volume: 1,
		onend: function() {
			isSfxPlaying = false;
		}
	} );
}

function restart ()
{
	lives = 3;
				
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) 
	{ 
		// initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++) 
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++) 
			{
				if(level1.layers[layerIdx].data[idx] != 0) 
				{
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1) 
				{
					// if we haven't set this cell's value, then set it to 0 now
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
			
			
		// add enemies
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
			idx++;
		}
	}
	
	cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++)
	{
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) 
			{
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
			}
			else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) 
			{
				// if we haven't set this cell's value, then set it to 0 now
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
			idx++;
		}
	}
}

function cellAtPixelCoord(layer, x,y)
{
if(x<0 || x>SCREEN_WIDTH || y<0)
return 1;
// let the player drop of the bottom of the screen (this means death)
if(y>SCREEN_HEIGHT)
return 0;
return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
if(tx<0 || tx>=MAP.tw || ty<0)
return 1;
// let the player drop of the bottom of the screen (this means death)
if(ty>=MAP.th)
return 0;
return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
return tile * TILE;
};

function pixelToTile(pixel)
{
return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
if(value < min)
return min;
if(value > max)
return max;
return value;
}

function intersects (x1, y1, w1, h1, x2, y2, w2, h2)
{
	if (y2 + h2 < y1 ||
	x2 + w2 < x1 ||
	x2 > x1 + w1 ||
	y2 > y1 + h1)
	{
		return false;
	}
	return true;
}

function drawMap()
{
	var startX = -1;
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE + Math.floor(player.position.x%TILE);

	startX = tileX - Math.floor(maxTiles / 2);

	if(startX < -1)
	{
	startX = 0;
	offsetX = 0;
	}
	
	if(startX > MAP.tw - maxTiles)
	{
	startX = MAP.tw - maxTiles + 1;
	offsetX = TILE;
	}

	worldOffsetX = startX * TILE + offsetX;
	
	 for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
	 {
		for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		{
			var idx = y * level1.layers[layerIdx].width + startX;
			for( var x = startX; x < startX + maxTiles; x++ )
			{
				if( level1.layers[layerIdx].data[idx] != 0 )
				{
					//  tiles in map are base 1 ( a value of 0 means no tile),
					//  subtract 1 from the tileset id to get correct tile
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *(TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *(TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,(x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

function runSplash (deltaTime)
{
	if(keyboard.isKeyDown(keyboard.KEY_SHIFT) == true)
	{
		gameState = STATE_GAME;
		return;
	}
	
	score = 0;
	
	context.fillStyle = "#A52A2A";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	context.drawImage(chuckNorrisSplash.image, chuckNorrisSplash.x, chuckNorrisSplash.y)
	
	context.fillStyle = "#FFFFFF";
	context.fillRect(220, 375, 180, 50);
	
	context.fillStyle = "#000";
	context.font="60px Algerian";
	context.fillText("GAME", 225, 420);
	
	context.font="15px Arial";
	context.fillText("press shift to begin", 10, 450);
}

function runGame (deltaTime)
{
	for (var i=0; i<enemies.length; i++)
	{
		enemies[i].update(deltaTime)
	}
	
	for (var j=0; j<enemies.length;j++)
	{
		if(intersects(player.position.x, player.position.y, TILE, TILE, enemies[j].position.x, enemies[j].position.y,TILE, TILE) == true)
		{
			//kill enemy
			enemies.splice(j,1);
			//decrease lives
			lives -= 1
			break;
		}
	}
	
	for (var i=0; i<bullets.length; i++)
	{
		var hit = false;
		
		bullets[i].update(deltaTime);
		bullets[i].draw();
		if (bullets[i].position.x - worldOffsetX < 0 || bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
		{
			hit = true;
		}
		
		for (var j=0; j<enemies.length;j++)
		{
			if(intersects(bullets[i].position.x, bullets[i].position.y, TILE, TILE, enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
			{
				//kill bullet and enemy
				enemies.splice(j,1);
				hit = true;
				//increment player score
				score += 1;
				break
			}
			
		}
		if(hit == true)
		{
			bullets.splice(i,1);
			i -= 1;
		}
	}
	
	context.fillStyle = "#CDB5CD";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	player.update(deltaTime); 		//updates before drawing map
	
	drawMap()
	
	for (var i=0; i<enemies.length; i++)
	{
		enemies[i].draw()
	}
	
	for (var i=0; i<bullets.length; i++)
	{
		bullets[i].draw()
	}
	
	player.draw();
	
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	//draw lives
	context.drawImage (livesBox, 5, 398)
	
	for (var i=0; i<lives; i++)
	{
		context.drawImage(heartImage, 20 + ((heartImage.width + 2) *i), 425);
	}
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
	
	//draw score
	context.drawImage (scoreBox, 5, 448)
	
	context.fillStyle = "#8B008B";
	context.font="18px OCR A Std";
	context.fillText("SCORE: " + score, 10, 470);
}

function runGameOver(deltaTime)
{
	if(keyboard.isKeyDown(keyboard.KEY_2) == true)
	{
		gameState = STATE_SPLASH;
		return;
	}
	context.fillStyle = "#2F4F4F";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	context.drawImage(chuckNorrisGameOver.image, chuckNorrisGameOver.x, chuckNorrisGameOver.y)
	
	context.fillStyle = "#000";
	context.font= "72px Amerigo";
	context.fillText("GAME OVER", 210 , 400);
	
	context.fillStyle = "#FFFFFF";
	context.font="18px OCR A Std";
	context.fillText("SCORE: " + score, 10, 470);
	
	context.fillStyle = "#FFFFFF";
	context.font= "20px Amerigo";
	context.fillText("press 2 to restart", 500 , 430);
	
	context.font= "12px Amerigo";
	context.fillText("[Cartoon Boing Sound Effect] via https://www.youtube.com/watch?v=iew9op9aPLQ", 10 , 20);
	context.fillText("Edited with Audacity", 10 , 35);
	
	context.fillText("[Falling whistle sound effect] via https://www.youtube.com/watch?v=8PbD3I9eumM", 10 , 55);
	context.fillText("Edited with Audacity", 10 , 70);
	
	context.fillText("[Splat Sound effect] via https://www.youtube.com/watch?v=rzhjY4ETXdA", 10 , 90);
	
}

function run()
{	
	var deltaTime = getDeltaTime();
	
	switch (gameState)
	{
		case STATE_SPLASH:
			runSplash(deltaTime);
			break;
		case STATE_GAME:
			runGame(deltaTime);
			break;
		case STATE_GAMEOVER:
			runGameOver(deltaTime);
			break;
	}
	
	
}

initialize ();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
