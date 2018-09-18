import ServerPlugin from '~/network/ServerPlugin';
import WorldStore from '~/world/WorldStore';

export default class WorldPlugin extends ServerPlugin {
    constructor() {
        super();
        this.worldStore = new WorldStore();

        // do a test
        this.worldStore.saveChunk({
            p: 4, q: 2, dx: 0, dy: 12, dz: 0
        });

        this.worldStore.loadChunk(4, 2).then((chunk) => {
            console.log(chunk);
        });
    }

    registerHandlers(registerHandler) {

    }
}
