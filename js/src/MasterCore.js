import EntityTypes from '~/entities/EntityTypes';
import Defs from '~/Defs';

import MasterServer from '~/network/MasterServer';
import MasterCorePlugin from '~/network/plugins/MasterCorePlugin';

export default class MasterCore {
    constructor() {
        this.server = new MasterServer();
        this.masterCorePlugin = new MasterCorePlugin(this);

        this.server.addPlugin(this.masterCorePlugin);
        this.server.init();
    }

    start() {
        this.lastUpdate = Date.now();
        this.updateInterval = setInterval(() => this.update(Date.now()), 50);
    }

    update(now) {
        let delta = now - this.lastUpdate;
        this.lastUpdate = now;

        // do updates
    }
}
