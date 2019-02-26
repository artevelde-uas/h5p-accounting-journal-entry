import { normalize as normailizePath } from 'path';

import library from '../library.json';


export function getPath(path = '') {
  return normailizePath(`${H5PIntegration.url}/${process.env.NODE_ENV}/${library.machineName}/${path}`);
}

export function getLang(element = document.documentElement) {
  element = element.closest('[lang]') || document.documentElement;
  
  return element.lang || element.getAttribute('xml:lang') || 'en';
}

export function getJSON(path) {
  return fetch(getPath(path))
    .then(response => response.json())
    .catch(console.error);
}

export function translate(key, vars = null) {
  return H5P.t(key, vars, library.machineName)
}

export function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
}
