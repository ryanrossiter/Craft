export const SignStruct = [
    { name: 'x', type: 'i32' },
    { name: 'y', type: 'i32' },
    { name: 'z', type: 'i32' },
    { name: 'face', type: 'i32' },
    { name: 'text', type: 'char', length: 64 },
];

export const SignListStruct = [
    { name: 'capacity', type: 'i32' },
    { name: 'size', type: 'i32' },
    { name: 'data', type: '*',
        to: { type: 'struct', struct: SignStruct } },
];

export const MapStruct = [
    { name: 'dx', type: 'i32' },
    { name: 'dy', type: 'i32' },
    { name: 'dz', type: 'i32' },
    { name: 'mask', type: 'i32' },
    { name: 'size', type: 'i32' },
    { name: 'data', type: '*' },
];

export const ChunkStruct = [
    { name: 'p', type: 'i32' },
    { name: 'q', type: 'i32' },
    { name: 'r', type: 'i32' },
    { name: 'active', type: 'i32' },
    { name: 'dirty', type: 'i32' },
    { name: 'map', type: 'struct', struct: MapStruct },
    { name: 'lights', type: 'struct', struct: MapStruct },
    { name: 'signs', type: 'struct', struct: SignListStruct }
];

export const ClientChunkStruct = [
    { name: 'c', type: 'struct', struct: ChunkStruct },
    { name: 'buffer', type: 'i32' },
    { name: 'sign_buffer', type: 'i32' },
    { name: 'faces', type: 'i32' },
    { name: 'sign_faces', type: 'i32' },
];

export const StateStruct = [
    { name: 'x', type: 'float' },
    { name: 'y', type: 'float' },
    { name: 'z', type: 'float' },
    { name: 'rx', type: 'float' },
    { name: 'ry', type: 'float' },
    { name: 't', type: 'float' }
];

export const PlayerStruct = [
    { name: 'id', type: 'i32' },
    { name: 'current_item', type: 'i32' },
    { name: 'name', type: 'char', length: 32 },
    { name: 'state', type: 'struct', struct: StateStruct },
    { name: 'buffer', type: 'i32' }
];

export const ClientModelStruct = [
    { name: 'chunks', type: 'struct', length: 1024, struct: ClientChunkStruct },
    { name: 'players', type: 'struct', length: 128, struct: PlayerStruct },
    { name: 'create_radius', type: 'i32' },
    { name: 'render_radius', type: 'i32' },
    { name: 'delete_radius', type: 'i32' },
    { name: 'sign_radius', type: 'i32' },
    { name: 'width', type: 'i32' },
    { name: 'height', type: 'i32' },
    { name: 'build_mode', type: 'i32' },
    { name: 'build_rot', type: 'i32' },
    { name: 'scale', type: 'i32' },
    { name: 'ortho', type: 'i32' },
    { name: 'fov', type: 'float' },
    { name: 'time', type: 'i32' },
    { name: 'day_length', type: 'i32' },
    { name: 'time_changed', type: 'i32' },
    { name: 'px', type: 'i32' },
    { name: 'py', type: 'i32' },
    { name: 'pz', type: 'i32' },
];
