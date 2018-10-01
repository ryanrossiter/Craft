import Component from '~/gui/Component';

export default class GUI extends Component {
    constructor(parentElement) {
        super();

        this.parentElement = parentElement || document.getElementsByTagName('body')[0];

        this.components = [];

        this.parentElement.appendChild(this.init());
    }

    build() {
        let element = document.createElement('div');
        element.style.position = "relative";
        element.style.width = "100%";
        element.style.height = "100%";

        return element;
    }

    addComponent(component) {
        if (!(component instanceof Component)) {
            throw Error("addComponent param must inherit from Component");
        }

        this.components.push(component);
        let element = component.init()
        this.element.appendChild(element);
    }


    removeComponent(component) {
        if (this.components.indexOf(component) === -1) {
            throw Error("Component does not exist in this GUI");
        }

        this._removeComponent(component);
    }

    destroy() {
        for (let component of this.components) {
            this._removeComponent(component);
        }
        
        this.parentElement.removeChild(this.element);
    }

    _removeComponent(component) {
        component.destroy();
        this.element.removeChild(component);
    }

    update() {
        for (let component of this.components) {
            component.update();
        }
    }
}
