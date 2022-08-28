const WIDTH = 100;
const HEIGHT = 100;

// A class to create the color marker icon
export class IconCreator {
    static getIcon(hexColor) {

        // create a canvas to draw the icon
        var canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        var context = canvas.getContext("2d");

        // draw a filed in rounded square of the hex color
        this.drawRoundRect(context, 15, 15, 70, 70, 25, hexColor);

        // extract as new image (data-uri)
        var url = canvas.toDataURL();

        // return the icon as a (data-uri)
        return url;
    }

    // Draw a rounded rectangle
    static drawRoundRect(context, x, y, w, h, radius, hexColor)
    {
      var r = x + w;
      var b = y + h;
      context.beginPath();
      context.strokeStyle=hexColor;
      context.lineWidth="1";
      context.moveTo(x+radius, y);
      context.lineTo(r-radius, y);
      context.quadraticCurveTo(r, y, r, y+radius);
      context.lineTo(r, y+h-radius);
      context.quadraticCurveTo(r, b, r-radius, b);
      context.lineTo(x+radius, b);
      context.quadraticCurveTo(x, b, x, b-radius);
      context.lineTo(x, y+radius);
      context.quadraticCurveTo(x, y, x+radius, y);
      context.fillStyle=hexColor;
      context.fill();
      context.stroke();
    }
}