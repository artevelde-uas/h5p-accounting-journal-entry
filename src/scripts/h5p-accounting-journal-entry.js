import Question from './Question';
import Validator from './Validator';
import { getJSON, getLibraryPath } from './util';
import JournalEntryList from './components/JournalEntryList';
import l10n, { setTranslations } from './l10n';

import styles from '../styles/h5p-accounting-journal-entry.css';


class AccountingJournalEntry extends Question {

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
    this.contentId = contentId;
    this.validator = new Validator(params.behaviour, params.journalEntries);

    setTranslations(params.l10n);
  }

  attach($container) {
    this.container = $container[0];

    super.attach($container);
  }

  /**
   * Register the DOM elements with H5P.Question
   */
  registerDomElements() {
    let answerContainer = document.createElement('div');
    let libraryPath = getLibraryPath(this.contentId);

    answerContainer.className = styles.answerContainer;

    // Wait for the chart file to load, then do initialization
    getJSON(`${libraryPath}/assets/charts/${this.params.chartType}.json`).then(chart => {
      // Store chart
      this.chart = chart;

      // Attach the component to the container
      let invoiceTypeVisibility = this.params.behaviour.invoiceTypeVisibility;
      let posNegVisibility = this.params.behaviour.posNegVisibility;
      this.answer = new JournalEntryList(chart, false, invoiceTypeVisibility, posNegVisibility);
      this.answer.render(answerContainer);

      // Add the answer to the validator
      this.validator.setAnswer(this.answer);

      // Add 'Check answer' button
      this.addButton('check-answer', l10n.checkAnswer, () => {
        this.hideButton('check-answer');
        this.showButton('show-solution');
        this.showButton('try-again');

        this.setReadonly();
        this.showFeedback();

        // Save the scores using xAPI
        this.triggerXAPIScored(this.getScore(), this.getMaxScore(), 'answered', true, this.getScore() === this.getMaxScore());
      });

      // Add 'Show solution' button
      if (this.params.behaviour.enableSolutionsButton) {
        this.addButton('show-solution', l10n.showSolution, () => {
          this.hideButton('show-solution');

          this.showSolutions();
        }, false);
      }

      // Add 'Retry' button
      if (this.params.behaviour.enableRetry) {
        this.addButton('try-again', l10n.tryAgain, () => {
          this.resetTask();
        }, false);
      }
    });

    // Register Introduction
    this.setIntroduction(this.params.description);

    // Register content
    this.setContent(answerContainer);
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
    return this.validator.getScore();
  }

  /**
   * Calculates the maximum amount of points achievable for this task.
   *
   * @returns {number} Max score achievable for this task.
   */
  getMaxScore() {
    return this.validator.getMaxScore();
  }

  /**
   * Displays the solution(s) for this task, should also hide all buttons.
   */
  showSolutions() {
    let invoiceTypeVisibility = this.params.behaviour.invoiceTypeVisibility;
    let posNegVisibility = this.params.behaviour.posNegVisibility;
    let journalEntryList = new JournalEntryList(this.chart, true, invoiceTypeVisibility, posNegVisibility);
    let solutionContainer = this.container.querySelector(`.${styles.solutionContainer}`);

    // Create the solution if it doesn't exist
    if (solutionContainer === null) {
      solutionContainer = document.createElement('div');
      solutionContainer.className = styles.solutionContainer;
      solutionContainer.insertAdjacentHTML('beforeend', `
        <div class="${styles.solutionTitle}">
          ${l10n.solutionTitle}
        </div>
        <div class="${styles.solutionIntroduction}">
          ${l10n.solutionIntroduction}
        </div>
        <div class="${styles.solutionSample}">
        </div>
      `);

      let solutionSample = solutionContainer.querySelector(`.${styles.solutionSample}`);

      // Render the solution
      journalEntryList.render(solutionSample);
      journalEntryList.data = this.params.journalEntries;

      // Insert the solution before the feedback
      this.container.insertBefore(solutionContainer, this.container.querySelector('.h5p-question-feedback'));
    }

    // Unhide the solution
    solutionContainer.removeAttribute('hidden');
  }

  /**
   * Resets the task to its initial state, should also show buttons that were hidden by the `showSolutions()` function.
   */
  resetTask() {
    this.hideFeedback();
    this.hideSolution();
    this.setReadonly(false);

    this.showButton('check-answer');
    this.hideButton('show-solution');
    this.hideButton('try-again');

    if (this.params.behaviour.clearAnswerOnRetry) {
      this.answer.data = [];
    }
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
  /*getXAPIData() {
    //TODO return xAPI data
    return {};
  }*/

  showFeedback() {
    let feedbackText = '';

    this.validator.validate();

    if (this.validator.getScore() === this.validator.getMaxScore()) {
      feedbackText = `
        <div>
          <span class="${styles.correct}">${l10n.feedbackCorrect}</span>
        </div>
      `;
    } else {
      feedbackText = `
        <div>
          <span class="${styles.wrong}">${l10n.feedbackWrong}</span>
        </div>
        <ul>
          ${this.validator.getFeedback().reduce((text, item) => text + `
            <li>${l10n[item]}</li>
          `, '')}
        </ul>
      `;
    }

    this.setFeedback(feedbackText, this.getScore(), this.getMaxScore());
  }

  hideFeedback() {
    // Loop through all the items an reset the feedback
    this.answer.getItems().forEach(item => {
      item.setFeedback();
    });

    // Hide the feedback text
    this.removeFeedback();
  }

  hideSolution() {
    let solutionContainer = this.container.querySelector(`.${styles.solutionContainer}`);

    if (solutionContainer === null) return;

    solutionContainer.setAttribute('hidden', 'hidden');
  }

  /**
   * Disables (or enables) all input elements and buttons of the answer element.
   *
   * @param {boolean} value TRUE to disable, FALSE to enable.
   */
  setReadonly(readonly = true) {
    let inputs = this.answer.element.querySelectorAll('input, button, select');

    inputs.forEach(readonly ? element => {
      element.setAttribute('disabled', 'disabled');
    } : element => {
      element.removeAttribute('disabled');
    });
  }

}

export default AccountingJournalEntry;
