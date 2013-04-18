var DodgeBallGame = function(){
    this.setup();
    window.util.deltaTimeRequestAnimationFrame(this.draw.bind(this));
}


// size of playable character
var CHAR_WIDTH = 20;
var CHAR_HEIGHT = 40;

var lost = false;
var score = 0;
var level = 0;
var scoreInterval;
var ballInterval;

// possible colors for balls
var ballColors = ['#f25a5a', '#e9f25a', '#85f25a', '#5af2c2', '#5ac2f2', 
        '#5a65f2', '#c07af6', '#f67ae9'];

// data of each level: score limit, radius range, velocity range
var lvlInfo = [
    {'score': 0, 'radiusMin': 12, 'radiusMax': 20, 'velxMin': 2, 'velxMax': 4,
        'velyMin': 2, 'velyMax': 5},
    {'score': 100, 'radiusMin': 10, 'radiusMax': 25, 'velxMin': 1, 'velxMax': 5,
        'velyMin': 4, 'velyMax': 8},
    {'score': 200, 'radiusMin': 8, 'radiusMax': 30, 'velxMin': 0.3, 'velxMax': 6,
        'velyMin': 6, 'velyMax': 10},
    {'score': 400, 'radiusMin': 8, 'radiusMax': 35, 'velxMin': 0.3, 'velxMax': 8,
        'velyMin': 8, 'velyMax': 14},
    {'score': 600, 'radiusMin': 8, 'radiusMax': 35, 'velxMin': 0.3, 'velxMax': 8,
        'velyMin': 14, 'velyMax': 20}
];


// starts game
function start(){
    ballInterval = setInterval(function(){window.game.newBall();}, 2500);
    scoreInterval = setInterval(updateScore, 1000);
}

// score += 10 every second
function updateScore(){
    score += 10;
}

// freezes screen, used for game over
function pausecomp(millis) {
    var date = new Date();
    var curDate = null;

    do { curDate = new Date(); } 
    while(curDate-date < millis);
}

// helper; gives random int in given range
function randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 

//==============================================
//SETUP
//==============================================

DodgeBallGame.prototype.setup = function(){
    window.util.patchRequestAnimationFrame();
    window.util.patchFnBind();
    this.initCanvas();
    // TouchHandler.init(this);
    this.balls = [];        // array that contains all on-screen balls
    this.initCharacter();
    this.initAccelerometer();
}

DodgeBallGame.prototype.initCanvas = function(){
    this.body = $(document.body);
    this.body.width(document.body.offsetWidth);
    this.body.height(window.innerHeight - 20);
    this.width = $(window).width();
    this.height = $(window).height();
    this.canvas = window.util.makeAspectRatioCanvas(this.body, this.width/this.height);
    this.page = new ScaledPage(this.canvas, this.width);
};

DodgeBallGame.prototype.initCharacter = function(){
    this.character = new Character({'x': this.width/2-CHAR_WIDTH, 'y': this.height-CHAR_HEIGHT,
                            'width': CHAR_WIDTH, 'height': CHAR_HEIGHT,
                            'maxX': this.width, 'maxY': 300});
    this.character.speed = 0;
}

DodgeBallGame.prototype.newBall = function(){
    // set level
    if (score >= lvlInfo[4].score){
        level = 4;
    }
    else if (score >= lvlInfo[3].score){
        level = 3;
    }
    else if (score >= lvlInfo[2].score){
        level = 2;
    }
    else if (score >= lvlInfo[1].score){
        level = 1;
    }

    // set ball parameters based on level
    var lvl = lvlInfo[level];

    var randY = randomInt(50, this.height-70);
    var randRadius = randomInt(lvl.radiusMin, lvl.radiusMax);
    var randVelX = randomInt(lvl.velxMin, lvl.velxMax);
    var randVelY = randomInt(lvl.velyMin, lvl.velyMax);
    var randColor = ballColors[randomInt(0, ballColors.length-1)];

    var ball = new Ball({'style': randColor, 'x': 0, 'y': randY, 'radius': randRadius, 
        'maxX': this.width, 'maxY': this.height});
    ball.velx = randVelX;
    ball.vely = randVelY;

    // add new ball to balls array
    this.balls.push(ball);
}

DodgeBallGame.prototype.initAccelerometer = function(){
    this.accelerometer = new Accelerometer();
    this.accelerometer.startListening();
}

//==============================================
//DRAWING
//==============================================

