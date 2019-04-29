import Component from '../Component';
import { translate as __, formatAmount } from '../helpers';

import styles from '../../styles/h5p-accounting-journal-entry.css';

const data = new WeakMap();

class JournalItem extends Component {

  get accountNumber() {
    return Number(this.element.querySelector('[name="account-number"]').value);
  }
  set accountNumber(value) {
    this.element.querySelector('[name="account-number"]').value = value;

    // Update the account name
    this.element.querySelector(`td.${styles.accountName}`).textContent = this.chart[value];
  }

  get invoiceType() {
    return this.element.querySelector('[name="invoice-type"]').value;
  }
  set invoiceType(value) {
    this.element.querySelector('[name="invoice-type"]').value = value;
  }

  get plusMinus() {
    return this.element.querySelector('[name="plus-minus"]').value;
  }
  set plusMinus(value) {
    this.element.querySelector('[name="plus-minus"]').value = value;
  }

  get amount() {
    return Number(this.element.querySelector('[name="amount"]').value);
  }
  set amount(value) {
    this.element.querySelector('[name="amount"]').value = value;
  }

  get data() {
    return {
      accountNumber: this.accountNumber,
      invoiceType: this.invoiceType,
      plusMinus: this.plusMinus,
      amount: this.amount
    }
  }
  set data(value) {
    this.accountNumber = value.accountNumber;
    this.invoiceType = value.invoiceType;
    this.plusMinus = value.plusMinus;
    this.amount = value.amount;
  }

  /**
   * @constructor
   * @param {string} type The type of item, either 'debit' or 'credit'
   * @param {object} chart The 'Chart of Accounts' to be used
   */
  constructor(type, chart, isSolution) {
    super();

    data.set(this, Object.create(null));

    this.type = type;
    this.chart = chart;
    this.isSolution = isSolution;

    // When the account number changes, lookup the number in the chart of accounts
    this.on('itemChange', (name, oldValue, newValue) => {
      let accountNameCell = this.element.querySelector(`td.${styles.accountName}`);

      if (name !== 'account-number') return;

      if (this.chart.hasOwnProperty(newValue)) {
        accountNameCell.textContent = this.chart[newValue];
      } else if (newValue === '') {
        accountNameCell.innerHTML = `<span class="${styles.empty}">${__('enter_account_number')}</span>`;
      } else {
        accountNameCell.innerHTML = `<span class="${styles.invalid}">${__('invalid_account_number')}</span>`;
      }
    });

    // Fire an event if data is added for the first time
    this.on('itemChange', (name, oldValue, newValue) => {
      let keys = ['account-number', 'invoice-type', 'plus-minus', 'amount'];
      let isNewItem = keys.every(key => {
        let value = this.element.querySelector(`[name=${key}]`).value;

        return !Boolean((key === name) ? oldValue : value);
      });

      if (isNewItem) {
        this.emit('newItem');
      };
    });

    // Fire an event when all the fields become empty
    this.on('itemChange', (name, oldValue, newValue) => {
      let keys = ['account-number', 'invoice-type', 'plus-minus', 'amount'];
      let deleteItem = !keys.some(key => {
        let value = this.element.querySelector(`[name=${key}]`).value;

        return Boolean(value);
      });

      if (deleteItem) {
        this.emit('deleteItem');
      };
    });
  }

  render(container) {
    super.render(container, `
      <tr>
        ${(container.children.length === 0) ? `
          <th class="${styles.title}">
            ${__(this.type)}
          </th>
        ` : ''}
        <td class="${styles.accountNumber}">
          <input type="text" name="account-number" ${this.isSolution ? 'disabled' : ''} />
        </td>
        <td class="${styles.accountName}">
          <span class="${styles.empty}">${__('enter_account_number')}</span>
        </td>
        <td class="${styles.invoiceType}">
          <select name="invoice-type" ${this.isSolution ? 'disabled' : ''}>
            <option value="">&mdash;</option>
            <option value="A">${__('assets')}</option>
            <option value="L">${__('liabilities')}</option>
            <option value="E">${__('expenses')}</option>
            <option value="R">${__('revenue')}</option>
          </select>
        </td>
        <td class="${styles.plusMinus}">
          <select name="plus-minus" ${this.isSolution ? 'disabled' : ''}>
            <option></option>
            <option value="plus">&plus;</option>
            <option value="minus">&minus;</option>
          </select>
        </td>
        <td class="${styles.amountDebit}">
          ${this.type === 'debit' ? `
            <input type="text" name="amount" ${this.isSolution ? 'disabled' : ''} />
          ` : ''}
        </td>
        <td class="${styles.amountCredit}">
          ${this.type === 'credit' ? `
            <input type="text" name="amount" ${this.isSolution ? 'disabled' : ''} />
          ` : ''}
        </td>
        <td class="${styles.controls}"></td>
      </tr>
    `);

    ['account-number', 'invoice-type', 'plus-minus', 'amount'].forEach(name => {
      let element = this.element.querySelector(`[name="${name}"]`);
      let type = (element.tagName === 'SELECT') ? 'change' : 'input';

      element.addEventListener(type, event => {
        let newValue = event.target.value;
        let oldValue = data.get(this)[name] || '';

        if (newValue === oldValue) return;

        this.emit('itemChange', name, oldValue, newValue);

        data.get(this)[name] = newValue;
      });
    });

    // Calculate the correct row span for the added row
    container.querySelector(`th.${styles.title}`).setAttribute('rowspan', container.children.length);
  }

  remove() {
    var container = this.element.parentNode;

    // If the first element is being removed, move the spanned header cell to the next row
    if (this.element.previousElementSibling === null && container.children.length > 0) {
      let nextRow = this.element.nextElementSibling;

      nextRow.insertBefore(this.element.firstElementChild, nextRow.firstElementChild);
    }

    super.remove();

    if (container.children.length === 0) return;

    // Calculate the correct row span for the added row
    container.querySelector(`th.${styles.title}`).setAttribute('rowspan', container.children.length);
  }

}

export default JournalItem;
