import Player from '~/entities/Player';
import MemoryBackedObject from '~/util/MemoryBackedObject';
import { PlayerStruct } from '~/StructDefs';
import { hashCode } from '~/util/StringUtils';

export default class ClientPlayer extends MemoryBackedObject(Player, PlayerStruct) {
    constructor(data={}) {
        super(data);
    }

    initMemory() {
        this.setMemoryValue('id', hashCode(this.id));
        // TODO: On delete set id to 0
    }

    onChangeData(k, v) {
        if (['x', 'y', 'z', 'rx', 'ry'].includes(k)) {
            this.setMemoryValue(`state.${k}`, v);
        }

        super.onChangeData(...arguments);
    }
}
