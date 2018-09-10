import MemoryBackedObject from '~/util/MemoryBackedObject';
import { ChunkStruct } from '~/StructDefs';

export default class Chunk extends MemoryBackedObject(Object, ChunkStruct) {
}
