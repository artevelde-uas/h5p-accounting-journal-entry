import Component from './Component';
import JournalTransaction from './JournalTransaction';
import { translate as __, formatAmount } from './helpers';

import styles from './journal-entry.css';

export default class extends Component {

  /**
   * @constructor
   * @param {object} chart The 'Chart of Accounts' to be used
   */
  constructor(chart, isSolution) {
    super();

    this.chart = chart;
    this.isSolution = isSolution;
    this.transactions = {
      debit: [],
      credit: []
    };

    Object.defineProperty(this.transactions, 'length', {
      get: function () {
        return this.debit.length + this.credit.length;
      }
    });
  }

  render(container) {
    super.render(container, `
      <table class="${styles.journalItem}">
        <thead>
          <tr>
            <th></th>
            <th>${__('number')}</th>
            <th>${__('account_name')}</th>
            <th>${__('type')}</th>
            <th>&plus; / &minus;</th>
            <th>${__('debit')}</th>
            <th>${__('credit')}</th>
            <th class="${styles.controls}">
              ${this.isSolution ? '' : `
                <button class="h5p-core-button ${styles.deleteJournalItem}" title="${__('delete_journal_item')}"></button>
              `}
            </th>
          </tr>
        </thead>
        <tbody class="${styles.debit}">
        </tbody>
        <tbody class="${styles.credit}">
        </tbody>
        <tfoot>
          <tr>
            <th class="${styles.totalLabel}" colspan="5">${__('total')}:</th>
            <th class="${styles.totalDebit}"><output name="totalDebit">${formatAmount(0)}</output></th>
            <th class="${styles.totalCredit}"><output name="totalCredit">${formatAmount(0)}</output></th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    `);

    // Remove item if delete button is clicked
    if (!this.isSolution) {
      this.element.querySelector(`.${styles.deleteJournalItem}`).addEventListener('click', () => {
        // Don't remove if there is only one item left
        if (this.element.parentNode.children.length === 1) return;

        this.remove()
      });
    }

    // Add two debit and two credit rows
    this.addTransactionRow('debit');
    this.addTransactionRow('debit');
    this.addTransactionRow('credit');
    this.addTransactionRow('credit');
  }

  getData() {
    return {
      debitTransactions: this.transactions.debit.map(transaction => transaction.getData()),
      creditTransactions: this.transactions.credit.map(transaction => transaction.getData())
    };
  }

  setData(data) {
    if (data === undefined) return;

    // Remove all current transactions
    this.transactions.debit = [];
    this.transactions.credit = [];
    this.element.querySelector(`tbody.${styles.debit}`).innerHTML = '';
    this.element.querySelector(`tbody.${styles.credit}`).innerHTML = '';

    // Add new transaction
    data.debitTransactions.forEach(transaction => {
      this.transactions.debit.push(this.addTransactionRow('debit', transaction));
    });
    data.creditTransactions.forEach(transaction => {
      this.transactions.credit.push(this.addTransactionRow('credit', transaction));
    });

    this.calculateTotals();

    if (!this.isSolution) {
      this.addTransactionRow('debit');
      this.addTransactionRow('credit');
    }
  }

  addTransactionRow(type, data) {
    var transactions = this.transactions[type];
    var transaction = new JournalTransaction(type, this.chart, this.isSolution);
    var tbody = this.element.querySelector(`tbody.${styles[type]}`);

    transaction.render(tbody);
    transaction.setData(data);

    // Check for the creation of first new data in a row
    transaction.on('newTransaction', () => {
      transactions.push(transaction);

      // If new data is added on the last row, append a new row to the list
      if (transaction.element === tbody.lastElementChild) {
        this.addTransactionRow(type);
      }

      if (this.transactions.length === 1) {
        this.emit('newItem');
      }
    });

    // Check when all data in a row is removed
    transaction.on('deleteTransaction', () => {
      transactions.splice(transactions.indexOf(transaction), 1);

      // Remove the row from the list but keep at least two
      if (tbody.children.length > 2) {
        transaction.remove();
      }

      if (this.transactions.length === 0) {
        this.emit('deleteItem');
      }
    });

    // Recalculate the totals if one of the amounts change
    transaction.onChange('amount', () => {
      this.calculateTotals();
    });

    return transaction;
  }

  calculateTotals() {
    var reducer = (sum, transaction) => (sum + Number(transaction.get('amount')));
    var totalDebit = this.transactions.debit.reduce(reducer, 0);
    var totalCredit = this.transactions.credit.reduce(reducer, 0);

    this.set('totalDebit', formatAmount(totalDebit));
    this.set('totalCredit', formatAmount(totalCredit));
  }

}
