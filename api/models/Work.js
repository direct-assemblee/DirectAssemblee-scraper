module.exports = {
  autoCreatedAt: true,
  autoUpdatedAt: true,
  attributes: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: 'string'
    },
    officialId: {
      type: 'int',
    },
    date: {
      type: 'date'
    },
    url: {
      type: 'string'
    },
    description: {
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
