import Component from './Component';
import JournalItem from './JournalItem';
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
    this.items = {
      debit: [],
      credit: []
    };

    Object.defineProperty(this.items, 'length', {
      get: function () {
        return this.debit.length + this.credit.length;
      }
    });
  }

  render(container) {
    super.render(container, `
      <table class="${styles.entry}">
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
                <button class="h5p-core-button ${styles.deleteEntry}" title="${__('delete_journal_entry')}"></button>
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
            <th class="${styles.totalDebit}"><output name="total-debit">${formatAmount(0)}</output></th>
            <th class="${styles.totalCredit}"><output name="total-credit">${formatAmount(0)}</output></th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    `);

    // Remove entry if delete button is clicked
    if (!this.isSolution) {
      this.element.querySelector(`.${styles.deleteEntry}`).addEventListener('click', () => {
        // Don't remove if there is only one entry left
        if (this.element.parentNode.children.length === 1) return;

        this.remove()
      });
    }

    // Add two debit and two credit rows
    this.addItemRow('debit');
    this.addItemRow('debit');
    this.addItemRow('credit');
    this.addItemRow('credit');
  }

  get data() {
    return {
      debitItems: this.items.debit.map(item => item.getData()),
      creditItems: this.items.credit.map(item => item.getData())
    };
  }

  set data(data) {
    // Remove all current items
    this.items.debit = [];
    this.items.credit = [];
    this.element.querySelector(`tbody.${styles.debit}`).innerHTML = '';
    this.element.querySelector(`tbody.${styles.credit}`).innerHTML = '';

    // Add new items
    data.debitItems.forEach(item => {
      this.items.debit.push(this.addItemRow('debit', item));
    });
    data.creditItems.forEach(item => {
      this.items.credit.push(this.addItemRow('credit', item));
    });

    this.calculateTotals();

    if (!this.isSolution) {
      this.addItemRow('debit');
      this.addItemRow('credit');
    }
  }

  addItemRow(type, data) {
    var items = this.items[type];
    var item = new JournalItem(type, this.chart, this.isSolution);
    var tbody = this.element.querySelector(`tbody.${styles[type]}`);

    item.render(tbody);

    if (data !== undefined) {
      item.data = data;
    }

    // Check for the creation of first new data in a row
    item.on('newItem', () => {
      items.push(item);

      // If new data is added on the last row, append a new row to the list
      if (item.element === tbody.lastElementChild) {
        this.addItemRow(type);
      }

      if (this.items.length === 1) {
        this.emit('newEntry');
      }
    });

    // Check when all data in a row is removed
    item.on('deleteItem', () => {
      items.splice(items.indexOf(item), 1);

      // Remove the row from the list but keep at least two
      if (tbody.children.length > 2) {
        item.remove();
      }

      if (this.items.length === 0) {
        this.emit('deleteEntry');
      }
    });

    // Recalculate the totals if one of the amounts change
    item.on('itemChange', name => {
      if (name !== 'amount') return;

      this.calculateTotals();
    });

    return item;
  }

  calculateTotals() {
    var reducer = (sum, item) => (sum + item.amount);
    var totalDebit = this.items.debit.reduce(reducer, 0);
    var totalCredit = this.items.credit.reduce(reducer, 0);

    this.element.querySelector('[name="total-debit"]').value = formatAmount(totalDebit);
    this.element.querySelector('[name="total-credit"]').value = formatAmount(totalCredit);
  }

}
