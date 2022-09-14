import { TokenColorMarker } from './TokenColorMarker.mjs';

// A class that contains the main functionality for the module with a few 
// specific changes to work for the PF2e system
export class TokenColorMarkerPF2e extends TokenColorMarker {

    static async addTokenColorMarkerModule() {
        super.addTokenColorMarkerModule();

        // PF2e system sets ActiveEffect "disabled" to true. set disabled = false
        Hooks.on('createActiveEffect', (app, html, data) => { 
            app.update({ disabled: false });
        });

        Hooks.on('drawToken', (token) => { 
            this.drawActiveEffects(token);
        });
    }

    static async drawActiveEffects(token){
        // PF2e system sets ActiveEffect "disabled" to true. this resets after the app
        // is reloaded. Set disabled = false on ActiveEffects and draw again if needed.
        let needsRedraw = false
        for (const effect of token.actor.effects) {
            if(effect.disabled) {
                await effect.updateSource({ disabled: false });
                needsRedraw = true;
            }
        }

        // Only redraw if needed.
        if(needsRedraw){
            token.drawEffects();
        }
    }
}