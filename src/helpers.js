import { normalize as normailizePath } from 'path';

import { machineName } from '../library.json';

export function getPath(path = '') {
  var librariesFolder = (process.env.NODE_ENV === 'development') ? 'development' : 'libraries';

  return normailizePath(`${H5PIntegration.url}/${librariesFolder}/${machineName}/${path}`);
}

export function getLang(element = document.documentElement) {
  element = element.closest('[lang]') || document.documentElement;

  return element.lang || element.getAttribute('xml:lang') || 'en';
}

export function getJSON(path) {
  return fetch(getPath(path))
    .then(response => response.json())
    .catch(function (error) {
      throw error;
    });
}

export function translate(key, vars = null) {
  return H5P.t(key, vars, machineName)
}

export function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
}
