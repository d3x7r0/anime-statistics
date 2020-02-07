#!/bin/sh

if [ ! -d "data" ]; then
    mkdir data;
fi

curl "http://localhost:5984/ann/_design/aggregated/_view/all?group=true" > data/totals.json

curl "http://localhost:5984/ann/_design/aggregated/_view/episodesByType?group=true" > data/episode_totals.json

curl "http://localhost:5984/ann/_design/aggregated/_view/byKey?group=true" > data/data.json

curl "http://localhost:5984/ann/_design/aggregated/_view/episodesByKeyAndType?group=true" > data/episode_data.json


curl "http://localhost:5984/ann/_design/genres/_view/all?group=true" > data/genres.json
curl "http://localhost:5984/ann/_design/genres/_view/byYear?group=true" > data/data_genres.json

curl "http://localhost:5984/ann/_design/themes/_view/all?group=true" > data/themes.json
curl "http://localhost:5984/ann/_design/themes/_view/byYear?group=true" > data/data_themes.json

curl "http://localhost:5984/ann/_design/types/_view/byYear?group=true" > data/types.json
