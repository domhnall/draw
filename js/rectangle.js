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
    this._init_canvas();
    //if(!this.canvas){
      //this.canvas = document.createElement("canvas");
      //this.canvas.width = this.orig_canvas.width;
      //this.canvas.height = this.orig_canvas.height;
      //this.orig_canvas.parentNode.insertBefore(this.canvas, this.orig_canvas.nextSibling);
      //this.ctx = this.canvas.getContext("2d");
      //this.ctx.lineWidth = this.orig_context.lineWidth;
      //this.ctx.strokeStyle = this.orig_context.strokeStyle;
      //this.p = new Point({ x: this.canvas_x, y: this.canvas_y, canvas: this.canvas });
    //}

    // Draw rect with default size
    this.ctx.beginPath();
    var p = new Point({canvas_x: this.x-this.width/2, canvas_y: this.y-this.height/2, canvas: this.canvas});

    this.ctx[fill ? 'fillRect' : 'strokeRect'](
      this.x-this.width/2,
      this.y-this.height/2,
      width || this.width,
      height || this.height
    );
    if(this.is_active){
      this.ctx.strokeRect(
        this.x-this.width/2-2,
        this.y-this.height/2-2,
        (width || this.width) + 4,
        (height || this.height) + 4
      );
    }
    return this;
  }

  top_left(){
    return new Point({
      canvas_x: this.x-this.width/2,
      canvas_y: this.y-this.height/2,
      canvas: this.canvas
    });
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

  _init_canvas() {
    if(this.canvas){
      return;
    }
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.orig_canvas.width;
    this.canvas.height = this.orig_canvas.height;
    this.orig_canvas.parentNode.insertBefore(this.canvas, this.orig_canvas.nextSibling);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineWidth = this.orig_context.lineWidth;
    this.ctx.strokeStyle = this.orig_context.strokeStyle;
    this.p = new Point({ x: this.canvas_x, y: this.canvas_y, canvas: this.canvas });
  }
}

class DraggableRectangle extends Rectangle {
  constructor({x, y, width, height, canvas}={}) {
    super({x: x, y: y, width: width, height: height, canvas: canvas});
    this.mousemove = throttle(this._mousemove.bind(this), 50);
    this.touchmove = throttle(this._touchmove.bind(this), 50);
    this.touchstart = this._touchstart.bind(this);
    this.mouseup = this._mouseup.bind(this);
    this.mousedown = this._mousedown.bind(this);
    this.dragging = false;
  }

  destroy(){
    this.toggle_handlers(false);
    super.destroy();
  }

  with_fill_colour(colour, callback){
    var orig_colour = this.ctx.fillStyle;
    this.ctx.fillStyle = colour;
    callback();
    this.ctx.fillStyle = orig_colour;
  }

  with_stroke_colour(colour, callback){
    var orig_colour = this.ctx.strokeStyle;
    this.ctx.strokeStyle = colour;
    callback();
    this.ctx.strokeStyle = orig_colour;
  }

  with_colour(colour, callback){
    this.with_fill_colour(colour, function(){
      this.with_stroke_colour(colour, callback);
    }.bind(this));
  }

  unset_active(){
    this.is_active = false;
    this.clear();
    this.draw();
  }

  set_active(){
    this.is_active = true;
    this.clear();
    this.draw();
  }

