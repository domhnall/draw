window.ERASER =(function(e){
  const eraser_width = 10;
  let ctx = null,
    canvas = null,
    p = null,
    erasing = false;

  // Handler functions
  const clear_at = function(point){
    ctx.clearRect(point.canvas_x-eraser_width,
      point.canvas_y-eraser_width,
      2*eraser_width,
      2*eraser_width);
  };

  const move_to = function(point){
    ctx.moveTo(point.canvas_x, point.canvas_y);
    ctx.beginPath();
  };

  const touchstart = function(event){
    event.preventDefault();
    if (event.targetTouches.length == 1) {
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
      p.x = touch.pageX;
      p.y = touch.pageY;
      clear_at(p);
    }
  }, 50);

  const mousedown = function(event){
    event.preventDefault();
    erasing = true;
    p.x = event.pageX;
    p.y = event.pageY;
    move_to(p);
  };

  const mousemove = throttle(function(event){
    event.preventDefault();
    if(!erasing){
      return;
    }
    p.x = event.pageX;
    p.y = event.pageY;
    clear_at(p);
  }, 50);

  const mouseup = function(event){
    event.preventDefault();
    erasing = false;
  };

  const toggle_erasing_handlers = function(on) {
    const method = on ? canvas.addEventListener.bind(canvas) : canvas.removeEventListener.bind(canvas);

    // Handling touch events
    method('touchstart', touchstart, false);
    method('touchmove', touchmove, false);

    // Handling mouse events
    method('mousedown', mousedown, false);
    method('mousemove', mousemove, false);
    method('mouseup', mouseup);
  };

  e.init = function(context){
    ctx = context;
    canvas = context.canvas;

    // Initialize touch point state
    p = new Point(0, 0, canvas)

    document.getElementById("erase_tool_btn").addEventListener("click", throttle(function(e){
      const $target = e.target.closest(".tool-btn"),
        active = ($target.dataset.active==="true");
      $target.dataset.active = !active;
      toggle_erasing_handlers(!active);
    }, 50));
  }

  return e;
})({});
