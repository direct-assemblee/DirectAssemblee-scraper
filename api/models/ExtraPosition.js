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
    type: {
      type: 'string'
    },
    deputyId: {
      type: 'int',
      model: 'Deputy'
    }
  }
};
