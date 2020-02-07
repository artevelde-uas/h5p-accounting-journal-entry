import { normalize as normalizePath } from 'path';

const librariesFolder = (process.env.NODE_ENV === 'development') ? 'development' : 'libraries';


export function getLibraryPath(contentId) {
  let library = H5P.libraryFromString(H5P.getContentForInstance(contentId).library);
  let libraryName = library.machineName;

  if (process.env.NODE_ENV !== 'development') {
    libraryName += `-${library.majorVersion}.${library.minorVersion}`;
  }

  return normalizePath(`${H5PIntegration.url}/${librariesFolder}/${libraryName}`);
}

export function getJSON(path) {
  return fetch(path)
    .then(response => response.json())
    .catch(function (error) {
      throw error;
    });
}

export function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
}
