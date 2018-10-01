import ServerPlugin from '~/network/ServerPlugin';
import EntityTypes from '~/entities/EntityTypes';
import Defs from '~/Defs';

export default class ChatPlugin extends ServerPlugin {
    constructor(masterCore) {
        super();

        this.masterCore = masterCore;
    }

    registerHandlers(registerHandler) {
        registerHandler('chat.message', (socket, { msg }) => {
            if (msg[0] === '/') {
                // command
                let args = msg.slice(1).split(' ');
                if (args[0] === 'timeset') {
                    if (args[1] === 'day') {
                        this.masterCore.masterCorePlugin.gameTime = Defs.TIME_DAY;
                    } else if (args[1] === 'night') {
                        this.masterCore.masterCorePlugin.gameTime = Defs.TIME_NIGHT;
                    } else {
                        socket.emit('chat.message', { msg: "USAGE: timeset [day|night|time]" });
                    }
                } else {
                    socket.emit('chat.message', { msg: "Unknown command" });
                }
            } else {
                let player = this.masterCore.masterCorePlugin.getPlayer(socket.id);
                let playerName = player? player.name : "?????";
                let formattedMsg = `${playerName}: ${msg}`;
                this.emit('chat.message', { msg: formattedMsg });
            }
        });
    }
}
