var Vector2 = function() {
	this.x = 0;
	this.y = 0;
}

Vector2.prototype.set = function (x,y){
	this.x = x;
	this.y = y;
}

Vector2.prototype.normalise = function (){
	var length = Math.sqrt(this.x*this.x + this.y*this.y);
	this.x = x/legnth;
	this.y = y/length
}

Vector2.prototype.add = function (v2){
	this.x += v2.x;
	this.y += v2.y;
}

Vector2.prototype.subtract = function (v2){
	this.x -= v2.x;
	this.y -= v2.y;
}

Vector2.prototype.multiplyScalar = function (num){
	this.x *= num.x;
	this.y *= num.y;
}
