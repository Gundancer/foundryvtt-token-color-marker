import { Settings } from "./Settings.mjs";

export const MODULENAME = "token-color-marker";

const RAINBOWMARKER = `modules/${MODULENAME}/icons/rainbow.webp`
const WHITEMARKER = `modules/${MODULENAME}/icons/white-marker.webp`;

const FLAGS = {
    COLORMARKERCLASS: 'colorMarkerClass',
}

// A class that contains the main functionality for the module
export class TokenColorMarker {
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
            this.addTokenColorMarkerUI(app, html, data);
            
            // register click event listener for token color marker button
            html.on('click', `.control-icon[data-action="${MODULENAME}"]`, (event) => {
                this.activateTokenColorMarkerButton($(event.currentTarget), app);
            });
    
            let palette = html.find(`.${MODULENAME}-palette`);

            // register click event listener for token color marker palette icons
            palette.on('click', `.${MODULENAME}`, (event) => {
                this.clickMarkerPaletteIcons(event, app, data);
            });

            // register right click event listener for token color marker palette icons
            palette.on('contextmenu', `.${MODULENAME}`, (event) => {
                this.clickMarkerPaletteIcons(event, app, data);
            });
    
            // register click event listener for effects button
            html.on('click', '.control-icon[data-action="effects"]', (event) => {
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
            let activeColor = tokenHUD.object.document.getFlag(`${MODULENAME}`, color.id);
            markers = markers.concat(
                `<div class="${MODULENAME} ${activeColor ?? ''}" data-color-id="${color.id}" id="${MODULENAME}-${color.id}" title="${color.label}">
                    <i class="fa-solid fa-square-small" style="color: ${color.hex}; font-size: 25px; display: block;"></i>
                 </div>`
            );
        });

        // This will check if a token has a color marker still on it that has been deleted. If it does, a trash icon
        // will be visible on the palette to remove them.
        let showTrash = false;
        let colorFlags = tokenHUD.object.document.flags[MODULENAME];
        if(colorFlags) {
            Object.entries(colorFlags)?.forEach(colorFlag => {
                if(colorFlag[0] !== FLAGS.COLORMARKERCLASS && !colors.find(x => x.id === colorFlag[0]))
                {
                    showTrash = true;
                }
            });
        }

        // check if token color marker "control-icon" is active when the TokenHUD gets refreshed.
        // the refresh happens during "ToggleEffect". delete the flag after one time use.
        let active = tokenHUD.object.document.getFlag(`${MODULENAME}`, FLAGS.COLORMARKERCLASS);
        tokenHUD.object.document.unsetFlag(`${MODULENAME}`, FLAGS.COLORMARKERCLASS);

        // create localized tooltip for button
        const buttonTooltip = game.i18n.localize(`${MODULENAME}.button-title`);
        const trashTooltip = game.i18n.localize(`${MODULENAME}.trash-button-title`);

        // insert a button at the top of this element
        rightButtonColumn.prepend(
            `<div class="control-icon ${active ?? ''}" data-action="${MODULENAME}">
                <img src="${RAINBOWMARKER}" width="36" height="36" title="${buttonTooltip}">
                <div class="${MODULENAME}-palette ${active ?? ''}">
                    ${markers}
                    <i id="remove-deleted-colors" class="fas fa-trash ${showTrash ? 'active' : ''}" title="${trashTooltip}"></i>
                </div>
            </div>`
        );
    }

    static activateTokenColorMarkerButton(colorMarkerButton, tokenHUD) {
        // Activate the token color marker button and palette
		colorMarkerButton[0].classList.toggle("active");
        colorMarkerButton[0].querySelector(`.${MODULENAME}-palette`).classList.toggle("active");

        // Deactivate the effects button and status effects palette
        tokenHUD._statusEffects = false;
        let effectsButton = colorMarkerButton.parent().find('.control-icon[data-action="effects"]')[0];
        effectsButton.classList.remove("active");
        const palette = effectsButton.querySelector(".status-effects");
        palette.classList.remove("active");
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
        await tokenHUD.object.document.setFlag(`${MODULENAME}`, FLAGS.COLORMARKERCLASS, 'active');

        let isActive;

        // toggle flag to store what markers are set on the token. 
        if(tokenHUD.object.document.getFlag(`${MODULENAME}`, colorId)) {
            await tokenHUD.object.document.unsetFlag(`${MODULENAME}`, colorId);
            isActive = false;
        }
        else {
            await tokenHUD.object.document.setFlag(`${MODULENAME}`, colorId, 'active');
            isActive = true;
        }

        this.toggleMarkerToToken(tokenHUD, colorId, data, isActive);
    }

    static async toggleMarkerToToken(tokenHUD, colorId, data, isActive) {
        
        let colors = game.settings.get(MODULENAME, Settings.COLORS);
        let color = colors.find(x => x.id === colorId);

        // the marker effect to be added to the token
        let effectObject = {
            id: colorId,
            // if the color has been deleted, set the label to the color id
            label: (color ? color.label : colorId), 
            // if the color has been deleted, set the icon to the default rainbow image
            icon: `${WHITEMARKER}`,
            tint: (color ? color.hex : "#ffffff")
        }

        // toggle the marker effect
        await tokenHUD.object.toggleEffect(effectObject);
    }


    static async clickRemoveDeletedColorMarkers(event, app, data)
    {
        event.preventDefault();
        event.stopPropagation();

        // get the colors from settings
        let colors = game.settings.get(MODULENAME, Settings.COLORS);
        // get the color marker flags on the token
        let colorFlags = app.object.data.flags[MODULENAME];

        let colorFlagEntries = Object.entries(colorFlags);
        // find any deleted color markers on a token and remove them.
        for (const colorFlagEntry of colorFlagEntries) {
            if(!colors.find(x => x.id === colorFlagEntry[0])) {

                await this.clickMarkerIcon(app, colorFlagEntry[0], data);
            }
        }
    }
}