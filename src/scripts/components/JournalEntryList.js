import Component from '../Component';
import JournalEntry from './JournalEntry';
import { translate as __, formatAmount } from '../helpers';

import styles from '../../styles/h5p-accounting-journal-entry.css';

class JournalEntryList extends Component {

  get data() {
    return this.entries.map(entry => entry.data);
  }

  set data(data) {
    var listDiv = this.element.querySelector(`div.${styles.entryList}`);

    // Remove all current journal entries
    listDiv.innerHTML = '';
    this.entries = [];

    if (data === null || data.length === 0) {
      this.addJournalEntry();
    }

    // Add new journal entries
    data.forEach(entry => {
      this.entries.push(this.addJournalEntry(entry));
    });
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
    this.entries = [];
  }

  render(container, options) {
    super.render(container, `
      <div>
        <div class="${styles.entryList}">
        </div>
        ${this.isSolution ? '' : `
          <button class="h5p-joubelui-button truncated ${styles.addEntry}" title="${__('add_journal_entry')}"></button>
        `}
      </div>
    `, options);

    if (!this.isSolution) {
      this.element.querySelector(`.${styles.addEntry}`).addEventListener('click', () => {
        this.addJournalEntry();
      });
    }

    this.addJournalEntry();
  }

  addJournalEntry(data) {
    var journalEntry = new JournalEntry(this.chart, this.isSolution, this.invoiceTypeVisibility, this.posNegVisibility);
    var listDiv = this.element.querySelector(`div.${styles.entryList}`);

    journalEntry.render(listDiv);

    if (data !== undefined) {
      journalEntry.data = data;
    }

    // Check when entry is removed
    journalEntry.on('remove', () => {
      if (this.entries.includes(journalEntry)) {
        this.entries.splice(this.entries.indexOf(journalEntry), 1);
      }
    });

    // Check for the creation of first new data in an entry
    journalEntry.on('newEntry', () => {
      this.entries.push(journalEntry);
    });

    // Check when all data in an entry is removed
    journalEntry.on('deleteEntry', () => {
      this.entries.splice(this.entries.indexOf(journalEntry), 1);
    });

    return journalEntry;
  }

  getItems() {
    return this.entries.flatMap(entry => entry.getItems());
  }

}

export default JournalEntryList;
