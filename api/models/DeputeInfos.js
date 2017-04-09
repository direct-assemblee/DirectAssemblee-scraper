/**
 * DeputeInfos.js
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
    fullname: {
      type: 'string'
    },
    lastname: {
      type: 'string'
    },
    firstname: {
      type: 'string'
    },
    genre: {
      type: 'string'
    },
    birthdate: {
      type: 'date'
    },
    birthplace: {
      type: 'string'
    },
    departmentNumber: {
      type: 'string'
    },
    circonscriptionName: {
      type: 'string'
    },
    circonscriptionNumber: {
      type: 'int'
    },
    circonscriptionNumber: {
      type: 'string'
    },
    mandateStartingDate: {
      type: 'string'
    },
    roleInParty: {
      type: 'string'
    },
    partyShort: {
      type: 'string'
    },
    party: {
      type: 'string'
    },
    websites: {
      type: 'array'
    },
    emails: {
      type: 'array'
    },
    addresses: {
      type: 'array'
    },
    previousMandates: {
      type: 'array'
    },
    otherMandates: {
      type: 'array'
    },
    previousOtherMandates: {
      type: 'array'
    },
    job: {
      type: 'string'
    },
    seat: {
      type: 'int'
    },
    officialUrl: {
      type: 'string'
    },
    officialId: {
      type: 'int',
      unique: true
    },
    slugName: {
      type: 'string'
    },
    numberOfMandates: {
      type: 'int'
    },
    twitter: {
      type: 'string'
    }
  }
};
