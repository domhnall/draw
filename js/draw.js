const DRAW = (function(d){

  // Point class to represent (x,y) and convert to canvas coordinates
  window.Point = class Point {
    constructor(x, y, canvas) {
      this.x = x;
      this.y = y;
      this.canvas = canvas;
      this.css_width = window.getComputedStyle(DRAW.canvas, null)
        .getPropertyValue("width")
        .replace(/px$/, '');
      this.css_height = window.getComputedStyle(DRAW.canvas, null)
        .getPropertyValue("height")
        .replace(/px$/, '');
    }

    get canvas_x(){
      return (this.x - this.canvas.offsetLeft)*this.canvas.width/this.css_width;
    }

    get canvas_y(){
      return (this.y - this.canvas.offsetTop)*this.canvas.height/this.css_height;
    }
  };

  // Utilities
  window.throttle = function(func, wait = 50) {
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



  // Set up shared state and handler functions for canvas drawing events
  // Shared state
  let p = null,
    drawing = false;

  // Handler functions
  const line_to = function(point){
    d.ctx.lineTo(point.canvas_x, point.canvas_y);
    d.ctx.stroke();
  };

  const move_to = function(point){
    d.ctx.moveTo(point.canvas_x, point.canvas_y);
    d.ctx.beginPath();
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
    const method = on ? d.canvas.addEventListener : d.canvas.removeEventListener;

    // Handling touch events
    method('touchstart', touchstart, false);
    method('touchmove', touchmove, false);

    // Handling mouse events
    method('mousedown', mousedown, false);
    method('mousemove', mousemove, false);
    method('mouseup', mouseup);
  };

  const init_style_button_handlers = function(){
    const $line_width_btn = document.getElementById("line_width"),
      $line_colour_btn = document.getElementById("line_colour"),
      $reset_btn = document.getElementById("reset");

    $line_width_btn.addEventListener("change", function(e){
      d.ctx.lineWidth = e.target.value;
    });
    $line_colour_btn.addEventListener("change", function(e){
      d.ctx.strokeStyle = e.target.value;
    });
    $reset_btn.addEventListener("click", function(e){
      if(confirm("This will completely clear your work on the canvas. You cannot undo. Are you sure?")){
        d.ctx.clearRect(0, 0, d.canvas.width, d.canvas.height);
        if(d.img_input){
          d.img_input.value = null;
        }
      }
    });
  };

  const init_draw_tool = function(){
    const $draw_tool_btn = document.getElementById("draw_tool_btn");

    $draw_tool_btn.addEventListener("click", function(e){
      const $target = e.target,
        active = (e.target.dataset.active==="true");

      $target.dataset.active = !active;
      toggle_drawing_handlers(!active);
    });
  }

  d.canvas = null;
  d.ctx = null;

  d.init = function(canvas_id){
    // Initialize canvas size
    d.canvas = document.getElementById(canvas_id);
    d.canvas.width = window.getComputedStyle(d.canvas, null)
      .getPropertyValue("width")
      .replace(/px$/, '');
    d.canvas.height = window.getComputedStyle(d.canvas, null)
      .getPropertyValue("height")
      .replace(/px$/, '');
    d.ctx = this.canvas.getContext('2d');

    // Initialize touch point state
    p = new Point(0,0,d.canvas)

    init_draw_tool();
    init_style_button_handlers();
    if(typeof window.ERASER !== "undefined"){
      window.ERASER.init(d.ctx);
    }
  };

  return d;
})({});

document.addEventListener("DOMContentLoaded", function(){
  DRAW.init("draw_panel");
  IMAGE.init(DRAW.ctx);
});
