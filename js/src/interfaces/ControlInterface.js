import Interface from '~/interfaces/Interface';

export default class ControlInterface extends Interface {
    constructor(Module) {
        super(Module, [
            { name: 'init', ret: 'number' },
            { name: 'shutdown' },
            { name: 'run_frame' },
            { name: 'get_model_mem_location' },
            { name: 'get_unused_player_mem_location' },
            { name: 'get_players_mem_location' },
            { name: 'get_workers_mem_location' },
            { name: 'get_chunks_mem_location' },
        ])
    }
}
