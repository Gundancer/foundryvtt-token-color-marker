import { MODULENAME } from "./TokenColorMarker.mjs";

const WIDTH = 100;
const HEIGHT = 100;

export const FILEEXTENTION = "png";

// A class to create the color marker icon
export class IconManager {

    static getImagePath(hexColor) {
        return `${this.getDirectoryPath()}/${hexColor.split('#')[1]}.${FILEEXTENTION}`;
    }

    static getDirectoryPath() {
        return `worlds/${game.world.id}/${MODULENAME}`;
    }

    static createNewColorId() {
        return foundry.utils.randomID(16);
    }

    static async saveIconImage(hexColor) {

        // create a canvas to draw the icon
        var canvas = document.createElement("canvas");

        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        var context = canvas.getContext("2d");

        // draw a filed in rounded square of the hex color
        this.drawRoundRect(context, 15, 15, 70, 70, 25, hexColor); 

        // extract as new image blob
        canvas.toBlob((blob) => { 
            return this.saveFile(blob, hexColor); 
        }, `image/${FILEEXTENTION}`);
    }

    static async saveFile(blob, hexColor) {
        // create new file 
        let file = new File([blob], `${hexColor.split('#')[1]}.${FILEEXTENTION}`, { type: blob.type });
    
        const result = await FilePicker.upload("data", this.getDirectoryPath(), file, {}, { notify: false });
    
        return result.path;
    }

    static async createDirectory() {
        // create directory. catch error if it already exists
        try {
            await FilePicker.createDirectory("data", this.getDirectoryPath());
        }
        catch(error) {
            if (!error.startsWith("EEXIST") && !error.startsWith("The S3 key")){
                throw error;
            } 
        }
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