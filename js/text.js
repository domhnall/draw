window.TEXT =(function(text){

  let ctx = null,
    canvas = null,
    p = null,
    all_texts = [],
    font_colour = "black",
    font_size = 16,
    background_colour = "white";

  const mouseup = function(event){
    event.preventDefault();
    p.x = event.pageX;
    p.y = event.pageY;
    for(let i=0, len=all_texts.length; i<len; i++){
      if(all_texts[i].hit(p)){
        all_texts[i].set_focus();
        return;
      }
    }
    all_texts.push(new TextBox({
      x: p.canvas_x,
      y: p.canvas_y,
      canvas: canvas,
      font_colour: font_colour,
      font_size: font_size,
      background_colour: background_colour
    }));
  };

  const toggle_text_handlers = function(on) {
    const method = on ? canvas.addEventListener : canvas.removeEventListener;
    method.call(canvas, 'mouseup', mouseup);
    method.call(canvas, 'touchend', mouseup);
  };

  const init_text_style_handlers = function(){
    const $font_size_select = document.getElementById("font_size"),
      $font_colour_select = document.getElementById("font_colour"),
      $background_colour_select = document.getElementById("background_colour");

    $font_size_select.addEventListener("change", function(e){
      font_size = parseInt(e.target.value, 10);
      all_texts.forEach(function(text){
        if(text.is_active){
          text.font_size = font_size;
          text.draw();
        }
      });
    });
    $font_colour_select.addEventListener("change", function(e){
      font_colour = e.target.value;
      all_texts.forEach(function(text){
        if(text.is_active){
          text.font_colour = font_colour;
          text.draw();
        }
      });
    });
    $background_colour_select.addEventListener("change", function(e){
      background_colour = e.target.value;
      all_texts.forEach(function(text){
        if(text.is_active){
          text.background_colour = background_colour;
          text.draw();
        }
      });
    });
  };

  text.init = function(context){
    ctx = context;
    canvas = context.canvas;

    // Initialize touch point state
    p = new Point({ x: 0, y: 0, canvas: canvas })

    document.getElementById("text_tool_btn").addEventListener("click", throttle(function(e){
      const $target = e.target.closest(".tool-btn"),
        active = ($target.dataset.active==="true");
      $target.dataset.active = !active;
      toggle_text_handlers(!active);
      PAGE.toggle_context_menu($target, !active);
    }, 50));
    init_text_style_handlers();
  }

  return text;
})({});
