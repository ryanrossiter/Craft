class Interface {
    constructor(Module, functionDefs) {
        for (let func of functionDefs) {
            this[func.name] = Module.cwrap(func.name, func.ret, func.args);
        }
    }
}

export default Interface;