  toggle_handlers(on) {
    const method = on ? this.orig_canvas.addEventListener.bind(this.orig_canvas) :
      this.orig_canvas.removeEventListener.bind(this.orig_canvas);

    // Handling touch events
    method.call(this.orig_canvas, 'touchstart', this.touchstart, false);
    method.call(this.orig_canvas, 'touchmove', this.touchmove);
    method.call(this.orig_canvas, 'touchend', this.mouseup);

    // Handling mouse events
    method.call(this.orig_canvas, 'mousedown', this.mousedown, false);
    method.call(this.orig_canvas, 'mousemove', this.mousemove);

    method.call(this.orig_canvas, 'mouseup', this.mouseup);
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

  _mouseup(event) {
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

  _mousedown(event) {
    event.preventDefault();
    this.p.x = event.pageX;
    this.p.y = event.pageY;
    this.select(this.p)
    this.dragging = this.is_active;
  }

  _touchstart(event) {
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      const touch = event.targetTouches[0];
      this.p.x = touch.pageX;
      this.p.y = touch.pageY;
      this.select(this.p);
      this.dragging = this.is_active;
    }
  }

  _touchmove(event) {
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      const touch = event.targetTouches[0];
      this.p.x = touch.pageX;
      this.p.y = touch.pageY;
      if(!this.dragging){
        return;
      }
      this.move(this.p);
    }
  }

  _mousemove(event) {
    event.preventDefault();
    this.p.x = event.pageX;
    this.p.y = event.pageY;
    if(!this.dragging){
      return;
    }
    this.move(this.p);
  }
}

class ResizeHandle extends DraggableRectangle {
  constructor({x, y, size=6, rect, clamp_x, clamp_y, drag_direction=1}={}) {
    super({
      x: x,
      y: y,
      width: size,
      height: size,
      canvas: rect.orig_canvas
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
    // Work out new dimensions of rect based on movement of drag handle
    this.rect.x = this.rect.x+0.5*(this.x-x_orig);
    this.rect.y = this.rect.y+0.5*(this.y-y_orig);
    this.rect.width = this.rect.width+this.drag_direction*(this.x-x_orig);
    this.rect.height = this.rect.height+this.drag_direction*(this.y-y_orig);
    this.rect.clear();
    this.rect.draw();
  }

  move_end(point){
    this.rect.draw_resize_handles();
  }
}

class ResizableDraggableRectangle extends DraggableRectangle {
  constructor({x, y, width, height, canvas, handle_size=6, handle_margin=7}={}) {
    super({x: x, y: y, width: width, height: height, canvas: canvas});
    this.resize_handles = [];
    this.handle_size = handle_size;
    this.handle_margin = handle_margin;
  }

  draw_resize_handles(){
    const that = this;
    this.destroy_resize_handles();
    this.resize_handles = [
      [this.x, this.y-this.height/2-this.handle_margin, function(x){ return that.x; }, function(y){ return Math.min(y, that.y); }, -1],
      [this.x, this.y+this.height/2+this.handle_margin, function(x){ return that.x; }, function(y){ return Math.max(y, that.y); }, +1],
      [this.x-this.width/2-this.handle_margin, this.y, function(x){ return Math.min(x, that.x); }, function(y){ return that.y; }, -1],
      [this.x+this.width/2+this.handle_margin, this.y, function(x){ return Math.max(x, that.x); }, function(y){ return that.y; }, +1]
    ].map(function(args){
      return new ResizeHandle({
        x: args[0],
        y: args[1],
        clamp_x: args[2],
        clamp_y: args[3],
        drag_direction: args[4],
        rect: that,
        size: that.handle_size
      });
    });
  }

  clear(){
    if(this.dragging){
      this.clear_resize_handles();
    }
    super.clear();
  }

  destroy(){
    this.destroy_resize_handles();
    super.destroy();
  }

  destroy_resize_handles(){
    this.resize_handles.forEach(function(resize_handle){
      resize_handle.destroy();
    });
    this.resize_handles = [];
  }

  clear_resize_handles(){
    this.resize_handles.forEach(function(resize_handle){
      resize_handle.clear();
      resize_handle.toggle_handlers(false);
    });
  }

  set_active(){
    this.dispatch_event();
    this.is_active = true;
    this.clear();
    this.draw();
    this.draw_resize_handles();
  }

  dispatch_event(){
    const active_event = new CustomEvent('active', { detail: this });
    this.orig_canvas.dispatchEvent(active_event);
  }

  move_end(point){
    this.draw_resize_handles();
  }
}
