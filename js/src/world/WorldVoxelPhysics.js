import CANNON from 'cannon';
import Defs from '~/Defs';
import WorldNarrowphase from '~/world/WorldNarrowphase';
import physicsMaterial from '~/world/physicsMaterial';
import makePhysics from 'voxel-physics-engine';
import {chunked, isBlockSolid} from '~/world/ChunkUtils';

export default class WorldVoxelPhysics {
    constructor(chunkManager) {
        this.lastUpdate = 0;
        this.timeStep = 1 / Defs.PHYSICS_STEP_FREQUENCY;
        this.phys = makePhysics({
            gravity: [0, -10, 0]
        }, (x, y, z) => {
            let chunk = chunkManager.getChunk(chunked(x), chunked(z), chunked(y));
            if (!chunk) return true;
            return isBlockSolid(chunk.getBlock(x, y, z));
        }, (x, y, z) => false);
    }

    addBody() {
        this.phys.addBody(...arguments);
    }

    update(now) {
        let start = Date.now();
        if (this.lastUpdate === 0) {
            this.phys.tick(this.timeStep);
        } else {
            let delta = now - this.lastUpdate;
            if (delta >= 0) {
                this.phys.tick(delta);
            }
        }

        this.lastUpdate = now;
    }
}
