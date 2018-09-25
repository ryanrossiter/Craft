import SerializedObject from '~/util/SerializedObject'
import EntityTypes from '~/entities/EntityTypes';

export default class Entity extends SerializedObject(null,
    EntityTypes.ENTITY, {
    _static: [],
    id: undefined,
    player: null
}, /* onChangeData */ function(k, v) {
    
}) {
    constructor(data) {
        super(data);

        this.dirty = false;
        this.deleted = false;
        this.clientControlled = false;
    }

    serverUpdate() {}

    clientUpdate() {}

    onDelete() {}
}
