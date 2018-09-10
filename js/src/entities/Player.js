import SerializedObject from '~/util/SerializedObject';
import PhysicsEntity from '~/entities/PhysicsEntity';
import EntityTypes from '~/entities/EntityTypes';

export default class Player extends SerializedObject(PhysicsEntity,
    EntityTypes.PLAYER, {
    name: "Nemp"
}) {
    constructor(data, mem) {
        super(data, mem + 4 + 32);
    }
}