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

    // create a color and add it to the settings color list
    static async createColor() {
        const newIcon = IconManager.createIcon();
    
        let colors = this.getColors().concat(newIcon);

        // update the database with the new Colors
        await game.settings.set(MODULENAME, Settings.COLORS, colors);

        // create the image file
        await IconManager.saveIconImage(newIcon);
    }

    // create a color and add it to the settings color list
    static async addImage() {
      const newIcon = IconManager.createCustomImage();

      let colors = this.getColors().concat(newIcon);

      // update the database with the new Colors
      await game.settings.set(MODULENAME, Settings.COLORS, colors);
    }

    static async updateColor(colorId, field, value) {
        // get the color list 
        let colors = this.getColors();
        // find the color to update
        let relevantColor = colors.find(x => x.id === colorId)
        
        // update the color
        relevantColor[field] = value;

        IconManager.refreshImages();

        // update the database with the updated Color list
        await game.settings.set(MODULENAME, Settings.COLORS, colors);

        if(!relevantColor.isCustom) {
          // update the image file
          await IconManager.saveIconImage(relevantColor);
        }
    }
    
    static async deleteColor(colorId) {
        // get the list of colors
        let colors = this.getColors();

        // remove the color selected
        colors = colors.filter(x => {
          return x.id != colorId;
        })

        // update the database with the updated Color list
        await game.settings.set(MODULENAME, Settings.COLORS, colors);
    }

    static async moveColor(from, to) {
      // get the list of colors
      let colors = this.getColors();

      // change the order
      colors.splice(to, 0, colors.splice(from, 1)[0]);

      // update the database with the updated Color list
      await game.settings.set(MODULENAME, Settings.COLORS, colors);
    }

    // handles the create and delete actions
    async _handleButtonClick(event) {
      const clickedElement = $(event.currentTarget);
      const action = clickedElement.data().action;
      const parentData = clickedElement.parents('[data-color-id]')?.data();
      const colorId = parentData?.colorId;
      const index = parentData?.index;
  
      switch (action) {
        case 'create': {
          await ColorPalatteSettings.createColor();
          this.render();
          break;
        }
  
        case 'add-image': {
          await ColorPalatteSettings.addImage();
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

        case 'move-up': {
            await ColorPalatteSettings.moveColor(index, index-1);
            this.render();
            break;
        }

        case 'move-down': {
          await ColorPalatteSettings.moveColor(index, index+1);
          this.render();
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
  }