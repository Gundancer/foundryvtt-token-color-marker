import { Settings } from './Settings.mjs';
import { TokenColorMarker, MODULENAME } from './TokenColorMarker.mjs';

export class TokenColorMarkerPF2e extends TokenColorMarker {

    static addTokenColorMarkerModule() {
        super.addTokenColorMarkerModule();

        // PF2e system sets ActiveEffect "disabled" to true. this resets after the app
        // is reloaded. loop through actors and set disabled = false on ActiveEffects
        game.actors.forEach(actor => {
            actor.data.effects.forEach(effect => {
                effect.data.update({ disabled: false });
            });
        });
    
        // PF2e system sets ActiveEffect "disabled" to true. set disabled = false
        Hooks.on('createActiveEffect', (app, html, data) => { 
            app.data.update({ disabled: false });
        });
    }

    static async toggleMarkerToToken(tokenHUD, colorId, data, isActive) {
        await super.toggleMarkerToToken(tokenHUD, colorId, data, isActive);

        if(isActive)
        {
            let colors = game.settings.get(MODULENAME, Settings.COLORS);
            let color = colors.find(x => x.id === colorId);

            // PF2e system sets ActiveEffect "disabled" to true. need to manually call scrolling text
            tokenHUD.object.hud.createScrollingText(`+(${color.label})`, {
                anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
                direction: CONST.TEXT_ANCHOR_POINTS.TOP,
                fontSize: 28,
                stroke: 0x000000,
                strokeThickness: 4,
                jitter: 0.25
            });
        }
    }
}