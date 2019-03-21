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
    this.items = [];
  }

  render(container, options) {
    super.render(container, `
      <div>
        <div class="${styles.journalEntry}">
        </div>
        ${this.isSolution ? '' : `
          <button id="${styles.addJournalItem}" class="h5p-core-button">${__('add_journal_item')}</button>
        `}
      </div>
    `, options);

    if (!this.isSolution) {
      this.element.querySelector(`#${styles.addJournalItem}`).addEventListener('click', () => {
        this.addJournalItem();
      });
    }

    this.addJournalItem();
  }

  setData(data) {
    var listDiv = this.element.querySelector(`div.${styles.journalEntry}`);

    if (data === undefined) return;

    // Remove all current journal items
    listDiv.innerHTML = '';
    this.items = [];

    // Add new journal items
    data.forEach(item => {
      this.items.push(this.addJournalItem(item));
    });
  }

  addJournalItem(data) {
    var journalItem = new JournalItem(this.chart, this.isSolution);
    var listDiv = this.element.querySelector(`div.${styles.journalEntry}`);

    journalItem.render(listDiv);
    journalItem.setData(data);

    // Check when item is removed
    journalItem.on('remove', () => {
      if (this.items.includes(journalItem)) {
        this.items.splice(this.items.indexOf(journalItem), 1);
      }
    })

    // Check for the creation of first new data in an item
    journalItem.on('newItem', () => {
      this.items.push(journalItem);
    });

    // Check when all data in an item is removed
    journalItem.on('deleteItem', () => {
      this.items.splice(this.items.indexOf(journalItem), 1);
    });

    return journalItem;
  }

}
