import Question from './Question';
import { getJSON, getLang } from './helpers';
import JournalEntryList from './components/JournalEntryList';
import { translate as __ } from './helpers';

import { machineName } from '../../library.json';

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

    console.log(params.behaviour);
    console.log(params.journalEntries);

    this.params = params;
  }

  attach($container) {
    this.container = $container[0];

    super.attach($container);
  }

  /**
   * Register the DOM elements with H5P.Question
   */
  registerDomElements() {
    var answerContainer = document.createElement('div');
    var lang = getLang(answerContainer);
    var chartType = this.params.chartType;
    var translations = getJSON(`./language/${lang}.json`);
    var chart = getJSON(`./assets/charts/${chartType}.json`);

    answerContainer.className = styles.answerContainer;

    // Wait for all the files to load, then do initialization
    Promise.all([translations, chart]).then(([translations, chart]) => {
      // Store UI strings into translation tool
      H5PIntegration.l10n[machineName] = translations.uiStrings;

      // Store chart
      this.chart = chart;

      // Attach the component to the container
      let showInvoiceType = this.params.behaviour.invoiceTypeVisibility !== 'hidden';
      let showPosNeg = this.params.behaviour.posNegVisibility !== 'hidden';
      this.answer = new JournalEntryList(chart, false, showInvoiceType, showPosNeg);
      this.answer.render(answerContainer);

      // Add 'Check answer' button
      this.addButton('check-answer', __('check_answer'), () => {
        this.hideButton('check-answer');
        this.showButton('show-solution');
        this.showButton('try-again');

        this.setReadonly();
        this.showFeedback();
      });

      // Add 'Show solution' button
      if (this.params.behaviour.enableSolutionsButton) {
        this.addButton('show-solution', __('show_solution'), () => {
          this.hideButton('show-solution');

          this.showSolutions();
        }, false);
      }

      // Add 'Retry' button
      if (this.params.behaviour.enableRetry) {
        this.addButton('try-again', __('try_again'), () => {
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
    //TODO Return points
    return 0;
  }

  /**
   * Calculates the maximum amount of points achievable for this task.
   *
   * @returns {number} Max score achievable for this task.
   */
  getMaxScore() {
    switch (this.params.behaviour.scoringMechanism) {
      case 'recalculated':
        return this.params.behaviour.maxScore;
      default:
        let numItems = this.params.journalEntries.reduce((sum, entry) => {
          return sum + entry.creditItems.length + entry.debitItems.length;
        }, 0);

        return this.params.behaviour.singlePointPerRow ? numItems : numItems * 4;
    }
  }

  /**
   * Displays the solution(s) for this task, should also hide all buttons.
   */
  showSolutions() {
    let showInvoiceType = this.params.behaviour.invoiceTypeVisibility !== 'hidden';
    let showPosNeg = this.params.behaviour.posNegVisibility !== 'hidden';
    let journalEntryList = new JournalEntryList(this.chart, true, showInvoiceType, showPosNeg);
    let solutionContainer = this.container.querySelector(`.${styles.solutionContainer}`);

    // Create the solution if it doesn't exist
    if (solutionContainer === null) {
      solutionContainer = document.createElement('div');
      solutionContainer.className = styles.solutionContainer;
      solutionContainer.insertAdjacentHTML('beforeend', `
        <div class="${styles.solutionTitle}">
          ${__('solution_title')}
        </div>
        <div class="${styles.solutionIntroduction}">
          ${__('solution_introduction')}
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
  getXAPIData() {
    //TODO return xAPI data
    return {};
  }

  showFeedback() {
    var data = this.answer.getNormalizedData();
    var solution = this.getNormalizedSolution();
    var reducer = (type, sum, item) => (item.type === type ? (sum + item.amount) : sum);
    var totalDebit = data.reduce(reducer.bind(undefined, 'debit'), 0);
    var totalCredit = data.reduce(reducer.bind(undefined, 'credit'), 0);
    var explanations = [];
    var feedbackText = '';

    // Check if debit and credit totals are equal
    if (this.params.behaviour.debetCreditEqual && (totalDebit !== totalCredit)) {
      explanations.push(__('totals_not_equal'));
    }

    // Loop over each item and check if it exists as a possible solution
    data.forEach(item => {
      let found = solution.some(data => (
        data.type === item.type &&
        data.accountNumber === item.accountNumber &&
        data.invoiceType === item.invoiceType &&
        data.posNeg === item.posNeg &&
        data.amount === item.amount
      ));

      item.items.forEach(item => {
        item.setFeedback(found ? 'correct' : 'wrong');
      });
    });

    if (this.getScore() === this.getMaxScore()) {
      feedbackText = `
        <div>
          <span class="${styles.correct}">${__('feedback_correct')}</span>
        </div>
      `;
    } else {
      feedbackText = `
        <div>
          <span class="${styles.wrong}">${__('feedback_wrong')}</span>
        </div>
        <ul>
          ${explanations.reduce((text, item) => text + `
            <li>${item}</li>
          `, '')}
        </ul>
      `;
    }

    this.setFeedback(feedbackText, this.getScore(), this.getMaxScore());
  }

  hideFeedback() {
    var data = this.answer.getNormalizedData();

    data.flatMap(item => item.items).forEach(item => { item.setFeedback() });

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
    var inputs = this.answer.element.querySelectorAll('input, button, select');

    inputs.forEach(readonly ? element => {
      element.setAttribute('disabled', 'disabled');
    } : element => {
      element.removeAttribute('disabled');
    });
  }

  getNormalizedSolution() {
    var entries = this.params.journalEntries;
    var debitItems = entries.flatMap(entry => entry.debitItems);
    var creditItems = entries.flatMap(entry => entry.creditItems);
    var walker = (type, options) => {
      options.forEach(item => {
        item.type = type;

        if (this.params.behaviour.posNegVisibility === 'hidden') {
          item.posNeg = undefined;
        }
      })
    };

    debitItems.forEach(walker.bind(undefined, 'debit'));
    creditItems.forEach(walker.bind(undefined, 'credit'));

    return debitItems.concat(creditItems).flat();
  }

}

export default AccountingJournalEntry;
