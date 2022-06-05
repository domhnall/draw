window.SHAPE =(function(s){

  let ctx = null,
    canvas = null,
    p = null,
    dragging = false,
    all_rectangles = [],
    shifted = false;

  const drop_rect = function(point){
    let rect = new ResizableDraggableRectangle({
      x: point.canvas_x,
      y: point.canvas_y,
      canvas: canvas })
    all_rectangles.push(rect.draw());
  };

  const resize_rect = function(event){
    console.log("Resizing");
  };

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

  const toggle_shape_handlers = function(on) {
    const method = on ? canvas.addEventListener : canvas.removeEventListener;
    method('mouseup', shape_mouseup);
  };

  const toggle_selector_handlers = function(on){
    all_rectangles.forEach(function(rect){
      rect.toggle_handlers(on);
    });
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
        all_rectangles.forEach(function(rect){
          if(rect.is_active){
            rect.destroy();
          }
        });
      }
    });
  }

  return s;
})({});
