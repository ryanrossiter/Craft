class ClientCore {
    constructor(controlInterface, inputInterface) {
        this.controlInterface = controlInterface;
        this.inputInterface = inputInterface;
        this.canvas = document.querySelector('#canvas');

        this.canvas.addEventListener('mousedown', (evt) => {
            if (evt.button === 0) {
                let valid = this.inputInterface.on_left_click();
                if (valid) {
                    this.inputInterface.action_destroy_block();
                }
            } else if (evt.button === 1) {
                this.inputInterface.on_middle_click();
            } else if (evt.button === 2) {
                var valid = this.inputInterface.on_right_click();
                if (valid) {
                    this.inputInterface.action_create_block();
                }
            }
        });

        this.canvas.addEventListener('mousemove', (evt) => {
            this.inputInterface.on_mouse_move(evt.movementX, evt.movementY);
        });
    }

    start() {
        let status = this.controlInterface.init();
        if (status !== 0) {
            throw "Failed to initialize core";
        }
        
        this.runFrame();
    }

    runFrame() {
        this.controlInterface.run_frame();
        window.requestAnimationFrame(() => this.runFrame());
    }
}

export default ClientCore;