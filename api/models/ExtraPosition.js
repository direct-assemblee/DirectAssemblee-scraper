module.exports = {
  autoCreatedAt: true,
  autoUpdatedAt: true,
  attributes: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    position: {
      type: 'string'
    },
    office: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    deputyId: {
      type: 'int',
      model: 'Deputy'
    }
  }
};
