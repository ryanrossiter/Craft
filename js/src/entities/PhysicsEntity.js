import SerializedObject from '~/util/SerializedObject';
import Entity from '~/entities/Entity';
import EntityTypes from '~/entities/EntityTypes';

export default class PhysicsEntity extends SerializedObject(Entity,
    EntityTypes.PHYSICS, {
    x: 0, y: 0, z: 0,
    rx: 0, ry: 0, rz: 0,
    vx: 0, vy: 0, vz: 0
}) {
    constructor(data, physMem) {
        super(data);

        this.physMem = physMem;
    }
}
