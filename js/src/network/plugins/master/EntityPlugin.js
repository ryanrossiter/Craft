import ServerPlugin from '~/network/ServerPlugin';
import EntityTypes from '~/entities/EntityTypes';
import Player from '~/entities/Player';
import { generateUuid } from '~/util/UUID';

export default class EntityPlugin extends ServerPlugin {
    constructor(onCreateEntity, onDeleteEntity) {
        super();
        this.onCreateEntity = onCreateEntity;
        this.onDeleteEntity = onDeleteEntity;
        this.entities = {};

        this.entityFactory = {
            [EntityTypes.PLAYER]: Player
        }
    }

    registerHandlers(registerHandler) {
        registerHandler('entity.update', (socket, { entityData }) => {
            for (let data of entityData) {
                if (this.entities.hasOwnProperty(data.id)) {
                    // Only allow update by controlling player
                    let entity = this.entities[data.id];
                    if (entity.player === socket.id) {
                        entity.updateData(data);
                        entity.dirty = true;
                    }
                }
            }
        });

        // registerHandler('entity.delete', (socket, { entityIds }) => {
        //     for (let id of entityIds) {
        //         if (this.entities.hasOwnProperty(id)) {
        //             this.entities[id].onDelete();
        //             delete this.entities[id];
        //         }
        //     }
        // });
    }

    create(entityType, data={}) {
        if (entityType in this.entityFactory) {
            let id = generateUuid();
            let EntityClass = this.entityFactory[entityType];
            let entity = new EntityClass({
                ...data, id
            });

            this.entities[id] = entity;
            this.onCreateEntity(entity);
            this.sendUpdate(entity);
        } else {
            throw Error(`Unregistered entity type ${entityType}.`);
        }
    }

    delete(entity) {
        entity.deleted = true;
        this.onDeleteEntity(entity);
    }

    update() {
        for (let e of Object.values(this.entities)) {
            e.serverUpdate();
        }
    }

    sendUpdate(entity) {
        if (entity.deleted) {
            this.emit('entity.delete', { entityIds: [entity.id] });
        } else {
            this.emit('entity.update', { entityData: [entity.toData()] });
        }
    }

    sendUpdates() {
        let entityData = [];
        let deletedEntityIds = [];
        for (let e of Object.values(this.entities)) {
            if (e.deleted) {
                deletedEntityIds.push(e.id);
                delete this.entities[e.id];
            } else if (e.dirty) {
                entityData.push(e.toData());
                e.dirty = false;
            }
        }

        if (entityData.length > 0) {
            this.emit('entity.update', { entityData });
        }

        if (deletedEntityIds.length > 0) {
            this.emit('entity.delete', { entityIds: deletedEntityIds });
        }
    }

    sendAllEntities(socket) {
        let entityData = [];
        for (let e of Object.values(this.entities)) {
            if (e.deleted) continue;
            entityData.push(e.toData());
        }

        if (entityData.length > 0) {
            socket.emit('entity.update', { entityData });
        }
    }

    search(cond) {
        let entities = [];

        for (let e of Object.values(this.entities)) {
            if (cond(e) === true) {
                entities.push(e);
            }
        }

        return entities;
    }
}
