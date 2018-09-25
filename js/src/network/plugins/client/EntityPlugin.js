import ServerPlugin from '~/network/ServerPlugin';
import EntityTypes from '~/entities/EntityTypes';
import ClientPlayer from '~/entities/client/ClientPlayer';

export default class EntityPlugin extends ServerPlugin {
    constructor(time, onCreateEntity, onDeleteEntity) {
        super();
        this.time = time;
        this.onCreateEntity = onCreateEntity;
        this.onDeleteEntity = onDeleteEntity;
        this.entities = {};

        this.entityFactory = {
            [EntityTypes.PLAYER]: ClientPlayer
        }
    }

    registerHandlers(registerHandler) {
        registerHandler('entity.update', (socket, { entityData }) => {
            for (let data of entityData) {
                if (this.entities.hasOwnProperty(data.id)) {
                    if (this.entities[data.id].clientControlled === true) continue;
                    this.entities[data.id].updateData(data, true);
                } else {
                    if (data.type in this.entityFactory) {
                        let EntityClass = this.entityFactory[data.type];
                        let entity = new EntityClass(data);
                        this.entities[data.id] = entity;
                        this.onCreateEntity(entity);
                    } else {
                        throw Error(`Unregistered entity type ${data.type}.`);
                    }
                }
            }
        });

        registerHandler('entity.delete', (socket, { entityIds }) => {
            for (let id of entityIds) {
                if (this.entities.hasOwnProperty(id)) {
                    this.entities[id].onDelete();
                    this.onDeleteEntity(this.entities[id]);
                    delete this.entities[id];
                }
            }
        });
    }

    update() {
        for (let e of Object.values(this.entities)) {
            e.clientUpdate();
            if (e.clientControlled) {
                this.sendUpdate(e);
            }
        }
    }

    sendUpdate(entity) {
        this.emit('entity.update', { entityData: [entity.toData()] }, (data) => {
            // The server might return a correction
            if (data) entity.updateData(data);
        });
    }

    // create(entity) {
    //     this.emit('entity.create', { name: "Nemp" }, ({ playerId }) => {
    //         this.clientCore.onJoin(playerId);
    //     });
    // }
}
