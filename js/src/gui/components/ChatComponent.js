import Component from '~/gui/Component';

export default class ChatComponent extends Component {
    constructor() {
        super();
    }

    build() {
        let element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = 0;
        element.style.bottom = 0;
        element.style.width = "100%";
        element.style.maxWidth = "400px";
        element.style.height = "230px";
        element.style.border = '2px solid rgba(20, 20, 20, 0.5)';


        this.textArea = document.createElement('textarea');
        this.textArea.readOnly = true;
        this.textArea.style.boxSizing = 'border-box';
        this.textArea.style.resize = "none";
        this.textArea.style.width = '100%';
        this.textArea.style.height = "calc(100% - 25px)"; 
        this.textArea.style.borderWidth = 0;
        this.textArea.style.padding = '5px';
        this.textArea.style.margin = 0;
        this.textArea.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
        this.textArea.style.color = '#FFF';
        this.textArea.style.fontSize = '17px';
        this.textArea.style.fontFamily = "'Amaranth', sans-serif";
        element.appendChild(this.textArea);

        this.typeArea = document.createElement('input');
        this.typeArea.type = 'text';
        this.typeArea.placeholder = 'Chat here';
        this.typeArea.style.position = 'absolute';
        this.typeArea.style.boxSizing = 'border-box';
        this.typeArea.style.width = '100%';
        this.typeArea.style.height = "25px";
        this.typeArea.style.bottom = 0;
        this.typeArea.style.left = 0; 
        this.typeArea.style.borderWidth = 0;
        this.typeArea.style.borderTopWidth = '2px';
        this.typeArea.style.padding = 0;
        this.typeArea.style.paddingLeft = '5px';
        this.typeArea.style.paddingRight = '5px';
        this.typeArea.style.margin = 0;
        this.typeArea.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
        this.typeArea.style.color = '#FFF';
        this.typeArea.style.fontSize = '17px';
        this.typeArea.style.fontFamily = "'Amaranth', sans-serif";
        this.typeArea.addEventListener('keydown', (evt) => {
            if (evt.code === 'Enter') {
                if (this.typeArea.value.length > 0) {
                    this.emit('submit', this.typeArea.value);
                    this.typeArea.value = "";
                }
            } else if (evt.code === 'Backspace') {
                this.typeArea.value = this.typeArea.value.slice(0, this.typeArea.value.length - 1);
            }
        });
        element.appendChild(this.typeArea);
        this.addMessage("Hello, sailor!");

        return element;
    }

    addMessage(message) {
        this.textArea.value += message + '\n';
        this.textArea.scrollTop = this.textArea.scrollHeight;
    }
}
