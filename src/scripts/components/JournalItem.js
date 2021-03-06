import Component from '../Component';
import l10n from '../l10n';

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
    return (this.invoiceTypeVisibility === 'showWithScoring') ? this.element.querySelector('[name="invoice-type"]').value : undefined;
  }
  set invoiceType(value) {
    if (this.invoiceTypeVisibility === 'showWithScoring') {
      this.element.querySelector('[name="invoice-type"]').value = value;
    }
  }

  get posNeg() {
    return (this.posNegVisibility === 'showWithScoring') ? this.element.querySelector('[name="pos-neg"]').value : undefined;
  }
  set posNeg(value) {
    if (this.posNegVisibility === 'showWithScoring') {
      this.element.querySelector('[name="pos-neg"]').value = value;
    }
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
      posNeg: this.posNeg,
      amount: this.amount
    };
  }
  set data(value) {
    this.accountNumber = value.accountNumber;
    this.invoiceType = value.invoiceType;
    this.posNeg = value.posNeg;
    this.amount = value.amount;
  }

  /**
   * @constructor
   * @param {string} type The type of item, either 'debit' or 'credit'
   * @param {object} chart The 'Chart of Accounts' to be used
   */
  constructor(type, chart, isSolution, invoiceTypeVisibility, posNegVisibility) {
    super();

    data.set(this, Object.create(null));

    this.type = type;
    this.chart = chart;
    this.isSolution = isSolution;
    this.invoiceTypeVisibility = invoiceTypeVisibility;
    this.posNegVisibility = posNegVisibility;
    this.inputNames = ['account-number', 'amount'];

    if (this.invoiceTypeVisibility !== 'hidden') {
      this.inputNames.push('invoice-type');
    }
    if (this.posNegVisibility !== 'hidden') {
      this.inputNames.push('pos-neg');
    }

    // When the account number changes, lookup the number in the chart of accounts
    this.on('itemChange', (name, oldValue, newValue) => {
      var accountNameCell = this.element.querySelector(`td.${styles.accountName}`);

      if (name !== 'account-number') return;

      if (this.chart.hasOwnProperty(newValue)) {
        accountNameCell.textContent = this.chart[newValue];
      } else if (newValue === '') {
        accountNameCell.innerHTML = `<span class="${styles.empty}">${l10n.enterAccountNumber}</span>`;
      } else {
        accountNameCell.innerHTML = `<span class="${styles.invalid}">${l10n.invalidAccountNumber}</span>`;
      }
    });

    // Fire an event if data is added for the first time
    this.on('itemChange', (name, oldValue, newValue) => {
      var isNewItem = this.inputNames.every(key => {
        var value = this.element.querySelector(`[name=${key}]`).value;

        return !Boolean((key === name) ? oldValue : value);
      });

      if (isNewItem) {
        this.emit('newItem');
      }
    });

    // Fire an event when all the fields become empty
    this.on('itemChange', (name, oldValue, newValue) => {
      var deleteItem = !this.inputNames.some(key => {
        var value = this.element.querySelector(`[name=${key}]`).value;

        return Boolean(value);
      });

      if (deleteItem) {
        this.emit('deleteItem');
      }
    });
  }

  render(container) {
    var showInvoiceType = this.invoiceTypeVisibility !== 'hidden';
    var showPosNeg = this.posNegVisibility !== 'hidden';

    super.render(container, `
      <tr>
        <td class="${styles.accountNumber}">
          <input type="text" name="account-number" ${this.isSolution ? 'disabled' : ''} />
        </td>
        <td class="${styles.accountName}">
          <span class="${styles.empty}">${l10n.enterAccountNumber}</span>
        </td>
        ${showInvoiceType ? `
          <td class="${styles.invoiceType}">
            <select name="invoice-type" ${this.isSolution ? 'disabled' : ''}>
              <option value="">&mdash;</option>
              <option value="A">${l10n.assets}</option>
              <option value="L">${l10n.liabilities}</option>
              <option value="E">${l10n.expenses}</option>
              <option value="R">${l10n.revenue}</option>
            </select>
          </td>
        ` : ''}
        ${showPosNeg ? `
          <td class="${styles.posNeg}">
            <select name="pos-neg" ${this.isSolution ? 'disabled' : ''}>
              <option></option>
              <option value="pos">&plus;</option>
              <option value="neg">&minus;</option>
            </select>
          </td>
        ` : ''}
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
        <td class="${styles.feedback}"></td>
      </tr>
    `);

    this.inputNames.forEach(name => {
      var element = this.element.querySelector(`[name="${name}"]`);
      var type = (element.tagName === 'SELECT') ? 'change' : 'input';

      element.addEventListener(type, event => {
        var newValue = event.target.value;
        var oldValue = data.get(this)[name] || '';

        if (newValue === oldValue) return;

        this.emit('itemChange', name, oldValue, newValue);

        data.get(this)[name] = newValue;
      });
    });
  }

  setFeedback(type) {
    var feedback = this.element.querySelector(`td.${styles.feedback}`);

    switch (type) {
      case 'correct':
        feedback.innerHTML = `
          <span class="${styles.correct}"></span>
        `;
        break;
      case 'wrong':
        feedback.innerHTML = `
          <span class="${styles.wrong}"></span>
        `;
        break;
      default:
        feedback.innerHTML = '';
        break;
    }
  }

}

export default JournalItem;
