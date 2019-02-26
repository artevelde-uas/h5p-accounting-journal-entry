import { translate as __, formatAmount } from './helpers';

import styles from './journal-entry.css';


export const journalItemTemplate = (data) => (`
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
      ${journalTransactionTemplate(data, 'debit', 2)}
      ${journalTransactionTemplate(data, 'debit')}
    </tbody>
    <tbody class="${styles.credit}">
      ${journalTransactionTemplate(data, 'credit', 2)}
      ${journalTransactionTemplate(data, 'credit')}
    </tbody>
    <tfoot>
        <th class="${styles.totalLabel}" colspan="5">${__('total')}:</th>
        <th class="${styles.totalDebit}">${formatAmount(0)}</th>
        <th class="${styles.totalCredit}">${formatAmount(0)}</th>
    </tfoot>
  </table>
`);

export const journalTransactionTemplate = (data, amountType, titleSpan = false) => (`
  <tr>
    ${titleSpan ? `
      <td rowspan="${titleSpan}" class="${styles.title}">
        ${__(amountType)}
      </td>
    ` : ''}
    <td class="${styles.accountNumber}">
      <input type="text" name="accountNumber" />
    </td>
    <td class="${styles.accountName}">
      <span class="${styles.empty}">&larr; ${__('enter_account_number')}</span>
    </td>
    <td class="${styles.invoiceType}">
      <select name="invoiceType">
        <option>&mdash;</option>
        <option value="A">${__('assets')}</option>
        <option value="L">${__('liabilities')}</option>
        <option value="E">${__('expenses')}</option>
        <option value="R">${__('revenue')}</option>
      </select>
    </td>
    <td class="${styles.plusMin}">
      <select name="plusMinus">
        <option></option>
        <option value="plus">&plus;</option>
        <option value="minus">&minus;</option>
      </select>
    </td>
    <td class="${styles.amountDebit}">
      ${amountType === 'debit' ? `
        <input type="text" name="amount" />
      ` : ''}
    </td>
    <td class="${styles.amountCredit}">
      ${amountType === 'credit' ? `
        <input type="text" name="amount" />
      ` : ''}
    </td>
  </tr>
`);
