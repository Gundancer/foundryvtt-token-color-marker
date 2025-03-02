import { ColorPalatteSettings } from './ColorPalatteSettings.mjs';
import { IconManager } from './IconManager.mjs';
import { MODULENAME, TokenColorMarker } from './TokenColorMarker.mjs';

const DEFAULT_COLORS = [
  "#ff0000",
  "#ffa500",
  "#ffff00",
  "#008000",
  "#0000ff",
  "#800080",
  "#ffffff",
  "#000000",
]

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
  
    static ENABLE_BUTTON_SETTING = 'enable-button';
    static ENABLE_BUTTON_GM_ONLY_SETTING = 'enable-button-for-gm-only';
    static ENABLE_MONOCHROME_ICON_SETTING = 'enable-mono-Icon';
    static ENABLE_ICON_IN_CHAT_MESSAGE_SETTING = 'enable-icon-in-chat-message';

    static COLORS = 'colors';

    static registerSettings() {
    
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
        default: this.getDefaultColorSettings(),
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
    }

    static createImagesforSettings(){
      IconManager.createDirectory();

      let colors = game.settings.get(MODULENAME, Settings.COLORS);
      colors.forEach(color => {
        IconManager.saveIconImage(color, false);
      });
    }
}