import { getJSON, getLang } from './helpers';
import JournalEntryList from './components/JournalEntryList';
import { translate as __ } from './helpers';

import { machineName } from '../../library.json';

import styles from '../styles/h5p-accounting-journal-entry.css';

class AccountingJournalEntry extends H5P.Question {

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

  /**
   * Checks if answers for this task has been given, and the program can proceed to calculate scores.
   *
   * @returns {boolean} TRUE if answers have been given, else FALSE.
   */
  getAnswerGiven() {
    //TODO Check if answers were given
    return true;
  }

  /**
   * Calculates the user's score for this task.
   *
   * @returns {number} User's score for this task.
   */
  getScore() {
    //TODO Return points
    return 0;
  }

  /**
   * Calculates the maximum amount of points achievable for this task.
   *
   * @returns {number} Max score achievable for this task.
   */
  getMaxScore() {
    //TODO Calculate maximum score
    return 10;
  }

  /**
   * Displays the solution(s) for this task, should also hide all buttons.
   */
  showSolutions() {
    //TODO Show solutions
  }

  /**
   * Resets the task to its initial state, should also show buttons that were hidden by the `showSolutions()` function.
   */
  resetTask() {
    this.setExplanation();
    this.removeFeedback();
    this.hideSolution();

    this.showButton('check-answer');
    this.hideButton('show-solution');
    this.hideButton('try-again');

    //TODO Reset data
  }

  /**
   * @typedef {Object} XAPIData
   * @property {Object} statement - Should contain the xAPI statement that is usually sent on 'answered'.
   * @property {string} statement.object.definition.interactionType - Type of the interaction. Choose from [xAPI spec]{@link https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#interaction-types}.
   * @property {string} statement.object.definition.description - Question text and any additional information to generate the report.
   * @property {string} statement.object.definition.correctResponsesPattern - A pattern for determining the correct answers of the interaction. See [spec]{@link https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#response-patterns}.
   * @property {string} statement.object.definition - Additional definition properties required for the specific interaction type.
   * @property {string} statement.result.response - User answers for interaction. See [spec]{@link https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#result}.
   * @property {number} statement.result.score.min - Minimum possible score for task.
   * @property {number} statement.result.score.raw - Raw user score.
   * @property {number} statement.result.score.max - Maximum possible score for task.
   * @property {number} statement.result.score.scaled - Score in percentage.
   * @property {array} [children] An array of all children's xAPI event. This is implemented by calling getXAPIData() on all children of the content type.
   */

  /**
   * Retrieves the xAPI data necessary for generating result reports.
   *
   * @returns {XAPIData}
   */
  getXAPIData() {
    //TODO return xAPI data
    return {};
  }

}

export default AccountingJournalEntry;
