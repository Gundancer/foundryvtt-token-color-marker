import { TokenColorMarker } from './TokenColorMarker.mjs';

// A class that contains the main functionality for the module with a few 
// specific changes to work for the PF2e system
export class TokenColorMarkerPF2e extends TokenColorMarker {

    static addTokenColorMarkerModule() {
        super.addTokenColorMarkerModule();

        // PF2e system sets ActiveEffect "disabled" to true. this resets after the app
        // is reloaded. loop through actors and set disabled = false on ActiveEffects
        game.actors.forEach(actor => {
            actor.effects.forEach(effect => {
                effect.update({ disabled: false });
            });
        });
    
        // PF2e system sets ActiveEffect "disabled" to true. set disabled = false
        Hooks.on('createActiveEffect', (app, html, data) => { 
            app.update({ disabled: false });
        });
    }
}