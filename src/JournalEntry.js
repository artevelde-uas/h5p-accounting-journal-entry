import Component from './Component';
import JournalItem from './JournalItem';
import { translate as __, formatAmount } from './helpers';

import styles from './journal-entry.css';


export default class extends Component {

  /**
   * @constructor
   * @param {object} chart The 'Chart of Accounts' to be used
   */
  constructor(chart) {
    super();
    
    this.chart = chart;
    this.items = [];
  }
  
  render(container, options) {
    super.render(container, `
      <div class="${styles.journalEntry}">
        <div class="${styles.journalEntryList}">
        </div>
        <button class="h5p-core-button ${styles.addJournalItem}">${__('add_journal_item')}</button>
      </div>
    `, options);
    
    this.element.querySelector(`.${styles.addJournalItem}`).addEventListener('click', () => {
      this.addJournalItem();
    });
    
    this.addJournalItem();
  }
  
  addJournalItem(type, data) {
    var journalItem = new JournalItem(this.chart);
    var listDiv = this.element.querySelector(`div.${styles.journalEntryList}`);
    
    journalItem.render(listDiv);
    
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
  }
  
}
