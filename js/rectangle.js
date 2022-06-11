class Rectangle {
  constructor({x, y, width=null, height=null, canvas}={}) {
    this.x = x;
    this.y = y;
    this.width = width || this.default_width;
    this.height = height || this.default_height;
    this.orig_canvas = canvas;
    this.orig_context = canvas.getContext('2d');
    this.canvas = null;
    this.ctx = null;
    this.is_active = false;
    this.p = null;
  }

  get default_height(){
    return 30;
  }

  get default_width(){
    return 1.681*(this.height || this.default_height);
  }

  draw({width=null, height=null, fill=false}={}) {
    const that = this;
    if(!this.canvas){
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.orig_canvas.width;
      this.canvas.height = this.orig_canvas.height;
      this.orig_canvas.parentNode.insertBefore(this.canvas, this.orig_canvas.nextSibling);
      this.ctx = this.canvas.getContext("2d");
      this.ctx.lineWidth = this.orig_context.lineWidth;
      this.ctx.strokeStyle = this.orig_context.strokeStyle;
      this.p = new Point(this.x, this.y, this.canvas);
    }

    // Draw rect with default size
    this.ctx.beginPath();
    this.ctx[fill ? 'fillRect' : 'strokeRect'](
      this.x-this.width/2,
      this.y-this.height/2,
      width || this.width,
      height || this.height
    )
    return this;
  }

  destroy(){
    this.clear();
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
  constructor({x, y, width, height, canvas}={}) {
    super({x: x, y: y, width: width, height: height, canvas: canvas});
    this.dragging = false;
  }

  clear(){
    this.toggle_handlers(false);
    super.clear();
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

  move_end(point){
    //No-op
  }

  mouseup(event) {
    event.preventDefault();
    this.p.x = event.pageX;
    this.p.y = event.pageY;
    if(this.dragging){
      this.dragging = false;
      this.move_end(this.p);
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
      this.p.x = touch.pageX;
      this.p.y = touch.pageY;
      this.move(this.p);
    }
  }

  mousemove(event) {
    event.preventDefault();
    this.p.x = event.pageX;
    this.p.y = event.pageY;
    if(!this.dragging){
      if(this.hit(this.p)){
        document.body.classList.add("grabbing");
      }else{
        document.body.classList.remove("grabbing");
      }
      return;
    }
    this.move(this.p);
  }

  identity(x) {
    return x;
  }

}

class DragHandle extends DraggableRectangle {
  constructor({x, y, size=6, rect, clamp_x, clamp_y, drag_direction=1}={}) {
    super({
      x: x,
      y: y,
      width: size,
      height: size,
      canvas: rect.canvas
    });
    this.clamp_x = clamp_x;
    this.clamp_y = clamp_y;
    this.rect = rect;
    this.drag_direction = drag_direction;
    this.ctx = rect.ctx
    this.draw({fill: true});
    this.toggle_handlers(true);
  }

  move(point) {
    this.clear();
    const x_orig = this.x, y_orig = this.y;
    this.x = this.clamp_x(point.canvas_x);
    this.y = this.clamp_y(point.canvas_y);
    this.draw({fill: true});
    // Work out new dimensions of rect based on movement of drag handle
    this.rect.x = this.rect.x+0.5*(this.x-x_orig);
    this.rect.y = this.rect.y+0.5*(this.y-y_orig);
    this.rect.width = this.rect.width+this.drag_direction*(this.x-x_orig);
    this.rect.height = this.rect.height+this.drag_direction*(this.y-y_orig);
    this.rect.clear();
    this.rect.draw();
    //this.rect.draw_drag_handles();
  }

  move_end(point){
    this.rect.draw_drag_handles();
  }

}

class ResizableDraggableRectangle extends DraggableRectangle {
  constructor({x, y, width, height, canvas}={}) {
    super({x: x, y: y, width: width, height: height, canvas: canvas});
    this.drag_handles = []
  }

  draw_drag_handles(){
    const that = this;
    this.destroy_drag_handles();
    this.drag_handles = [
      [this.x, this.y-this.height/2-7, function(x){ return that.x; }, function(y){ return Math.min(y, that.y); }, -1],
      [this.x, this.y+this.height/2+7, function(x){ return that.x; }, function(y){ return Math.max(y, that.y); }, +1],
      [this.x-this.width/2-7, this.y, function(x){ return Math.min(x, that.x); }, function(y){ return that.y; }, -1],
      [this.x+this.width/2+7, this.y, function(x){ return Math.max(x, that.x); }, function(y){ return that.y; }, +1]
    ].map(function(args){
      return new DragHandle({
        x: args[0],
        y: args[1],
        clamp_x: args[2],
        clamp_y: args[3],
        drag_direction: args[4],
        rect: that,
      });
    });
  }

  clear(){
    this.clear_drag_handles();
    super.clear();
  }

  destroy_drag_handles(){
    this.drag_handles.forEach(function(drag_handle){
      drag_handle.destroy();
    });
    this.drag_handles = [];
  }

  clear_drag_handles(){
    this.drag_handles.forEach(function(drag_handle){
      drag_handle.clear();
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
