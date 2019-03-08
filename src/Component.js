import EventEmitter from 'events';


const viewData = new WeakMap();
const handledEvents = new WeakSet();

export default class Component extends EventEmitter {
  
  constructor() {
    super();
    
    viewData.set(this, Object.create(null));
  }
  
  /**
   * Getter for <input> element values
   * 
   * @param {string} key The name of the <input> field
   * @returns {string} The value of the <input> field
   */
  get(key) {
    if (this.element === undefined) return;
    
    let element = this.element.querySelector(`[name="${key}"]`);
    if (element === null) return;
    
    return element.value;
  }
  
  /**
   * Setter for <input> element values
   * 
   * @param {string} key The name of the <input> field
   * @param {string} value The value of the <input> field
   */
  set(key, value) {
    if (this.element === undefined) return false;
    
    let element = this.element.querySelector(`[name="${key}"]`);
    if (element === null) return false;
    
    element.value = value;
    
    return true;
  }
  
  /**
   * Get all <input> element values
   * 
   * @returns {object} Key/value pairs of the names and values
   */
  getData() {
    var elements = this.element.querySelectorAll('[name]');
    var data = {}
    
    elements.forEach(element => {
      data[element.name] = element.value;
    });
    
    return data;
  }
  
  /**
   * Set all <input> element values
   * 
   * @param {object} data Key/value pairs of the names and values to be set
   */
  setData(data) {
    Object.entries(data).forEach(([key, value]) => { this.set(key, value) });
  }
  
  /**
   * Renders the given template on the specified container element
   * 
   * @param {HTMLElement} container The container element
   * @param {string} template The HTML to be rendered
   */
  render(container, template) {
    var fragment = document.createElement(container.tagName);
    
    fragment.innerHTML = template;
    
    if (fragment.children.length > 1) {
      throw new Error('The template can only have one root element');
    }
    
    this.element = fragment.firstElementChild;
    
    ['input', 'change'].forEach(type => {
      this.element.addEventListener(type, event => {
        var name = event.target.name;
        var value = event.target.value;
        var oldValue = viewData.get(this)[name] || '';

        if (handledEvents.has(event)) return;
        
        handledEvents.add(event);
        
        if ((type === 'input' && event.target.tagName === 'SELECT') ||
            (type === 'change' && event.target.tagName !== 'SELECT') ||
            oldValue === value) {
          return;
        }
        
        viewData.get(this)[name] = value;
        
        this.emit('change', name, value, oldValue);
      });
    });
    
    container.appendChild(fragment.firstElementChild);
  }
  
  /**
   * Removes the component from the DOM
   */
  remove() {
    this.element.parentNode.removeChild(this.element);
    delete this.element;
  }
  
  /**
   * Listens for a change in any of the <input> elements
   * 
   * @param {string} name The <input> element to listen on
   * @param {function} handler The handler to fire when a change occurs
   */
  onChange(name, handler) {
    this.on('change', (key, value, oldValue) => {
      if (name !== key) return;
      
      handler(value, oldValue);
    });
  }
  
}
