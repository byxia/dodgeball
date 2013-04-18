
var Character = function(config){
    this.style = config.style || '#edad5b';
    this.width = config.width;
    this.height = config.height;

    this.speed = 0;

    // this.damping = config.damping || 1.5;

    this.x = config.x;
    this.y = config.y;

    this.maxX = config.maxX;
    this.maxY = config.maxY;

}

Character.prototype.update = function(timeDiff){
    this.x += this.speed*timeDiff/20;

    if (this.x < 0){
        this.x = 0;
    }
    else if (this.x + this.width > this.maxX){
        this.x = this.maxX - this.width;
    }

}

Character.prototype.draw = function(scaledPage){
    scaledPage.fillRect(this.x, this.y, this.width, this.height, this.style);
}