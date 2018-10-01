import GUI from '~/gui/GUI';
import ChatComponent from '~/gui/components/ChatComponent';
import ChatController from '~/gui/controllers/ChatController';

const NempGUIBuilder = {
    build: (chatPlugin) => {
        let gui = new GUI(document.getElementById('canvas').parentElement);
        let chatComponent = new ChatComponent();
        let chatController = new ChatController(chatComponent, chatPlugin);
        gui.addComponent(chatComponent);

        return gui;
    }
};

export default NempGUIBuilder;
