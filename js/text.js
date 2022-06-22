class TextArea extends ResizableDraggableRectangle {
  constructor({x, y, width, height, canvas, text}={}) {
    super({x: x, y: y, width: width, height: height, canvas: canvas});
    this.text = text;
  }

  draw({width=null, height=null, fill=false}={}) {
    const self = this,
      parent_draw = super.draw.bind(this);
    this.init_canvas();
    this.with_colour("white", function(){
      parent_draw({fill: true});
    }.bind(this));
    this.with_colour("black", function(){
      self.ctx.fillText(self.text, self.x-self.width/2, self.y+self.height/2, self.width);
    }.bind(this));
    return this;
  }
};

window.TEXT =(function(text){

  let ctx = null,
    canvas = null,
    p = null,
    all_texts = [],
    font_colour = "black",
    font_size = "medium",
    background_colour = "white";

  //const build_template = function(point){
  //  return `
  //  <span contenteditable="true"
  //    style="position: absolute;
  //      top: ${point.y}px;
  //      left: ${point.x}px;
  //      color: ${font_colour};
  //      font-size: ${font_size};
  //      background-color: ${background_colour};">
  //    <span class="destroy">X</span>
  //  </span>`;
  //};
  const drop_text = function(point){
    // Add an absolutely positioned text input
    const $input = document.createElement("span"),
      $close_btn = document.createElement("span");
    $close_btn.classList.add("destroy");
    $close_btn.innerText = "X";

    $input.setAttribute("contenteditable", true);
    $input.role = "textbox";
    $input.style.position = "absolute";
    $input.style.top = point.y+"px";
    $input.style.left = point.x+"px";
    $input.style.color = font_colour;
    $input.style.fontSize = font_size;
    $input.style.backgroundColor = background_colour;
    $input.appendChild($close_btn);
    document.body.appendChild($input);
    $input.addEventListener("change", draw_text, false);
    $close_btn.addEventListener("click", destroy_text, false);
  };

  const destroy_text = function(e) {
    const $target = e.target,
      $text = $target.closest("[contenteditable]");
    $text.parentNode.removeChild($text);
  };

  const draw_text = function(event){
    const text = event.target.value;

    ctx.fillText(text, p.canvas_x, p.canvas_y);
  }

  const mouseup = function(event){
    event.preventDefault();
    p.x = event.pageX;
    p.y = event.pageY;
    drop_text(p)
  };

  const toggle_text_handlers = function(on) {
    const method = on ? canvas.addEventListener : canvas.removeEventListener;
    method.call(canvas, 'mouseup', mouseup);
    method.call(canvas, 'touchend', mouseup);
  };

  const toggle_text_control_buttons = function(on) {
    const $text_controls = document.getElementById("text-controls");
    if(on){
      $text_controls.style.display = "flex";
    }else{
      $text_controls.style.display = "none";
    }
    $text_controls.addEventListener("click", function(e){
      e.stopPropagation();
    });
  };

  const init_text_style_handlers = function(){
    const $font_size_select = document.getElementById("font_size"),
      $font_colour_select = document.getElementById("font_colour"),
      $background_colour_select = document.getElementById("background_colour");

    $font_size_select.addEventListener("change", function(e){
      font_size = e.target.value;
    });
    $font_colour_select.addEventListener("change", function(e){
      font_colour = e.target.value;
    });
    $background_colour_select.addEventListener("change", function(e){
      background_colour = e.target.value;
    });
  };

  text.init = function(context){
    ctx = context;
    canvas = context.canvas;

    // Initialize touch point state
    p = new Point(0, 0, canvas)

    document.getElementById("text_tool_btn").addEventListener("click", throttle(function(e){
      const $target = e.target.closest(".tool-btn"),
        active = ($target.dataset.active==="true");
      $target.dataset.active = !active;
      toggle_text_handlers(!active);
      toggle_text_control_buttons(!active);
    }, 50));
    init_text_style_handlers();
  }

  return text;
})({});
