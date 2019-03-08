import { getJSON, getLang } from './helpers';
import JournalItem from './JournalItem';

import library from '../library.json';


const H5P = window.H5P || {};

H5P.AccountingJournalEntry = class {
  
  /**
   * @constructor
   * 
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    this.params = params;
  }
  
  /**
   * Attach function called by H5P framework to insert H5P content into page
   * 
   * @param {jQuery} $container
   */
  attach($container) {
    var container = $container.get(0);
    var lang = getLang(container);
    var chartType = this.params.chartType;
    var translations = getJSON(`./language/${lang}.json`);
    var chart = getJSON(`./assets/charts/${chartType}.json`);
    
    // Attach the description
    container.insertAdjacentHTML('beforeend', `
      <p>${this.params.description}</p>
    `);
      
    // Wait for all the files to load, then do initialization
    Promise.all([translations, chart]).then(([translations, chart]) => {
      // Store UI strings into translation tool
      H5PIntegration.l10n[library.machineName] = translations.uiStrings;
      
      // Attach the component to the container
      let journalItem = new JournalItem(chart);
      journalItem.render(container);
    });
    
    container.classList.add('h5p-accounting-journal-entry');
  }
  
};
