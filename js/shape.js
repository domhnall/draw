window.SHAPE =(function(s){
  class Rectangle {
    constructor(x, y, width, height, canvas) {
      this.x = x;
      this.y = y;
      this.width = width || this.default_width;
      this.height = height || this.default_height;
      this.orig_canvas = canvas;
      this.point = window.Point
      this.canvas = null;
      this.ctx = null;
    }

    get default_height(){
      return 30;
    }

    get default_width(){
      return 1.681*(this.height || this.default_height);
    }

    draw() {
      const self = this;
      if(!this.canvas){
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.orig_canvas.width;
        this.canvas.height = this.orig_canvas.height;
        this.ctx = this.canvas.getContext("2d");
        this.orig_canvas.parentNode.insertBefore(this.canvas, this.orig_canvas.nextSibling);
      }

      // Draw rect with default size
      this.ctx.strokeRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height)
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
      this.ctx.clearRect(
        this.x-(1+this.width/2),
        this.y-(1+this.height/2),
        this.width+2,
        this.height+2
      );
    }

    redraw(width = null, height = null) {
      this.ctx.strokeRect(
        this.x-this.width/2,
        this.y-this.height/2,
        width || this.width,
        height || this.height
      );
    }

    unset_active(){
      this.clear();
      this.redraw();
    }

    set_active(){
      this.clear();
      var orig_colour = this.ctx.strokeStyle
      this.ctx.strokeStyle = "red"
      this.redraw();
      //this.draw_drag_handles();
      this.ctx.strokeStyle = orig_colour;
    }

    draw_drag_handles(){
      const handle_size = 4,
        context = this.ctx;
      [
        [this.x, this.y-this.height/2-5],
        [this.x, this.y+this.height/2+5],
        [this.x-this.width/2-5, this.y],
        [this.x+this.width/2+5, this.y]
      ].forEach(function(coords){
        context.fillRect(coords[0]-handle_size/2, coords[1]-handle_size/2, handle_size, handle_size)
      })
    }

  }


  let ctx = null,
    canvas = null,
    p = null,
    dragging = false,
    all_rectangles = [],
    active_rect = null,
    shifted = false;

  // Utilities 
  const set_active_rect = function(rect){
    active_rect && active_rect.unset_active()
    active_rect = rect
    active_rect.set_active()
  };

  // Handler functions
  const select_rect = function(point){
    if(active_rect){
      active_rect.unset_active();
      //active_rect = null;
    }
    active_rect = all_rectangles.find(function(rect){
      return rect.hit(point);
    });
    if(active_rect){
      active_rect.set_active();
    }
  };

  const drop_rect = function(point){
    let rect = new Rectangle(point.canvas_x, point.canvas_y, null, null, canvas)
    all_rectangles.push(rect.draw());
    set_active_rect(rect);
  };

  const resize_rect = function(event){
    console.log("Resizing");
  };

  const move_rect = function(point){
    active_rect.clear();
    active_rect.x = point.canvas_x;
    active_rect.y = point.canvas_y;
    active_rect.draw();
  }

  const shape_mouseup = function(event){
    event.preventDefault();
    p.x = event.pageX;
    p.y = event.pageY;
    if(dragging){
      resize_rect(event);
      dragging = false;
    }else{
      drop_rect(p)
    }
  };

  const selector_mouseup = function(event){
    event.preventDefault();
    p.x = event.pageX;
    p.y = event.pageY;
    if(dragging){
      dragging = false;
      //active_rect.unset_active();
    }else{
      select_rect(p)
    }
  };

  const mousedown = function(event){
    event.preventDefault();
    p.x = event.pageX;
    p.y = event.pageY;
    dragging = true;
    select_rect(p)
  };

  const touchstart = function(event){
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      dragging = true;
      const touch = event.targetTouches[0];
      p.x = touch.pageX;
      p.y = touch.pageY;
      select_rect(p);
    }
  };

  const touchmove = throttle(function(event){
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      const touch = event.targetTouches[0];
      if(!dragging){
        return;
      }
      p.x = touch.pageX;
      p.y = touch.pageY;
      move_rect(p);
    }
  }, 50);

  const mousemove = throttle(function(event){
    event.preventDefault();
    if(!dragging){
      return;
    }
    p.x = event.pageX;
    p.y = event.pageY;
    move_rect(p);
  }, 50);

  const toggle_shape_handlers = function(on) {
    const method = on ? canvas.addEventListener : canvas.removeEventListener;
    method('mouseup', shape_mouseup);
  };

  const toggle_selector_handlers = function(on){
    const method = on ? canvas.addEventListener : canvas.removeEventListener;
    // Handling touch events
    method('touchstart', touchstart, false);
    method('touchmove', touchmove, false);

    // Handling mouse events
    method('mousedown', mousedown, false);
    method('mousemove', mousemove, false);
    method('mouseup', selector_mouseup);
  };

  s.init = function(context){
    ctx = context;
    canvas = context.canvas;

    // Initialize touch point state
    p = new Point(0, 0, canvas)

    document.getElementById("rect_tool_btn").addEventListener("click", function(e){
      const $target = e.target,
        active = (e.target.dataset.active==="true");

      document.querySelectorAll("#control_panel .tool-btn[data-active=\"true\"]").forEach(function($btn){
        if($btn!==$target){
          $btn.click();
        }
      });
      $target.dataset.active = !active;
      toggle_shape_handlers(!active);
    });
    document.getElementById("selector_tool_btn").addEventListener("click", function(e){
      const $target = e.target,
        active = (e.target.dataset.active==="true");

      document.querySelectorAll("#control_panel .tool-btn[data-active=\"true\"]").forEach(function($btn){
        if($btn!==$target){
          $btn.click();
        }
      });
      $target.dataset.active = !active;
      toggle_selector_handlers(!active);
    });
    document.addEventListener("keyup", function(event){
      if(event.keyCode===8 || event.keyCode===46){
        active_rect && active_rect.destroy();
      }
    });
  }

  return s;
})({});
