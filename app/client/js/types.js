import Promise from "bluebird";
import Common from "./common";

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

            let colors = Common.generateColors(types.length, "show-type-year-data");

            return types.map((type, idx) => {
                let fn = Common.buildEntry({
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

    return Common.reduceToActiveYears(data);
}

var CHARTS = {
    "types": null,
    "types-relative": null
};

function drawTypesChart(datasets) {
    if (CHARTS["types"]) {
        CHARTS["types"].destroy();
    }

    let yAxis = {
        scaleLabel: {
            display: true,
            labelString: "count"
        },
        ticks: {
            beginAtZero: true
        }
    };

    CHARTS["types"] = Common.drawLineChart($types, datasets, yAxis);
}

function drawTypesRelativeChart(datasets) {
    if (CHARTS["types-relative"]) {
        CHARTS["types-relative"].destroy();
    }

    let yAxis = {
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

    let totals = Common.getTotals();

    let ds = datasets.map(ds => {
        let years = Object.keys(totals);
        let res = Object.assign({}, ds);

        res.fill = true;

        res.data = res.data.map((value, idx) => {
            let year = years[idx];
            let v = (value / totals[year] * 100);
            v = v.toFixed(2);
            return parseInt(v, 10);
        });

        return res;
    });

    CHARTS["types-relative"] = Common.drawLineChart($typesRelative, ds, yAxis);
}

function enableForm() {
    Common.setupDownloads();

    populateTypes();
}

function run() {
    $types = Common.printChart("types", "Types of shows per year");
    $typesRelative = Common.printChart("typesRelative", "Types of shows per year (%)");

    Promise.all([
        Common.init()
    ]).then(enableForm);
}

run();
