class Rectangle {
  constructor({x, y, width=null, height=null, canvas, new_canvas=true}={}) {
    this.x = x;
    this.y = y;
    this.width = width || this.default_width;
    this.height = height || this.default_height;
    this.orig_canvas = canvas;
    this.canvas = null;
    this.ctx = null;
    this.is_active = false;
    this.p = null;
    this.new_canvas = new_canvas;
  }

  get default_height(){
    return 30;
  }

  get default_width(){
    return 1.681*(this.height || this.default_height);
  }

  draw({width=null, height=null, fill=false}={}) {
    const self = this;
    if(!this.canvas){
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.orig_canvas.width;
      this.canvas.height = this.orig_canvas.height;
      this.orig_canvas.parentNode.insertBefore(this.canvas, this.orig_canvas.nextSibling);
      this.ctx = this.canvas.getContext("2d");
      this.p = new Point(this.x, this.y, this.canvas);
    }

    // Draw rect with default size
    //this.ctx.beginPath();
    this.ctx[fill ? 'fillRect' : 'strokeRect'](
      this.x-this.width/2,
      this.y-this.height/2,
      width || this.width,
      height || this.height
    )
    return this;
  }

  destroy(){
    this.canvas.parentNode.removeChild(this.canvas);
  }

  hit(point) {
    return point.canvas_x >= (this.x-this.width/2) &&
      point.canvas_x <= (this.x+this.width/2) &&
      point.canvas_y >= (this.y-this.height/2) &&
      point.canvas_y <= (this.y+this.height/2);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

}

class DraggableRectangle extends Rectangle {
  constructor({x, y, width, height, canvas, clamp_x=null, clamp_y=null}={}) {
    super({x: x, y: y, width: width, height: height, canvas: canvas});
    this.dragging = false;
    this.clamp_x = clamp_x || this.identity;
    this.clamp_y = clamp_y || this.identity;
  }

  with_colour(colour, callback){
    var orig_colour = this.ctx.strokeStyle;
    this.ctx.strokeStyle = colour;
    callback();
    this.ctx.strokeStyle = orig_colour;
  }

  unset_active(){
    this.is_active = false;
    this.clear();
    this.draw();
  }

  set_active(){
    this.is_active = true;
    this.clear();
    this.with_colour("red", this.draw.bind(this));
  }

  toggle_handlers(on) {
    const method = on ? this.canvas.addEventListener : this.canvas.removeEventListener;
    // Handling touch events
    method('touchstart', this.touchstart.bind(this), false);
    method('touchmove', throttle(this.touchmove.bind(this), 50), false);

    // Handling mouse events
    method('mousedown', this.mousedown.bind(this), false);
    method('mousemove', throttle(this.mousemove.bind(this), 50), false);
    method('mouseup', this.mouseup.bind(this));
  }

  select(point) {
    if(this.hit(point)){
      this.set_active();
    }else{
      if(this.is_active){
        this.unset_active();
      }
    }
  }

  move(point) {
    this.clear();
    this.x = point.canvas_x;
    this.y = point.canvas_y;
    this.draw();
  }

  mouseup(event) {
    event.preventDefault();
    this.p.x = event.pageX;
    this.p.y = event.pageY;
    if(this.dragging){
      this.dragging = false;
      //active_rect.unset_active();
    }else{
      this.select(this.p)
    }
  }

  mousedown(event) {
    event.preventDefault();
    this.p.x = event.pageX;
    this.p.y = event.pageY;
    this.select(this.p)
    this.dragging = this.is_active;
  }

  touchstart(event) {
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      const touch = event.targetTouches[0];
      this.p.x = touch.pageX;
      this.p.y = touch.pageY;
      this.select(this.p);
      this.dragging = this.is_active;
    }
  }

  touchmove(event) {
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      const touch = event.targetTouches[0];
      if(!this.dragging){
        return;
      }
      this.p.x = this.clamp_x(touch.pageX);
      this.p.y = this.clamp_y(touch.pageY);
      this.move(this.p);
    }
  }

  mousemove(event) {
    event.preventDefault();
    if(!this.dragging){
      return;
    }
    this.p.x = this.clamp_x(event.pageX);
    this.p.y = this.clamp_y(event.pageY);
    this.move(this.p);
  }

  identity(x) {
    return x;
  }
}

class ResizableDraggableRectangle extends DraggableRectangle {
  draw_drag_handles(){
    const handle_size = 4,
      context = this.ctx;
    this.drag_handles = [
      [this.x, this.y-this.height/2-5, (x)=>{ this.x }, (y)=>{ Math.min(y, this.y) }],
      [this.x, this.y+this.height/2+5, (x)=>{ this.x }, (y)=>{ Math.max(y, this.y) }],
      [this.x-this.width/2-5, this.y, (x)=>{ Math.min(x, this.x) }, (y)=>{ this.y }],
      [this.x+this.width/2+5, this.y, (x)=>{ Math.max(x, this.x) }, (y)=>{ this.y }]
    ].forEach(function(args){
      context.fillRect(
        args[0]-handle_size/2,
        args[1]-handle_size/2,
        handle_size,
        handle_size
      );
    });
  }

  unset_active(){
    this.is_active = false;
    this.clear();
    this.draw();
  }

  set_active(){
    this.is_active = true;
    this.clear();
    this.with_colour("red", function(){
      this.draw();
      this.draw_drag_handles();
    }.bind(this));
  }
}
