let DB

switch (process.env.DATA_SOURCE) {
  case 'files':
    DB = require('./files')
    break
  case 'couch':
    DB = require('./couch')
    break
  default:
    throw new Error('Unknown or missing data source config')
}

export default DB
