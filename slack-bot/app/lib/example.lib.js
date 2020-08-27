
/* jshint esversion: 8 */

const FILE_NAME = __filename + ': ';

const ORDER_BUSINESS_RULES = [{
  dataElement: 'size',
  dataType: 'string',
  required: true,
  multiValue: false,
  question: 'What size pizza would like (small, medium, large, extra large)?',
  mutliValueQuestion: '',
}, {
  dataElement: 'toppings',
  dataType: 'string[]',
  required: false,
  multiValue: true,
  question: 'What toppings would you like?',
  mutliValueQuestion: 'Would you like any more toppings?',
}];

class ExampleLib {
  doSomething(provider, body, cbDoSomething) {
    console.log(FILE_NAME + 'I\'m starting DB');

    var genericResponseData = {
      valid: true,
      order: {
        a: 1,
        b: 2,
      }
    };

    if (provider === 'slack') {
      // do something specific to slack
      return cbDoSomething(null, genericResponseData);
    } else if (provider === 'teams') {
      // do something specific to teams
      return cbDoSomething(null, genericResponseData);
    } else {
      return cbDoSomething(new Error('provider not recognized'));
    }
  }
}

module.exports = new ExampleLib();