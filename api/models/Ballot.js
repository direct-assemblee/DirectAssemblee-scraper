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
    title: {
      type: 'string'
    },
    theme: {
      type: 'string'
    },
    date: {
      type: 'date'
    },
    dateDetailed: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    totalVotes: {
      type: 'int'
    },
    yesVotes: {
      type: 'int'
    },
    noVotes: {
      type: 'int'
    },
    analysisUrl: {
      type: 'string'
    },
    fileUrl: {
      type: 'string'
    }
  }
};
