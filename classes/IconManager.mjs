import { MODULENAME } from "./TokenColorMarker.mjs";
import { Settings } from "./Settings.mjs";

const WIDTH = 100;
const HEIGHT = 100;

const activeSource = "data";

export const FILEEXTENTION = "webp";

// A class to create the color marker icon
export class IconManager {

    static cashBuster = 1;

    static refreshImages() {
        this.cashBuster++;
    }

    static getFilePath(icon) {

        if(icon.isCustom) {
            return icon.filePath;
        }

        return `${this.getDirectoryPath()}/${this.getFileName(icon)}`;
    }

    static getImagePath(icon) {
        const filepath = this.getFilePath(icon);
        if(filepath && !icon.isCustom) {
            return `${filepath}?v=${this.cashBuster}`;
        }
        return filepath;
    }

    static getDirectoryPath() {
        return `${MODULENAME}`;
    }

    static getFileName(icon) {
        return `${icon.id}.${FILEEXTENTION}`;
    }

    // generate a random id for this new Color and populate
    static createIcon(hex = this.getRandomColor()) {
        const newIcon = {
            hex: hex,
            label: game.i18n.localize(`${MODULENAME}.color-manager-menu.new-color-label`),
            id: foundry.utils.randomID(16),
            text: "",
            textColor: "#000000"
        }

        return newIcon;
    }

    static createCustomImage(hex = this.getRandomColor()) {
        const newCustomImage = {
            isCustom: true,
            label: game.i18n.localize(`${MODULENAME}.color-manager-menu.new-image-label`),
            id: foundry.utils.randomID(16),
            filePath: ""
        }

        return newCustomImage;
    }

    static async saveIconImage(icon, overwrite = true) {

        var directory = await FilePicker.browse(activeSource, this.getDirectoryPath());
        var iconExists = directory.files.includes(this.getFilePath(icon));

        // if the icon does not alreeady exist, create it.
        if(overwrite || !iconExists)
        {
            // create a canvas to draw the icon
            var canvas = document.createElement("canvas");

            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            var context = canvas.getContext("2d");

            const x = 10;
            const y = 10;
            const width = 80;
            const height = 80;
            // because of the rounded corners, the width of "W" is outside the background
            const Wfactor = 10;

            // draw a filed in rounded square of the hex color
            this.drawRoundRect(context, x, y, width, height, 30, icon.hex); 

            if(icon.text) {
                this.drawText(context, width-Wfactor, icon.text, icon.textColor);
            }

            // extract as new image blob
            await this.getBlobFromCanvas(canvas, icon);
        }
    }

    static async getBlobFromCanvas(canvas, icon) {
        return new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
                await this.saveFile(blob, icon);
                resolve(blob);
            }, `image/${FILEEXTENTION}`);
        });
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
        var letters = '0123456789abcdef';
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

    // Draw text
    static drawText(context, width, text, hexColor)
    {
        context.fillStyle = hexColor;
        const fontName = "arial";

        let fontSize = game.settings.get(MODULENAME, Settings.MAX_FONT_SIZE_SETTING);
        
        if(!Object.keys(Settings.FONT_SIZES).includes(fontSize))
        {
            // If the font is not in range of options, use the default size.
            fontSize = Settings.DEFAULT_FONT_SIZE;
        }

        do {
            context.font = `bold ${fontSize}px ${fontName}`;
            fontSize--;
        } while (context.measureText(text).width > width)

        const measure = context.measureText(text);

        const xPos = 0 + (WIDTH/ 2) + ((measure.actualBoundingBoxLeft - measure.actualBoundingBoxRight) / 2);
        const yPos = 0 + (HEIGHT / 2) + ((measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent) / 2);

        context.fillText(text , xPos, yPos);
    }
}