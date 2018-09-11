'use strict';
const pTimeout = require('p-timeout');

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = (condition, options) => {
  options = Object.assign(
    {
      minInterval: 10,
      maxInterval: 30,
      timeout: Infinity,
    },
    options,
  );

  const promise = new Promise((resolve, reject) => {
    const check = () => {
      Promise.resolve()
        .then(condition)
        .then((value) => {
          if (typeof value !== 'boolean') {
            throw new TypeError('Expected condition to return a boolean');
          }

          if (value === true) {
            resolve();
          } else {
            const randomInt = getRandomInt(
              options.minInterval,
              options.maxInterval,
            );
            setTimeout(check, randomInt);
          }
        })
        .catch(reject);
    };

    check();
  });

  if (options.timeout !== Infinity) {
    return pTimeout(promise, options.timeout);
  }

  return promise;
};
