import Promise from "bluebird";
import Chart from "chart.js";
import randomColor from "randomcolor";
import DB from "./db";
import Common from "./common";

const MIN_COUNT = 25;

var LABELS = [];

for (var i = Common.START_YEAR; i <= Common.END_YEAR; i++) {
    LABELS.push(i);
}

var $absolute, $relative, $relativeCumulative, $episodes;
var $genres, $themes;

function onDatasetChange() {
    updateCharts();
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
    return DB.getData(entry.key)
        .then(processEntries)
        .then(data => ({
            label: entry.key,
            data: data,
            fill: false,
            backgroundColor: entry.color,
            borderColor: Common.lightenDarkenColor(entry.color, -35)
        }));
}

function getEpisodeData(entry) {
    return DB.getEpisodeData(entry.key)
        .then(processEntries)
        .then(calculateAverages)
        .then(data => ({
            label: entry.key,
            data: data,
            fill: false,
            backgroundColor: entry.color,
            borderColor: Common.lightenDarkenColor(entry.color, -35)
        }));
}

function calculateAverages(data) {
    return data.map(value => Math.round(value.sum / value.count || 0));
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

    var totals = Common.getTotals();

    ds = [{
        label: "total",
        data: Object.keys(totals).map(y => totals[y]),
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

    var totals = Common.getEpisodeTotals();

    ds = [{
        label: "overall",
        data: Object.keys(totals).map(y => totals[y]),
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

    var totals = Common.getTotals();

    var ds = datasets.map(ds => {
        var years = Object.keys(totals);
        var res = Object.assign({}, ds);

        res.data = res.data.map((value, idx) => {
            var year = years[idx];
            var v = (value / totals[year] * 100);
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

    var totals = Common.getTotals();

    var ds = datasets.map(ds => {
        var years = Object.keys(totals);
        var res = Object.assign({}, ds);

        res.fill = true;

        res.data = res.data.map((value, idx) => {
            var year = years[idx];
            var v = (value / totals[year] * 100);
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
    return DB.getGenreData(type)
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

function enableForm() {
    Common.setupDownloads();

    $genres.removeAttribute("disabled");
    $themes.removeAttribute("disabled");

    updateCharts();
}

export default function run() {
    $absolute = document.getElementById("absolute");
    $relative = document.getElementById("relative");
    $relativeCumulative = document.getElementById("relative-cumulative");
    $episodes = document.getElementById("episodes");

    $genres = document.getElementById("genres");
    $themes = document.getElementById("themes");

    $genres.addEventListener("change", onDatasetChange);
    $themes.addEventListener("change", onDatasetChange);

    Promise.all([
        Common.init(),
        populateAll("genres", $genres),
        populateAll("themes", $themes)
    ]).then(enableForm);
}
