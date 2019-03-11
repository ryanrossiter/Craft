import SerializedObject from '~/util/SerializedObject';
import Entity from '~/entities/Entity';
import EntityTypes from '~/entities/EntityTypes';
import vec3 from 'gl-vec3'

export default class PhysicsEntity extends SerializedObject(Entity,
    EntityTypes.PHYSICS, {
    x: 0, y: 0, z: 0,
    rx: 0, ry: 0, rz: 0,
    vx: 0, vy: 0, vz: 0
}) {
    constructor(data) {
        super(data);

        this.body = this.createBody();
    }

    createBody() {
        /* override */
        throw Error("PhysicsEntity.createBody must be overridden");
    }

    onUpdateData() {
        this.body.setPosition([this.x, this.y, this.z]);
        vec3.set(this.body.velocity, this.vx, this.vy, this.vz);
    }

    updateFromBody() {
        this.x = this.body.getPosition()[0];
        this.y = this.body.getPosition()[1];
        this.z = this.body.getPosition()[2];
        this.vx = this.body.velocity[0];
        this.vy = this.body.velocity[1];
        this.vz = this.body.velocity[2];
    }

    clientUpdate() {
        super.clientUpdate();
        this.updateFromBody();
    }

    serverUpdate() {
        super.serverUpdate();
        this.updateFromBody();
    }
}
