import Player from '~/entities/Player';
import MemoryBackedObject from '~/util/MemoryBackedObject';
import { PlayerStruct } from '~/StructDefs';

export default class ClientPlayer extends MemoryBackedObject(Player, PlayerStruct) {
    constructor(data={}) {
        super(data);
    }

    onChangeData(k, v) {
        if (['x', 'y', 'z', 'rx', 'ry'].includes(k)) {
            this.setMemoryValue(`state.${k}`, v);
        }

        super.onChangeData(...arguments);
    }
}
