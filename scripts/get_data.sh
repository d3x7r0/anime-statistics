#!/bin/sh

curl "http://localhost:5984/ann/_design/aggregated/_view/all?group=true" > web/data/totals.json

curl "http://localhost:5984/ann/_design/aggregated/_view/episodesByType?group=true" > web/data/episode_totals.json

curl "http://localhost:5984/ann/_design/aggregated/_view/byKey?group=true" > web/data/data.json

curl "http://localhost:5984/ann/_design/aggregated/_view/episodesByKeyAndType?group=true" > web/data/episode_data.json

curl "http://localhost:5984/ann/_design/genre/_view/all?group=true" > web/data/genre.json
curl "http://localhost:5984/ann/_design/themes/_view/all?group=true" > web/data/themes.json

curl "http://localhost:5984/ann/_design/genres/_view/byYear?group=true" > web/data/data_genre.json
curl "http://localhost:5984/ann/_design/themes/_view/byYear?group=true" > web/data/data_themes.json

curl "http://localhost:5984/ann/_design/types/_view/byYear?group=true" > web/data/types.json
