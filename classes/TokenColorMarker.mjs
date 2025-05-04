import { IconManager } from "./IconManager.mjs";
import { Settings } from "./Settings.mjs";

export const MODULENAME = "token-color-marker";

const RAINBOWMARKER = `modules/${MODULENAME}/icons/rainbow.webp`
const MONOCHROMEMARKER = `modules/${MODULENAME}/icons/monochrome.webp`;

export const FLAGS = {
    COLORMARKERCLASS: 'colorMarkerClass',
    COLORID: 'colorId'
}

// A class that contains the main functionality for the module
export class TokenColorMarker {
    static DefaultIcon = RAINBOWMARKER;

    static SetDefaultIcon() {
        // use monochrome icon
        if (game.settings.get(MODULENAME, Settings.ENABLE_MONOCHROME_ICON_SETTING)) {
            TokenColorMarker.DefaultIcon = MONOCHROMEMARKER;
        }
        else {
            TokenColorMarker.DefaultIcon = RAINBOWMARKER;
        }
    }

    static addTokenColorMarkerModule() {
        Hooks.on('renderTokenHUD', (app, html, data) => { 
            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!game.settings.get(MODULENAME, Settings.ENABLE_BUTTON_SETTING)) {
                return;
            }

            // if the user is not a GM and ENABLE_BUTTON_GM_ONLY_SETTING setting is true, return early
            if (!game.user.isGM && game.settings.get(MODULENAME, Settings.ENABLE_BUTTON_GM_ONLY_SETTING)) {
                return;
            }

            // Add the UI
            this.addTokenColorMarkerUI(app, $(html), data);

            // register click event listener for token color marker button
            $(html).on('click', `.control-icon[data-action="${MODULENAME}"]`, (event) => {
                this.activateTokenColorMarkerButton($(event.currentTarget), app);
            });

            let palette = $(html).find(`.${MODULENAME}-palette`);

            // register click event listener for token color marker palette icons
            palette.on('click', `.${MODULENAME}`, (event) => {
                this.clickMarkerPaletteIcons(event, app, data);
            });

            // register right click event listener for token color marker palette icons
            palette.on('contextmenu', `.${MODULENAME}`, (event) => {
                this.clickMarkerPaletteIcons(event, app, data);
            });

            // register click event listener for effects button
            $(html).on('click', '.control-icon[data-action="effects"]', (event) => {
                this.deactivateTokenColorMarkerButton($(event.currentTarget));
            });

            // register click event listener for token color marker palette icons
            palette.on('click', `#remove-deleted-colors`, (event) => {
                this.clickRemoveDeletedColorMarkers(event, app, data);
            });

            // register right click event listener for token color marker palette icons
            palette.on('contextmenu', `#remove-deleted-colors`, (event) => {
                this.clickRemoveDeletedColorMarkers(event, app, data);
            });
        });
    }

    static addTokenColorMarkerUI(tokenHUD, html, data) {
        // find the right button column on the token hud
        const rightButtonColumn = html.find('.col.right');

        let markers = "";

        // get the list of colors from the settings
        let colors = game.settings.get(MODULENAME, Settings.COLORS);

        // create a color marker for each color
        colors.forEach(color => {
            // Check if the effects is already on the token
            let activeColor = this.isColorActiveOnToken(tokenHUD, color.id)
            const filepath = IconManager.getImagePath(color);
            if(filepath){
                markers = markers.concat(
                    `<div class="${MODULENAME} ${activeColor ? 'active' : ''}" data-color-id="${color.id}" id="${MODULENAME}-${color.id}" title="${color.label}">
                        <img class="${MODULENAME}-icon" src=${filepath} >
                    </div>`
                );
            }
        });

        // If there is a deleted marker, a trash icon will be visible on the palette to remove them.
        let showTrash = this.hasDeletedMarker(tokenHUD, colors);

        // check if token color marker "control-icon" is active when the TokenHUD gets refreshed.
        // the refresh happens during "ToggleEffect". delete the flag after one time use.
        let active = tokenHUD[FLAGS.COLORMARKERCLASS];
        tokenHUD[FLAGS.COLORMARKERCLASS] = "";

        // create localized tooltip for button
        const buttonTooltip = game.i18n.localize(`${MODULENAME}.button-title`);
        const trashTooltip = game.i18n.localize(`${MODULENAME}.trash-button-title`);

        let style = "";
        if (!game.settings.get(MODULENAME, Settings.ENABLE_MONOCHROME_ICON_SETTING)) {
            // if not the monochrome icon remove the overlay on the active image that changes the color. only happens on some systems
            style = 'style="filter:none;"';
        }

        // insert a button at the top of this element
        rightButtonColumn.prepend(
            `<div class="control-icon ${active ?? ''}" data-action="${MODULENAME}">
                <img src="${TokenColorMarker.DefaultIcon}" width="36" height="36" title="${buttonTooltip}" ${style}>
                <div class="${MODULENAME}-palette ${active ?? ''}">
                    ${markers}
                    <i id="remove-deleted-colors" class="fas fa-trash ${showTrash ? 'active' : ''}" title="${trashTooltip}"></i>
                </div>
            </div>`
        );
    }

    static isColorActiveOnToken(tokenHUD, colorId) {
        let effect = tokenHUD.object.document.actor.effects.find(e => e.statuses.find(s => s === colorId));
        if(effect) {
            return true;
        }
        return false;
    }

    // This will check if a token has a color marker still on it that has been deleted.
    static hasDeletedMarker(tokenHUD, colors) {
        let effects = this.getTokenEffects(tokenHUD);
        for (const effect of effects) {
            let effectId = this.getEffectColorId(effect);
            // only include effects that are part of token color marker
            if(effectId && !colors.find(x => x.id === effectId))
            {
                return true;
            }
        }
        return false;
    }

    static getTokenEffects(tokenHUD) {
        return tokenHUD.object.document.actor.effects;
    }

    static getEffectColorId(effect) {
        return effect.getFlag(MODULENAME, FLAGS.COLORID);
    }

    static activateTokenColorMarkerButton(colorMarkerButton, tokenHUD) {
        // Activate the token color marker button and palette
		colorMarkerButton[0].classList.toggle("active");
        colorMarkerButton[0].querySelector(`.${MODULENAME}-palette`).classList.toggle("active");

        // Deactivate the effects button and status effects palette
        tokenHUD.toggleStatusTray(false);
	}

    static async deactivateTokenColorMarkerButton(effectsButton) {
		// Deactivate the token color marker button and palette
        let colorMarkerButton = effectsButton.parent().find(`.control-icon[data-action="${MODULENAME}"]`)[0];
        colorMarkerButton.classList.remove("active");
        const palette = colorMarkerButton.querySelector(`.${MODULENAME}-palette`);
        palette.classList.remove("active");
	}

    static async clickMarkerPaletteIcons(event, app, data)
    {
        event.preventDefault();
        event.stopPropagation();

        // gets the img that was clicked
        let img = event.currentTarget;
        await this.clickMarkerIcon(app, img.dataset.colorId, data);
    }

    static async clickMarkerIcon(tokenHUD, colorId, data) {
        // set the token color marker menu button as active when UI refreshes.
        // This is a one time use flag to keep the token color marker "control-icon" active
        tokenHUD[FLAGS.COLORMARKERCLASS] = "active";

        this.toggleMarkerToToken(tokenHUD, colorId, data);
    }

    static async toggleMarkerToToken(tokenHUD, colorId, data) {
        
        let colors = game.settings.get(MODULENAME, Settings.COLORS);
        let color = colors.find(x => x.id === colorId);

        // the marker effect to be added to the token
        CONFIG.statusEffects.push(
            { 
                id: colorId, 
                name: (color ? color.label : colorId),
                label: (color ? color.label : colorId), 
                img: IconManager.getImagePath(color) 
            });

        // toggle the marker effect
        await tokenHUD.actor.toggleStatusEffect(colorId, {overlay: false});

        const index = CONFIG.statusEffects.findIndex((obj) => obj.id === colorId);
        CONFIG.statusEffects.splice(index, 1);

    }

    static async clickRemoveDeletedColorMarkers(event, app, data)
    {
        event.preventDefault();
        event.stopPropagation();

        // get the colors from settings
        let colors = game.settings.get(MODULENAME, Settings.COLORS);
        // get the color marker flags on the token
        let effects = this.getTokenEffects(app);

        // find any deleted color markers on a token and remove them.
        for (const effect of effects) {
            let effectId = this.getEffectColorId(effect);
            if(effectId && !colors.find(x => x.id === effectId)) {
                await this.removeEffect(app, effectId);
            }
        }
    }

    static async removeEffect(app, effectId) {
        let effectObject = {
            id: effectId,
            icon: TokenColorMarker.DefaultIcon
        }
        await app.object.toggleEffect(effectObject, {active:false});
    }
}