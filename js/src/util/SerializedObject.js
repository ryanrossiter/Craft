import { extend, mask } from '~/util/ObjectHelpers';

const SerializedObject = (SuperClass, type, SCHEMA) => {
    // generate a *unique* data symbol for each class
    let _data = Symbol('data');
    if (!SuperClass) {
        SuperClass = Object;
    }

    return class extends SuperClass {
        constructor() {
            super(...arguments);

            if (SuperClass !== Object && !super.updateData) {
                throw "Super class must implement updateData (Should inherit from SerializedObject)";
            }

            if (SuperClass !== Object && !super.onUpdateData) {
                throw "Super class must implement onUpdateData (Should inherit from SerializedObject)";
            }

            if (SuperClass !== Object && !super.onChangeData) {
                throw "Super class must implement onChangeData (Should inherit from SerializedObject)";
            }

            this[_data] = mask({
                _static: [],
                ...SCHEMA
            }, arguments[0]);

            // create getters and setters
            for (let p in this[_data]) {
                if (p == '_static') continue;
                let o = this;
                Object.defineProperty(this, p, {
                    get: () => this[_data][p],
                    set: (v) => {
                        if (this[_data]._static.includes(p)) {
                            throw `Property "${p}" is static and cannot be updated`;
                        }

                        this[_data][p] = v;
                        this.onChangeData(p, v);
                    }
                });
            }
        }

        get type() { return type; }

        toData() {
            return {
                ...(super.toData? super.toData() : {}),
                ...mask(SCHEMA, this[_data], true)
            }
        }

        updateData(data) {
            this[_data] = mask(this[_data], data);

            if (SuperClass !== Object) {
                super.updateData(...arguments);
            } else {
                // Only invoke callback in top-level class (after all data has been updated)
                this.onUpdateData();
            }
        }

        onUpdateData() {
            if (SuperClass !== Object) {
                super.onUpdateData();
            }
        }

        onChangeData(k, v) {
            if (SuperClass !== Object) {
                super.onChangeData(...arguments);
            }
        }
    }
}

export default SerializedObject;
