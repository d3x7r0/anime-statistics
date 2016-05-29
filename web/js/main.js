/* globals Chart:false, randomColor:false */
(function () {
    const DATABASE_LOCATION = "http://127.0.0.1:5984/ann/";
    const START_YEAR = 1970;
    const END_YEAR = 2016;
    const MIN_COUNT = 25;

    var LABELS = [];
    var TOTALS = {};

    var MODE;

    for (var i = START_YEAR; i <= END_YEAR; i++) {
        LABELS.push(i);
    }

    var $output = document.getElementById("output"),
        $genres = document.getElementById("genres"),
        $themes = document.getElementById("themes"),
        $mode = document.getElementById("relative"),
        $download = document.getElementById("download");

    $genres.addEventListener("change", onDatasetChange);
    $themes.addEventListener("change", onDatasetChange);
    $mode.addEventListener("change", onModeChange);
    $download.addEventListener("click", onDownloadClick);

    function onDatasetChange() {
        updateChart();
    }

    function onModeChange() {
        updateMode();
        onDatasetChange();
    }

    function onDownloadClick(e) {
        if (!chart) {
            e.preventDefault();
            return false;
        }

        this.href = $output.toDataURL("image/png");
    }

    function updateMode() {
        MODE = $mode.value;
    }

    function updateChart() {
        var values = getActive();

        Promise.all(
            values.map(getData)
        ).then(drawChart);
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
                borderColor: entry.color
            }));
    }

    function processEntries(entries) {
        var data = [].concat(entries && entries.rows || [])
            .map(d => [d.key[1], d.value])
            .reduce((memo, entry) => {
                var year = entry[0],
                    value = entry[1];

                if (MODE === "relative") {
                    value = (value / TOTALS[year] * 100);
                    value = value.toFixed(2);
                }

                memo[year] = value;

                return memo;
            }, {});

        return LABELS.reduce((memo, label, idx) => {
            memo[idx] = data[label] || 0;
            return memo;
        }, []);
    }

    var chart;

    function drawChart(datasets) {
        console.debug(datasets);

        if (chart) {
            chart.destroy();
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

        if (MODE === "relative") {
            ds = [{
                label: "total",
                data: Object.keys(TOTALS).map(() => 100),
                fill: false
            }].concat(ds || []);

            yAxis.ticks.max = 100;
            yAxis.ticks.steps = 20;

            yAxis.scaleLabel.labelString = "percent";
        } else {
            ds = [{
                label: "total",
                data: Object.keys(TOTALS).map(y => TOTALS[y]),
                fill: false
            }].concat(ds || []);
        }

        chart = new Chart($output, {
            type: "line",
            data: {
                labels: LABELS,
                datasets: ds
            },
            responsive: true,
            options: {
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
        fetch(`${DATABASE_LOCATION}/_design/${type}/_view/all?group=true`)
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
        return `<p><label for="entry_${entry.key}"><input type="checkbox" value="${entry.key}" data-color="${entry.color}" id="entry_${entry.key}" />${entry.key}</label></p>`;
    }

    function fetchTotals() {
        return fetch(`${DATABASE_LOCATION}/_design/aggregated/_view/count?group=true&startkey=${START_YEAR}&endkey=${END_YEAR}`)
            .then(res => res.json())
            .then(data => {
                TOTALS = data.rows.reduce(function (memo, entry) {
                    memo[entry.key] = entry.value;
                    return memo;
                }, {});
            });
    }

    function enableForm() {
        $mode.removeAttribute("disabled");
        $genres.removeAttribute("disabled");
        $themes.removeAttribute("disabled");
        updateMode();
        updateChart();
    }

    Promise.all([
        fetchTotals(),
        populateAll("genres", $genres),
        populateAll("themes", $themes)
    ]).then(enableForm);
})();