import DB from "./db";
import Promise from "bluebird";

const START_YEAR = 1975;
const END_YEAR = 2015;

var TOTALS, EPISODE_TOTALS;

function fetchTotals() {
    return DB.fetchAllShows(START_YEAR, END_YEAR)
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
    return DB.fetchEpisodeData(START_YEAR, END_YEAR)
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

function init() {
    return Promise.all([
        fetchTotals(),
        fetchEpisodeTotals()
    ]);
}

export default {
    START_YEAR: START_YEAR,
    END_YEAR: END_YEAR,
    getTotals: function () {
        return TOTALS;
    },
    getEpisodeTotals: function () {
        return EPISODE_TOTALS;
    },
    setupDownloads: setupDownloads,
    lightenDarkenColor: lightenDarkenColor,
    init: init
};