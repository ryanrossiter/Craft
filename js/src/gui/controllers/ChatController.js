
export default class ChatController {
    constructor(chatComponent, chatPlugin) {
        this.chatComponent = chatComponent;
        this.chatPlugin = chatPlugin;
        this.chatComponent.on('submit', (...a) => this.onSubmit(...a) );
        this.chatPlugin.on('message', (msg) => this.chatComponent.addMessage(msg));
    }
    
    onSubmit(msg) {
        this.chatPlugin.sendMessage(msg);
    }
}
