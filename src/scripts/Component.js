import EventEmitter from 'events';

export default class Component extends EventEmitter {

  constructor() {
    super();
  }

  /**
   * Renders the given template on the specified container element
   *
   * @param {HTMLElement} container The container element
   * @param {string} template The HTML to be rendered
   */
  render(container, template, options = {}) {
    let fragment = document.createElement(container.tagName);

    fragment.innerHTML = template;

    if (fragment.children.length > 1) {
      throw new Error('The template can only have one root element');
    }

    this.element = fragment.firstElementChild;

    if (options.replaceContainer) {
      container.parentNode.replaceChild(fragment.firstElementChild, container);
    } else {
      container.appendChild(fragment.firstElementChild);
    }
  }

  /**
   * Removes the component from the DOM
   */
  remove() {
    this.element.parentNode.removeChild(this.element);
    delete this.element;

    this.emit('remove');
  }

}
