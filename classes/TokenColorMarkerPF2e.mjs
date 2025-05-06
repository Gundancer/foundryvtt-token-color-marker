import { IconManager } from './IconManager.mjs';
import { Settings } from './Settings.mjs';
import { FLAGS, MODULENAME, TokenColorMarker } from './TokenColorMarker.mjs';

// A class that contains the main functionality for the module with a few 
// specific changes to work for the PF2e system
export class TokenColorMarkerPF2e extends TokenColorMarker {

    static async addTokenColorMarkerModule() {
        super.addTokenColorMarkerModule();

        Hooks.on('deleteItem', (effect) => { 
            let colorId = this.getEffectColorId(effect);
            // If a color marker, then remove active class on the color marker palette
            if(colorId) {
                // deactivate the icon in the palette
                let paletteIcon = $(`.${MODULENAME}[data-color-id="${colorId}"]`)[0];
                paletteIcon?.classList.remove("active");
            }
        });
    }

    static async toggleMarkerToToken(actor, colorId, data) 
    {
        const existing = actor.items.find(e => e.getFlag(MODULENAME, FLAGS.COLORID) === colorId);

        // if exists then delete to toggle off.
        if(existing) {
            await existing.delete();
        }
        else {
            let colors = game.settings.get(MODULENAME, Settings.COLORS);
            let color = colors.find(x => x.id === colorId);
    
            // the marker effect to be added to the token
            let effectObject = [{
                // if the color has been deleted, set the label to the color id
                name: (color ? color.label : colorId),
                type: "effect",
                img: IconManager.getImagePath(color),
                flags: { 
                    [MODULENAME]: {
                        [FLAGS.COLORID]: colorId
                    }
                },
                system: {
                    tokenIcon: { 
                        show: true
                    },
                }
            }];
    
            // toggle the marker effect
            await actor.createEmbeddedDocuments("Item", effectObject);
        }
    }

    static isColorActiveOnToken(tokenHUD, colorId) {
        let item = tokenHUD.object.document.actor.items.find(e => e.getFlag(MODULENAME, FLAGS.COLORID) === colorId);
        if(item) { return true; }
        return false;
    }

    static getTokenEffects(tokenHUD) {
        return tokenHUD.object.document.actor.items;
    }

    static async removeEffect(app, effectId) {
        const existing = app.object.document.actor.items.find(e => e.getFlag(MODULENAME, FLAGS.COLORID) === effectId);
        await existing.delete();
        await app.render();
    }
}