const IMAGE = (function(i){
  let canvas = null,
    ctx = null,
    img_input = null,
    print_button = null;

  i.init = function(ctx){
    ctx = ctx;
    canvas = ctx.canvas;
    i.init_file_upload_handlers();
    i.init_print_button();
  };

  i.init_print_button = function(){
    print_button = document.getElementById("print");
    print_button.addEventListener("click", function(e){
      const win=window.open();
      win.document.write("<br><img src='" + canvas.toDataURL("image/jpeg", 0.75) +"'/>");
      win.print();
      win.location.reload();
    });
  };

  const draw_image_to_canvas = function(image, context){
    const canvas = context.canvas,
      horizontal_ratio = canvas.width/image.width,
      vertical_ratio = canvas.height/image.height,
      ratio = Math.min(horizontal_ratio, vertical_ratio),
      horizontal_offset = ( canvas.width - image.width*ratio ) / 2,
      vertical_offset = ( canvas.height - image.height*ratio ) / 2;

    context.drawImage(image, 0, 0, image.width, image.height,
      horizontal_offset, vertical_offset, image.width*ratio, image.height*ratio);
  };

  i.init_file_upload_handlers = function(){
    img_input = document.getElementById("image_upload");
    img_input.addEventListener('change', function(e) {
      if(e.target.files) {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onloadend = function (e) {
          const my_image = new Image();
          my_image.src = e.target.result;
          my_image.onload = function() {
            const orig_composite_op = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = 'destination-over';
            ctx.beginPath();
            draw_image_to_canvas(my_image, ctx);
            ctx.globalCompositeOperation = orig_composite_op;
          }
        }
      }
    });
  };

  return i;
})({});
