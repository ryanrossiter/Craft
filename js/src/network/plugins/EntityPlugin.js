import ServerPlugin from '~/network/ServerPlugin';
import EntityTypes from '~/entities/EntityTypes';
import ClientPlayer from '~/entities/client/ClientPlayer';

export default class EntityPlugin extends ServerPlugin {
    constructor(time, onCreateEntity) {
        super();
        this.time = time;
        this.onCreateEntity = onCreateEntity;
        this.entities = {};

        this.entityFactory = {
            [EntityTypes.PLAYER]: ClientPlayer
        }
    }

    registerHandlers(registerHandler) {
        registerHandler('entity.update', ({ entityData }) => {
            for (let data of entityData) {
                if (this.entities.hasOwnProperty(data.id)) {
                    this.entities[data.id].dataUpdate(data, this.time.now);
                } else {
                    if (data.type in this.entityFactory) {
                        let EntityClass = this.entityFactory[data.type];
                        let entity = new EntityClass(data);
                        this.entities[data.id] = entity;
                        this.onCreateEntity(entity);
                    }
                }
            }
        });

        registerHandler('entity.delete', ({ entityIds }) => {
            for (let id of entityIds) {
                if (this.entities.hasOwnProperty(id)) {
                    this.entities[id].onDelete();
                    delete this.entities[id];
                }
            }
        });
    }

    update() {
        for (let e of this.entities) {
            e.clientUpdate();
            if (e.clientControlled) {
                this.sendUpdate(e);
            }
        }
    }

    sendUpdate(entity) {
        this.emit('entity.update', e.toData(), (data) => {
            // The server might return a correction
            if (data) e.dataUpdate(data, this.time.now);
        });
    }

    // create(entity) {
    //     this.emit('entity.create', { name: "Nemp" }, ({ playerId }) => {
    //         this.clientCore.onJoin(playerId);
    //     });
    // }
}