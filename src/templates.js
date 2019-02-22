import styles from './journal-entry.css';


export const journalItemTemplate = (data) => (`
  <table class="${styles.journalItem}">
    <thead>
      <tr>
        <th></th>
        <th>Number</th>
        <th>Account name</th>
        <th>Type</th>
        <th>&plus; / &minus;</th>
        <th>Debit</th>
        <th>Credit</th>
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
        <th class="${styles.totalLabel}" colspan="5">Total:</th>
        <th class="${styles.totalDebit}">0.00</th>
        <th class="${styles.totalCredit}">0.00</th>
    </tfoot>
  </table>
`);

export const journalTransactionTemplate = (data, amountType, titleSpan = false) => (`
  <tr>
    ${titleSpan ? `
      <td rowspan="${titleSpan}" class="${styles.title}">
        ${amountType === 'debit' ? 'Debit' : 'Credit' }
      </td>
    ` : ''}
    <td class="${styles.accountNumber}">
      <input type="text" />
    </td>
    <td class="${styles.accountName}">
    </td>
    <td class="${styles.invoiceType}">
      <select>
        <option>&mdash;</option>
        <option value="A">Assets</option>
        <option value="L">Liabilities</option>
        <option value="E">Expenses</option>
        <option value="R">Revenue</option>
      </select>
    </td>
    <td class="${styles.plusMin}">
      <select>
        <option></option>
        <option value="plus">&plus;</option>
        <option value="minus">&minus;</option>
      </select>
    </td>
    <td class="${styles.amountDebit}">
      ${amountType === 'debit' ? `
        <input type="text" />
      ` : ''}
    </td>
    <td class="${styles.amountCredit}">
      ${amountType === 'credit' ? `
        <input type="text" />
      ` : ''}
    </td>
  </tr>
`);
