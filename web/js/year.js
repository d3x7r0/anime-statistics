/* globals Chart:false, randomColor:false */
(function () {
    const DATABASE_LOCATION = "http://127.0.0.1:5984/ann/";
    const START_YEAR = 1975;
    const END_YEAR = 2015;
    const MAX_CHART_ENTRIES = 10;

    var LABELS = [];

    var TOTALS,
        EPISODE_TOTALS;

    for (var i = START_YEAR; i <= END_YEAR; i++) {
        LABELS.push(i);
    }

    var $topGenresChart = document.getElementById("topGenresChart"),
        $topThemesChart = document.getElementById("topThemesChart"),
        $topGenres = document.getElementById("topGenres"),
        $topThemes = document.getElementById("topThemes"),
        $yearDetails = document.getElementById("yearDetails");

    var $year = document.getElementById("year");

    $year.addEventListener("change", onDatasetChange);

    $topGenresChart.addEventListener("click", onDownloadClick);
    $topThemesChart.addEventListener("click", onDownloadClick);

    function onDatasetChange() {
        updateCharts();
    }

    function onDownloadClick(e) {
        if (e.target && e.target.matches(".js-download")) {

            var $canvas = this.querySelectorAll(".js-output")[0];

            if (!$canvas) {
                e.preventDefault();
                return false;
            }

            e.target.href = $canvas.toDataURL("image/png");
        }
    }

    function updateCharts() {
        var active = getActive();

        getData(
            "genres",
            active
        ).then(ds => {
            if (console && console.debug) {
                console.debug(ds);
            }

            printTop($topGenres, ds);
            drawTopGenreChart(ds);
        });

        getData(
            "themes",
            active
        ).then(ds => {
            if (console && console.debug) {
                console.debug(ds);
            }

            printTop($topThemes, ds);
            drawTopThemesChart(ds);
        });

        updateStats(active);
    }

    function getActive() {
        var $el = $year.querySelectorAll(`[value="${$year.value}"]`)[0];

        if (!$el) {
            return;
        }

        return ({
            key: $el.value
        });
    }

    function getData(type, entry) {
        return fetch(`${DATABASE_LOCATION}/_design/${type}/_view/byYear?group=true&startkey=[${entry.key}]&endkey=[${entry.key}, {}]`)
            .then(res => res.json())
            .then(processEntries);
    }

    function processEntries(entries) {
        var rows = [].concat(entries.rows || []);

        var color = randomColor({
            count: rows.length
        });

        return rows
            .sort((a, b) => b.value - a.value)
            .map((entry, idx) => ({
                label: entry.key[1],
                value: entry.value,
                backgroundColor: color[idx],
                hoverBackgroundColor: lightenDarkenColor(color[idx], -35)
            }));
    }

    // src: https://css-tricks.com/snippets/javascript/lighten-darken-color/
    function lightenDarkenColor(col, amt) {

        var usePound = false;

        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }

        var num = parseInt(col, 16);

        var r = (num >> 16) + amt;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        var b = ((num >> 8) & 0x00FF) + amt;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        var g = (num & 0x0000FF) + amt;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

    }

    function printTop($target, dataset) {
        $target
            .querySelectorAll(".js-output")[0]
            .innerHTML = dataset.map(entry => `<li>${entry.label} - ${entry.value} shows</li>`).join("\n");
    }

    var charts = {
        "topGenre": null,
        "topTheme": null
    };

    function drawTopGenreChart(dataset) {
        if (charts["topGenre"]) {
            charts["topGenre"].destroy();
        }

        charts["topGenre"] = drawChart($topGenresChart, dataset);
    }

    function drawTopThemesChart(dataset) {
        if (charts["topTheme"]) {
            charts["topTheme"].destroy();
        }

        charts["topTheme"] = drawChart($topThemesChart, dataset);
    }

    function drawChart($target, dataset) {
        var $output = $target.querySelectorAll(".js-output");

        var data = dataset
            .slice(0, MAX_CHART_ENTRIES)
            .reduce((memo, entry) => {
                memo.labels.push(entry.label);

                memo.datasets[0].data.push(entry.value);
                memo.datasets[0].backgroundColor.push(entry.backgroundColor);
                memo.datasets[0].hoverBackgroundColor.push(entry.hoverBackgroundColor);

                return memo;
            }, {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    hoverBackgroundColor: []
                }]
            });

        return new Chart($output, {
            type: "pie",
            data: data
        });
    }

    function updateStats(entry) {
        var year = entry.key;

        $yearDetails.innerHTML = `<li><strong>Number of shows:</strong> ${TOTALS[year]}</li>` +
            `<li><strong>Average Episode Count:</strong> ${EPISODE_TOTALS[year]}</li>`;
    }

    function fetchTotals() {
        return fetch(`${DATABASE_LOCATION}/_design/aggregated/_view/all?group=true&startkey=${START_YEAR}&endkey=${END_YEAR}`)
            .then(res => res.json())
            .then(data => {
                TOTALS = data.rows.reduce(function (memo, entry) {
                    memo[entry.key] = entry.value;
                    return memo;
                }, {});

                if (console && console.debug) {
                    console.debug("Total show count", TOTALS);
                }
            });
    }

    function fetchEpisodeTotals() {
        return fetch(`${DATABASE_LOCATION}/_design/aggregated/_view/episodes?group=true&startkey=${START_YEAR}&endkey=${END_YEAR}`)
            .then(res => res.json())
            .then(data => {
                EPISODE_TOTALS = data.rows.reduce(function (memo, entry) {
                    var value = entry.value.sum / entry.value.count;
                    memo[entry.key] = Math.round(value);
                    return memo;
                }, {});

                if (console && console.debug) {
                    console.debug("Total episode averages", EPISODE_TOTALS);
                }
            });
    }

    function printOption(key) {
        return `<option value="${key}">${key}</option>`;
    }

    function enableForm() {
        $year.innerHTML = Object.keys(TOTALS)
            .map(printOption)
            .join("\n");

        $year.value = START_YEAR;

        $year.removeAttribute("disabled");
        updateCharts();
    }

    Promise.all([
        fetchTotals(),
        fetchEpisodeTotals()
    ]).then(enableForm);
})();