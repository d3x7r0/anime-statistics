#!/bin/sh

if [ ! -d "target/data" ]; then
    mkdir target/data;
fi

curl "http://localhost:5984/ann/_design/aggregated/_view/all?group=true" > target/data/totals.json

curl "http://localhost:5984/ann/_design/aggregated/_view/episodesByType?group=true" > target/data/episode_totals.json

curl "http://localhost:5984/ann/_design/aggregated/_view/byKey?group=true" > target/data/data.json

curl "http://localhost:5984/ann/_design/aggregated/_view/episodesByKeyAndType?group=true" > target/data/episode_data.json

curl "http://localhost:5984/ann/_design/genre/_view/all?group=true" > target/data/genres.json
curl "http://localhost:5984/ann/_design/themes/_view/all?group=true" > target/data/themes.json

curl "http://localhost:5984/ann/_design/genres/_view/byYear?group=true" > target/data/data_genre.json
curl "http://localhost:5984/ann/_design/themes/_view/byYear?group=true" > target/data/data_themes.json

curl "http://localhost:5984/ann/_design/genres/_view/all?group=true" > target/data/genres.json
curl "http://localhost:5984/ann/_design/types/_view/byYear?group=true" > target/data/types.json
