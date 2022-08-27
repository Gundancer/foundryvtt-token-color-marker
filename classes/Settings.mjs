import { ColorPalatteSettings } from './ColorPalatteSettings.mjs';
import { IconCreator } from './IconCreator.mjs';
import { MODULENAME } from './TokenColorMarker.mjs';

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

export class Settings {

    static getDefaultColorSettings() {
      let defaultColors = [];

      DEFAULT_COLORS.forEach(defaultColor => {
        let label = game.i18n.localize(`${MODULENAME}.default-setting-colors.${defaultColor}`)
        defaultColors.push( { hex: `${defaultColor}`, label: label, id: foundry.utils.randomID(16), iconDataUrl: `${IconCreator.getIcon(defaultColor)}` })
      });

      return defaultColors;
    }
  
    static ENABLE_BUTTON_SETTING = 'enable-button';
    static ENABLE_BUTTON_GM_ONLY_SETTING = 'enable-button-for-gm-only';
    static COLORS = 'colors';

    static registerSettings() {
    
      game.settings.register(MODULENAME, this.ENABLE_BUTTON_SETTING, {
        name: `${MODULENAME}.settings.${this.ENABLE_BUTTON_SETTING}.Name`,
        default: true,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${this.ENABLE_BUTTON_SETTING}.Hint`,
        onChange: () => ui.players.render()
      });

      game.settings.register(MODULENAME, this.ENABLE_BUTTON_GM_ONLY_SETTING, {
        name: `${MODULENAME}.settings.${this.ENABLE_BUTTON_GM_ONLY_SETTING}.Name`,
        default: false,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${this.ENABLE_BUTTON_GM_ONLY_SETTING}.Hint`,
        onChange: () => ui.players.render()
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

      game.settings.register(MODULENAME, this.COLORS, {
        default: this.getDefaultColorSettings(),
        type: Array,
        scope: 'world',
        config: false,
      });
    }
}