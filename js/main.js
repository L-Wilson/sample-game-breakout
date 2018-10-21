// Initialisation on global variables
var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')
var width = canvas.width
var height = canvas.height
var game

// Go to main page
// goToPage('home')
goToPage('play')

// Listen for click events on <a> and redirect to the right page
$('a').click(function(event){
  event.preventDefault()
  var href = $(this).attr('href')
  goToPage(href)
})

$('#play').click(function(){
  game = new Game(ctx, levels[0].grid)
  game.start()
})



$(document).keydown(function(event){
  // console.log("keydown",event.keyCode)
  switch(event.keyCode) {
    case 37:
      game.paddle.movement = "left"
      break
    case 39:
      game.paddle.movement = "right"
      break
    case 32: // space
      event.preventDefault()
      game.launchBalls()
      break
    }
})

$(document).keyup(function(event){
  event.preventDefault()
  switch(event.keyCode) {
    case 37:
    case 39:
      game.paddle.movement = null
      break
  }
})


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

class Brick {
  constructor(ctx,x,y,width,height) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
  top() { return this.y }
  bottom() { return this.y + this.height }
  left() { return this.x }
  right() { return this.x + this.width }
  draw() {
    ctx.save()
    ctx.fillStyle = "#dc3545"
    this.ctx.strokeRect(this.x, this.y,this.width,this.height)
    this.ctx.fillRect(this.x, this.y,this.width,this.height)
    ctx.restore()
  }
}

class Paddle {
  constructor(ctx,width,height) {
    this.ctx = ctx
    this.x = (this.ctx.canvas.width-width)/2
    this.y = this.ctx.canvas.height - height
    this.width = width
    this.height = height
    this.movement = null
    this.speed = 20
  }
  center(){
    return {
      x:this.x + this.width/2,
      y: this.y + this.height/2
    }
  }
  top() { return this.y }
  bottom() { return this.y + this.height }
  left() { return this.x }
  right() { return this.x + this.width }
  draw() {
    this.ctx.save()
    this.ctx.fillStyle = "black"
    // this.ctx.strokeRect(this.x, this.y,this.width,this.height)
    this.ctx.fillRect(this.x, this.y,this.width,this.height)
    this.ctx.restore()
  }
  update() {
    if (this.movement) {
      var delta = this.movement === "right" ? 1 : -1
      this.x += delta * this.speed
    }
  }
}

class Ball {
  constructor(ctx,x,y,radius){
    this.ctx = ctx
    this.x = x
    this.y = y
    this.radius = radius
    this.speed = 0
    this.angle = -Math.PI/2
    // this.vx = 0
    // this.vy = 0
  }
  vx() {
    return this.speed*Math.cos(this.angle)
  }
  vy() {
    return this.speed*Math.sin(this.angle)
  }
  isStatic() {
    return this.speed === 0
  }
  launch(){
    if (this.isStatic()) {
      this.speed = 10
    }
  }
  top() { return this.y - this.radius }
  bottom() { return this.y + this.radius }
  left() { return this.x - this.radius }
  right() { return this.x + this.radius }
  bounceHorizontally() {
    this.angle = -1*this.angle
  }
  bounceVertically() {
    this.angle = -1*(this.angle-Math.PI/2) + Math.PI/2
  }
  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,true)
    this.ctx.fill()
  }
  update() {
    this.x += this.vx()
    this.y += this.vy()
    var isLeftOrRightCollision = this.x - this.radius < 0 || this.x + this.radius > this.ctx.canvas.width
    if (isLeftOrRightCollision) {
      // this.vx *= -1
      this.bounceVertically()
    }
    var isTopOrBottomCollision = this.y - this.radius < 0
    if (isTopOrBottomCollision) {
      // this.vy *= -1
      this.bounceHorizontally()
    }
  }
}

