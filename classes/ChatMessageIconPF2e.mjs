import { Settings } from "./Settings.mjs";
import { FLAGS, MODULENAME } from "./TokenColorMarker.mjs";

// A class that adds the color marker to the "target" in the chat message
// This only works for pf2e
export class ChatMessageIconPF2e {

    static addMarkerToChatMessage() {
        Hooks.on("renderChatMessage", async (message, html, data) => {
            if (game.settings.get(MODULENAME, Settings.ENABLE_ICON_IN_CHAT_MESSAGE_SETTING)) {
                // get the list of colors from the settings
                let colors = game.settings.get(MODULENAME, Settings.COLORS);
    
                //get the color markers of the target
                var markers = this.getTokenEffects(message)?.filter(m => m.getFlag(MODULENAME, FLAGS.COLORID));
    
                var icons = "";
    
                markers?.forEach(marker => {
                    var color = colors.find(c => c.id === marker.getFlag(MODULENAME, FLAGS.COLORID));
                    icons += `<i class="fa-solid fa-square-small ${MODULENAME}-icon-chat" style="color: ${color.hex};"></i>`
                });
    
                if(icons)
                {
                    var targetText = html.find('.target-dc').children().first();
                    targetText.after(icons); 
                }
            }
        });
    } 

    static getTokenEffects(message) {
        return message?.target?.actor?.items;
    }
}