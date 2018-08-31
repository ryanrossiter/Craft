import Interface from '~/interfaces/Interface';

class ControlInterface extends Interface {
    constructor(Module) {
        super(Module, [
            { name: 'init', ret: 'number' },
            { name: 'shutdown' },
            { name: 'run_frame' }
        ])
    }
}

export default ControlInterface;