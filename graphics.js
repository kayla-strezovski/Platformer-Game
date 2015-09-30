
// create object for splash screen
var chuckNorrisSplash = {
			image: document.createElement("img"),
			x: 125,
			y: 10,
			width:300,
			height: 300,
			directionX: 0,
			directionY: 0,
			angularDirection:0,
			rotation:0 
		};

		chuckNorrisSplash.image.src = "splash_chuck.png";
		
		// create object for gameover screen
var chuckNorrisGameOver = {
			image: document.createElement("img"),
			x: 10,
			y: 50,
			width:300,
			height: 300,
			directionX: 0,
			directionY: 0,
			angularDirection:0,
			rotation:0 
		};

		chuckNorrisGameOver.image.src = "gameover_chuck.gif";