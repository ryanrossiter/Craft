import EntityTypes from '~/entities/EntityTypes';
import Defs from '~/Defs';

import MasterServer from '~/network/MasterServer';
import MasterCorePlugin from '~/network/plugins/master/MasterCorePlugin';
import EntityPlugin from '~/network/plugins/master/EntityPlugin';

export default class MasterCore {
    constructor() {
        this.server = new MasterServer();
        this.masterCorePlugin = new MasterCorePlugin(this);
        this.entities = new EntityPlugin();

        this.server.addPlugin(this.masterCorePlugin);
        this.server.addPlugin(this.entities);
        this.server.init();
    }

    start() {
        this.lastUpdate = Date.now();
        this.updateInterval = setInterval(() => this.update(Date.now()), 50);
    }

    update(now) {
        let delta = now - this.lastUpdate;
        this.lastUpdate = now;

        this.entities.update();
        this.entities.sendUpdates();
    }
}
