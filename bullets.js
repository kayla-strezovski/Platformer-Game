//COMPLETE

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();
var keyboard = new Keyboard();

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

var BULLET_SPEED = 10;
var shoot = false;
var shootTimer = 0;

getDeltaTime();
	
var bullets = [];
	
var Bullets = function() {
	this.image = document.createElement("img");
	this.position = new Vector2();
	this.position.set (player.position.x, player.position.y);
	
	this.width = 5;
	this.height = 5;
	
	this.velocityX = 0;
	this.velocityY = 0;
	
	this.image.src = "bullet.png";
};	
	
function playerShoot()
{
	//start with velocity that shoots the bullet straight up
	var velX = 0;
	var velY = 10;
	
	//now rotate this vector according to the ships current rotation
	var s = Math.sin (player.rotation);
	var c = Math.cos (player.rotation);
		
	//for an explanation of this formula,
	// see http://en.wikipedia.org/wiki/Rotation_matrix
	var xVel = (velX * c) - (velY * s);
	var yVel = (velX * s) + (velY * c);
	
	Bullets.velocityX = xVel * BULLET_SPEED ;
	Bullets.velocityY = yVel * BULLET_SPEED ;
	
	//finally, add bullet to Bullets array
	bullets.push(Bullets);
}

	
	//update bulets
	for (var i=0; i<bullets.length; i++)
	{
	bullets[i].x += bullets[i].velocityX * deltaTime;
	bullets[i].y += bullets[i].velocityY * deltaTime;
	}
	
	for(var i=0; i<bullets.length; i++)
	{
		//check if the bullet has gone out of screen boundaries, if so kill
		if(bullets[i].x < -bullets[i].width ||
			bullets[i].x > SCREEN_WIDTH ||
			bullets[i].y < -bullets[i].height ||
			bullets[i].y > SCREEN_HEIGHT)
		{
		//remove 1 element at position i
		bullets.splice(i,1);
		//because we are deleting elements from middle
		//we can only delete one at a time. 
		//So as soon as we remove 1 bullet stop.
		break;
		}
	}
	
	//draw all Bullets
	for(var i=0; i<bullets.length; i++)
	{
		context.drawImage(bullets[i].image,
			bullets[i].x - bullets[i].width/2,      
			bullets[i].y - bullets[i].height/2);
	}
	
	
	
	//check if any Bullets intersect any enemy if so kill both
	for(var j=0; j<bullets.length; j++)
	{
		if(intersects(
			bullets[j].x, bullets[j].y,
			bullets[j].width, bullets[j].height,
			Enemy.x, Enemy.y,
			Enemy.width, Enemy.height) == true)
	{
			bullets.splice(j, 1);
			break;
	}
	}