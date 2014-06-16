(function(){
	var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");

	var width = canvas.width;
	var height = canvas.height;

	var player = {};
	var terrain = [];
	var tick = 0;
	var quadTree ;
	var PlatformWidth = 100;
	var score = 0;

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

/*
	var walls = {

		type : "walls",
		collidableWith : "player",
		draw : function(x,y){
			ctx.rect(x,y,50,200);
			ctx.stroke();
		}
	};
*/

	function walls(x,y){
		
		this.type = "wall";
		this.collidableWith = "player";
		this.x = x;
		this.y = y;
		this.width = 100;
		this.height = 200;
		Vector.call(this,this.x,this.y,0,0);

		this.draw = function(){
			ctx.fillRect(this.x,this.y,100,200);
			
		};
	}
	walls.prototype = Object.create(Vector.prototype);

	var player = function(player){

		player.width = 50;
		player.height = 50;
		player.type ="player";
		player.collidableWith = "walls";
		player.collided = false;
		player.img = assetsLoaded.imgs["heli"];
		player.img1 = assetsLoaded.imgs["heli2"];
		player.image = new Image();
		
		player.dx = 0;
		player.dy = 0;
		player.speed = 5;

		player.isThrust = false;
		player.gravity = 1;

		Vector.call(player,0,0,0,0);	
		
		player.update = function(){

			tick+=1;
			if(KEY_STATUS.space){
				player.dy = -10;
			//	console.log("COMON");
			}

			else{
				player.dy += player.gravity;
			}

			if(player.y>=canvas.height || player.y<-30){
				player.collided = true;
			}

			this.advance();
			if(tick%2==0){
				player.image.src = player.img;
			}
			else{
				player.image.src = player.img1;
			}

			if(player.collided){
				GameOver();
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

	function QuadTree(boundBox,lvl){

		this.bounds = boundBox || {
			x :0,
			y :0,
			width :0,
			height:0
		};

		var objects = [];
		var maxLevel = 5;
		var maxObjects = 10;

		var level = lvl || 0;
		this.nodes = [];

		this.clear = function(){
			
			objects = [];
			for(var i=0;i<this.nodes.length;i++){
				this.nodes[i].clear();
			}

			this.nodes = [];
		};

		this.getAllobjects = function(returnedobject){
			for(var i=0;i<this.nodes.length;i++){
				this.nodes[i].getAllobjects(returnedobject);
			}

			for(var i=0;i<objects.length;i++){
				returnedobject.push(objects[i]);
			}

			return returnedobject;
		};

		this.findObjects = function(returnedobject,obj){

			var index = this.getIndex(obj);
			
			if(index != -1 && this.nodes.length){
				this.nodes[index].findObjects(returnedobject,obj);
			}

			for(var i=0;i<objects.length;i++){
				returnedobject.push(objects[i]);
			}

			return returnedobject;
		}

		this.getIndex = function(obj){

			var index = -1;

			var verticalMidPoint = this.bounds.x + this.bounds.width/2;
			var horizontMidPoint = this.bounds.y + this.bounds.height/2;
			
			var left = (obj.x < verticalMidPoint && obj.x+obj.width<verticalMidPoint);
			var right = (obj.x >verticalMidPoint);

			if(left){

				var top =(obj.y<horizontMidPoint && obj.y+obj.height<horizontMidPoint);
				var bottom = (obj.y>horizontMidPoint);

				if(top){
					index = 1;
				}
				else{
					index = 2;
				}
			}

			else{

				var top =(obj.y<horizontMidPoint && obj.y+obj.height<horizontMidPoint);
				var bottom = (obj.y>horizontMidPoint);

				if(top){
					index = 0;
				}
				else{
					index = 3;
				}
			}

			return index;
		};

		this.split = function(){

			var subWidth = this.bounds.width/2 || 0;
			var subHeight = this.bounds.height/2 || 0;
			
			this.nodes[0] = new QuadTree({
				x:this.bounds.x+subWidth,
				y:this.bounds.y,
				width:subWidth,
				height:subHeight
			},level+1);
			this.nodes[1] = new QuadTree({
				x:this.bounds.x,
				y:this.bounds.y,
				width:subWidth,
				height:subHeight
			},level+1);
			this.nodes[2] = new QuadTree({
				x:this.bounds.x,
				y:this.bounds.y+subHeight,
				width:subWidth,
				height:subHeight
			},level+1);
			this.nodes[3] = new QuadTree({
				x:this.bounds.x+subWidth,
				y:this.bounds.y+subHeight,
				width:subWidth,
				height:subHeight
			},level+1);
		};

		this.insert = function(object){

			if(typeof(object)=="undefined"){
				return;
			}

			if(object instanceof Array){
				for(var i=0;i<object.length;i++){
					this.insert(object[i]);
				}
			}

			if(this.nodes.length){
				
				var index = this.getIndex(object);
				if(index != -1){
					this.nodes[index].insert(object);
				}
			}

			objects.push(object);

			if(objects.length>maxObjects && level<maxLevel){
				if(this.nodes[0] == null){
					this.split();
				}
				var i = 0;
				while(i<objects.length){

					var index = this.getIndex(objects[i]); // Get the index of each element of the objects
					if(index != -1){
						this.nodes[index].insert((objects.splice(i,1))[0]);
						// This node containing the quadtree will have its own boundBox {x,y,width,height} 
					}
					else{
						i++;
					}
				}
			}
		};

	}

	function updateTerrain(){

		for(var i=0;i<terrain.length;i++){
			terrain[i].x -= player.speed;
			terrain[i].draw();
		//	console.log(terrain[i]);
		}

		if(terrain[0].x<= -PlatformWidth){
			terrain.shift();
			var x = terrain[terrain.length-1].x + 1000;
			var y = (Math.random()*350);
			terrain.push(new walls(x,y));
		}
		
	}

	function GameOver(){
		
		//ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.font="30px Verdana";
		var gradient=ctx.createLinearGradient(0,0,canvas.width,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");
		// Fill with gradient
		ctx.fillStyle=gradient;
		ctx.fillText("GameOver !",canvas.width/2,canvas.height/2);
		ctx.fillText("You have scored:"+score+"m",canvas.width/2,canvas.height/1.8);
	}

	function detectCollision(){

		var objects = [];
		quadTree.getAllobjects(objects);

		for(var x=0;x<objects.length;x++){
			quadTree.findObjects(obj=[],objects[x]);
			for(var y=0;y<obj.length;y++){

				if(objects[x].collidableWith == obj[y].type &&
					objects[x].x<obj[y].x+obj[y].width &&
					objects[x].x+objects[x].width>obj[y].x &&
					(objects[x].y+objects[x].height>obj[y].y ||
						objects[x].y - objects[x].height>obj[y].y)
					 &&
					objects[x].y<obj[y].y+obj[y].height 
					){
					player.collided = true;
				}
			}

		}

	}

	function animate(){

		
		if(!player.collided){
			score+=1;			
			requestAnimFrame(animate);
			ctx.clearRect(0,0,width,height);

			quadTree.clear();
			quadTree.insert(player);
			quadTree.insert(terrain);
			updateTerrain();
			player.update();
			player.draw();

			ctx.font="15px Verdana";
			ctx.fillText("score:"+score+"m",canvas.width-200,canvas.height);

			detectCollision();
		}

		else{
			GameOver();
		}

//		console.log("all inserted properly");
	}

	function startGame(){

		quadTree = new QuadTree({
			x:0,
			y:0,
			width:canvas.width,
			height:canvas.height
		});

		for(var i=1;i<Math.floor(canvas.width/PlatformWidth)+2 ;i++){
			var x = i*500;
			var y = (Math.random()*350)+50;
			terrain.push(new walls(x,y));
		}
	
		player.reset();
		animate();
	}
	assetsLoaded.downloadAll();

})();