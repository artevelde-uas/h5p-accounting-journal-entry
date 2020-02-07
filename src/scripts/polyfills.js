{
  let elementPrototype = Element.prototype;

  if (!elementPrototype.matches) {
    elementPrototype.matches = elementPrototype.msMatchesSelector;
  }

  if (!elementPrototype.closest) {
    elementPrototype.closest = function(selector) {
      let element = this;

      do {
        if (element.matches(selector)) return element;
        element = element.parentElement || element.parentNode;
      } while (element !== null && element.nodeType === 1);

      return null;
    };
  }

  if (window.HTMLOutputElement === undefined) {
    Object.defineProperty(HTMLUnknownElement.prototype, 'value', {
      get: function () {
        if (this.tagName === 'OUTPUT') {
          return this.textContent;
        }
      },
      set: function (newValue) {
        if (this.tagName === 'OUTPUT') {
          this.textContent = newValue;
        }
      }
    });
  }
}
