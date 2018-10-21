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