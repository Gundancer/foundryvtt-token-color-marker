import { TokenColorMarkerPF2e } from './classes/TokenColorMarkerPF2e.mjs';
import { TokenColorMarker, MODULENAME } from './classes/TokenColorMarker.mjs';
import { Settings } from './classes/Settings.mjs';

console.log(`${MODULENAME} | Module loaded`);

Hooks.once('i18nInit', () => {
    Settings.registerSettings();
  });

Hooks.on('ready', () => {
    let tokenColorMarker;

    if(game.system.id === 'pf2e') {
        tokenColorMarker = TokenColorMarkerPF2e;
    }
    else {
        tokenColorMarker = TokenColorMarker;
    }

    tokenColorMarker.addTokenColorMarkerModule();
});