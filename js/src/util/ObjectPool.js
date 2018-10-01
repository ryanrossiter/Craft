export default class ObjectPool {
	constructor(Cls, n, ...args) {
		this.Cls = Cls;
		this.args = args;
		this.objs = [];
		this.usedObjs = [];

		if (typeof(n) !== 'number' || n < 0) {
			throw Error("n must be a number >= 0");
		}

		for (let i = 0; i < n; i++) {
			this._allocate();
		}
	}

	_allocate() {
		let obj = new (this.Cls)(...this.args);
		this.objs.push(obj);
		return obj;
	}

	init() {
		for (let i = 0; i < this.objs.length; i++) {
			if (this.usedObjs.indexOf(i) === -1) {
				this.usedObjs.push(i);
				return this.objs[i];
			}
		}

		// Didn't find an unused object, create a new one
		this.usedObjs.push(this.objs.length);
		return this._allocate();
	}

	free(obj) {
		let i = this.objs.indexOf(obj);
		if (i === -1) throw Error("obj not in ObjectPool");

		let ii = this.usedObjs.indexOf(i);
		if (ii === -1) throw Error("obj is not used (invalid free)");

		this.usedObjs.splice(ii, 1);
	}

	freeAll() {
		this.usedObjs = [];
	}
}
