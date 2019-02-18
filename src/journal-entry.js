import styles from './journal-entry.css';


export default class extends H5P.EventDispatcher {
  
  /**
   * @constructor
   * 
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super();
  }
  
  /**
   * Attach function called by H5P framework to insert H5P content into page
   * 
   * @param {jQuery} $container
   */
  attach($container) {
    // Add HTML
    $container.append(`
      <div class="${styles.test}">OK!</div>
    `);
  }
  
}
