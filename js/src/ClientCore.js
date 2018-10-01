import EntityTypes from '~/entities/EntityTypes';
import ClientPlayer from '~/entities/client/ClientPlayer';
import PhysicsEntity from '~/entities/PhysicsEntity';
import ClientModel from '~/ClientModel';
import PlayerController from '~/PlayerController';

import ClientServer from '~/network/ClientServer';
import ClientCorePlugin from '~/network/plugins/client/ClientCorePlugin';
import TimeKeeperPlugin from '~/network/plugins/client/TimeKeeperPlugin';
import EntityPlugin from '~/network/plugins/client/EntityPlugin';
import WorldPlugin from '~/network/plugins/client/WorldPlugin';
import ChatPlugin from '~/network/plugins/client/ChatPlugin';

import ClientChunkManager from '~/world/ClientChunkManager';
import NetChunkLoader from '~/world/NetChunkLoader';
import WorldPhysics from '~/world/WorldPhysics';
// import GenChunkLoader from '~/world/GenChunkLoader';
import { chunked } from '~/world/ChunkUtils';

import NempGUIBuilder from '~/gui/NempGUIBuilder';

export default class ClientCore {
    constructor(controlInterface, inputInterface, worldInterface) {
        this.controlInterface = controlInterface;
        this.inputInterface = inputInterface;
        this.worldInterface = worldInterface;
        this.state = {
            playerId: undefined
        };

        this.physics = new WorldPhysics();

        this.model = new ClientModel();
        this.model.assignMemory(this.controlInterface.get_model_mem_location());
        this.playerController = null;
        this.chunkManager = null;

        this.server = new ClientServer();
        this.clientCorePlugin = new ClientCorePlugin(this);
        this.gameTime = new TimeKeeperPlugin();
        this.entities = new EntityPlugin(this.gameTime,
            (e) => this.onCreateEntity(e), (e) => this.onDeleteEntity(e));
        this.world = new WorldPlugin();
        this.chat = new ChatPlugin();

        this.server.addPlugin(this.clientCorePlugin);
        this.server.addPlugin(this.gameTime);
        this.server.addPlugin(this.entities);
        this.server.addPlugin(this.world);
        this.server.addPlugin(this.chat);
        this.server.init();

        this.gui = NempGUIBuilder.build(this.chat);

        this.clientCorePlugin.join();
    }

    onJoin(playerId) {
        this.state.playerId = playerId;
        this.chunkManager = new ClientChunkManager(this.worldInterface, this.physics,
            new NetChunkLoader(this.world)
            // new GenChunkLoader(this.worldInterface)
        );
        console.log("Joined server.");
    }

    onCreateEntity(entity) {
        if (entity.type === EntityTypes.PLAYER) {
            if (entity.player === this.state.playerId) {
                entity.clientControlled = true;
                entity.assignMemory(this.model.getMemoryPosition('players'));
                entity.refreshData();

                this.playerController = new PlayerController(entity, this);
            } else {
                console.log("Created other player");
                entity.assignMemory(this.controlInterface.get_unused_player_mem_location());
                entity.refreshData();
            }
        }

        if (entity instanceof PhysicsEntity) {
            this.physics.addBody(entity.body);
        }
    }

    onDeleteEntity(entity) {
        if (entity instanceof PhysicsEntity) {
            this.physics.removeBody(entity.body);
        }
    }

    start() {
        let status = this.controlInterface.init();
        if (status !== 0) {
            throw Error("Failed to initialize core");
        }

        this.lastFrame = performance.now();
        window.requestAnimationFrame((now) => this.runFrame(now));
    }

    runFrame(now) {
        let delta = now - this.lastFrame;
        this.lastFrame = now;

        if (this.chunkManager && this.playerController) {
            let p = chunked(this.playerController.player.x);
            let q = chunked(this.playerController.player.z);
            let r = chunked(this.playerController.player.y);
            let currentChunk = this.chunkManager.getChunk(p, q, r);
            if (currentChunk && currentChunk.loaded) {
                // only update physics if the current chunk is loaded
                this.physics.update(this.gameTime.now);
            }
        }
        this.entities.update();
        
        if (this.playerController) {
            this.playerController.update(delta);
        }

        if (this.chunkManager && this.playerController) {
            this.chunkManager.ensureChunks(
                this.playerController.player.x,
                this.playerController.player.y,
                this.playerController.player.z
            );
        }

        this.gui.update();
        this.controlInterface.run_frame();
        window.requestAnimationFrame((now) => this.runFrame(now));
    }
}
