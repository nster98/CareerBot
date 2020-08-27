
/* jshint esversion: 8 */

const FILE_NAME = __filename + ': ';

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