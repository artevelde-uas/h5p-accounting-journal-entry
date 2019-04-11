import { getJSON, getLang } from './helpers';
import JournalEntryList from './JournalEntryList';
import { translate as __ } from './helpers';

import { machineName } from '../library.json';

import styles from './journal-entry.css';

const H5P = window.H5P || {};

H5P.AccountingJournalEntry = class extends H5P.Question {

  /**
   * @constructor
   *
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('accounting-journal-entry');

    this.params = params;
  }

  /**
   * Register the DOM elements with H5P.Question
   */
  registerDomElements() {
    var container = document.createElement('div');
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
        <div id="${styles.question}">
        </div>
        <div id="${styles.solution}">
          <button id="${styles.showSolution}" class="h5p-core-button">${__('show_solution')}</button>
        </div>
      `);

      container.querySelector(`#${styles.showSolution}`).addEventListener('click', () => {
        let journalEntryList = new JournalEntryList(chart, true);

        journalEntryList.render(container.querySelector(`#${styles.solution}`), { replaceContainer: true });
        journalEntryList.data = this.params.journalEntries;
      });

      // Attach the component to the container
      let journalEntryList = new JournalEntryList(chart);

      journalEntryList.render(container.querySelector(`#${styles.question}`), { replaceContainer: true });
    });

    // Register Introduction
    this.setIntroduction(this.params.description);

    // Register content
    this.setContent(container);
  }

};
