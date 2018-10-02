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
    }

    onDelete() {
        this.setMemoryValue('id', 0);
    }

    onChangeData(k, v) {
        if (k === 'currentItem') {
            this.setMemoryValue('current_item', v);
        } else if (['x', 'y', 'z', 'rx', 'ry'].includes(k)) {
            this.setMemoryValue(`state.${k}`, v);
        }

        super.onChangeData(...arguments);
    }
}
