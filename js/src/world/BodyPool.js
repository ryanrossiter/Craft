import ObjectPool from '~/util/ObjectPool';
import CANNON from 'cannon';

import { chunkKey } from '~/world/ChunkUtils';

export default class BodyPool extends ObjectPool {
	constructor(n, ...args) {
		super(CANNON.Body, n, ...args);

		this.ids = {}; // chunkKey(x, y, z): id
	}

	init(x, y, z) {
		let key = chunkKey(x, y, z);
		let body = super.init();

		let id = this.ids[key];
		if (id === undefined) {
			id = CANNON.Body.idCounter++;
			this.ids[key] = id;
		}

		body.id = id;
		body.position.set(x, y, z);
		body.computeAABB();

		return body;
	}
}