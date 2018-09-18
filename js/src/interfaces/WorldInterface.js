import Interface from '~/interfaces/Interface';

export default class WorldInterface extends Interface {
    constructor(Module) {
        super(Module, [
            { name: 'find_chunk', args: ['i32', 'i32'] },
            { name: 'get_unused_chunk_mem_location' },
            { name: 'init_chunk', args: ['*', 'i32', 'i32'] },
            { name: 'delete_chunk', args: ['*'] },
            { name: 'gen_chunk', args: ['*'] },
        ])
    }
}
