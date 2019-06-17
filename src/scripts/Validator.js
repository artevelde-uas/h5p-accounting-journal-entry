
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

        // If the single point per row option is enabled, maximum score per row is one
        if (this.behaviour.singlePointPerRow) {
          return numItems;
        }

        let useInvoiceType = this.behaviour.invoiceTypeVisibility === 'showWithScoring';
        let usePosNeg = this.behaviour.posNegVisibility === 'showWithScoring';

        // If neither invoice type column or pos/neg column was enabled, maximum score per row is two
        if (!useInvoiceType && !usePosNeg) {
          return numItems * 2;
        }

        // If only one of invoice type column or pos/neg column was enabled, maximum score per row is three
        if (useInvoiceType != usePosNeg) {
          return numItems * 3;
        }

        // Otherwise, maximum score per row is four
        return numItems * 4;
    }
  }

  getNormalizedSolution() {
    var debitItems = this.solution.flatMap(entry => entry.debitItems);
    var creditItems = this.solution.flatMap(entry => entry.creditItems);
    var walker = (type, options) => {
      options.forEach(item => {
        item.type = type;

        if (this.behaviour.invoiceTypeVisibility !== 'showWithScoring') {
          delete item.invoiceType;
        }

        if (this.behaviour.posNegVisibility !== 'showWithScoring') {
          delete item.posNeg;
        }
      })
    };

    debitItems.forEach(walker.bind(undefined, 'debit'));
    creditItems.forEach(walker.bind(undefined, 'credit'));

    return debitItems.concat(creditItems).flat();
  }

  getFeedback() {
    var data = this.answer.getNormalizedData();
    var countFilter = (type, item) => (item.type === type);
    var totalReducer = (type, sum, item) => (item.type === type ? (sum + item.amount) : sum);
    var feedback = [];

    // Check if there is at least one debit and one credit item
    {
      let countDebit = data.filter(countFilter.bind(undefined, 'debit')).length;
      let countCredit = data.filter(countFilter.bind(undefined, 'credit')).length;

      if (countDebit === 0 || countCredit === 0) {
        feedback.push('no_debit_or_credit_bookings');
      }
    }

    // Check if debit and credit are equal
    if (this.behaviour.debetCreditEqual) {
      let totalDebit = data.reduce(totalReducer.bind(undefined, 'debit'), 0);
      let totalCredit = data.reduce(totalReducer.bind(undefined, 'credit'), 0);

      if (totalDebit !== totalCredit) {
        feedback.push('totals_not_equal');
      }
    }

    return feedback;
  }

  validate() {
    var data = this.answer.getNormalizedData();
    var solution = this.getNormalizedSolution();

    // Loop over each item and check if it exists as a possible solution
    data.forEach(item => {
      var found = solution.some(data => (
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
