import Promise from "bluebird";
import Chart from "chart.js";
import randomColor from "randomcolor";
import Common from "./common";

var LABELS = [];

for (var i = Common.START_YEAR; i <= Common.END_YEAR; i++) {
    LABELS.push(i);
}

var $types, $typesRelative;

function populateTypes() {
    return getTypesData().then(ds => {
        console.debug("Episode Count per Genre Data", ds);

        drawTypesChart(ds);
        drawTypesRelativeChart(ds);
    });
}

function getTypesData() {
    return Common.DB.getTypesData(Common.START_YEAR, Common.END_YEAR)
        .then(data => processTypes(data && data.rows))
        .then(data => {
            let types = Object.keys(data);

            let colors = randomColor({
                count: types.length
            });

            return types.map((type, idx) => {
                let fn = buildEntry({
                    key: type,
                    color: colors[idx]
                });

                return fn(data[type]);
            });
        });
}

function processTypes(entries) {
    let data = [].concat(entries || [])
        .reduce((memo, entry) => {
            let year = entry.key[1],
                type = entry.key[0];

            memo[year] = memo[year] || {};
            memo[year][type] = entry.value;

            return memo;
        }, {});

    return reduceToYears(data);
}

function reduceToYears(data) {
    return Object.keys(data).reduce((memo, key) => {
        memo[key] = mapToYears(data[key]);
        return memo;
    }, {});
}

function mapToYears(data) {
    return LABELS.reduce((memo, label, idx) => {
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
            borderColor: Common.lightenDarkenColor(entry.color, -35)
        };
    };
}

var charts = {
    "types": null,
    "types-relative": null
};

function drawTypesChart(datasets) {
    if (charts["types"]) {
        charts["types"].destroy();
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

    charts["types"] = drawChart($types, datasets, yAxis);
}

function drawTypesRelativeChart(datasets) {
    if (charts["types-relative"]) {
        charts["types-relative"].destroy();
    }

    var yAxis = {
        stacked: true,
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

        res.fill = true;

        res.data = res.data.map((value, idx) => {
            var year = years[idx];
            var v = (value / totals[year] * 100);
            v = v.toFixed(2);
            return parseInt(v, 10);
        });

        return res;
    });

    charts["types-relative"] = drawChart($typesRelative, ds, yAxis);
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

function enableForm() {
    Common.setupDownloads();
}

export default function run() {
    $types = Common.printChart("types", "Types of shows per year");
    $typesRelative = Common.printChart("typesRelative", "Types of shows per year (%)");

    Promise.all([
        Common.init(),
        populateTypes()
    ]).then(enableForm);
}
