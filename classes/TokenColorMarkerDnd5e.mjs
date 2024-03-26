import { IconManager } from './IconManager.mjs';
import { Settings } from './Settings.mjs';
import { MODULENAME, TokenColorMarker } from './TokenColorMarker.mjs';

// A class that contains the main functionality for the module with a few 
// specific changes to work for the dnd5e system
export class TokenColorMarkerDnd5e extends TokenColorMarker {
    static async toggleMarkerToToken(tokenHUD, colorId, data) 
    {
        //dnd5e version 3.1.0 started looking for the status effect when toggling. it was throwing an error if not found.
        // there was a note that they may not be needed when foundry v11 is no longer supported.
        let colors = game.settings.get(MODULENAME, Settings.COLORS);
        let color = colors.find(x => x.id === colorId);

        CONFIG.statusEffects.push({ id: colorId, name: (color ? color.label : colorId), icon: IconManager.getImagePath(color.hex) });

        super.toggleMarkerToToken(tokenHUD, colorId, data);

        const index = CONFIG.statusEffects.findIndex((obj) => obj.id === colorId);
        CONFIG.statusEffects.splice(index, 1);
    }
}