import ClientCore from '~/ClientCore';
import InputInterface from '~/interfaces/InputInterface';
import ControlInterface from '~/interfaces/ControlInterface';
import WorldInterface from '~/interfaces/WorldInterface';

if (!Module) console.error("Module not defined");

Module['onRuntimeInitialized'] = () => {
    console.log("Runtime initialized!");

    let controlInterface = new ControlInterface(Module);
    let inputInterface = new InputInterface(Module);
    let worldInterface = new WorldInterface(Module);
    let clientCore = new ClientCore(controlInterface, inputInterface, worldInterface);
    clientCore.start();
};

console.log("STARTING");
