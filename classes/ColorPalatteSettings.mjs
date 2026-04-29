import { IconManager } from "./IconManager.mjs";
import { Settings } from "./Settings.mjs";
import { MODULENAME } from "./TokenColorMarker.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api

// the form to customize the color markers in module settings
export class ColorPalatteSettings extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      id: "color-palatte-settings",
      tag: "form",
      classes: ["standard-form"],

      form: {
        closeOnSubmit: false,
        submitOnChange: true
      },

      position: {
        height: "800",
      },

      window: {
        title: "Colors",
        resizable: true,
      },

      userId: game.userId
    };

    static PARTS = {
      form: {
        template: `modules/token-color-marker/templates/color-palatte-settings.hbs`,
        scrollable: [".scroll-region", ""]
      },
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

      if(to >= 0){ // prevent first one from looping to bottom
        // change the order
        colors.splice(to, 0, colors.splice(from, 1)[0]);
      }

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
          this.render({isScrollDown: true});
          break;
        }
  
        case 'add-image': {
          await ColorPalatteSettings.addImage();
          this.render({isScrollDown: true});
          break;
        }

        case 'delete': {
            const confirmed = await DialogV2.confirm({
              window: {
                title: game.i18n.localize(`${MODULENAME}.confirms.deleteConfirm.Title`)
              },
              content: game.i18n.localize(`${MODULENAME}.confirms.deleteConfirm.Content`),
              yes: { 
                default: true 
              }
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
  
        case 'close': {
          // This showed up when updating to ApplicationV2
          break;
        }

        default:
          console.log(false, 'Invalid action detected', action);
      }
    }
  
    _onRender(context, options) {
      super._onRender(context, options);

      if(options.isScrollDown) {
        const scrollRegion = this.element.querySelector(".scroll-region");
        scrollRegion.scrollTop = scrollRegion.scrollHeight;
      }

      this.element.querySelectorAll("[data-action]")
        .forEach(da => {
          da.addEventListener("click", event => this._handleButtonClick(event));
        });

      this.element.querySelectorAll("input")
        .forEach(input => {
          input.addEventListener("change", this._onChangeInput.bind(this));
        });

      this.element.querySelectorAll("file-picker")
        .forEach(fp => {
          fp.addEventListener("change", this._onChangeInput.bind(this));
        });
    }
  
    // gets the color list to display on the form
    async _prepareContext(options) {
      const context = await super._prepareContext(options)

      const colors = ColorPalatteSettings.getColors();

      // make a deep copy to avoid adding filepath to colors in settings
      var displayIcons = JSON.parse(JSON.stringify(colors));

      displayIcons.forEach(displayIcon => {
        if(!displayIcon.isCustom) {
          displayIcon.filePath = IconManager.getImagePath(displayIcon);
        }
      });

      return {
        colors: displayIcons
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