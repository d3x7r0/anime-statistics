/* global emit:false */

module.exports = {
  types: {
    all: {
      map: function (doc) {
        if (!doc['year'] || !doc['type']) {
          return
        }

        emit(doc['type'].toLowerCase(), doc)
      },
      reduce: '_count',
    },
    byYear: {
      map: function (doc) {
        if (!doc['year'] || !doc['type']) {
          return
        }

        emit([doc['year'], doc['type'].toLowerCase()], doc)
      },
      reduce: '_count',
    },
    byKey: {
      map: function (doc) {
        if (!doc['year'] || !doc['type']) {
          return
        }

        emit([doc['type'].toLowerCase(), doc['year']], doc)
      },
      reduce: '_count',
    },
  },
  sources: {
    all: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        if (doc['sources'] && doc['sources'].length) {
          doc['sources'].forEach(function (entry) {
            emit(entry.toLowerCase(), doc)
          })
        } else {
          emit('original', doc)
        }
      },
      reduce: '_count',
    },
    byKey: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        if (doc['sources'] && doc['sources'].length) {
          doc['sources'].forEach(function (entry) {
            emit([entry.toLowerCase(), doc['year']], 1)
          })
        } else {
          emit(['original', doc['year']], doc)
        }
      },
      reduce: '_count',
    },
    byYear: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        if (doc['sources'] && doc['sources'].length) {
          doc['sources'].forEach(function (entry) {
            emit([doc['year'], entry.toLowerCase()], 1)
          })
        } else {
          emit([doc['year'], 'original'], doc)
        }
      },
      reduce: '_count',
    },
  },
  genres: {
    all: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Genres'].forEach(function (entry) {
          emit(entry.toLowerCase(), doc)
        })
      },
      reduce: '_count',
    },
    byYear: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Genres'].forEach(function (entry) {
          emit([doc['year'], entry.toLowerCase()], doc)
        })
      },
      reduce: '_count',
    },
  },
  themes: {
    all: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Themes'].forEach(function (entry) {
          emit(entry.toLowerCase(), doc)
        })
      },
      reduce: '_count',
    },
    byYear: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Themes'].forEach(function (entry) {
          emit([doc['year'], entry.toLowerCase()], doc)
        })
      },
      reduce: '_count',
    },
  },
  aggregated: {
    byKey: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Genres'].forEach(function (entry) {
          emit([entry.toLowerCase(), doc['year']], doc)
        })

        doc['Themes'].forEach(function (entry) {
          emit([entry.toLowerCase(), doc['year']], doc)
        })
      },
      reduce: '_count',
    },
    all: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        emit(doc['year'], doc)
      },
      reduce: '_count',
    },
    episodes: {
      'map': function (doc) {
        if (!doc['year'] || !doc['Episodes']) {
          return
        }

        emit(doc['year'], doc['Episodes'])
      },
      'reduce': '_stats',
    },
    episodesByKey: {
      'map': function (doc) {
        if (!doc['year'] || !doc['Episodes']) {
          return
        }

        doc['Genres'].forEach(function (entry) {
          emit([entry.toLowerCase(), doc['year']], doc['Episodes'])
        })

        doc['Themes'].forEach(function (entry) {
          emit([entry.toLowerCase(), doc['year']], doc['Episodes'])
        })
      },
      'reduce': '_stats',
    },
    episodesByType: {
      'map': function (doc) {
        if (!doc['year'] || !doc['Episodes'] || !doc['type']) {
          return
        }

        emit([doc['year'], doc['type'].toLowerCase()], doc['Episodes'])
      },
      'reduce': '_stats',
    },
    episodesByKeyAndType: {
      'map': function (doc) {
        if (!doc['year'] || !doc['Episodes'] || !doc['type']) {
          return
        }

        doc['Genres'].forEach(function (entry) {
          emit([entry.toLowerCase(), doc['type'].toLowerCase(), doc['year']], doc['Episodes'])
        })

        doc['Themes'].forEach(function (entry) {
          emit([entry.toLowerCase(), doc['type'].toLowerCase(), doc['year']], doc['Episodes'])
        })
      },
      'reduce': '_stats',
    },
  },
}