DodgeBallGame.prototype.draw = function(timeDiff){
    
    // if game isn't over, update balls, character, show score, and check if game over
    if (lost === false){
        this.clearPage();
        for (var i=0; i<this.balls.length; i++){
            this.drawBall(timeDiff, this.balls[i]);
        }
        this.drawChar(timeDiff);
        // TouchHandler.drawBalls(timeDiff);
        this.updateChar();
        this.showScore();
        this.detectDie();
    }

    // if game is over, stop scoring, pause screen for 1s, and show game over screen
    else{
        clearInterval(scoreInterval);
        pausecomp(1000);
        this.clearPage();
        this.showScore();
        this.drawLoseScreen();
    }

}

DodgeBallGame.prototype.clearPage = function(){
    this.page.fillRect(0, 0, this.width, this.height, '#fff');
}

// draw character
DodgeBallGame.prototype.drawChar = function(timeDiff){
    this.character.update(timeDiff);
    this.character.draw(this.page);
}

// update character speed with input from accelerometer
DodgeBallGame.prototype.updateChar = function(){
    var lastAcceleration = this.accelerometer.getLast();
    if (lastAcceleration.x > 0){
        this.character.speed = 2;
    }
    else{
        this.character.speed = -2;
    }
}

// draw all on-screen balls
DodgeBallGame.prototype.drawBall = function(timeDiff, ball){
    var update = ball.update(timeDiff);
    if (update === true){
        ball.draw(this.page);
    }
    else{
        for (var i=0; i<this.balls.length; i++){
            if (this.balls[i] == ball){
                this.balls.splice(i,1);
            }
        }
    }
}

// check if game over
DodgeBallGame.prototype.detectDie = function(){
    var charX = this.character.x;
    var charY = this.character.y;

    // check 9 points on character for overlap
    var points = [
                {"x": charX, "y": charY},                 // top left
                {"x": charX+CHAR_WIDTH/2, "y": charY},    // top center
                {"x": charX+CHAR_WIDTH, "y": charY},      // top right

                {"x": charX, "y": charY+CHAR_HEIGHT/2},                 //middle left
                {"x": charX+CHAR_WIDTH/2, "y": charY+CHAR_HEIGHT/2},    //middle center
                {"x": charX+CHAR_WIDTH, "y": charY+CHAR_HEIGHT/2},      //middle right

                {"x": charX, "y": charY+CHAR_HEIGHT},                   //bottom left
                {"x": charX+CHAR_WIDTH/2, "y": charY+CHAR_HEIGHT},      //bottom center
                {"x": charX+CHAR_WIDTH, "y": charY+CHAR_HEIGHT}         // bottom right
                ];

    for (var i=0; i<this.balls.length; i++){    // loop over balls
        for (var j=0; j<points.length; j++){    // loop over char points
            var distance = getDistance(
                {"x": this.balls[i].x, "y": this.balls[i].y},
                points[j]
                );
            if (distance < this.balls[i].radius-2){     // lose when touching
                this.lose();
            }
        }
    }
}

DodgeBallGame.prototype.lose = function(){
    lost = true;
}

DodgeBallGame.prototype.showScore = function() {
    this.page.writeText("Score: "+score, this.width/2-70, 40, "#666", "24px Arial", "left");
}

DodgeBallGame.prototype.drawLoseScreen = function() {
    var newHiScore = false;
    var hiScore;

    if (typeof(localStorage)!=="undefined") {
        // localStorage.clear();
        hiScore = localStorage["hiScore"];

        // if no record, update hi score
        if (hiScore == null){
            newHiScore = true;
            localStorage["hiScore"] = score;
        }
        else{
            hiScore = localStorage["hiScore"];
            if (score >= hiScore){              //update if new hi score
                console.log("new highscore");
                newHiScore = true;
                localStorage["hiScore"] = score;
            }
        }
    }
    else{
        console.log("no local storage support");
    }

    // draw pop-up window
    this.page.fillRect(this.width/2-130, this.height/2-80, 260, 160, '#666');
    
    // write game over & high score if localStorage exists
    if (typeof(localStorage)!=="undefined") {
        this.page.writeText("Game Over", this.width/2-10, this.height/2-20, "white", "30px Arial", "center");
        if (newHiScore === true){
            this.page.writeText("New High Score!", this.width/2-10, this.height/2+20, "white", "24px Arial", "center");
        }
        else{
            this.page.writeText("High score: "+hiScore, this.width/2-10, this.height/2+20, "white", "24px Arial", "center");
        }
    }
    // only write game over if localStorage doesn't
    else{
        this.page.writeText("Game Over", this.width/2-10, this.height/2, "white", "30px Arial", "center");
    }

};

// helper, get distance between 2 given points
function getDistance(point1, point2){
    var x1 = point1.x;
    var y1 = point1.y;

    var x2 = point2.x;
    var y2 = point2.y;

    var distance = Math.sqrt(Math.pow(Math.abs(x2-x1),2)+Math.pow(Math.abs(y2-y1),2));
    return distance;
}