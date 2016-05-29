/* globals Chart:false, randomColor:false */
(function () {
    const DATABASE_LOCATION = "http://127.0.0.1:5984/ann/";
    const START_YEAR = 1975;
    const END_YEAR = 2015;
    const MIN_COUNT = 25;

    var LABELS = [];
    var TOTALS = {};

    var EPISODE_TOTALS = {};

    for (var i = START_YEAR; i <= END_YEAR; i++) {
        LABELS.push(i);
    }

    var $absolute = document.getElementById("absolute"),
        $relative = document.getElementById("relative"),
        $relativeCumulative = document.getElementById("relative-cumulative"),
        $episodes = document.getElementById("episodes");

    var $genres = document.getElementById("genres"),
        $themes = document.getElementById("themes");

    $genres.addEventListener("change", onDatasetChange);
    $themes.addEventListener("change", onDatasetChange);

    $absolute.addEventListener("click", onDownloadClick);
    $relative.addEventListener("click", onDownloadClick);
    $relativeCumulative.addEventListener("click", onDownloadClick);
    $episodes.addEventListener("click", onDownloadClick);

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
        var values = getActive();

        Promise.all(
            values.map(getData)
        ).then(ds => {
            if (console && console.debug) {
                console.debug("Genre data", ds);
            }

            drawAbsoluteChart(ds);
            drawRelativeChart(ds);
            drawCumulativeRelativeChart(ds);
        });

        Promise.all(
            values.map(getEpisodeData)
        ).then(ds => {
            if (console && console.debug) {
                console.debug("Episode Count per Genre Data", ds);
            }

            drawEpisodesChart(ds);
        });
    }

    function getActive() {
        var $g = $genres.querySelectorAll(":checked"),
            $t = $themes.querySelectorAll(":checked");

        $g = Array.prototype.slice.call($g);
        $t = Array.prototype.slice.call($t);

        return $g.concat($t).map($el => ({
            key: $el.value,
            color: $el.dataset.color
        }));
    }

    function getData(entry) {
        return fetch(`${DATABASE_LOCATION}/_design/aggregated/_view/byKey?group=true&startkey=["${entry.key}"]&endkey=["${entry.key}", {}]`)
            .then(res => res.json())
            .then(processEntries)
            .then(data => ({
                label: entry.key,
                data: data,
                fill: false,
                backgroundColor: entry.color,
                borderColor: lightenDarkenColor(entry.color, -35)
            }));
    }

    function getEpisodeData(entry) {
        return fetch(`${DATABASE_LOCATION}/_design/aggregated/_view/episodesByKey?group=true&startkey=["${entry.key}"]&endkey=["${entry.key}", {}]`)
            .then(res => res.json())
            .then(processEntries)
            .then(calculateAverages)
            .then(data => ({
                label: entry.key,
                data: data,
                fill: false,
                backgroundColor: entry.color,
                borderColor: lightenDarkenColor(entry.color, -35)
            }));
    }

    function calculateAverages(data) {
        return data.map(value => Math.round(value.sum / value.count || 0));
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

    function processEntries(entries) {
        var data = [].concat(entries && entries.rows || [])
            .map(d => [d.key[1], d.value])
            .reduce((memo, entry) => {
                memo[entry[0]] = entry[1];
                return memo;
            }, {});

        return LABELS.reduce((memo, label, idx) => {
            memo[idx] = data[label] || 0;
            return memo;
        }, []);
    }

    var charts = {
        "absolute": null,
        "relative": null,
        "relative-cumulative": null,
        "episodes": null
    };

    function drawAbsoluteChart(datasets) {
        if (charts["absolute"]) {
            charts["absolute"].destroy();
        }

        var ds = datasets;

        var yAxis = {
            scaleLabel: {
                display: true,
                labelString: "count"
            },
            ticks: {
                beginAtZero: true
            }
        };

        ds = [{
            label: "total",
            data: Object.keys(TOTALS).map(y => TOTALS[y]),
            fill: false
        }].concat(ds || []);

        charts["absolute"] = drawChart($absolute, ds, yAxis);
    }

    function drawEpisodesChart(datasets) {
        if (charts["episodes"]) {
            charts["episodes"].destroy();
        }

        var ds = datasets;

        var yAxis = {
            scaleLabel: {
                display: true,
                labelString: "avg. episode count"
            },
            ticks: {
                beginAtZero: true
            }
        };

        ds = [{
            label: "overall",
            data: Object.keys(EPISODE_TOTALS).map(y => EPISODE_TOTALS[y]),
            fill: false
        }].concat(ds || []);

        charts["episodes"] = drawChart($episodes, ds, yAxis);
    }

    function drawRelativeChart(datasets) {
        if (charts["relative"]) {
            charts["relative"].destroy();
        }

        var yAxis = {
            scaleLabel: {
                display: true,
                labelString: "percent"
            },
            ticks: {
                max: 100,
                steps: 20,
                beginAtZero: true
            }
        };

        var ds = datasets.map(ds => {
            var years = Object.keys(TOTALS);
            var res = Object.assign({}, ds);

            res.data = res.data.map((value, idx) => {
                var year = years[idx];
                var v = (value / TOTALS[year] * 100);
                v = v.toFixed(2);
                return parseInt(v, 10);
            });

            return res;
        });

        charts["relative"] = drawChart($relative, ds, yAxis);
    }

    function drawCumulativeRelativeChart(datasets) {
        if (charts["relative-cumulative"]) {
            charts["relative-cumulative"].destroy();
        }

        var yAxis = {
            stacked: true,
            scaleLabel: {
                display: true,
                labelString: "percent"
            },
            ticks: {
                beginAtZero: true
            }
        };

        var ds = datasets.map(ds => {
            var years = Object.keys(TOTALS);
            var res = Object.assign({}, ds);

            res.fill = true;

            res.data = res.data.map((value, idx) => {
                var year = years[idx];
                var v = (value / TOTALS[year] * 100);
                v = v.toFixed(2);
                return parseInt(v, 10);
            });

            return res;
        });

        charts["relative-cumulative"] = drawChart($relativeCumulative, ds, yAxis);
    }

    function drawChart($target, ds, yAxis) {
        var $output = $target.querySelectorAll(".js-output");

        if (!$output.length) {
            console.warn("Missing canvas", $target);
            return;
        }

        return new Chart($output[0], {
            type: "line",
            data: {
                labels: LABELS,
                datasets: ds.slice(0)
            },
            responsive: true,
            options: {
                tooltips: {
                    mode: "label"
                },
                hover: {
                    mode: "label"
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "year"
                        }
                    }],
                    yAxes: [yAxis]
                }
            }
        });
    }

    function populateAll(type, $target) {
        return fetch(`${DATABASE_LOCATION}/_design/${type}/_view/all?group=true`)
            .then(res => res.json())
            .then(function (data) {
                var entries = data.rows.filter(d => d.value >= MIN_COUNT);

                var colors = randomColor({count: entries.length});

                entries = entries.map((entry, idx) => {
                    entry.color = colors[idx];
                    return entry;
                });

                $target.querySelectorAll(".js-values")[0].innerHTML = entries.map(printOption).join("\n");
            });
    }

    function printOption(entry) {
        return `<label for="entry_${entry.key}" class="pure-checkbox"><input type="checkbox" value="${entry.key}" data-color="${entry.color}" id="entry_${entry.key}" />${entry.key}</label>`;
    }

    function fetchTotals() {
        return fetch(`${DATABASE_LOCATION}/_design/aggregated/_view/count?group=true&startkey=${START_YEAR}&endkey=${END_YEAR}`)
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

    function enableForm() {
        $genres.removeAttribute("disabled");
        $themes.removeAttribute("disabled");
        updateCharts();
    }

    Promise.all([
        fetchTotals(),
        fetchEpisodeTotals(),
        populateAll("genres", $genres),
        populateAll("themes", $themes)
    ]).then(enableForm);
})();