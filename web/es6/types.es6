import Promise from "bluebird";
import randomColor from "randomcolor";
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

            let colors = randomColor({
                count: types.length
            });

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
            labelString: "count"
        },
        ticks: {
            beginAtZero: true
        }
    };

    charts["types"] = Common.drawLineChart($types, datasets, yAxis);
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

    charts["types-relative"] = Common.drawLineChart($typesRelative, ds, yAxis);
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
