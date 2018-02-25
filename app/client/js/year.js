import Chart from "chart.js";
import Common from "./common";

const MAX_GENRE_ENTRIES = 10;
const MAX_THEME_ENTRIES = 20;

var $topGenresChart, $topThemesChart, $typesChart, $topGenres, $topThemes, $yearDetails;
var $year;

function onDatasetChange() {
    updateCharts();
}

function updateCharts() {
    let active = getActive();

    getData(
        "genres",
        active
    ).then(ds => {
        console.debug(ds);

        printTop($topGenres, ds);
        drawTopGenreChart(ds);
    });

    getData(
        "themes",
        active
    ).then(ds => {
        console.debug(ds);

        printTop($topThemes, ds);
        drawTopThemesChart(ds);
    });

    updateStats(active);

    getTypes(active).then(ds => {
        console.debug(ds);

        drawTypesChart(ds, parseInt(active.key, 10));
    });
}

function getActive() {
    let $el = $year.querySelectorAll(`[value="${$year.value}"]`)[0];

    if (!$el) {
        return;
    }

    return ({
        key: $el.value
    });
}

function getData(type, entry) {
    return Common.DB.getYearData(type, entry.key)
        .then(processEntries(type + "-year-data"));
}

function getTypes(entry) {
    return Common.DB.getTypes(entry.key)
        .then(processEntries("types-year-data"));
}

function processEntries(colorSeed) {

    return function (entries) {
        let rows = [].concat(entries.rows || []);

        let color = Common.generateColors(rows.length, colorSeed);

        return rows
            .sort((a, b) => b.value - a.value)
            .map((entry, idx) => ({
                label: entry.key[1],
                value: entry.value,
                backgroundColor: color[idx],
                hoverBackgroundColor: Common.lightenDarkenColor(color[idx], -35)
            }));
    };
}

function printTop($target, dataset) {
    $target
        .querySelectorAll(".js-output")[0]
        .innerHTML = dataset.map(entry => `<li>${entry.label} - ${entry.value} shows</li>`).join("\n");
}

var CHARTS = {
    "topGenre": null,
    "topTheme": null,
    "types": null
};

function drawTopGenreChart(dataset) {
    if (CHARTS["topGenre"]) {
        CHARTS["topGenre"].destroy();
    }

    CHARTS["topGenre"] = drawChart(
        "pie",
        $topGenresChart,
        limit(dataset, MAX_GENRE_ENTRIES)
    );
}

function drawTopThemesChart(dataset) {
    if (CHARTS["topTheme"]) {
        CHARTS["topTheme"].destroy();
    }

    CHARTS["topTheme"] = drawChart(
        "pie",
        $topThemesChart,
        dataset.slice(0, MAX_THEME_ENTRIES)
    );
}

function drawTypesChart(dataset, year) {
    if (CHARTS["types"]) {
        CHARTS["types"].destroy();
    }

    dataset = dataset.map(entry => {
        let res = Object.assign({}, entry);
        let v = (entry.value / Common.getTotals()[year] * 100);
        v = v.toFixed(2);
        res.value = parseInt(v, 10);
        return res;
    });

    CHARTS["types"] = drawChart("horizontalBar", $typesChart, dataset, "Types", {
        scales: {
            yAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "percent"
                },
                ticks: {
                    max: 100,
                    beginAtZero: true
                }
            }]
        }
    });
}

function drawChart(type, $target, dataset, label, options) {
    let $output = $target.querySelectorAll(".js-output");

    let data = dataset.reduce((memo, entry) => {
        memo.labels.push(entry.label);

        memo.datasets[0].data.push(entry.value);
        memo.datasets[0].backgroundColor.push(entry.backgroundColor);
        memo.datasets[0].hoverBackgroundColor.push(entry.hoverBackgroundColor);

        return memo;
    }, {
        labels: [],
        datasets: [{
            label: label,
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        }]
    });

    return new Chart($output, {
        type: type,
        data: data,
        options: options
    });
}

function limit(dataset, limit) {
    let data = dataset.slice(0, limit);
    let rest = dataset.slice(limit);

    rest = rest.reduce((memo, entry) => ({
        label: "Others",
        value: memo.value + entry.value,
        backgroundColor: memo.backgroundColor || entry.backgroundColor,
        hoverBackgroundColor: memo.hoverBackgroundColor || entry.hoverBackgroundColor,
    }), {
        value: 0
    });

    data.push(rest);

    return data;
}

function updateStats(entry) {
    let year = entry.key;

    let totals = Common.getTotals(),
        episodeTotals = Common.getEpisodeTotals()["tv"];

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
    $year.value = Common.END_YEAR;
    $year.removeAttribute("disabled");

    updateCharts();
}

function run() {
    $topGenresChart = Common.printChart("topGenresChart", `Top ${MAX_GENRE_ENTRIES} Genres`);
    $topThemesChart = Common.printChart("topThemesChart", `Top ${MAX_THEME_ENTRIES} Themes`);
    $typesChart = Common.printChart("typesChart", "Type of shows (%)");

    $topGenres = document.getElementById("topGenres");
    $topThemes = document.getElementById("topThemes");
    $yearDetails = document.getElementById("yearDetails");

    $year = document.getElementById("year");

    $year.addEventListener("change", onDatasetChange);

    Common.init()
        .then(enableForm);
}

run();