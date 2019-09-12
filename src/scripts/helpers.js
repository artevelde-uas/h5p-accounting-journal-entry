import { normalize as normalizePath } from 'path';


// Store the base URL
var scripts = document.getElementsByTagName('script');
var url = new URL(scripts[scripts.length - 1].src);
var baseUrl = normalizePath(`${url.pathname}/../..`);


export function getPath(path = '') {
  return normalizePath(`${baseUrl}/${path}`);
}

export function getJSON(path) {
  return fetch(getPath(path))
    .then(response => response.json())
    .catch(function (error) {
      throw error;
    });
}

export function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
}
