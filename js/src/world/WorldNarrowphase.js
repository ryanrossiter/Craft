import CANNON from 'cannon';
import Defs from '~/Defs';
import { isBlockSolid } from '~/world/ChunkUtils';
import physicsMaterial from '~/world/physicsMaterial';
import BodyPool from '~/world/BodyPool';

const halfBlockSize = new CANNON.Vec3(Defs.WORLD_SCALE / 2, Defs.WORLD_SCALE / 2, Defs.WORLD_SCALE / 2);
const blockShape = new CANNON.Box(halfBlockSize);

export default class WorldNarrowphase extends CANNON.Narrowphase {
    constructor(...args) {
        super(...args);
        // this.bodyPool = new BodyPool(15, {
        //     type: CANNON.Body.STATIC,
        //     mass: 0,
        //     material: physicsMaterial,
        //     shape: blockShape
        // });

        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.SPHERE] =
        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.BOX] =
        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.COMPOUND] =
        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.CONVEXPOLYHEDRON] =
        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.HEIGHTFIELD] =
        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.PARTICLE] =
        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.CYLINDER] =
        this[Defs.SHAPE_TYPE_CHUNK | CANNON.Shape.types.TRIMESH] =
            this.doChunkCollision;
    }

    chunkAABBCollision(chunkAABB, otherAABB, callback) {
        if (chunkAABB.overlaps(otherAABB) === false) return;

        let low = otherAABB.lowerBound;
        let high = otherAABB.upperBound;
        for (let x = Math.floor(low.x); x <= Math.ceil(high.x); x++) {
            if (x < chunkAABB.lowerBound.x || x >= chunkAABB.upperBound.x) continue;
            for (let y = Math.floor(low.y); y <= Math.ceil(high.y); y++) {
                if (y < chunkAABB.lowerBound.y || y >= chunkAABB.upperBound.y) continue;
                for (let z = Math.floor(low.z); z <= Math.ceil(high.z); z++) {
                    if (z < chunkAABB.lowerBound.z || z >= chunkAABB.upperBound.z) continue;

                    let br = callback(x, y, z);
                    if (br) return true;
                }
            }   
        }
    }

    doChunkCollision(si,sj,xi,xj,qi,qj,bi,bj,rsi,rsj,justTest) {
        // console.log(bi.aabb.lowerBound);

        let map = bj.chunk.getMap();
        let n = [];
        let br = this.chunkAABBCollision(bj.aabb, bi.aabb, (x, y, z) => {
            if (isBlockSolid(bj.chunk.getBlock(x, y, z, map))) {
                //let blockBody = this.bodyPool.init(x, y, z);
                let blockBody = new CANNON.Body({
                    type: CANNON.Body.STATIC,
                    mass: 0,
                    material: physicsMaterial,
                    shape: blockShape,
                    position: new CANNON.Vec3(x, y, z),
                });

                n.push([x,y,z]);
                // override current contact material with one from material pairing w blockBody
                this.currentContactMaterial = this.world.getContactMaterial(blockBody.material, bi.material)
                    || this.currentContactMaterial;

                // the order of arguments is dependent on the order of types
                if (CANNON.Shape.types.BOX < si.type) {
                    return this[CANNON.Shape.types.BOX | si.type](
                        blockShape, si,
                        blockBody.position, xi,
                        blockBody.quaternion, qi,
                        blockBody, bi,
                        blockShape, si,
                        justTest);
                } else {
                    return this[CANNON.Shape.types.BOX | si.type](
                        si, blockShape,
                        xi, blockBody.position,
                        qi, blockBody.quaternion,
                        bi, blockBody,
                        si, blockShape,
                        justTest);
                }
            }
        });

        //console.log(n.length);
        if (br && justTest) return true;
    }

    postStep() {
        // this.bodyPool.freeAll();
    }
}