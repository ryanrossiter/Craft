const ValueSizes = {
    char: 1,
    i8: 1,
    i16: 2,
    i32: 4,
    i64: 8,
    float: 4,
    double: 8,
    '*': 4, // pointer
    struct: 0 // special case, here for clarity
}

const computeMemoryDataForField = (field) => {
    let type = field.type;
    let length = field.length || 1;
    let size = 0;
    let struct, to;

    if (type === 'struct') {
        ({ memData: struct, size } = computeMemoryDataForStruct(field.struct));
    } else if (type === '*') {
        size = ValueSizes[field.type];
        if (field.to) {
            to = computeMemoryDataForField(field.to);
        } // else: just ignore, may not be required
    } else {
        size = ValueSizes[field.type];
    }

    return { type, length, size, struct, to };
}

const computeMemoryDataForStruct = (STRUCT) => {
    let memData = {};
    let offset = 0;

    for (let prop of STRUCT) {
        let field = computeMemoryDataForField(prop);

        memData[prop.name] = { offset, ...field };
        offset += field.size * field.length;
    }

    return { memData, size: offset };
}

const getFieldData = (memData, memPos, name) => {
    let names = name.split('.');
    let n = names[0];
    if (memData.hasOwnProperty(n) === false) {
        throw `Memory data doesn't contain the field ${n} (in ${name})`;
    }

    let field = memData[n];
    if (names.length === 1 && (field.type === 'struct' || field.type === '*')) {
        // Reached end of depth, return memory location
        return { pos: memPos + field.offset, type: '*' };
    } else if (field.type === 'struct') {
        return getFieldData(field.struct, memPos + field.offset, names.splice(1).join('.'));
    } else if (field.type === '*') {
        memPos = Module.getValue(memPos + field.offset, '*');
        // TODO: Access pointer value
    } else {
        return { pos: memPos + field.offset, type: field.type };
    }
}

const MemoryBackedObject = (SuperClass, STRUCT) => {
    const { memData, size } = computeMemoryDataForStruct(STRUCT);

    return class extends SuperClass {
        constructor() {
            super(...arguments);

            this.memPos = null;
        }

        assignMemoryPosition(memPos) {
            this.memPos = memPos;
        }

        get size() {
            return size;
        }

        getMemoryPosition(k) {
            if (this.memPos === null) return null;
            return getFieldData(memData, this.memPos, k).pos;
        }

        getMemoryValue(k) {
            if (this.memPos === null) return null;
            let { pos, type } = getFieldData(memData, this.memPos, k);
            return Module.getValue(pos, type);
        }

        setMemoryValue(k, v) {
            if (this.memPos === null) return null;
            // TODO: Implement setting char arrays
            let { pos, type } = getFieldData(memData, this.memPos, k);
            return Module.setValue(pos, v, type);
        }
    }
}

export default MemoryBackedObject;
