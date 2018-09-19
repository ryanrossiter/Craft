import CANNON from 'cannon';
let { Vec3 } = CANNON;

const SPEED = 0.01;

export default class PlayerController {
    constructor(player, clientCore) {
        this.player = player;
        this.clientCore = clientCore;
        this.inputInterface = clientCore.inputInterface;
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.dx = 0;
        this.dz = 0;
        this.flying = false;

        let canvas = document.querySelector('#canvas');
        canvas.addEventListener('mousedown', (evt) => {
            if (document.pointerLockElement !== canvas
                && document.mozPointerLockElement !== canvas) return;
            this.onMouseDown(evt)
        });

        canvas.addEventListener('mousemove', (evt) => {
            if (document.pointerLockElement !== canvas
                && document.mozPointerLockElement !== canvas) return;
            this.onMouseMove(evt)
        });

        document.addEventListener('keydown', (evt) => {
            if (document.pointerLockElement !== canvas
                && document.mozPointerLockElement !== canvas) return;
            this.onKeyChanged(evt, true);
        });

        document.addEventListener('keyup', (evt) => {
            if (document.pointerLockElement !== canvas
                && document.mozPointerLockElement !== canvas) return;
            this.onKeyChanged(evt, false);
        });
    }

    onMouseDown(evt) {
        if (evt.button === 0) {
            let valid = this.inputInterface.on_left_click();
            if (valid) {
                this.clientCore.world.modifyBlock(
                    this.clientCore.model.getMemoryValue('px'),
                    this.clientCore.model.getMemoryValue('py'),
                    this.clientCore.model.getMemoryValue('pz'),
                    0, 0);

                this.inputInterface.action_destroy_block();
            }
        } else if (evt.button === 1) {
            this.inputInterface.on_middle_click();
        } else if (evt.button === 2) {
            var valid = this.inputInterface.on_right_click();
            if (valid) {
                this.clientCore.world.modifyBlock(
                    this.clientCore.model.getMemoryValue('px'),
                    this.clientCore.model.getMemoryValue('py'),
                    this.clientCore.model.getMemoryValue('pz'),
                    0, 1);//this.clientCore.model.getMemoryValue('item_index'));

                this.inputInterface.action_create_block();
            }
        }
    }

    onMouseMove(evt) {
        let m = 0.0025;
        let rx = this.player.rx;
        let ry = this.player.ry;
        rx += evt.movementX * m;
        ry -= evt.movementY * m;

        if (rx < 0) {
            rx += Math.PI * 2;
        } else if (rx >= Math.PI * 2) {
            rx -= Math.PI * 2;
        }

        ry = Math.max(ry, -Math.PI / 2);
        ry = Math.min(ry, Math.PI / 2);

        this.player.rx = rx;
        this.player.ry = ry;
    }

    onKeyChanged(evt, pressed) {
        if (evt.code == 'Tab' && !pressed) this.flying = !this.flying;
        else if (evt.code == 'KeyW') this.up = pressed;
        else if (evt.code == 'KeyS') this.down = pressed;
        else if (evt.code == 'KeyA') this.left = pressed;
        else if (evt.code == 'KeyD') this.right = pressed;

        this.dx = this.dz = 0;
        if (this.up) this.dz--;
        if (this.down) this.dz++;
        if (this.left) this.dx--;
        if (this.right) this.dx++;
    }

    getMotionVector() {
        if (this.dx === 0 && this.dz === 0) {
            return new Vec3(0,0,0);
        }

        let strafe = Math.atan2(this.dz, this.dx);
        if (this.flying) {
            let m = Math.cos(this.player.ry);
            let y = Math.sin(this.player.ry);
            if (this.dx !== 0) {
                if (this.dz === 0) {
                    y = 0;
                }
                m = 1;
            }
            if (this.dz > 0) {
                y = -y;
            }
            return new Vec3(Math.cos(this.player.rx + strafe) * m, y, Math.sin(this.player.rx + strafe) * m);
        } else {
            return new Vec3(Math.cos(this.player.rx + strafe), 0, Math.sin(this.player.rx + strafe));
        }
    }

    update(delta) {
        let motion = this.getMotionVector().scale(SPEED * delta);
        this.player.x += motion.x;
        this.player.y += motion.y;
        this.player.z += motion.z;
    }
}
