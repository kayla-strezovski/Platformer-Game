var Enemy = function() {
	this.image = document.createElement("img");
	this.x = 60;
	this.y = 70;
	this.width = 50;
	this.height = 50;
	
	this.image.src = "enemy.png";
};

Enemy.prototype.update = function(deltaTime)
{
	if( typeof(this.rotation) == "undefined" )
		this.rotation = 0; 	// hang on, where did this variable come from!
		this.rotation -= deltaTime;
}

Enemy.prototype.draw = function()
{
	context.save();
		context.translate(this.x, this.y);
		context.rotate(this.rotation);
		context.drawImage(this.image, -this.width/2, -this.height/2);
	context.restore();
}