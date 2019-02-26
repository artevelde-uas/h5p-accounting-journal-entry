import { getJSON, getLang, translate as __, formatAmount } from './helpers';
import { journalItemTemplate, journalTransactionTemplate } from './templates';

import library from '../library.json';
import styles from './journal-entry.css';


export default class {
  
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
    var promise = Promise.all([getTranslations(lang), getChart(chartType)]);
    
    // Wait for all the files to load, then do initialization
    promise.then(function ([translations, chart]) {
      // Store UI strings into translation tool
      H5PIntegration.l10n[library.machineName] = translations.uiStrings;
      
      // Attach the content to the container
      attach(container, chart);
    });
    
    container.classList.add('h5p-accounting-journal-entry');
  }
  
}


function getTranslations(lang) {
  return getJSON(`./language/${lang}.json`);
}

function getChart(chartType) {
  return getJSON(`./assets/charts/${chartType}.json`);
}

function attach(container, chart) {
  var entry = document.createElement('div');

  entry.classList.add(styles.journalEntry);
  entry.insertAdjacentHTML('afterbegin', journalItemTemplate());

  // Add or remove transaction rows if necessary
  container.addEventListener('keyup', function (event) {
    if (event.target.matches(`table.${styles.journalItem} td input`)) {
      let row = event.target.closest('tr');
      let accountNumber = row.querySelector(`td.${styles.accountNumber} input`).value;
      let amount = row.querySelector(`td.${styles.amountDebit} input, td.${styles.amountCredit} input`).value;
      
      if (accountNumber === '' && amount === '') {
        removeTransactionRow(row);
      } else if (accountNumber !== '' || amount !== '') {
        addTransactionRow(row);
      }
    }
  });
  
  // Lookup descriptions in chart of accounts
  container.addEventListener('keyup', function (event) {
    if (event.target.matches(`td.${styles.accountNumber} input`)) {
      let row = event.target.closest('tr');
      let accountNameCell = row.querySelector(`td.${styles.accountName}`);
      let accountNumber = event.target.value;
      
      if (chart.hasOwnProperty(accountNumber)) {
        accountNameCell.textContent = chart[accountNumber];
      } else if (accountNumber === '') {
        accountNameCell.innerHTML = `<span class="${styles.empty}">&larr; ${__('enter_account_number')}</span>`;
      } else {
        accountNameCell.innerHTML = `<span class="${styles.invalid}">&larr; ${__('invalid_account_number')}</span>`;
      }
    }
  });
  
  // Calculate debit and credit totals if necessary
  container.addEventListener('keyup', function (event) {
    if (event.target.matches(`td.${styles.amountDebit} input, td.${styles.amountCredit} input`)) {
      let table = event.target.closest('table');
      
      calculateTotals(table);
    }
  });

  container.appendChild(entry);
}

function removeTransactionRow(row) {
  let list = row.parentNode;
  
  // Do not remove if there are no more than two rows
  if (list.children.length <= 2) return false;
  
  // Move the title cell to the next row if on first row
  if (row.previousElementSibling === null) {
    let nextRow = row.nextElementSibling;
    
    nextRow.insertBefore(row.firstElementChild, nextRow.firstElementChild);
  }
  
  list.removeChild(row);
  list.querySelector(`td.${styles.title}`).setAttribute('rowspan', list.children.length);
}

function addTransactionRow(row) {
  // Only insert a new row if on the last row
  if (row.nextElementSibling !== null) return false;
  
  let list = row.parentNode;
  let type = list.classList.contains(styles.debit) ? 'debit' : 'credit';
  
  row.insertAdjacentHTML('afterend', journalTransactionTemplate(null, type));
  list.querySelector(`td.${styles.title}`).setAttribute('rowspan', list.children.length);
}

function calculateTotals(table) {
  var reducer = (sum, input) => (sum + Number(input.value));
  var totalDebit = Array.from(table.querySelectorAll(`td.${styles.amountDebit} input`)).reduce(reducer, 0);
  var totalCredit = Array.from(table.querySelectorAll(`td.${styles.amountCredit} input`)).reduce(reducer, 0);

  table.querySelector(`th.${styles.totalDebit}`).textContent = formatAmount(totalDebit);
  table.querySelector(`th.${styles.totalCredit}`).textContent = formatAmount(totalCredit);
}
