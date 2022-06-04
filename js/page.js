window.PAGE = (function(page){
  page.canvas = null,
  page.ctx = null;

  const init_global_button_handlers = function(){
    const $line_width_btn = document.getElementById("line_width"),
      $line_colour_btn = document.getElementById("line_colour"),
      $reset_btn = document.getElementById("reset");

    $line_width_btn.addEventListener("change", function(e){
      page.ctx.lineWidth = e.target.value;
    });
    $line_colour_btn.addEventListener("change", function(e){
      page.ctx.strokeStyle = e.target.value;
    });
    $reset_btn.addEventListener("click", function(e){
      if(confirm("This will completely clear your work on the canvas. You cannot undo. Are you sure?")){
        page.ctx.clearRect(0, 0, page.canvas.width, page.canvas.height);
        //if(d.img_input){
        //  d.img_input.value = null;
        //}
      }
    });
  };


  page.init = function(canvas_id){
    // Initialize canvas size
    page.canvas = document.getElementById(canvas_id);
    page.canvas.width = window.getComputedStyle(page.canvas, null)
      .getPropertyValue("width")
      .replace(/px$/, '');
    page.canvas.height = window.getComputedStyle(page.canvas, null)
      .getPropertyValue("height")
      .replace(/px$/, '');
    page.ctx = this.canvas.getContext('2d');

    init_global_button_handlers();
    if(typeof window.PENCIL !== "undefined"){
      window.PENCIL.init(page.ctx);
    }
    if(typeof window.IMAGE !== "undefined"){
      window.IMAGE.init(page.ctx);
    }
    if(typeof window.ERASER !== "undefined"){
      window.ERASER.init(page.ctx);
    }
    if(typeof window.SHAPE !== "undefined"){
      window.SHAPE.init(page.ctx);
    }
    if(typeof window.SELECTOR !== "undefined"){
      window.SELECTOR.init(page.ctx);
    }
  };

  return page;
})({});

// Point class to represent (x,y) and convert to canvas coordinates
window.Point = class Point {
  constructor(x, y, canvas) {
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.css_width = window.getComputedStyle(PAGE.canvas, null)
      .getPropertyValue("width")
      .replace(/px$/, '');
    this.css_height = window.getComputedStyle(PAGE.canvas, null)
      .getPropertyValue("height")
      .replace(/px$/, '');
  }

  get canvas_position() {
    const client_rect = this.canvas.getBoundingClientRect();
    return {
      left: this.canvas.offsetParent.offsetLeft,
      top: this.canvas.offsetParent.offsetTop
    };
  }

  get canvas_x(){
    return (this.x - this.canvas_position.left)*this.canvas.width/this.css_width;
  }

  get canvas_y(){
    return (this.y - this.canvas_position.top)*this.canvas.height/this.css_height;
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

document.addEventListener("DOMContentLoaded", function(){
  PAGE.init("draw_panel");
});
