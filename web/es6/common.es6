// import DB from "./db";
import DB from "./files";
import Promise from "bluebird";
import Chart from "chart.js";

const START_YEAR = 1975;
const END_YEAR = 2015;

var TOTALS, EPISODE_TOTALS;
var ACTIVE_YEARS = [];

for (let i = START_YEAR; i <= END_YEAR; i++) {
    ACTIVE_YEARS.push(i);
}

function fetchTotals() {
    return DB.fetchAllShows(START_YEAR, END_YEAR)
        .then(data => {
            TOTALS = data.rows.reduce((memo, entry) => {
                memo[entry.key] = entry.value;
                return memo;
            }, {});

            console.debug("Total show count", TOTALS);
        });
}

function fetchEpisodeTotals() {
    return DB.fetchEpisodeData(START_YEAR, END_YEAR)
        .then(data => {
            EPISODE_TOTALS = data.rows.reduce((memo, entry) => {
                let year = entry.key[0],
                    type = entry.key[1];

                memo[type] = memo[type] || {};
                memo[type][year] = Math.round(entry.value.sum / entry.value.count);

                return memo;
            }, {});

            console.debug("Total episode averages", EPISODE_TOTALS);
        });
}

// DOM
function setupDownloads() {
    var $entries = document.querySelectorAll(".js-downloadable");

    Array.prototype.slice.call($entries)
        .forEach($el => {
            $el.addEventListener("click", onDownloadClick);
            var $buttons = $el.querySelectorAll(".js-download");

            Array.prototype.slice.call($buttons)
                .forEach($b => $b.classList.remove("pure-button-disabled"));
        });
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

function printChart(id, title, width = 800, height = 600) {
    var $target = document.getElementById(id);

    let $title = document.createElement("h2");
    $title.textContent = title;

    let $canvas = document.createElement("canvas");
    $canvas.setAttribute("class", "js-output");
    $canvas.setAttribute("width", `${width}`);
    $canvas.setAttribute("height", `${height}`);

    let $download;
    if ($target.className && $target.className.indexOf("js-downloadable") !== -1) {
        $download = document.createElement("a");
        $download.setAttribute("href", "#download");
        $download.setAttribute("class", "pure-button pure-button-primary js-download pure-button-disabled");
        $download.setAttribute("download", title + ".png");
        $download.textContent = "Save to PNG";
    }

    $target.appendChild($title);
    $target.appendChild($canvas);

    if ($download) {
        $target.appendChild($download);
    }

    return $target;
}

// Charts
function drawLineChart($target, ds, yAxis) {
    var $output = $target.querySelectorAll(".js-output");

    if (!$output.length) {
        console.warn("Missing canvas", $target);
        return;
    }

    return new Chart($output[0], {
        type: "line",
        data: {
            labels: ACTIVE_YEARS,
            datasets: ds.slice(0)
        },
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

// Helpers
function reduceToActiveYears(data) {
    return Object.keys(data).reduce((memo, key) => {
        memo[key] = mapToActiveYears(data[key]);
        return memo;
    }, {});
}

function mapToActiveYears(data) {
    return ACTIVE_YEARS.reduce((memo, label, idx) => {
        memo[idx] = data[label] || 0;
        return memo;
    }, []);
}

function buildEntry(entry) {
    return function (data) {
        return {
            label: entry.key,
            data: data,
            fill: false,
            backgroundColor: entry.color,
            borderColor: lightenDarkenColor(entry.color, -35)
        };
    };
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

    return (usePound ? "#" : "") + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);
}

function init() {
    return Promise.all([
        fetchTotals(),
        fetchEpisodeTotals()
    ]);
}

export default {
    START_YEAR: START_YEAR,
    END_YEAR: END_YEAR,
    DB: DB,
    getTotals: function () {
        return TOTALS;
    },
    getEpisodeTotals: function () {
        return EPISODE_TOTALS;
    },
    setupDownloads: setupDownloads,
    reduceToActiveYears: reduceToActiveYears,
    mapToActiveYears: mapToActiveYears,
    buildEntry: buildEntry,
    lightenDarkenColor: lightenDarkenColor,
    printChart: printChart,
    drawLineChart: drawLineChart,
    init: init
};
