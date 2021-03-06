window.SHAPE =(function(s){

  let ctx = null,
    canvas = null,
    p = null,
    all_rectangles = [],
    handle_margin_px = 7,
    handle_size_px = 6,
    line_width = null,
    line_colour = null;

  const drop_rect = function(point){
    let rect = new ResizableDraggableRectangle({
      x: point.canvas_x,
      y: point.canvas_y,
      canvas: canvas,
      handle_margin: handle_margin_px,
      handle_size: handle_size_px,
      line_width: line_width,
      line_colour: line_colour });
    all_rectangles.push(rect.draw());
    document.getElementById("selector_tool_btn").click();
    rect.set_active();
  };

  const shape_mouseup = function(event){
    event.preventDefault();
    p.x = event.pageX;
    p.y = event.pageY;
    drop_rect(p)
  };

  const toggle_shape_handlers = function(on) {
    const method = on ? canvas.addEventListener : canvas.removeEventListener;
    method.call(canvas, 'mouseup', shape_mouseup);
  };

  const toggle_selector_handlers = function(on){
    all_rectangles.forEach(function(rect){
      rect.toggle_handlers(on);
      if(!on) {
        rect.unset_active();
        if(rect["clear_resize_handles"]){
          rect.clear_resize_handles();
        }
      }
    });
  };

  const init_style_button_handlers = function(){
    const $line_width_btn = document.getElementById("rect_line_width"),
      $line_colour_btn = document.getElementById("rect_line_colour");

    $line_width_btn.addEventListener("change", function(e){
      line_width = e.target.value;
      all_rectangles.forEach(function(rect){
        if(rect.is_active){
          rect.ctx.lineWidth = line_width;
          rect.draw();
        }
      });
    });
    $line_colour_btn.addEventListener("change", function(e){
      line_colour = e.target.value;
      all_rectangles.forEach(function(rect){
        if(rect.is_active){
          rect.ctx.strokeStyle = line_colour;
          rect.draw();
        }
      });
    });
  };

  s.add_rectangle = function(rect){
    all_rectangles.push(rect);
  };

  s.init = function(context){
    ctx = context;
    canvas = context.canvas;

    // Initialize touch point state
    p = new Point({ x: 0, y: 0, canvas: canvas })

    document.getElementById("rect_tool_btn").addEventListener("click", throttle(function(e){
      const $target = e.target.closest(".tool-btn"),
        active = ($target.dataset.active==="true");
      $target.dataset.active = !active;
      toggle_shape_handlers(!active);
      PAGE.toggle_context_menu($target, !active);
    }, 50));
    document.getElementById("selector_tool_btn").addEventListener("click", throttle(function(e){
      const $target = e.target.closest(".tool-btn"),
        active = ($target.dataset.active==="true");
      $target.dataset.active = !active;
      toggle_selector_handlers(!active);
    }, 50));
    document.addEventListener("keyup", function(event){
      if(event.keyCode===8 || event.keyCode===46){
        for(const [i,rect] of all_rectangles.entries()){
          if(rect.is_active){
            rect.destroy();
            all_rectangles.splice(i,1);
          }
        }
      }
    });

    document.addEventListener('touchstart', function on_first_touch() {
      handle_margin_px = 14;
      handle_size_px = 10;
      document.removeEventListener('touchstart', on_first_touch, false);
    }, false);

    init_style_button_handlers();

    // Switching between active rectangles
    canvas.addEventListener('active', function(event){
      const active_rect = event.detail;
      all_rectangles.forEach(function(rect){
        if(rect!==active_rect && rect.resize_handles){
          rect.destroy_resize_handles();
        }
      });
    });
  }

  return s;
})({});
