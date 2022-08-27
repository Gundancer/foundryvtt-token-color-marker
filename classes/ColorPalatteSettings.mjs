import { IconCreator } from "./IconCreator.mjs";
import { Settings } from "./Settings.mjs";
import { MODULENAME } from "./TokenColorMarker.mjs";

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
  
    static getColors() {
      return game.settings.get(MODULENAME, Settings.COLORS);
    }

    static async createColor() {
        // generate a random id for this new Color and populate
        let hexValue = this.getRandomColor();
        const newColor = {
            hex: hexValue,
            label: game.i18n.localize(`${MODULENAME}.color-manager-menu.new-color-label`),
            id: foundry.utils.randomID(16),
            iconDataUrl: IconCreator.getIcon(hexValue)
        }
    
        let colors = this.getColors().concat(newColor);

        // update the database with the new Colors
        return game.settings.set(MODULENAME, Settings.COLORS, colors);
    }

    static async updateColors(updateData) {
      return await game.settings.set(MODULENAME, Settings.COLORS, updateData);
    }

    static async updateColor(colorId, field, value) {
        let colors = this.getColors();

        let relevantColor = colors.find(x => x.id === colorId)
        
        relevantColor[field] = value;

        if(field === 'hex') {
          relevantColor['iconDataUrl'] = IconCreator.getIcon(value);
        }

        // update the database with the updated Color list
        return await game.settings.set(MODULENAME, Settings.COLORS, colors);
    }
    
    static deleteColor(colorId) {
        let colors = this.getColors();

        colors = colors.filter(x => {
          return x.id != colorId;
        })

        // update the database with the updated Color list
        return game.settings.set(MODULENAME, Settings.COLORS, colors);
    }

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
  
    getData() {
      return {
        colors: ColorPalatteSettings.getColors()
      }
    }
  
    async _onChangeInput(event) {
  
      let inputName = event.currentTarget.name.split('.');

      await ColorPalatteSettings.updateColor(inputName[0], inputName[1], event.currentTarget.value);

      this.render();
    }

    static getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

  }