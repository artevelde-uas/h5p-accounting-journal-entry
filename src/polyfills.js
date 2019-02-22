{
  let elementPrototype = Element.prototype;
  
  if (!elementPrototype.matches) {
    elementPrototype.matches = elementPrototype.msMatchesSelector;
  }
  
  if (!elementPrototype.closest) {
    elementPrototype.closest = function(selector) {
      var element = this;
      
      do {
        if (element.matches(selector)) return element;
        element = element.parentElement || element.parentNode;
      } while (element !== null && element.nodeType === 1);
      
      return null;
    };
  }
}
