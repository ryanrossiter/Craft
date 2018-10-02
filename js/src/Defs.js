const Defs = {
    PORT: 50788,
    CHUNK_SIZE: 32,
    CREATE_CHUNK_RADIUS: 2,
    DELETE_CHUNK_RADIUS: 6, // Max is 10 chunks unless MAX_CHUNKS in C code is increased
    MAX_CHUNK_SUBS: 1500,
    CORE_SYNC_INTERVAL: 200, // ms
    PHYSICS_STEP_FREQUENCY: 20,
    PHYSICS_MAX_SUB_STEPS: 3,
    WORLD_SCALE: 1,
    SHAPE_TYPE_CHUNK: 512, // cannon.js shape type
    TIME_DAY: 1000 * 60 * 3,
    TIME_NIGHT: 1000 * 60 * 10,
    BUILD_MODE: {
        SINGLE: 0,
        FLOOR: 1,
        WALL: 2,
    }
}

export default Defs;