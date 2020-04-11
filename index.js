require("dotenv").config();
const fs = require("fs");
GraphSnapshot = require("./graph_snapshot");

const DATADOG_API_APP_KEY = process.env.DATADOG_API_APP_KEY;
const DATADOG_API_API_KEY = process.env.DATADOG_API_API_KEY;
const DATADOG_GRAPH_RESPONSE_DELAY = process.env.DATADOG_GRAPH_RESPONSE_DELAY

const source = fs.readFileSync("./example_graphs/request_timings_cds.json", "utf8");
const config = JSON.parse(source);
const snapshot = new GraphSnapshot(DATADOG_API_APP_KEY, DATADOG_API_API_KEY, DATADOG_GRAPH_RESPONSE_DELAY, config)

snapshot.takeSnapshot().then((json) => {
  console.log(json);
});
