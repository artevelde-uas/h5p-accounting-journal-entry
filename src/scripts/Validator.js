
class Validator {

  constructor(behaviour, solution) {
    this.behaviour = behaviour;
    this.solution = solution;
  }

  setAnswer(answer) {
    this.answer = answer;
  }

  /**
   * Calculates the user's score.
   *
   * @returns {number} User's score.
   */
  getScore() {
    //TODO Return points
    return 0;
  }

  /**
   * Calculates the maximum amount of points achievable.
   *
   * @returns {number} Max score achievable.
   */
  getMaxScore() {
    switch (this.behaviour.scoringMechanism) {
      case 'recalculated':
        return this.behaviour.maxScore;
      default:
        let numItems = this.solution.reduce((sum, entry) => {
          return sum + entry.creditItems.length + entry.debitItems.length;
        }, 0);

        return this.behaviour.singlePointPerRow ? numItems : numItems * 4;
    }
  }

  getNormalizedSolution() {
    var debitItems = this.solution.flatMap(entry => entry.debitItems);
    var creditItems = this.solution.flatMap(entry => entry.creditItems);
    var walker = (type, options) => {
      options.forEach(item => {
        item.type = type;

        if (this.behaviour.posNegVisibility === 'hidden') {
          item.posNeg = undefined;
        }
      })
    };

    debitItems.forEach(walker.bind(undefined, 'debit'));
    creditItems.forEach(walker.bind(undefined, 'credit'));

    return debitItems.concat(creditItems).flat();
  }

  getFeedback() {
    var data = this.answer.getNormalizedData();
    var reducer = (type, sum, item) => (item.type === type ? (sum + item.amount) : sum);
    var totalDebit = data.reduce(reducer.bind(undefined, 'debit'), 0);
    var totalCredit = data.reduce(reducer.bind(undefined, 'credit'), 0);
    var feedback = [];

    // Check if debit and credit are equal
    if (this.behaviour.debetCreditEqual && (totalDebit !== totalCredit)) {
      feedback.push('totals_not_equal');
    }

    return feedback;
  }

  validate() {
    var data = this.answer.getNormalizedData();
    var solution = this.getNormalizedSolution();

    // Loop over each item and check if it exists as a possible solution
    data.forEach(item => {
      let found = solution.some(data => (
        data.type === item.type &&
        data.accountNumber === item.accountNumber &&
        data.invoiceType === item.invoiceType &&
        data.posNeg === item.posNeg &&
        data.amount === item.amount
      ));

      item.items.forEach(item => {
        item.setFeedback(found ? 'correct' : 'wrong');
      });
    });
  }

}

export default Validator;