window.IMAGE = (function(i){
  let canvas = null,
    ctx = null,
    img_input = null;

  i.init = function(context){
    ctx = context;
    canvas = ctx.canvas;
    init_file_upload_handlers();
    init_export_button();
  };

  const random = function(){
    return (Math.random() + 1).toString(36).substring(7);
  };


  const set_up_temp_canvas_for_export = function(){
    const $temp_canvas = document.createElement('canvas'),
        $temp_ctx = $temp_canvas.getContext('2d');
    $temp_canvas.width = window.getComputedStyle(canvas, null)
      .getPropertyValue("width")
      .replace(/px$/, '');
    $temp_canvas.height = window.getComputedStyle(canvas, null)
      .getPropertyValue("height")
      .replace(/px$/, '');
    document.body.appendChild($temp_canvas);
    canvas.parentNode.querySelectorAll("canvas").forEach(function($canvas){
      $temp_ctx.drawImage($canvas, 0, 0);
    });
    return $temp_canvas;
  };

  const init_export_button = function(){
    const export_button = document.getElementById("export");
    export_button.addEventListener("click", function(e){
      const $temp_canvas = set_up_temp_canvas_for_export(),
        $link = document.createElement('a');

      $link.href = "" + $temp_canvas.toDataURL('image/png');
      $link.download = `vector-logic-${random()}.png`;
      $link.style.display = "none";
      document.body.appendChild($link);
      $link.click();
      document.body.removeChild($link);
      document.body.removeChild($temp_canvas);
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

  const init_file_upload_handlers = function(){
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
