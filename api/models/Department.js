/**
 * Department.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    nameUppercase: {
      type: 'string'
    },
    slug: {
      type: 'string'
    },
    soundexName: {
      type: 'string'
    }
  }
}
