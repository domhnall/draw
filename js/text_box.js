class CanvasScaler {
  constructor(canvas){
    this.canvas = canvas;
    this.css_width = window.getComputedStyle(canvas, null)
      .getPropertyValue("width")
      .replace(/px$/, '');
    this.css_height = window.getComputedStyle(canvas, null)
      .getPropertyValue("height")
      .replace(/px$/, '');
  }

  scale_to_canvas_horizontal(length){
    return length*this.canvas.width/this.css_width;
  }

  scale_to_canvas_vertical(length){
    return length*this.canvas.height/this.css_height;
  }

  scale_from_canvas_horizontal(length){
    return length*this.css_width/this.canvas.width;
  }

  scale_from_canvas_vertical(length){
    return length*this.css_height/this.canvas.height;
  }
};

window.debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

//class TextBox extends ResizableDraggableRectangle {
class TextBox extends DraggableRectangle {
  constructor({x, y, width, height, canvas, font_colour, font_size, background_colour}={}) {
    super({x: x, y: y, width: width, height: height, canvas: canvas});
    this.font_colour = font_colour;
    this.font_size = font_size;
    this.background_colour = background_colour;
    this.scaler = new CanvasScaler(canvas);
    this.text_box = null;
    this.text = "";
    SHAPE.add_rectangle(this.draw());
    this.text_box = this._add_textbox();
    this.input = this.text_box.querySelector("[contenteditable]");
    this.padding = 0.25*Number(window.getComputedStyle(document.body).getPropertyValue('font-size').match(/\d+/)[0]);
  }

  get default_height(){
    return 50;
  }

  draw(opts={}){
    this._init_canvas();
    const orig_colour = this.ctx.fillStyle;
    this.clear();
    this.ctx.fillStyle = this.background_colour;
    super.draw({fill: this.background_colour!=="transparent"});
    this.ctx.fillStyle = orig_colour;
    this._draw_text();
    return this;
  }

  set_focus(){
    this.text_box.style.top = this.top_left().y+"px";
    this.text_box.style.left = this.top_left().x+"px";

    this.text_box.style.display = "inline-block";
    this.text_box.querySelector("[contenteditable]").focus();
  }

  _add_textbox(set_focus=true){
    // Add an absolutely positioned text input
    const $wrapper = document.createElement("div"),
      $input = document.createElement("span"),
      $close_btn = document.createElement("span");
    $close_btn.classList.add("destroy");
    $close_btn.innerText = "X";

    $wrapper.classList.add("text-wrapper");
    $wrapper.style.position = "absolute";
    $wrapper.style.top = this.top_left().y+"px";
    $wrapper.style.left = this.top_left().x+"px";

    $input.setAttribute("contenteditable", true);
    $input.style.position = "absolute";
    $input.style.top = "0px";
    $input.style.left = "0px";
    $input.style.width = "auto";
    $input.style.height = this.scaler.scale_from_canvas_vertical(this.height)+"px";
    $input.style.minWidth = this.scaler.scale_from_canvas_horizontal(this.width)+"px";
    $input.role = "textbox";
    $input.style.color = this.font_colour;
    $input.style.fontSize = this.font_size + "px";
    $input.style.backgroundColor = this.background_colour;

    $wrapper.appendChild($close_btn);
    $wrapper.appendChild($input);
    document.body.appendChild($wrapper);
    if(set_focus){
      $input.focus();
    }
    $input.addEventListener("input", debounce(this._draw_text.bind(this), 1000), false);
    $input.addEventListener("input", this._resize_box.bind(this), false);
    $close_btn.addEventListener("click", this.destroy.bind(this), false);
    return $wrapper;
  }

  _resize_box(event){
    const old_width = this.width,
      old_height = this.height;

    this.width = this.scaler.scale_to_canvas_horizontal(this.input.clientWidth);
    this.height = this.scaler.scale_to_canvas_vertical(this.input.clientHeight);
    this.x = this.x + (this.width-old_width)/2;
    this.y = this.y + (this.height-old_height)/2;
    if(event.inputType==="insertText" && event.data===null){
      this._draw_text(event);
    }
  }

  _draw_text(){
    if(!this.text_box){
      return;
    }
    const point = new Point({
        x: this.top_left().x + this.padding,
        y: this.top_left().y + this.font_size + this.padding,
        canvas: this.canvas
      });
    this.with_fill_colour(this.font_colour, function(){
      this.ctx.fillText(this.input.textContent, point.canvas_x, point.canvas_y);
    }.bind(this));
    this.text_box.style.display = "none";
  }

  destroy() {
    this.text_box.parentNode.removeChild(this.text_box);
    super.destroy();
  }
};
