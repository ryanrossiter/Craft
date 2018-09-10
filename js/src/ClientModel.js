import MemoryBackedObject from '~/util/MemoryBackedObject';
import { ClientModelStruct } from '~/StructDefs';

export default class ClientModel extends MemoryBackedObject(Object, ClientModelStruct) {
}
