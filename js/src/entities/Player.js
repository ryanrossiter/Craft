import SerializedObject from '~/util/SerializedObject';
import PhysicsEntity from '~/entities/PhysicsEntity';
import EntityTypes from '~/entities/EntityTypes';
// import CANNON from 'cannon';
// import physicsMaterial from '~/world/physicsMaterial';
import RigidBody from '~/../node_modules/voxel-physics-engine/src/rigidBody'
import aabb from 'aabb-3d'
import vec3 from 'gl-vec3'
import Defs from '~/Defs'

export default class Player extends SerializedObject(PhysicsEntity,
    EntityTypes.PLAYER, {
    name: "Nemp",
    currentItem: Defs.BUILD_MODE.SINGLE
}) {
    constructor(data, mem) {
        super(data, mem + 4 + 32);
    }

    createBody() {
        let b = new RigidBody(new aabb([0,0,0], [3,6,3]), 1, 1, 0, 1, () => {}, 1);
        b.setPosition([this.x, this.y, this.z]);
        return b;

        // let radius = 1.4;
        // let height = 4.5;
        // let segments = 15;
        // // let shape = new CANNON.Cylinder(radius, radius, height, segments);
        // let shape = new CANNON.Sphere(radius);
        
        // // orient cylinder along y-axis
        // // let quat = new CANNON.Quaternion();
        // // quat.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
        // // shape.transformAllPoints(new CANNON.Vec3(0,0,0), quat);

        // let body = new CANNON.Body({
        //     type: CANNON.Body.DYNAMIC,
        //     mass: 10,
        //     position: new CANNON.Vec3(this.x, this.y, this.z),
        //     velocity: new CANNON.Vec3(this.vx, this.vy, this.vz),
        //     shape: shape,
        //     material: physicsMaterial,
        //     fixedRotation: true,
        //     linearDamping: 0.7
        // });
        // body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, -height + radius, 0));

        // return body;
    }
}