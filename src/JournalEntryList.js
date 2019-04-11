import Component from './Component';
import JournalEntry from './JournalEntry';
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
    this.entries = [];
  }

  render(container, options) {
    super.render(container, `
      <div>
        <div class="${styles.entryList}">
        </div>
        ${this.isSolution ? '' : `
          <button id="${styles.addEntry}" class="h5p-core-button">${__('add_journal_entry')}</button>
        `}
      </div>
    `, options);

    if (!this.isSolution) {
      this.element.querySelector(`#${styles.addEntry}`).addEventListener('click', () => {
        this.addJournalEntry();
      });
    }

    this.addJournalEntry();
  }

  getData() {
    return this.entries.map(entry => entry.getData());
  }

  setData(data) {
    var listDiv = this.element.querySelector(`div.${styles.entryList}`);

    if (data === undefined) return;

    // Remove all current journal entries
    listDiv.innerHTML = '';
    this.entries = [];

    // Add new journal entries
    data.forEach(entry => {
      this.entries.push(this.addJournalEntry(entry));
    });
  }

  addJournalEntry(data) {
    var journalEntry = new JournalEntry(this.chart, this.isSolution);
    var listDiv = this.element.querySelector(`div.${styles.entryList}`);

    journalEntry.render(listDiv);
    journalEntry.setData(data);

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

}
