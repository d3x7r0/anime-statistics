import Promise from "bluebird";
import randomColor from "randomcolor";
import Common from "./common";

const MIN_COUNT = 25;

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
        console.debug("Genre data", ds);

        drawAbsoluteChart(ds);
        drawRelativeChart(ds);
        drawCumulativeRelativeChart(ds);
    });

    Promise.all(
        values.map(getEpisodeData)
    ).then(ds => {
        console.debug("Episode Count per Genre Data", ds);

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
    return Common.DB.getData(entry.key)
        .then(data => processEntries(data && data.rows))
        .then(Common.buildEntry(entry));
}

function getEpisodeData(entry) {
    return Common.DB.getEpisodeData(entry.key)
        .then(data => processEpisodeEntries(data && data.rows))
        .then(calculateEpisodeAverages)
        .then(data => Object.keys(data).reduce((memo, key) => {
            memo[key] = Common.buildEntry(entry)(data[key]);
            return memo;
        }, {}));
}

function processEntries(entries) {
    let data = [].concat(entries || [])
        .reduce((memo, entry) => {
            let key = entry.key[1];
            memo[key] = entry.value;
            return memo;
        }, {});

    return Common.mapToActiveYears(data);
}

function processEpisodeEntries(entries) {
    let data = [].concat(entries || [])
        .reduce((memo, entry) => {
            let year = entry.key[2],
                type = entry.key[1];

            memo[type] = memo[type] || {};
            memo[type][year] = entry.value;

            return memo;
        }, {});

    return Common.reduceToActiveYears(data);
}

function calculateEpisodeAverages(data) {
    return Object.keys(data).reduce((memo, key) => {
        memo[key] = calculateAverages(data[key] || []);
        return memo;
    }, {});
}

function calculateAverages(data) {
    return data.map(value => Math.round(value["sum"] / value["count"] || 0));
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

    charts["absolute"] = Common.drawLineChart($absolute, ds, yAxis);
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

    charts["relative"] = Common.drawLineChart($relative, ds, yAxis);
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

    charts["relative-cumulative"] = Common.drawLineChart($relativeCumulative, ds, yAxis);
}

function drawEpisodesChart(datasets) {
    if (charts["episodes"]) {
        charts["episodes"].destroy();
    }

    var ds = datasets.map(ds => ds["tv"]);

    var yAxis = {
        scaleLabel: {
            display: true,
            labelString: "avg. episode count"
        },
        ticks: {
            beginAtZero: true
        }
    };

    var totals = Common.getEpisodeTotals()["tv"];

    ds = [{
        label: "overall",
        data: Object.keys(totals).map(y => totals[y]),
        fill: false
    }].concat(ds || []);

    charts["episodes"] = Common.drawLineChart($episodes, ds, yAxis);
}

function populateAll(type, $target) {
    return Common.DB.getGenreData(type)
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
    $absolute = Common.printChart("absolute", "# of shows per year");
    $relative = Common.printChart("relative", "% of shows per year");
    $relativeCumulative = Common.printChart("relative-cumulative", "% of shows per year (cumulative)");
    $episodes = Common.printChart("episodes", "Avg. # of Eps per year (TV)");

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