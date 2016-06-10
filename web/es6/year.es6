import Chart from "chart.js";
import randomColor from "randomcolor";
import Common from "./common";

const MAX_CHART_ENTRIES = 15;

var $topGenresChart, $topThemesChart, $topGenres, $topThemes, $yearDetails;
var $year;

function onDatasetChange() {
    updateCharts();
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
    return Common.DB.getYearData(type, entry.key)
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
            hoverBackgroundColor: Common.lightenDarkenColor(color[idx], -35)
        }));
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

    var totals = Common.getTotals(),
        episodeTotals = Common.getEpisodeTotals();

    $yearDetails.innerHTML = `<li><strong>Number of shows:</strong> ${totals[year]}</li>` +
        `<li><strong>Average Episode Count:</strong> ${episodeTotals[year]}</li>`;
}

function printOption(key) {
    return `<option value="${key}">${key}</option>`;
}

function enableForm() {
    Common.setupDownloads();

    $year.innerHTML = Object.keys(Common.getTotals())
        .map(printOption)
        .join("\n");
    $year.value = Common.START_YEAR;
    $year.removeAttribute("disabled");

    updateCharts();
}

export default function run() {
    $topGenresChart = document.getElementById("topGenresChart");
    $topThemesChart = document.getElementById("topThemesChart");
    $topGenres = document.getElementById("topGenres");
    $topThemes = document.getElementById("topThemes");
    $yearDetails = document.getElementById("yearDetails");

    $year = document.getElementById("year");

    $year.addEventListener("change", onDatasetChange);

    Common.init()
        .then(enableForm);
}