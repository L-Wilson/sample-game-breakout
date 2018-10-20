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
  event.preventDefault()
  console.log("keydown",event.keyCode)
  switch(event.keyCode) {
    case 37:
      game.paddle.movement = "left"
      break
    case 39:
      game.paddle.movement = "right"
      break
    case 32: // space
      game.launchBalls()
      break
    }
})

$(document).keyup(function(event){
  event.preventDefault()
  console.log("keyup",event.keyCode)
  switch(event.keyCode) {
    case 37:
    case 39:
      game.paddle.movement = null
      break
  }
})


class Game{
  constructor(ctx, grid){
    this.ctx = ctx
    this.bricks = []
    // var brickMargin = 0
    // var brickWidth = ((ctx.canvas.width-brickMargin) / grid[0].length) - brickMargin
    var brickWidth = ctx.canvas.width / grid[0].length
    var brickHeight = 50
    for (var row = 0; row < grid.length; row++) {
      for (var col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === 'X') {
          this.bricks.push(new Brick(
            this.ctx,
            col*brickWidth,
            row*brickHeight,
            brickWidth,
            brickHeight
          ))
        }
      }
    }
    this.paddle = new Paddle(this.ctx,this.ctx.canvas.width/5,brickHeight)
    var ballRadius = brickHeight/2
    this.balls= [new Ball(this.ctx,this.paddle.center().x,this.paddle.y-ballRadius,ballRadius)]
  }
  start() {
    var that = this
    this.intervalId = setInterval(function(){
      that.update()
      that.draw()
    }, 1000/60)
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
  }
  update(){
    this.paddle.update()
    for (var i = 0; i < this.balls.length; i++) {
      this.balls[i].update()
      checkCollisionWithPaddleAndUpdate(this.balls[i],this.paddle)
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
    this.speed = 10
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
    this.vx = 0
    this.vy = 0
  }
  isStatic() {
    return this.vx === 0 && this.vy === 0
  }
  launch(){
    if (this.isStatic()) {
      this.vx = 5
      this.vy = -5
    }
  }
  top() { return this.y - this.radius }
  bottom() { return this.y + this.radius }
  left() { return this.x - this.radius }
  right() { return this.x + this.radius }
  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,true)
    this.ctx.fill()
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    var isLeftOrRightCollision = this.x - this.radius < 0 || this.x + this.radius > this.ctx.canvas.width
    if (isLeftOrRightCollision) {
      this.vx *= -1
    }
    var isTopOrBottomCollision = this.y - this.radius < 0
    if (isTopOrBottomCollision) {
      this.vy *= -1
    }
  }
}

function checkCollisionWithPaddleAndUpdate(ball, paddle){
  if (paddle.left() < ball.x && ball.x < paddle.right() && paddle.top() < ball.bottom() && ball.y < paddle.top()) {
    ball.vy *= -1
  }
}