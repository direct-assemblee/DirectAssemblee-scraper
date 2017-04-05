/**
 * Depute.js
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
    officialId: {
      type: 'int',
      unique: true
    },
    civility: {
      type: 'string'
    },
    firstname: {
      type: 'string'
    },
    lastname: {
      type: 'string'
    },
    party: {
      type: 'string'
    },
    departmentId: {
      type: 'int'
    },
    subdepartment: {
      type: 'int'
    },
    commission: {
      type: 'string'
    },
    subscribers: {
      collection: 'subscriber',
      via: 'followedDeputeIds',
      dominant: true
    }
  }
};
