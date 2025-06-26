import { ColorPalatteSettings } from './ColorPalatteSettings.mjs';
import { IconManager } from './IconManager.mjs';
import { MODULENAME, TokenColorMarker } from './TokenColorMarker.mjs';

const DEFAULT_COLORS = [
  "#ff0000",
  "#ffa500",
  "#ffff00",
  "#ffffff",
  "#008000",
  "#0000ff",
  "#800080",
  "#000000",
]

const WHITE = "#ffffff";
const BLACK = "#000000";

// A class used to register the module settings
export class Settings {

    static getDefaultColorSettings() {
      let defaultColors = [];

      for (const defaultColor of DEFAULT_COLORS) {
        let icon = IconManager.createIcon(defaultColor);
        icon.label = game.i18n.localize(`${MODULENAME}.default-setting-colors.${defaultColor}`);
        defaultColors.push(icon);
      };

      return defaultColors;
    }

    static getDefaultTextAndImageSettings() {
      let defaultText = [];

      let number1 = IconManager.createIcon(WHITE);
      number1.label = game.i18n.localize(`${MODULENAME}.default-setting-colors.Number1`);
      number1.text = "1";
      number1.textColor = BLACK;
      defaultText.push(number1);

      let number2 = IconManager.createIcon(BLACK);
      number2.label = game.i18n.localize(`${MODULENAME}.default-setting-colors.Number2`);
      number2.text = "2";
      number2.textColor = WHITE;
      defaultText.push(number2);

      let abc = IconManager.createIcon(WHITE);
      abc.label = game.i18n.localize(`${MODULENAME}.default-setting-colors.ABC`);
      abc.text = "ABC";
      abc.textColor = BLACK;
      defaultText.push(abc);

      let rainbow = IconManager.createCustomImage(WHITE);
      rainbow.label = game.i18n.localize(`${MODULENAME}.default-setting-colors.Rainbow`);
      rainbow.filePath = "modules/token-color-marker/icons/rainbow.webp";
      defaultText.push(rainbow);

      return defaultText;
    }
  
    static COMPATIBILITY_FLAG_SETTING = 'compatibility-flag';

    static ENABLE_BUTTON_SETTING = 'enable-button';
    static ENABLE_BUTTON_GM_ONLY_SETTING = 'enable-button-for-gm-only';
    static ENABLE_MONOCHROME_ICON_SETTING = 'enable-mono-Icon';
    static ENABLE_ICON_IN_CHAT_MESSAGE_SETTING = 'enable-icon-in-chat-message';
    static MAX_FONT_SIZE_SETTING = 'max-font-size';

    static FONT_SIZES = { 80: "80", 75: "75", 70: "70", 65: "65", 60: "60" };
    static DEFAULT_FONT_SIZE = 70;

    static COLORS = 'colors';

    static registerSettings() {
    
      // register the setting to turn off the token color marker button
      game.settings.register(MODULENAME, this.COMPATIBILITY_FLAG_SETTING, {
        default: 0,
        type: Number,
        scope: 'world',
        config: false,
      });

      // register the setting to turn off the token color marker button
      game.settings.register(MODULENAME, this.ENABLE_BUTTON_SETTING, {
        name: `${MODULENAME}.settings.${this.ENABLE_BUTTON_SETTING}.Name`,
        default: true,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${this.ENABLE_BUTTON_SETTING}.Hint`,
      });

      // register the setting to enable the token color marker button to only be seen by the GM
      game.settings.register(MODULENAME, this.ENABLE_BUTTON_GM_ONLY_SETTING, {
        name: `${MODULENAME}.settings.${this.ENABLE_BUTTON_GM_ONLY_SETTING}.Name`,
        default: false,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${this.ENABLE_BUTTON_GM_ONLY_SETTING}.Hint`,
      });

      // register ColorPalatteSettings form application as a settings menu
      game.settings.registerMenu(MODULENAME, 'color-manager-menu', {
        name: `${MODULENAME}.settings.color-manager-menu.Name`,
        label: `${MODULENAME}.settings.color-manager-menu.Label`,
        icon: 'fas fa-cogs',
        type: ColorPalatteSettings,
        restricted: true,
        hint: `${MODULENAME}.settings.color-manager-menu.Hint`,
      });

      // register the colors setting to allow for color customization 
      game.settings.register(MODULENAME, this.COLORS, {
        default: [],
        type: Array,
        scope: 'world',
        config: false,
      });

      // register the setting to toggle the rainbow or monochrome icon
      game.settings.register(MODULENAME, this.ENABLE_MONOCHROME_ICON_SETTING, {
        name: `${MODULENAME}.settings.${this.ENABLE_MONOCHROME_ICON_SETTING}.Name`,
        default: false,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${this.ENABLE_MONOCHROME_ICON_SETTING}.Hint`,
        onChange: () => TokenColorMarker.SetDefaultIcon()
      });

      if(game.system.id === 'pf2e') {
        // register the setting to toggle the rainbow or monochrome icon
        game.settings.register(MODULENAME, this.ENABLE_ICON_IN_CHAT_MESSAGE_SETTING, {
          name: `${MODULENAME}.settings.${this.ENABLE_ICON_IN_CHAT_MESSAGE_SETTING}.Name`,
          default: true,
          type: Boolean,
          scope: 'world',
          config: true,
          hint: `${MODULENAME}.settings.${this.ENABLE_ICON_IN_CHAT_MESSAGE_SETTING}.Hint`,
        });
      }

      // register the setting to toggle the rainbow or monochrome icon
      game.settings.register(MODULENAME, this.MAX_FONT_SIZE_SETTING, {
        name: `${MODULENAME}.settings.${this.MAX_FONT_SIZE_SETTING}.Name`,
        default: this.DEFAULT_FONT_SIZE,
        type: String,
        scope: 'world',
        config: true,
        choices: this.FONT_SIZES,
        hint: `${MODULENAME}.settings.${this.MAX_FONT_SIZE_SETTING}.Hint`,
      });

    }

    static createImagesforSettings(overwrite = false){
      IconManager.createDirectory();

      let colors = game.settings.get(MODULENAME, Settings.COLORS);
      colors.forEach(color => {
        if(!color.isCustom) {
          IconManager.saveIconImage(color, overwrite);
        }
      });
    }

    static async handleCompatibilityFlag(){
      var flag = game.settings.get(MODULENAME, Settings.COMPATIBILITY_FLAG_SETTING);

      if(flag < 1)
      {
        // this is used to set setting defaults once.
        var colors = game.settings.get(MODULENAME, Settings.COLORS);

        if(colors.length == 0)
        {
          colors = this.getDefaultColorSettings();
        }

        colors = colors.concat(this.getDefaultTextAndImageSettings());
        
        // save colors with the defaults.
        await game.settings.set(MODULENAME, Settings.COLORS, colors);
        
        // set the flag so this is called once.
        await game.settings.set(MODULENAME, Settings.COMPATIBILITY_FLAG_SETTING, 1);

        Settings.createImagesforSettings(true);
      }
      
    }
}