
var LEFT = 0;
var RIGHT = 1;

var startTimer = 1;
var respawnTimer = 0.5;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_IDLE_RIGHT = 3;
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;
var ANIM_MAX = 6;
var SHOOT_RIGHT = 7;
var SHOOT_LEFT = 8;

var Player = function() {
	this.sprite = new Sprite("ChuckNorris.png");
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [0,1,2,3,4,5,6]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [8, 9, 10, 11, 12]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [52, 53, 54, 55, 56, 57, 58, 59]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [60, 61, 62, 63, 64]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);

	for (var i=0; i<ANIM_MAX; i++)
	{
		this.sprite.setAnimationOffset(i, - 55, -87);
	}
	
	this.position = new Vector2();
	this.position.set (9*TILE, 0*TILE);
	
	this.width = 159;
	this.height = 163;
	
	this.velocity = new Vector2();
	
	this.falling = true;
	this.jumping = false;
	
	this.direction = LEFT;
	
	this.cooldownTimer = 0;
};

Player.prototype.update = function(deltaTime)
{
	this.sprite.update(deltaTime);
	
	var left = false;
	var right = false;
	var jump = false;
	
	//check keypress events
	if((keyboard.isKeyDown(keyboard.KEY_LEFT) == true) || (keyboard.isKeyDown(keyboard.KEY_A) == true))
	{
		left = true;
		this.direction = LEFT;
		Bullet.moveRight = false;
		if (this.sprite.currentAnimation != ANIM_WALK_LEFT && this.jumping == false)
			this.sprite.setAnimation(ANIM_WALK_LEFT);
	}
	else if((keyboard.isKeyDown(keyboard.KEY_RIGHT) == true) || (keyboard.isKeyDown(keyboard.KEY_D) == true))
	{
		right = true;
		this.direction = RIGHT;
		Bullet.moveRight = true;
		if (this.sprite.currentAnimation != ANIM_WALK_RIGHT && this.jumping == false)
			this.sprite.setAnimation(ANIM_WALK_RIGHT);
	}
	else 
	{
		if(this.jumping == false && this.falling == false)
		{
			if(this.direction == LEFT)
			{
				if(this.sprite.currentAnimation != ANIM_IDLE_LEFT)
				this.sprite.setAnimation(ANIM_IDLE_LEFT);
			}
			else
			{
				if(this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
				this.sprite.setAnimation(ANIM_IDLE_RIGHT);
			}
		}
	}
	
	
	if ((keyboard.isKeyDown(keyboard.KEY_UP) == true)|| (keyboard.isKeyDown(keyboard.KEY_W) == true))
	{
		jump = true;
		sfxJump.play();
		if (left == true)
		{
			this.sprite.setAnimation (ANIM_JUMP_LEFT);
		}
		if (right == true)
		{
			this.sprite.setAnimation (ANIM_JUMP_RIGHT)
		}
	}
	
	if (this.cooldownTimer > 0)
	{
		this.cooldownTimer -= deltaTime;
	}
	
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true && this.cooldownTimer <=0)
	{
		sfxFire.play();
		bullets.push(new Bullet (this.position.x, this.position.y, Bullet.moveRight));
		this.cooldownTimer = 0.25;
	}
	
	var wasleft = this.velocity.x <0;
	var wasright = this.velocity.x >0;
	var falling = this.falling;
	var ddx = 0;		//acceleration
	var ddy = GRAVITY;
	
	if (left)
		ddx = ddx - ACCEL; 			//player wants to go left
	else if (wasleft)
		ddx = ddx+ FRICTION; 		//player was goinbg left, not anymore
	
	if (right)
		ddx = ddx + ACCEL;		 // player wants to go right
	else if (wasright)
		ddx = ddx - FRICTION;	 // player was going right, but not any more

	 if (jump && !this.jumping && !falling)
	{
		//apply instantaneous (large) vertical pulse
		ddy = ddy - JUMP; 		// apply an instantaneous (large) vertical impulse
		this.jumping = true;
		if (this.direction == LEFT)
			this.sprite.setAnimation(ANIM_JUMP_LEFT)
		else 
			this.sprite.setAnimation (ANIM_JUMP_RIGHT)
	}
	
	// calculate the new position and velocity:
	this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
	this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
	this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);
	
	if ((wasleft && (this.velocity.x>0)) ||
		(wasright && (this.velocity.x<0)))
	{
		//clamp at zero to prevent friction from making "jiggle" from side to side
		this.velocity.x=0;
	}
	
	
	//collision detection 
	//collision detection simplified bc player is rectangle && same size as one tile
	// player can only occupy 1, 2, 4 cells
	
	//therfore we can short circuit and avoid building a general purpose collision detection engine
	// by just looking at the 1-4 cells the player occupies
	
	var tx = pixelToTile(this.position.x);
	var ty = pixelToTile(this.position.y);
	var nx = (this.position.x)%TILE;		//true is player overlaps right
	var ny = (this.position.y)%TILE;		// true if overlaps left
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cellright = cellAtTileCoord (LAYER_PLATFORMS, tx + 1, ty);
	var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty +1);
	var celldiag = cellAtTileCoord (LAYER_PLATFORMS, tx +1, ty +1);
	
	// if the player has a vertical veolcity, check to see if hit platform
	// below or above in which case stop vertical velocity and clamp y position
	if (this.velocity.y > 0) 
	{
		if ((celldown && !cell) || (celldiag && !cellright && nx)) 
		{
			// clammp y position to avoid falling into platform below
			this.position.y = tileToPixel (ty);
			this.velocity.y = 0;	//stop down velocity
			this.falling = false;	//not falling
			this.jumping = false;	//not jumping
			ny = 0;					//no longer overlaps cells below
		}
	}
	
	else if (this.velocity.y < 0)
	{
		if ((cell && !celldown) || (cellright && !celldiag && nx)) 
		{
			//clamp y position to avoid jumping into above platform
			this.position.y = tileToPixel (ty +1);
			this.velocity.y = 0;
			//player is no longer really in that cell, clamped to cell below
			cell = celldown;
			cellright = celldiag;		//(ditto)
			ny = 0;						//player no longer overlaps cell below
		}
	}
	if (this.velocity.x > 0)
	{
		if ((cellright && !cell) || (celldiag && !celldown && ny))
		{
			//clamp x position to avoid moving into platform just hit
			this.position.x = tileToPixel (tx);
			this.velocity.x = 0; 					// stop horizontal velocity
		}
	}
	else if (this.velocity.x < 0)
	{
		if ((cell && !cellright) || (celldown && !celldiag && ny))
		{
			//clamp x position to avoid moving into platform just hit
			this.position.x = tileToPixel (tx +1);
			this.velocity.x = 0;					//stop hosizontal velocity
		}
	}
	
	startTimer -= deltaTime;
	respawnTimer -= deltaTime;
	
	if(startTimer <= 0 && (this.position.x <= -10 || this.position.x >=  TILE*MAP.tw || this.position.y <= -10 || this.position.y >= TILE*MAP.th ) )
		{
			this.position.set (9*TILE, 0*TILE);
			sfxFall.play();
			gameState = STATE_GAMEOVER
			if (respawnTimer <= 0)
			{
				enemies = [];
			}
			restart ();	
		}
		
		if(lives <= 0)
		{
			this.position.set (9*TILE, 0*TILE);
			sfxSplat.play ();
			gameState = STATE_GAMEOVER
			if (respawnTimer <= 0)
			{
				enemies = [];
			}
			restart ();	
		}
			
	
	if(cellAtTileCoord(LAYER_OBJECT_TRIGGERS, tx, ty) == true)
	{
		gameState = STATE_GAMEOVER; 
	}
}

Player.prototype.draw = function()
{
	this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y);
}