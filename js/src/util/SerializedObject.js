import { extend, mask } from '~/util/ObjectHelpers';

const SerializedObject = (SuperClass, type, SCHEMA, onChangeData, onUpdateData) => {
    // generate a *unique* data symbol for each class
    let _data = Symbol('data');
    if (!SuperClass) {
        SuperClass = Object;
    }

    return class extends SuperClass {
        constructor() {
            super(...arguments);

            if (!onChangeData) {
                throw "Function onChangeData(key, value) does not exist";
            }

            if (SuperClass !== Object && !super.updateData) {
                throw "Super class must implement updateData (Should inherit from SerializedObject)";
            }

            this[_data] = mask({
                _static: [],
                ...SCHEMA
            }, arguments[0]);

            // create getters and setters
            for (let p in this[_data]) {
                if (p == '_static') continue;
                Object.defineProperty(this, p, {
                    get: () => this[_data][p],
                    set: (v) => {
                        if (this[_data]._static.includes(p)) {
                            throw `Property "${p}" is static and cannot be updated`;
                        }

                        this[_data][p] = v;
                        onChangeData.call(this, p, v);
                    }
                });
            }
        }

        static get type() { return type; }

        toData() {
            return {
                ...(super.toData? super.toData() : {}),
                ...mask(SCHEMA, this[_data], true)
            }
        };

        updateData(data, now) {
            super.updateData(data, now);
            this[_data] = mask(this[_data], data);

            if (onUpdateData) {
                onUpdateData.call(this, data, now);
            }
        };
    }
}

export default SerializedObject;
