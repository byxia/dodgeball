
var Ball = function(config){
    this.style = config.style || 'blue';
    this.radius = config.radius;

    this.damping = config.damping || 1;

    this.x = config.x;
    this.y = config.y;
    
    this.velx = 0;
    this.vely = 0;

    this.maxX = config.maxX;
    this.maxY = config.maxY;

}

Ball.prototype.update = function(timeDiff){
        // console.log(this.maxY);
    // console.log("update");
    this.x += this.velx*timeDiff/20;
    this.y += this.vely*timeDiff/20;

    if (this.x - this.radius < 0){
        this.x = this.radius;
        // this.velx = -this.velx/this.damping;
        this.velx = -this.velx;
    }
    else if(this.x > this.maxX){
        return false;
        // this.x = this.maxX - this.radius;
        // this.velx = -this.velx/this.damping;
    }
    if (this.y - this.radius < 0){
        this.y = this.radius;
        this.vely = -this.vely/this.damping;
    }
    else if (this.y + this.radius > this.maxY){
        // console.log(this.maxY);
        this.y = this.maxY - this.radius;
        this.vely = -this.vely/this.damping;
    }
    return true;
}

Ball.prototype.draw = function(scaledPage){
    scaledPage.fillCircle(this.x, this.y, this.radius, this.style);
}

