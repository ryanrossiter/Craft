import { chunked } from '~/world/ChunkUtils';
import CANNON from 'cannon';

const DEFAULT_FOV = 85;
const RUNNING_FOV = 100;
const ACCEL = 1.4;
const RUN_ACCEL = 3;
const JUMP_TIMER = 300;
const JUMP_FORCE = 10;

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
        this.jumping = false;
        this.running = false;
        this.ortho = false;
        this.fov = DEFAULT_FOV;

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

            if (evt.code === 'Space' || evt.code === 'F1') {
                evt.preventDefault(); // stop space from scrolling page
            }
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
                let x = this.clientCore.model.getMemoryValue('px');
                let y = this.clientCore.model.getMemoryValue('py');
                let z = this.clientCore.model.getMemoryValue('pz');
                this.clientCore.world.modifyBlock(x, y, z, 0, 0);

                let chunk = this.clientCore.chunkManager.getChunk(chunked(x), chunked(z), chunked(y));
                chunk.setBlock(x, y, z, 0, 0);
            }
        } else if (evt.button === 1) {
            this.inputInterface.on_middle_click();
        } else if (evt.button === 2) {
            var valid = this.inputInterface.on_right_click();
            if (valid) {
                let x = this.clientCore.model.getMemoryValue('px');
                let y = this.clientCore.model.getMemoryValue('py');
                let z = this.clientCore.model.getMemoryValue('pz');
                this.clientCore.world.modifyBlock(x, y, z, 0, 1);

                let chunk = this.clientCore.chunkManager.getChunk(chunked(x), chunked(z), chunked(y));
                chunk.setBlock(x, y, z, 0, 1);
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
        else if (evt.code == 'Space') {
            if (pressed && this.jumping <= 0) {
                this.jumping = JUMP_TIMER;
            } else if (!pressed && this.jumping > 0) {
                this.jumping = 0;
            }
        } else if (evt.code == 'ShiftLeft') this.running = pressed;
        else if (evt.code == 'F1' && !pressed) {
            this.ortho = !this.ortho;
            this.clientCore.model.setMemoryValue('ortho', this.ortho? 30 : 0);
        } else if (evt.code == 'KeyW') this.up = pressed;
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
            return new CANNON.Vec3(0,0,0);
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
            return new CANNON.Vec3(Math.cos(this.player.rx + strafe) * m, y, Math.sin(this.player.rx + strafe) * m);
        } else {
            return new CANNON.Vec3(Math.cos(this.player.rx + strafe), 0, Math.sin(this.player.rx + strafe));
        }
    }

    update(delta) {
        let accel = (this.running? RUN_ACCEL : ACCEL);
        let motion = this.getMotionVector().scale(accel * delta);
        if (this.flying) {
            // I have no idea why you gotta multiply mass by 3
            motion.vsub(this.clientCore.physics.gravity.scale(this.player.body.mass * 3), motion);
        }

        this.player.body.force.vadd(motion, this.player.body.force);

        if (this.jumping > 0) {
            let jump_delta = Math.min(delta, this.jumping);
            let jump_fac = Math.pow(this.jumping / JUMP_TIMER, 2);
            this.player.body.applyLocalForce(new CANNON.Vec3(0, JUMP_FORCE * jump_fac * jump_delta, 0), new CANNON.Vec3(0, 0, 0));
            this.jumping -= delta;
        } else {
            this.jumping = 0;
        }
        //console.log(this.player.body.velocity);

        let targetFov = this.running? RUNNING_FOV : DEFAULT_FOV;
        this.fov += (targetFov - this.fov) * 0.1;
        this.clientCore.model.setMemoryValue('fov', this.fov);
    }
}
