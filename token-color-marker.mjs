import { TokenColorMarkerPF2e } from './classes/TokenColorMarkerPF2e.mjs';
import { TokenColorMarker, MODULENAME } from './classes/TokenColorMarker.mjs';
import { Settings } from './classes/Settings.mjs';
import { ChatMessageIconPF2e } from './classes/ChatMessageIconPF2e.mjs';

console.log(`${MODULENAME} | Module loaded`);

Hooks.once('i18nInit', () => { 
    Settings.registerSettings();
  });

Hooks.on('init', () => {
    if(game.system.id === 'pf2e') {
        ChatMessageIconPF2e.addMarkerToChatMessage();
    }
});

Hooks.on('ready', () => {
    // only create if the user is the GM. players dont have file creation by default
    if(game.user.isGM) {
        Settings.handleCompatibilityFlag();
        Settings.createImagesforSettings();
    }
    
    let tokenColorMarker;

    if(game.system.id === 'pf2e') {
        tokenColorMarker = TokenColorMarkerPF2e;
    }
    else {
        tokenColorMarker = TokenColorMarker;
    }

    // sets either rainbow or monochrome button icon
    tokenColorMarker.SetDefaultIcon();

    tokenColorMarker.addTokenColorMarkerModule();
});