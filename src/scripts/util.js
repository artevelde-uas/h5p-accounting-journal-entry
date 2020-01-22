import { normalize as normalizePath } from 'path';

import { machineName } from '../../library.json';

const librariesFolder = (process.env.NODE_ENV === 'development') ? 'development' : 'libraries';


export function getPath(path = '') {
  return normalizePath(`${H5PIntegration.url}/${librariesFolder}/${machineName}/${path}`);
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
