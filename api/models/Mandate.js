/**
 * Subscriber.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autoCreatedAt: true,
  autoUpdatedAt: true,
  attributes: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string'
    },
    startingDate: {
      type: 'date'
    },
    endingDate: {
      type: 'date'
    },
    deputeId: {
      type: 'int',
      model: 'Depute'
    }
  }
};
