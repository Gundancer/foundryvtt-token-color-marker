import { IconManager } from "./IconManager.mjs";
import { Settings } from "./Settings.mjs";
import { MODULENAME } from "./TokenColorMarker.mjs";

// the form to customize the color markers in module settings
export class ColorPalatteSettings extends FormApplication {
    static get defaultOptions() {
      const defaults = super.defaultOptions;
  
      const overrides = {
        closeOnSubmit: false,
        height: 'auto',
        id: 'color-palatte-settings',
        submitOnChange: true,
        template: `modules/${MODULENAME}/templates/color-palatte-settings.hbs`,
        title: 'Colors',
        userId: game.userId,
      };
  
      const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
  
      return mergedOptions;
    }
  
    // get the color list in the settings
    static getColors() {
      return game.settings.get(MODULENAME, Settings.COLORS);
    }

    // create a color and add it tothe settings color list
    static async createColor() {
        // generate a random id for this new Color and populate
        let hexValue = this.getRandomColor();
        const newColor = {
            hex: hexValue,
            label: game.i18n.localize(`${MODULENAME}.color-manager-menu.new-color-label`),
            id: IconManager.createNewColorId()
        }
    
        let colors = this.getColors().concat(newColor);

        // update the database with the new Colors
        await game.settings.set(MODULENAME, Settings.COLORS, colors);

        // create the image file
        await IconManager.saveIconImage(hexValue);
    }

    static async updateColor(colorId, field, value) {
        // get the color list 
        let colors = this.getColors();
        // find the color to update
        let relevantColor = colors.find(x => x.id === colorId)
        
        // update the color
        relevantColor[field] = value;

        // update the database with the updated Color list
        await game.settings.set(MODULENAME, Settings.COLORS, colors);

        // update the image file
        await IconManager.saveIconImage(value);
    }
    
    static async deleteColor(colorId) {
        // get the lis of colors
        let colors = this.getColors();

        // remove the color selected
        colors = colors.filter(x => {
          return x.id != colorId;
        })

        // update the database with the updated Color list
        await game.settings.set(MODULENAME, Settings.COLORS, colors);
    }

    // handles the create and delete actions
    async _handleButtonClick(event) {
      const clickedElement = $(event.currentTarget);
      const action = clickedElement.data().action;
      const colorId = clickedElement.parents('[data-color-id]')?.data()?.colorId;
  
      switch (action) {
        case 'create': {
          await ColorPalatteSettings.createColor();
          this.render();
          break;
        }
  
        case 'delete': {
            const confirmed = await Dialog.confirm({
              title: game.i18n.localize(`${MODULENAME}.confirms.deleteConfirm.Title`),
              content: game.i18n.localize(`${MODULENAME}.confirms.deleteConfirm.Content`)
            });
    
            if (confirmed) {
              await ColorPalatteSettings.deleteColor(colorId);
              this.render();
            }
    
            break;
          }
  
        default:
          console.log(false, 'Invalid action detected', action);
      }
    }
  
    activateListeners(html) {
      super.activateListeners(html);
  
      html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }
  
    // gets the color list to display on the form
    getData() {
      return {
        colors: ColorPalatteSettings.getColors()
      }
    }
  
    // handles the update action
    async _onChangeInput(event) {
  
      let inputName = event.currentTarget.name.split('.');

      // update the color marker
      await ColorPalatteSettings.updateColor(inputName[0], inputName[1], event.currentTarget.value);

      this.render();
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

  }