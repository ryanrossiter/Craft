import SerializedObject from '~/util/SerializedObject';
import Entity from '~/entities/Entity';
import EntityTypes from '~/entities/EntityTypes';

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
        this.body.position.set(this.x, this.y, this.z);
        this.body.velocity.set(this.vx, this.vy, this.vz);
    }

    updateFromBody() {
        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.z = this.body.position.z;
        this.vx = this.body.velocity.x;
        this.vy = this.body.velocity.y;
        this.vz = this.body.velocity.z;
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
