import { getJSON, getLang } from './helpers';
import JournalEntry from './JournalEntry';
import { translate as __ } from './helpers';

import { machineName } from '../library.json';

import styles from './journal-entry.css';

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

    // Wait for all the files to load, then do initialization
    Promise.all([translations, chart]).then(([translations, chart]) => {
      // Store UI strings into translation tool
      H5PIntegration.l10n[machineName] = translations.uiStrings;

      // Render the HTML
      container.insertAdjacentHTML('beforeend', `
        <div>
          ${this.params.description}
        </div>
        <div id="${styles.question}">
        </div>
        <div id="${styles.solution}">
          <button id="${styles.showSolution}" class="h5p-core-button">${__('show_solution')}</button>
        </div>
      `);

      container.querySelector(`#${styles.showSolution}`).addEventListener('click', () => {
        let journalEntry = new JournalEntry(chart, true);

        journalEntry.render(container.querySelector(`#${styles.solution}`), { replaceContainer: true });
        journalEntry.setData(this.params);
      });

      // Attach the component to the container
      let journalEntry = new JournalEntry(chart);

      journalEntry.render(container.querySelector(`#${styles.question}`), { replaceContainer: true });
    });

    container.classList.add('h5p-accounting-journal-entry');
  }

};
