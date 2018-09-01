import Player from '~/entities/Player';
import PlayerController from '~/PlayerController';

export default class ClientCore {
    constructor(controlInterface, inputInterface) {
        this.controlInterface = controlInterface;
        this.inputInterface = inputInterface;

        let player = new Player({}, this.controlInterface.get_players_mem_location());
        this.playerController = new PlayerController(player, this.inputInterface);
    }

    start() {
        let status = this.controlInterface.init();
        if (status !== 0) {
            throw "Failed to initialize core";
        }
        
        this.lastFrame = performance.now();
        this.runFrame(performance.now());
    }

    runFrame(now) {
        let delta = now - this.lastFrame;
        this.lastFrame = now;
        
        this.playerController.update(delta);
        this.controlInterface.run_frame();
        window.requestAnimationFrame((now) => this.runFrame(now));
    }
}
