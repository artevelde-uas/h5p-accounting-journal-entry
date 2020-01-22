import Component from '../Component';
import JournalItem from './JournalItem';
import l10n from '../l10n';
import { formatAmount } from '../util';

import styles from '../../styles/h5p-accounting-journal-entry.css';

class JournalEntry extends Component {

  get data() {
    return {
      debitItems: this.items.debit.map(item => item.data),
      creditItems: this.items.credit.map(item => item.data)
    };
  }

  set data(data) {
    ['debit', 'credit'].forEach(type => {
      // Remove all current items
      this.items[type] = [];
      this.element.querySelector(`tbody.${styles[type]}`).innerHTML = `
        <tr>
          <th class="${styles.title}">${l10n[type]}</th>
        </tr>
      `;

      // Add new items
      data[`${type}Items`].forEach(item => {
        if (item instanceof Array) {
          item = item[0];
        }

        this.items[type].push(this.addItemRow(type, item));
      });

      if (!this.isSolution) {
        this.addItemRow(type);
      }
    });

    this.calculateTotals();
  }

  /**
   * @constructor
   * @param {object} chart The 'Chart of Accounts' to be used
   */
  constructor(chart, isSolution, invoiceTypeVisibility, posNegVisibility) {
    super();

    this.chart = chart;
    this.isSolution = isSolution;
    this.invoiceTypeVisibility = invoiceTypeVisibility;
    this.posNegVisibility = posNegVisibility;
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
    var showInvoiceType = this.invoiceTypeVisibility !== 'hidden';
    var showPosNeg = this.posNegVisibility !== 'hidden';
    var totalColSpan = 3;

    if (showInvoiceType) totalColSpan++;
    if (showPosNeg) totalColSpan++;

    super.render(container, `
      <table class="${styles.entry}">
        <thead>
          <tr>
            <th></th>
            <th>${l10n.number}</th>
            <th>${l10n.accountName}</th>
            ${showInvoiceType ? `
              <th>${l10n.type}</th>
            ` : ''}
            ${showPosNeg ? `
              <th>&plus; / &minus;</th>
            ` : ''}
            <th>${l10n.debit}</th>
            <th>${l10n.credit}</th>
            <th class="${styles.controls}">
              ${this.isSolution ? '' : `
                <button class="${styles.deleteEntry}" title="${l10n.deleteJournalEntry}"></button>
              `}
            </th>
          </tr>
        </thead>
        <tbody class="${styles.debit}">
          <tr>
            <th class="${styles.title}">${l10n.debit}</th>
          </tr>
        </tbody>
        <tbody class="${styles.credit}">
          <tr>
            <th class="${styles.title}">${l10n.credit}</th>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th class="${styles.totalLabel}" colspan="${totalColSpan}">${l10n.total}:</th>
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

        this.remove();
      });
    }

    // Add two debit and two credit rows
    this.addItemRow('debit');
    this.addItemRow('debit');
    this.addItemRow('credit');
    this.addItemRow('credit');
  }

  addItemRow(type, data) {
    var items = this.items[type];
    var item = new JournalItem(type, this.chart, this.isSolution, this.invoiceTypeVisibility, this.posNegVisibility);
    var tbody = this.element.querySelector(`tbody.${styles[type]}`);

    // Calculate the correct row span for the added row
    function setRowspan() {
      tbody.querySelector(`th.${styles.title}`).setAttribute('rowspan', tbody.children.length);
    }

    item.render(tbody);
    setRowspan();

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

      // Remove the row from the list but keep at least two (+ title row)
      if (tbody.children.length > 3) {
        item.remove();
        setRowspan();
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

  getItems() {
    return this.items.debit.concat(this.items.credit);
  }

}

export default JournalEntry;
