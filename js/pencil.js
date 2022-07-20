window.PENCIL = (function(pencil){

  let ctx = null,
    canvas = null,
    p = null,
    drawing = false;

  // Handler functions
  const line_to = function(point){
    ctx.lineTo(point.canvas_x, point.canvas_y);
    ctx.stroke();
  };

  const move_to = function(point){
    ctx.moveTo(point.canvas_x, point.canvas_y);
    ctx.beginPath();
  };

  const touchstart = function(event){
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      drawing = true;
      const touch = event.targetTouches[0];
      p.x = touch.pageX;
      p.y = touch.pageY;
      move_to(p);
    }
  };

  const touchmove = throttle(function(event){
    event.preventDefault();
    if (event.targetTouches.length == 1) {
      const touch = event.targetTouches[0];
      if(!drawing){
        return;
      }
      p.x = touch.pageX;
      p.y = touch.pageY;
      line_to(p);
    }
  }, 50);

  const mousedown = function(event){
    event.preventDefault();
    drawing = true;
    p.x = event.pageX;
    p.y = event.pageY;
    move_to(p);
  };

  const mousemove = throttle(function(event){
    event.preventDefault();
    if(!drawing){
      return;
    }
    p.x = event.pageX;
    p.y = event.pageY;
    line_to(p);
  }, 50);

  const mouseup = function(event){
    event.preventDefault();
    drawing = false;
  };

  const toggle_drawing_handlers = function(on) {
    const method = on ? canvas.addEventListener.bind(canvas) : canvas.removeEventListener.bind(canvas);

    // Handling touch events
    method('touchstart', touchstart, false);
    method('touchmove', touchmove, false);
    method('touchend', mouseup);

    // Handling mouse events
    method('mousedown', mousedown, false);
    method('mousemove', mousemove, false);
    method('mouseup', mouseup);
  };

  pencil.init = function(context){
    ctx = context
    canvas = context.canvas

    // Initialize touch point state
    p = new Point({x: 0, y: 0, canvas: canvas})

    document.getElementById("draw_tool_btn").addEventListener("click", function(e){
      const $target = e.target,
        active = (e.target.dataset.active==="true");
      $target.dataset.active = !active;
      toggle_drawing_handlers(!active);
    });
  };

  return pencil;
})({});
