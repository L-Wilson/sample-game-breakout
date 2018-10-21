class Game{
  constructor(ctx, grid){
    this.BRICK_WIDTH = ctx.canvas.width / grid[0].length
    this.BRICK_HEIGHT = 50
    this.BALL_RADIUS = this.BRICK_HEIGHT/2

    this.ctx = ctx
    this.bricks = []
    
    // Creation of bricks based on the grid
    for (var row = 0; row < grid.length; row++) {
      for (var col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === 'X') {
          this.bricks.push(new Brick(
            this.ctx,
            col*this.BRICK_WIDTH,
            row*this.BRICK_HEIGHT,
            this.BRICK_WIDTH,
            this.BRICK_HEIGHT
          ))
        }
      }
    }

    this.paddle = new Paddle(this.ctx,this.ctx.canvas.width/5,this.BRICK_HEIGHT)
    this.balls= [new Ball(this.ctx,this.paddle.center().x,this.paddle.y-this.BALL_RADIUS,this.BALL_RADIUS)]

    this.lives = 3
  }
  start() {
    var that = this

    this.intervalId = setInterval(function(){
      that.update()
      that.draw()
    }, 1000/60)

    // this.update()
    // this.draw()
    // window.requestAnimationFrame(function(){
    //   that.start()
    // })
  }
  launchBalls(){
    for (var i = 0; i < this.balls.length; i++) {
      this.balls[i].launch()
    }
  }
  draw() {
    this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)
    for (var i = 0; i < this.bricks.length; i++) {
      this.bricks[i].draw()
    }
    this.paddle.draw()
    for (var i = 0; i < this.balls.length; i++) {
      this.balls[i].draw()
    }
    // Draw of lives
    this.ctx.save()
    this.ctx.font = "30px sans-serif"
    this.ctx.textAlign = "right"
    this.ctx.fillText("Lives: " + this.lives, this.ctx.canvas.width-5, 30)
    this.ctx.restore()
  }
  update(){
    this.paddle.update()
    for (var iBall = 0; iBall < this.balls.length; iBall++) {
      this.balls[iBall].update()
      this.checkBallPaddleCollisionAndUpdate(this.balls[iBall],this.paddle)
      for (var iBrick = this.bricks.length-1; iBrick >=0; iBrick--) {
        if (this.checkBallBrickCollisionAndUpdate(this.balls[iBall], this.bricks[iBrick])) {
          console.log("DELETE", iBrick)
          this.bricks.splice(iBrick, 1)

        }
      } 
    }
    this.removeUselessBalls()
    if (this.balls.length === 0) {
      console.log('GAME OVER')
      this.balls.push(new Ball(this.ctx, this.paddle.center().x, this.paddle.y-this.BALL_RADIUS, this.BALL_RADIUS))
      this.lives--
    }
  }
  checkBallPaddleCollisionAndUpdate(ball, paddle){
    if (paddle.left() < ball.x && ball.x < paddle.right() && paddle.top() < ball.bottom() && ball.y < paddle.top()) {
      var factor = 2*(ball.x-paddle.center().x)/paddle.width // Number between -1 and 1
      var maxAngle = 0.9*Math.PI/2
      var paddleAngle = -Math.PI/2 + factor*maxAngle
      ball.angle = (-ball.angle + paddleAngle) / 2
      ball.y = paddle.top() - ball.radius
    }
  }
  
  // Return true if there is a collision
  checkBallBrickCollisionAndUpdate(ball, brick) {
    // Check with the bottom and top part of the  brick
    if((Math.abs(brick.bottom()-ball.y) < ball.radius || Math.abs(brick.top()-ball.y) < ball.radius) && brick.left() < ball.x && ball.x < brick.right()) {
      ball.bounceHorizontally()
      return true
    }
    if((Math.abs(brick.left()-ball.x) < ball.radius || Math.abs(brick.right()-ball.x) < ball.radius) && brick.top() < ball.y && ball.y < brick.bottom()) {
      ball.bounceVertically()
      return true
    }
    return false
  }

  removeUselessBalls() {
    for (var iBall = this.balls.length-1; iBall >= 0; iBall--) {
      if (this.balls[iBall].top() > this.ctx.canvas.height) {
        this.balls.splice(iBall, 1)
      }
    }
  }
}