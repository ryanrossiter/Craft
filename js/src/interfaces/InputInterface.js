import Interface from '~/interfaces/Interface';

export default class InputInterface extends Interface {
    constructor(Module) {
        super(Module, [
            { name: 'on_left_click', ret: 'bool' },
            { name: 'on_right_click', ret: 'bool' },
            // { name: 'on_middle_click' }
        ])
    }
}
