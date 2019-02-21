import styles from './journal-entry.css';


const createJournalItemTable = (data) => (`
  <table class="${styles.journalItem}">
    <thead>
      <tr>
        <th></th>
        <th>Number</th>
        <th>Account name</th>
        <th>Type</th>
        <th>+/-</th>
        <th>Debit</th>
        <th>Credit</th>
      </tr>
    </thead>
    <tbody class="${styles.debit}">
      ${createJournalTransaction(data, 'debit', 2)}
      ${createJournalTransaction(data, 'debit')}
    </tbody>
    <tbody class="${styles.credit}">
      ${createJournalTransaction(data, 'credit', 2)}
      ${createJournalTransaction(data, 'credit')}
    </tbody>
    <tfoot>
        <th class="${styles.totalLabel}" colspan="5">Total:</th>
        <th class="${styles.totalDebit}">0.00</th>
        <th class="${styles.totalCredit}">0.00</th>
    </tfoot>
  </table>
`);

const createJournalTransaction = (data, amountType, titleSpan = false) => (`
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


export default class {
  
  /**
   * @constructor
   * 
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    
  }
  
  /**
   * Attach function called by H5P framework to insert H5P content into page
   * 
   * @param {jQuery} $container
   */
  attach($container) {
    $container.addClass('h5p-accounting-journal-entry');
    $container.append(createJournalItemTable());
  }
  
}
