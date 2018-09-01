import SerializedObject from '~/util/SerializedObject';
import Entity from '~/entities/Entity';
import EntityTypes from '~/entities/EntityTypes';

export default class PhysicsEntity extends SerializedObject(Entity,
    EntityTypes.PHYSICS, {
    x: 0, y: 25, z: 0,
    rx: 0, ry: 0, rz: 0,
    vx: 0, vy: 0, vz: 0
}, /* onChangeData */ function(k, v) {
    if (k == 'x') {
        Module.setValue(this.physMem + 0 * 4, v, 'float');
    } else if (k == 'y') {
        Module.setValue(this.physMem + 1 * 4, v, 'float');
    } else if (k == 'z') {
        Module.setValue(this.physMem + 2 * 4, v, 'float');
    } else if (k == 'rx') {
        Module.setValue(this.physMem + 3 * 4, v, 'float');
    } else if (k == 'ry') {
        Module.setValue(this.physMem + 4 * 4, v, 'float');
    }
}, /* onUpdateData */ function(k, v) {
    
}) {
    constructor(data, physMem) {
        super(data);

        this.physMem = physMem;
    }
}
