import { normalize as normailizePath } from 'path';

import library from '../library.json';


export function getPath(path = '') {
  return normailizePath(`${H5PIntegration.url}/${process.env.NODE_ENV}/${library.machineName}/${path}`);
}

export function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
}
