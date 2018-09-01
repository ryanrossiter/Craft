import Interface from '~/interfaces/Interface';

export default class InputInterface extends Interface {
    constructor(Module) {
        super(Module, [
            { name: 'on_left_click', ret: 'bool' },
            { name: 'on_right_click', ret: 'bool' },
            { name: 'on_middle_click' },
            { name: 'on_mouse_move', args: ['number', 'number'] },
            { name: 'action_create_block' },
            { name: 'action_destroy_block' }
        ])
    }
}
