import EntityTypes from '~/entities/EntityTypes';
import ClientPlayer from '~/entities/client/ClientPlayer';
import ClientModel from '~/ClientModel';
import PlayerController from '~/PlayerController';

import ClientServer from '~/network/ClientServer';
import ClientCorePlugin from '~/network/plugins/ClientCorePlugin';
import TimeKeeperPlugin from '~/network/plugins/TimeKeeperPlugin';
import PlayerPlugin from '~/network/plugins/PlayerPlugin';
import EntityPlugin from '~/network/plugins/EntityPlugin';

export default class ClientCore {
    constructor(controlInterface, inputInterface) {
        this.controlInterface = controlInterface;
        this.inputInterface = inputInterface;
        this.state = {
            playerId: undefined
        };

        this.model = new ClientModel(this.controlInterface.get_model_mem_location());
        this.player = new ClientPlayer({});
        this.playerController = new PlayerController(this.player, this.inputInterface);

        this.server = new ClientServer();
        this.clientCorePlugin = new ClientCorePlugin(this);
        this.time = new TimeKeeperPlugin();
        this.players = new PlayerPlugin();
        this.entities = new EntityPlugin(this.time, (e) => onCreateEntity(e));

        this.server.addPlugin(this.clientCorePlugin);
        this.server.addPlugin(this.time);
        this.server.addPlugin(this.players);
        this.server.addPlugin(this.entities);
        this.server.start();

        this.clientCorePlugin.join();
    }

    onJoin(playerId) {
        this.state.playerId = playerId;
    }

    onCreateEntity(entity) {
        if (entity.type === EntityTypes.PLAYER) {
            if (entity.id === this.state.playerId) {
                entity.clientControlled = true;
                entity.assignMemoryPosition(this.model.getMemoryPosition('players'));
            } else {
                //entity.assignMemoryPosition(this.controlInterface.get_empty_player_mem_location());
            }
        }
    }

    start() {
        let status = this.controlInterface.init();
        if (status !== 0) {
            throw "Failed to initialize core";
        }

        // setTimeout(() => {
        //     console.log("Swapping chunks...");
        //     let chunk0 = new Chunk(this.model.getMemoryPosition('chunks'));
        //     let chunk1 = new Chunk(this.model.getMemoryPosition('chunks') + chunk0.size);
        //     let c0p = chunk0.getMemoryValue('p'), c0q = chunk0.getMemoryValue('q');
        //     let c1p = chunk1.getMemoryValue('p'), c1q = chunk1.getMemoryValue('q');
        //     chunk1.setMemoryValue('p', c0p);
        //     chunk1.setMemoryValue('q', c0q);
        //     chunk1.setMemoryValue('map.dx', c0p * 32 - 1);
        //     chunk1.setMemoryValue('map.dz', c0q * 32 - 1);
        //     chunk0.setMemoryValue('p', c1p);
        //     chunk0.setMemoryValue('q', c1q);
        //     chunk0.setMemoryValue('map.dx', c1p * 32 - 1);
        //     chunk0.setMemoryValue('map.dz', c1q * 32 - 1);
        //     chunk0.setMemoryValue('dirty', 1);
        //     chunk1.setMemoryValue('dirty', 1);
        // }, 3000);

        this.lastFrame = performance.now();
        window.requestAnimationFrame((now) => this.runFrame(now));
    }

    runFrame(now) {
        let delta = now - this.lastFrame;
        this.lastFrame = now;

        this.entities.update();
        
        this.playerController.update(delta);
        this.controlInterface.run_frame();
        window.requestAnimationFrame((now) => this.runFrame(now));
    }
}
