import MasterCore from '~/MasterCore';
import WorldInterface from '~/interfaces/WorldInterface';
global.Module = require('~/../../cmake-build-debug/craft_gen.js');

console.log("Starting server...");
let worldInterface = new WorldInterface(Module);
let core = new MasterCore(worldInterface);
core.start();
