
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
    let data = this.getNormalizedAnswer();
    let solution = this.getNormalizedSolution();
    let countReducer = (sum, item) => (sum + item.items.length);
    let totalReducer = (type, sum, item) => (item.type === type ? (sum + item.amount) : sum);
    let scoreReducer = (sum, item) => {
      let found = solution.flat().find(data => (data.accountNumber === item.accountNumber));

      // If the item is not found in the solution, don't give any points
      if (found === undefined) {
        return sum;
      }

      // If the single point per row option is enabled, add one point if all items are correct, zero otherwise
      if (this.behaviour.singlePointPerRow) {
        if (found.invoiceType === item.invoiceType &&
            found.posNeg === item.posNeg &&
            found.amount === item.amount) {
          return sum + 1;
        }

        return sum;
      }

      // The account number was correct, so give at least one point
      let points = 1;

      let useInvoiceType = this.behaviour.invoiceTypeVisibility === 'showWithScoring';
      let usePosNeg = this.behaviour.posNegVisibility === 'showWithScoring';

      // If invoice type column was enabled and invoice type is correct, add one point
      if (useInvoiceType && (found.invoiceType === item.invoiceType)) {
        points += 1;
      }

      // If pos/neg column was enabled and pos/neg is correct, add one point
      if (usePosNeg && (found.posNeg === item.posNeg)) {
        points += 1;
      }

      // If amount is correct, add one point
      if (found.amount === item.amount) {
        points += 1;
      }

      // add points to the total
      return sum + points;
    };

    // Check if debit and credit are equal
    if (this.behaviour.debetCreditEqual) {
      let totalDebit = data.reduce(totalReducer.bind(undefined, 'debit'), 0);
      let totalCredit = data.reduce(totalReducer.bind(undefined, 'credit'), 0);

      if (totalDebit !== totalCredit) {
        return 0;
      }
    }

    // Check if number of rows in answer exceeds number of rows in solution
    if (this.behaviour.noExtraLines) {
      let countAnswer = data.reduce(countReducer, 0);
      let countSolution = this.getNormalizedSolution().length;

      if (countAnswer > countSolution) {
        return 0;
      }
    }

    let score = data.reduce(scoreReducer, 0);

    // Recalculate score
    if (this.behaviour.scoringMechanism === 'recalculated') {
      let countSolution = this.getNormalizedSolution().length;

      score = score * this.behaviour.maxScore / (countSolution * this.getMaxPointsPerRow());
    }

    return score;
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
        let countSolution = this.getNormalizedSolution().length;

        return countSolution * this.getMaxPointsPerRow();
    }
  }

  getMaxPointsPerRow() {
    // If the single point per row option is enabled, maximum score per row is one
    if (this.behaviour.singlePointPerRow) {
      return 1;
    }

    let useInvoiceType = this.behaviour.invoiceTypeVisibility === 'showWithScoring';
    let usePosNeg = this.behaviour.posNegVisibility === 'showWithScoring';

    // If neither invoice type column or pos/neg column was enabled, maximum score per row is two
    if (!useInvoiceType && !usePosNeg) {
      return 2;
    }

    // If only one of invoice type column or pos/neg column was enabled, maximum score per row is three
    if (useInvoiceType != usePosNeg) {
      return 3;
    }

    // Otherwise, maximum score per row is four
    return 4;
  }

  getNormalizedSolution() {
    let debitItems = this.solution.flatMap(entry => entry.debitItems);
    let creditItems = this.solution.flatMap(entry => entry.creditItems);
    let walker = (type, options) => {
      options.forEach(item => {
        item.type = type;

        if (this.behaviour.invoiceTypeVisibility !== 'showWithScoring') {
          delete item.invoiceType;
        }

        if (this.behaviour.posNegVisibility !== 'showWithScoring') {
          delete item.posNeg;
        }
      });
    };

    debitItems.forEach(walker.bind(undefined, 'debit'));
    creditItems.forEach(walker.bind(undefined, 'credit'));

    return debitItems.concat(creditItems);
  }

  /**
   * Gets the data with items grouped by accountName, invoiceType and posNeg, with the sum of their amounts
   */
  getNormalizedAnswer() {
    let items = this.answer.getItems();
    let reducer = (list, item, i) => {
      let found = list.find(data => (
        data.type === item.type &&
        data.accountNumber === item.data.accountNumber &&
        data.invoiceType === item.data.invoiceType &&
        data.posNeg === item.data.posNeg
      ));

      if (found === undefined) {
        let data = {
          type: item.type,
          accountNumber: item.data.accountNumber,
          amount: item.data.amount,
          items: [item]
        };

        if (this.behaviour.invoiceTypeVisibility === 'showWithScoring') {
          data.invoiceType = item.data.invoiceType;
        }

        if (this.behaviour.posNegVisibility === 'showWithScoring') {
          data.posNeg = item.data.posNeg;
        }

        list.push(data);
      } else {
        found.amount += item.data.amount;
        found.items.push(item);
      }

      return list;
    };

    return items.reduce(reducer, []);
  }

  getFeedback() {
    let data = this.getNormalizedAnswer();
    let countFilter = (type, item) => (item.type === type);
    let totalReducer = (type, sum, item) => (item.type === type ? (sum + item.amount) : sum);
    let feedback = [];

    // Check if there is at least one debit and one credit item
    {
      let countDebit = data.filter(countFilter.bind(undefined, 'debit')).length;
      let countCredit = data.filter(countFilter.bind(undefined, 'credit')).length;

      if (countDebit === 0 || countCredit === 0) {
        feedback.push('noDebitOrCreditBookings');
      }
    }

    // Check if debit and credit are equal
    {
      let totalDebit = data.reduce(totalReducer.bind(undefined, 'debit'), 0);
      let totalCredit = data.reduce(totalReducer.bind(undefined, 'credit'), 0);

      if (totalDebit !== totalCredit) {
        feedback.push('totalsNotEqual');
      }
    }

    return feedback;
  }

  validate() {
    let data = this.getNormalizedAnswer();
    let solution = this.getNormalizedSolution();

    // Loop over each item and check if it exists as a possible solution
    data.forEach(item => {
      let found = solution.flat().some(data => (
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
