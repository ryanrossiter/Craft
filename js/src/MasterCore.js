import EntityTypes from '~/entities/EntityTypes';
import PhysicsEntity from '~/entities/PhysicsEntity';
import Defs from '~/Defs';

import MasterServer from '~/network/MasterServer';
import MasterCorePlugin from '~/network/plugins/master/MasterCorePlugin';
import EntityPlugin from '~/network/plugins/master/EntityPlugin';
import WorldPlugin from '~/network/plugins/master/WorldPlugin';
import ChatPlugin from '~/network/plugins/master/ChatPlugin';

import WorldPhysics from '~/world/WorldPhysics';
import WorldStore from '~/world/WorldStore';
import ChunkManager from '~/world/ChunkManager';
import DbChunkLoader from '~/world/DbChunkLoader';

export default class MasterCore {
    constructor(worldInterface) {
        this.physics = new WorldPhysics();

        let worldStore = new WorldStore();
        this.chunkManager = new ChunkManager(worldInterface, this.physics,
            new DbChunkLoader(worldInterface, worldStore)
        );

        this.server = new MasterServer();
        this.masterCorePlugin = new MasterCorePlugin(this);
        this.entities = new EntityPlugin(
            (e) => this.onCreateEntity(e),
            (e) => this.onDeleteEntity(e));
        this.world = new WorldPlugin(this.chunkManager, worldStore);
        this.chat = new ChatPlugin(this);

        this.server.addPlugin(this.masterCorePlugin);
        this.server.addPlugin(this.entities);
        this.server.addPlugin(this.world);
        this.server.addPlugin(this.chat);
        this.server.init();
    }

    onCreateEntity(entity) {
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
        this.lastUpdate = Date.now();
        this.updateInterval = setInterval(() => this.update(Date.now()), 50);
    }

    update(now) {
        let delta = now - this.lastUpdate;
        this.lastUpdate = now;

        this.physics.update(now);
        this.entities.update();
        this.entities.sendUpdates();
        this.masterCorePlugin.update();
    }
}
