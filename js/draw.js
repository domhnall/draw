const CANVAS = (function(c){
  const throttle = function(func, wait = 100) {
    let timer = null;
    return function(...args) {
      if (timer === null) {
        timer = setTimeout(() => {
          func.apply(this, args);
          timer = null;
        }, wait);
      }
    };
  };

  c.canvas = null;
  c.ctx = null;

  c.init = function(){
    let x = null,
        y = null,
        clicking = false;

    c.canvas = document.getElementById("draw_panel");
    c.ctx = this.canvas.getContext('2d');
    c.offset_x = c.canvas.offsetTop;
    c.offset_y = c.canvas.offsetLeft;


    // Handling touch events
    c.canvas.addEventListener('touchstart', function(event){
      event.preventDefault();
      if (event.targetTouches.length == 1) {
        const touch = event.targetTouches[0];
        x = touch.pageX;
        y = touch.pageY;
        c.ctx.moveTo(x,y);
      }
    }, false);

    c.canvas.addEventListener('touchmove', throttle(function(event){
      event.preventDefault();
      if (event.targetTouches.length == 1) {
        const touch = event.targetTouches[0];
        c.ctx.lineTo(touch.pageX,touch.pageY);
        c.ctx.stroke();
        x = touch.pageX;
        y = touch.pageY;
      }
    }, 50), false);

    // Handling mouse events
    c.canvas.addEventListener('mousedown', function(event){
      event.preventDefault();
      clicking = true;
      x = event.pageX;
      y = event.pageY;
      c.ctx.moveTo(x,y);
    }, false);

    c.canvas.addEventListener('mousemove', throttle(function(event){
      event.preventDefault();
      if(!clicking){
        return;
      }
      c.ctx.lineTo(event.pageX, event.pageY);
      c.ctx.stroke();
      x = event.pageX;
      y = event.pageY;
    }, 50), false);

    c.canvas.addEventListener('mouseup', function(event){
      event.preventDefault();
      clicking = false;
    });
  };

  return c;
})({});

CANVAS.init();
