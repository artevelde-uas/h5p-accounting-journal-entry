import Component from './Component';
import JournalTransaction from './JournalTransaction';
import { translate as __, formatAmount } from './helpers';

import styles from './journal-entry.css';


export default class extends Component {

  /**
   * @constructor
   * @param {object} chart The 'Chart of Accounts' to be used
   */
  constructor(chart) {
    super();
    
    this.chart = chart;
    this.transactions = {
      debit: [],
      credit: []
    };
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
          </tr>
        </tfoot>
      </table>
    `);
    
    // Add two debit and two credit rows
    this.addTransactionRow('debit');
    this.addTransactionRow('debit');
    this.addTransactionRow('credit');
    this.addTransactionRow('credit');
  }
  
  addTransactionRow(type, data) {
    var transactions = this.transactions[type];
    var transaction = new JournalTransaction(type, this.chart);
    var tbody = this.element.querySelector(`tbody.${styles[type]}`);
    
    transaction.render(tbody, data);
    
    // Check for the creation of first new data in a row
    transaction.on('newTransaction', () => {
      transactions.push(transaction);
      
      // If new data is added on the last row, append a new row to the list
      if (transaction.element === tbody.lastElementChild) {
        this.addTransactionRow(type);
      }
    });
    
    // Check when all data in a row is removed
    transaction.on('deleteTransaction', () => {
      transactions.splice(transactions.indexOf(transaction), 1);
      
      // Remove the row from the list but keep at least two
      if (tbody.children.length > 2) {
        transaction.remove();
      }
    });
    
    // Recalculate the totals if one of the amounts change
    transaction.onChange('amount', () => {
      var reducer = (sum, transaction) => (sum + Number(transaction.get('amount')));
      var totalDebit = this.transactions['debit'].reduce(reducer, 0);
      var totalCredit = this.transactions['credit'].reduce(reducer, 0);

      this.set('totalDebit', formatAmount(totalDebit));
      this.set('totalCredit', formatAmount(totalCredit));
    });
  }
  
  

}