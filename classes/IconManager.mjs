import { MODULENAME } from "./TokenColorMarker.mjs";

const WIDTH = 100;
const HEIGHT = 100;

const activeSource = "data";

export const FILEEXTENTION = "webp";

// A class to create the color marker icon
export class IconManager {

    static getImagePath(icon) {
        return `${this.getDirectoryPath()}/${this.getFileName(icon)}`;
    }

    static getDirectoryPath() {
        return `${MODULENAME}`;
    }

    static getFileName(icon) {
        return `${icon.id}.${FILEEXTENTION}`;
    }

    // generate a random id for this new Color and populate
    static createIcon() {
        const newId = foundry.utils.randomID(16);

        const newIcon = {
            hex: this.getRandomColor(),
            label: game.i18n.localize(`${MODULENAME}.color-manager-menu.new-color-label`),
            id: newId
            //filePath: `${this.getDirectoryPath()}/${newId}.${FILEEXTENTION}`
        }

        return newIcon;
    }

    static async saveIconImage(icon, overwrite = true) {

        var directory = await FilePicker.browse(activeSource, this.getDirectoryPath());
        var iconExists = directory.files.includes(this.getImagePath(icon));

        // if the icon does not alreeady exist, create it.
        if(overwrite || !iconExists)
        {
            // create a canvas to draw the icon
            var canvas = document.createElement("canvas");

            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            var context = canvas.getContext("2d");

            // draw a filed in rounded square of the hex color
            this.drawRoundRect(context, 15, 15, 70, 70, 25, icon.hex); 

            // extract as new image blob
            canvas.toBlob((blob) => { 
                return this.saveFile(blob, icon); 
            }, `image/${FILEEXTENTION}`);
        }
    }

    static async saveFile(blob, icon) {
        // create new file 
        let file = new File([blob], this.getFileName(icon), { type: blob.type });
    
        const result = await FilePicker.upload(activeSource, this.getDirectoryPath(), file, {}, { notify: false });
    
        return result.path;
    }

    static async createDirectory() {
        // create directory. catch error if it already exists
        try {
            await FilePicker.createDirectory(activeSource, this.getDirectoryPath());
        }
        catch(error) {
            if (!error.toString().startsWith("Error: EEXIST") && !error.toString().startsWith("Error: The S3 key")){
                throw error;
            } 
        }
    }

    // generates a random color for the new color marker.
    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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