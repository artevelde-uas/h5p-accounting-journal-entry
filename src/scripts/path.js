import { normalize as normalizePath } from 'path';


// Store the base URL
let scripts = document.getElementsByTagName('script');
let url = new URL(scripts[scripts.length - 1].src);
let baseUrl = normalizePath(`${url.pathname}/../..`);


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
