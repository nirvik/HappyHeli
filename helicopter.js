(function(){
	var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");

	var width = canvas.width;
	var height = canvas.height;

	var player = {};
	var tick = 0;

	window.requestAnimFrame = function(){
	    return (
	        window.requestAnimationFrame       || 
	        window.webkitRequestAnimationFrame || 
	        window.mozRequestAnimationFrame    || 
	        window.oRequestAnimationFrame      || 
	        window.msRequestAnimationFrame     || 
	        function(/* function */ callback){
	            window.setTimeout(callback, 1000 / 60);
	        }
	    );
	}();

	var assetsLoaded = function () {
		// body...

		this.imgs = {

			"heli" :"./img/heli.png",
			"heli2"	: "./img/heli2.png"

		};

		this.total = Object.keys(this.imgs).length;
		var loaded = 0;

		this.finished = function(){
			console.log("all images have been loaded ");
			startGame();
		}

		this.load = function(dic,name){
			
			if(this[dic][name].status != "loading"){
				return ;
			}
			else{
				this[dic][name].status = "loaded";
				loaded+=1;

				if(loaded==this.total){
					finished.call();
				}
			}
		};

		this.downloadAll = function(){

			var src ;
			var _this = this;

			for(var img in this.imgs){
				src = _this.imgs[img];
				(function(_this,img){
					_this.imgs[img] = new Image();
					_this.imgs[img].name = img;
					_this.imgs[img].status = "loading";
					_this.imgs[img].src = src;
					_this.imgs[img].onload = function() {
						load.call(_this,"imgs",img);
					}
				})(_this,img);
			}
		};

		return {
			imgs : this.imgs,
			downloadAll : this.downloadAll,
			load : this.load,
			total : this.total
		}

	}();

	var KEY_STATUS = {};
	var KEY_CODE = {32 : "space"};

	document.onkeyup = function(e){
		var keycode = e.keyCode ;
		if(KEY_CODE[keycode]){
			KEY_STATUS[KEY_CODE[keycode]] = false;
		}
	}

	document.onkeydown = function(e){
		var keycode = e.keyCode ;
		if(KEY_CODE[keycode]){
			KEY_STATUS[KEY_CODE[keycode]] = true;
		}
	}

	function Vector(x,y,dx,dy){

		this.x = x || 0;
		this.y = y || 0;

		this.dx = dx ;
		this.dy = dy ;
	}

	Vector.prototype.advance = function(){
		this.y+=this.dy;
	}

	var player = function(player){

		player.width = 50;
		player.height = 50;
		
		player.img = assetsLoaded.imgs["heli"];
		player.img1 = assetsLoaded.imgs["heli2"];
		player.image = new Image();
		
		player.dx = 0;
		player.dy = 0;

		player.isThrust = false;
		player.gravity = 1;

		Vector.call(player,0,0,0,0);	
		
		player.update = function(){

			tick+=1;
			if(KEY_STATUS.space){
				player.dy = -10;
				console.log("COMON");
			}

			else{
				player.dy += player.gravity;
			}

			this.advance();
			if(tick%2==0){
				player.image.src = player.img;
			}
			else{
				player.image.src = player.img1;
			}

		};

		player.reset = function(){
			player.x = 20;
			player.y = 100;
		};

		player.draw = function(){
			ctx.drawImage(
				player.image,
				player.x,
				player.y
			);
		};

		return player;
	}(Object.create(Vector.prototype));


	function animate(){
		requestAnimFrame(animate);
		ctx.clearRect(0,0,width,height);
		player.update();
		player.draw();
	}

	function startGame(){
		player.reset();
		animate();
	}
	assetsLoaded.downloadAll();

})();