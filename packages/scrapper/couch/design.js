/* global emit:false */

module.exports = {
  types: {
    byYear: {
      map: function (doc) {
        if (!doc['year'] || !doc['type']) {
          return
        }

        emit([doc['year'], doc['type'].toLowerCase()], 1)
      },
      reduce: '_count',
    },
  },
  sources: {
    byYear: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        if (doc['sources'] && doc['sources'].length) {
          doc['sources'].forEach(function (source) {
            emit([doc['year'], source.type], 1)
          })
        } else {
          emit([doc['year'], doc['adaptation'] ? 'adaptation' : 'original'], 1)
        }
      },
      reduce: '_count',
    },
  },
  studios: {
    all: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Studio'].forEach(function (studio) {
          emit(studio.name, 1)
        })
      },
      reduce: '_count',
    },
    byYear: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Studio'].forEach(function (studio) {
          emit([doc['year'], studio.name], 1)
        })
      },
      reduce: '_count',
    },
    byType: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Studio'].forEach(function (studio) {
          emit([studio.name, doc['type'].toLowerCase(), doc['year']], 1)
        })
      },
      reduce: '_count',
    },
    bySource: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Studio'].forEach(function (studio) {
          if (doc['sources'] && doc['sources'].length) {
            doc['sources'].forEach(function (source) {
              emit([studio.name, source.type, doc['year']], 1)
            })
          } else {
            emit([studio.name, doc['adaptation'] ? 'adaptation' : 'original', doc['year']], 1)
          }
        })
      },
      reduce: '_count',
    },
    byGenre: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Studio'].forEach(function (studio) {
          doc['Genres'].forEach(function (genre) {
            emit([studio.name, genre.toLowerCase(), doc['year']], 1)
          })
        })
      },
      reduce: '_count',
    },
    byTheme: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Studio'].forEach(function (studio) {
          doc['Themes'].forEach(function (theme) {
            emit([studio.name, theme.toLowerCase(), doc['year']], 1)
          })
        })
      },
      reduce: '_count',
    },
    episodesByKeyAndType: {
      'map': function (doc) {
        if (!doc['year'] || !doc['Episodes'] || !doc['type']) {
          return
        }

        doc['Studio'].forEach(function (studio) {
          emit([studio.name, doc['type'].toLowerCase(), doc['year']], doc['Episodes'])
        })
      },
      'reduce': '_stats',
    },
  },
  genres: {
    all: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Genres'].forEach(function (genre) {
          emit(genre.toLowerCase(), 1)
        })
      },
      reduce: '_count',
    },
    byYear: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Genres'].forEach(function (genre) {
          emit([doc['year'], genre.toLowerCase()], 1)
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
          emit(entry.toLowerCase(), 1)
        })
      },
      reduce: '_count',
    },
    byYear: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Themes'].forEach(function (theme) {
          emit([doc['year'], theme.toLowerCase()], 1)
        })
      },
      reduce: '_count',
    },
  },
  aggregated: {
    all: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        emit(doc['year'], 1)
      },
      reduce: '_count',
    },
    byKey: {
      map: function (doc) {
        if (!doc['year']) {
          return
        }

        doc['Genres'].forEach(function (genre) {
          emit([genre.toLowerCase(), doc['year']], 1)
        })

        doc['Themes'].forEach(function (theme) {
          emit([theme.toLowerCase(), doc['year']], 1)
        })
      },
      reduce: '_count',
    },
    episodesByKey: {
      'map': function (doc) {
        if (!doc['year'] || !doc['Episodes']) {
          return
        }

        doc['Genres'].forEach(function (genre) {
          emit([genre.toLowerCase(), doc['year']], doc['Episodes'])
        })

        doc['Themes'].forEach(function (themes) {
          emit([themes.toLowerCase(), doc['year']], doc['Episodes'])
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

        doc['Genres'].forEach(function (genres) {
          emit([genres.toLowerCase(), doc['type'].toLowerCase(), doc['year']], doc['Episodes'])
        })

        doc['Themes'].forEach(function (themes) {
          emit([themes.toLowerCase(), doc['type'].toLowerCase(), doc['year']], doc['Episodes'])
        })
      },
      'reduce': '_stats',
    },
  },
  debug: {
    relations: {
      map: function (doc) {
        if (doc['related-prev']) {
          doc['related-prev'].forEach(function (rel) {
            return emit(rel, doc)
          })
        }
      },
      'reduce': '_count',
    }
  }
}
