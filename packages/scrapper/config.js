const pkg = require('../../package.json')

const DEFAULTS = {
  reader: {
    name: 'ann',
    options: {
      startPage: 0,
    },
  },
  writer: {
    name: 'couch',
    options: {
      connection: 'http://localhost:5984',
      storeName: 'ann',
      deleteOnStart: true,
    },
  },
  // writer: {
  //   name: 'csv',
  //   options: {
  //     outFile: pkg.name + '.csv',
  //     statsFile: pkg.name + '_stats.csv',
  //     columns: [
  //       {
  //         'prop': 'name',
  //         'name': 'Name',
  //       },
  //       {
  //         'prop': 'type',
  //         'name': 'Type',
  //       },
  //       {
  //         'prop': 'year',
  //         'name': 'Year',
  //       },
  //       {
  //         'prop': 'month',
  //         'name': 'Month',
  //       },
  //       {
  //         'prop': 'Genres',
  //         'name': 'Genres',
  //       },
  //       {
  //         'prop': 'Themes',
  //         'name': 'Themes',
  //       },
  //     ],
  //   },
  // },
}

module.exports = require('rc')(pkg.name, DEFAULTS)
