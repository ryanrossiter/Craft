import EntityTypes from '~/entities/EntityTypes';
import ClientPlayer from '~/entities/client/ClientPlayer';
import ClientModel from '~/ClientModel';
import PlayerController from '~/PlayerController';

import ClientServer from '~/network/ClientServer';
import ClientCorePlugin from '~/network/plugins/client/ClientCorePlugin';
import TimeKeeperPlugin from '~/network/plugins/client/TimeKeeperPlugin';
import EntityPlugin from '~/network/plugins/client/EntityPlugin';

import ChunkManager from '~/world/ChunkManager';
import GenChunkLoader from '~/world/GenChunkLoader';

export default class ClientCore {
    constructor(controlInterface, inputInterface, worldInterface) {
        this.controlInterface = controlInterface;
        this.inputInterface = inputInterface;
        this.worldInterface = worldInterface;
        this.state = {
            playerId: undefined
        };

        this.chunkManager = new ChunkManager(worldInterface,
            new GenChunkLoader(worldInterface)
        );

        this.model = new ClientModel();
        this.model.assignMemory(this.controlInterface.get_model_mem_location());
        this.playerController = null;

        this.server = new ClientServer();
        this.clientCorePlugin = new ClientCorePlugin(this);
        this.time = new TimeKeeperPlugin();
        this.entities = new EntityPlugin(this.time, (e) => this.onCreateEntity(e));

        this.server.addPlugin(this.clientCorePlugin);
        this.server.addPlugin(this.time);
        this.server.addPlugin(this.entities);
        this.server.init();

        this.clientCorePlugin.join();
    }

    onJoin(playerId) {
        this.state.playerId = playerId;
        console.log("Joined server.");
    }

    onCreateEntity(entity) {
        if (entity.type === EntityTypes.PLAYER) {
            if (entity.player === this.state.playerId) {
                entity.clientControlled = true;
                entity.assignMemory(this.model.getMemoryPosition('players'));
                entity.refreshData();

                this.playerController = new PlayerController(entity, this.inputInterface);
            } else {
                console.log("Created other player");
                entity.assignMemory(this.controlInterface.get_unused_player_mem_location());
                entity.refreshData();
            }
        }
    }

    start() {
        let status = this.controlInterface.init();
        if (status !== 0) {
            throw "Failed to initialize core";
        }

        this.lastFrame = performance.now();
        window.requestAnimationFrame((now) => this.runFrame(now));
    }

    runFrame(now) {
        let delta = now - this.lastFrame;
        this.lastFrame = now;

        this.entities.update();
        
        if (this.playerController) {
            this.chunkManager.ensureChunks(
                this.playerController.player.x,
                this.playerController.player.z
            );
            this.playerController.update(delta);
        }
        this.controlInterface.run_frame();
        window.requestAnimationFrame((now) => this.runFrame(now));
    }
}
