import CANNON from 'cannon';
import Defs from '~/Defs';
import WorldNarrowphase from '~/world/WorldNarrowphase';
import physicsMaterial from '~/world/physicsMaterial';

export default class WorldPhysics extends CANNON.World {
    constructor() {
        super(...arguments);
        this.quatNormalizeSkip = 0;
        this.quatNormalizeFast = false;

        let solver = new CANNON.GSSolver();

        this.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.defaultContactMaterial.contactEquationRelaxation = 4;
        solver.iterations = 7;
        solver.tolerance = 0.1;
        this.solver = solver;
        //this.solver = new CANNON.SplitSolver(solver);

        this.broadphase = new CANNON.NaiveBroadphase();
        this.broadphase.useBoundingBoxes = true;
        this.narrowphase = new WorldNarrowphase(this);
        this.timeStep = 1 / Defs.PHYSICS_STEP_FREQUENCY;
        this.lastUpdate = 0;
        this.gravity.set(0, -2, 0); // m/s^2

        let physicsContactMaterial = new CANNON.ContactMaterial(
            physicsMaterial, physicsMaterial, {
                friction: 0.0,
                restitution: 0.1
            });
        this.addContactMaterial(physicsContactMaterial);

        // let box = new CANNON.Body({
        //     type: CANNON.Body.STATIC,
        //     material: physicsMaterial,
        //     shape: new CANNON.Box(new CANNON.Vec3(Defs.WORLD_SCALE, Defs.WORLD_SCALE, Defs.WORLD_SCALE)),
        //     position: new CANNON.Vec3(-2, 16, -2)
        // });
        // this.addBody(box);
    }

    // updateBounds(aabbMin, aabbMax) {
    //     this.broadphase
    // }

    update(now) {
        let start = Date.now();
        if (this.lastUpdate === 0) {
            this.step(this.timeStep);
        } else {
            let delta = now - this.lastUpdate;
            if (delta >= 0) {
                this.step(this.timeStep, delta, Defs.PHYSICS_MAX_SUB_STEPS);
            }
        }

        this.lastUpdate = now;
    }
}
