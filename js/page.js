window.PAGE = (function(page){
  page.canvas = null,
  page.ctx = null;

  page.toggle_context_menu = function($btn, active){
    const targetId = $btn.dataset.target,
      $reveal_target = document.getElementById(targetId),
      $context_menu = document.getElementById("context-menu");

    $context_menu.querySelectorAll(".control_option").forEach(function($menu){
      $menu.style.display = "none";
    });
    if(active){
      $reveal_target.style.display = "flex";
    }else{
      $reveal_target.style.display = "none";
    }
    $reveal_target.addEventListener("click", function(e){
      e.stopPropagation();
    });
  };

  const init_global_button_handlers = function(){
    ["touchstart", "click"].forEach(function(event_type){
      document.getElementById("reset").addEventListener(event_type, function(e){
        if(confirm("This will completely clear your work on the canvas. You cannot undo. Are you sure?")){
          page.ctx.clearRect(0, 0, page.canvas.width, page.canvas.height);
          document.querySelectorAll("canvas").forEach(function($canvas){
            if($canvas.getAttribute("id")!==page.canvas.getAttribute("id")){
              $canvas.parentNode.removeChild($canvas);
            }
          });
          page.canvas.dispatchEvent(new CustomEvent('clear'));
        }
      });

      // Click/tap anywhere outstide of canvas should deactivate currently active tool
      document.getElementById("tool_wrapper").addEventListener(event_type, function(event){
        const $target = event.target;

        if($target.classList.contains("menu-toggle")) {
          const $checkbox = document.querySelector("#tool_wrapper input.menu-checkbox");
          $checkbox.checked = !$checkbox.checked;
          event.preventDefault();
          return;
        }

        if( page.canvas.parentNode.contains($target) ||
          $target.nodeName.toLowerCase()==="select" ) {
          return;
        }
        // Disable active buttons
        document.querySelectorAll("#control_panel .tool-btn[data-active=\"true\"]").forEach(function($btn){
          if($btn!==$target){
            $btn.click();
          }
        });
      });
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
    if(typeof window.TEXT !== "undefined"){
      window.TEXT.init(page.ctx);
    }
  };

  return page;
})({});

// Point class to represent (x,y) and convert to canvas coordinates
window.Point = class Point {
  constructor({ x, y, canvas, canvas_x, canvas_y }) {
    this.canvas = canvas;
    this._x = x;
    this._y = y;
    this._canvas_x = canvas_x
    this._canvas_y = canvas_y;
    this.css_width = window.getComputedStyle(canvas, null)
      .getPropertyValue("width")
      .replace(/px$/, '');
    this.css_height = window.getComputedStyle(canvas, null)
      .getPropertyValue("height")
      .replace(/px$/, '');
  }

  get canvas_position() {
    const $offset_parent = this.canvas.offsetParent;
    return this._canvas_position ||= {
      left: $offset_parent ? $offset_parent.offsetLeft : 30,
      top: $offset_parent ? $offset_parent.offsetTop : 8
    };
  }

  set x(x) {
    this._x = x;
  }

  set y(y) {
    this._y = y;
  }

  get x(){
    return this._x ||
      (this._canvas_x*(this.css_width/this.canvas.width) + this.canvas_position.left);
  }

  get y() {
    return this._y ||
      (this._canvas_y*(this.css_height/this.canvas.height) + this.canvas_position.top);
  }

  get canvas_x(){
    return this._canvas_x ||
      (this._x - this.canvas_position.left)*this.canvas.width/this.css_width;
  }

  get canvas_y(){
    return this._canvas_y ||
      (this._y - this.canvas_position.top)*this.canvas.height/this.css_height;
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
