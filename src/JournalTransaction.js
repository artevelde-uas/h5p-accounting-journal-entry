import Component from './Component';
import { translate as __, formatAmount } from './helpers';

import styles from './journal-entry.css';


export default class extends Component {
  
  /**
   * @constructor
   * @param {string} type The type of transaction, either 'debit' or 'credit'
   * @param {object} chart The 'Chart of Accounts' to be used
   */
  constructor(type, chart) {
    super();
    
    this.type = type;
    this.chart = chart;
    
    // When the account number changes, lookup the number in the chart of accounts
    this.onChange('accountNumber', accountNumber => {
      var accountNameCell = this.element.querySelector(`td.${styles.accountName}`);
      
      if (this.chart.hasOwnProperty(accountNumber)) {
        accountNameCell.textContent = this.chart[accountNumber];
      } else if (accountNumber === '') {
        accountNameCell.innerHTML = `<span class="${styles.empty}">${__('enter_account_number')}</span>`;
      } else {
        accountNameCell.innerHTML = `<span class="${styles.invalid}">${__('invalid_account_number')}</span>`;
      }
    });
    
    ['accountNumber', 'invoiceType', 'plusMinus', 'amount'].forEach(name => {
      // Fire an event if data is added for the first time
      this.onChange(name, function onChange(name, value, oldValue) {
        var isNewTransaction = Object.entries(this.getData()).every(([key, value]) => {
          return (key === name) ? (oldValue === '') : (value === '')
        });
        
        if (isNewTransaction) {
          this.emit('newTransaction');
        };
      }.bind(this, name));
      
      // Fire an event when all the fields become empty
      this.onChange(name, () => {
        var deleteTransaction = !Object.values(this.getData()).some(value => (value !== ''));
        
        if (deleteTransaction) {
          this.emit('deleteTransaction');
        };
      });
    });
  }
  
  render(container, data) {
    super.render(container, `
      <tr>
        ${(container.children.length === 0) ? `
          <th class="${styles.title}">
            ${__(this.type)}
          </th>
        ` : ''}
        <td class="${styles.accountNumber}">
          <input type="text" name="accountNumber" />
        </td>
        <td class="${styles.accountName}">
          <span class="${styles.empty}">${__('enter_account_number')}</span>
        </td>
        <td class="${styles.invoiceType}">
          <select name="invoiceType">
            <option value="">&mdash;</option>
            <option value="A">${__('assets')}</option>
            <option value="L">${__('liabilities')}</option>
            <option value="E">${__('expenses')}</option>
            <option value="R">${__('revenue')}</option>
          </select>
        </td>
        <td class="${styles.plusMinus}">
          <select name="plusMinus">
            <option></option>
            <option value="plus">&plus;</option>
            <option value="minus">&minus;</option>
          </select>
        </td>
        <td class="${styles.amountDebit}">
          ${this.type === 'debit' ? `
            <input type="text" name="amount" />
          ` : ''}
        </td>
        <td class="${styles.amountCredit}">
          ${this.type === 'credit' ? `
            <input type="text" name="amount" />
          ` : ''}
        </td>
        <td class="${styles.controls}"></td>
      </tr>
    `);
    
    if (data !== undefined) {
      this.setData(data);
    }
    
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
