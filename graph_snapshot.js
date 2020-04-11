const moment = require("moment");
const fetch = require("node-fetch");
const { promisify } = require('util')
const delay = promisify(setTimeout)

InstStatsdRequestsGraphFactory = require("datadog-canned/factories/statsd/inst-statsd-requests");

const classes = {
  InstStatsdRequestsGraphFactory,
};

class DynamicClass {
  constructor(className, opts) {
    return new classes[className](opts);
  }
}

class GraphSnaphshot {
  constructor(appKey, apiKey, delay, config) {
    this.appKey = appKey;
    this.apiKey = apiKey;
    this.config = config;
    this.delay = delay || 2000 // Add delay before returning response because Datadog takes a while to render the image
    if (config) {
      this.graph = this.getGraphFromConfig(config);
    } else {
      this.graph = undefined;
    }
  }

  createSnapshot(title, graphDef, start, end) {
    const graphDefString = JSON.stringify(graphDef);
    const baseUrl = `https://api.datadoghq.com/api/v1/graph/snapshot`;
    const params = {
      graph_def: encodeURI(graphDefString),
      start: start,
      end: end,
      title: title,
    };

    var queryString = Object.keys(params)
      .map((key) => key + "=" + params[key])
      .join("&");
    const url = `${baseUrl}?${queryString}`;
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": this.apiKey,
        "DD-APPLICATION-KEY": this.appKey,
      },
    })
      .then(
        (response) => {
          if (response.status !== 200) {
            console.log(
              `Error encountered: (${response.status}) ${response.statusText}`
            );
          } else {
            console.log(`Snapshotted ${title}!`);
            return response.json();
          }
        },
        (error) => {
          console.error(error); // Stacktrace
        }
      )
      .then((json) => {
        return delay(this.delay).then(() => {
          return json;
        })
      });
  }

  getEndMoment(end) {
    if (!end) return new moment();
    if (end === "now") {
      return new moment();
    }
    return new moment(end);
  }

  getEndMomentUnix(end) {
    return this.getEndMoment(end).unix();
  }

  getStartMoment(start, end) {
    if (!start) return new moment();
    const endMoment = this.getEndMoment(end);

    if (start.period && start.number) {
      if (!end) return new moment();
      return endMoment.subtract(start.number, start.period);
    } else {
      return new moment(start);
    }
  }

  getStartMomentUnix(start, end) {
    return this.getStartMoment(start, end).unix();
  }

  getGraphFromConfig(config) {
    // Instantiate the factory class
    const instance = new DynamicClass(config.factory);

    // Call the graph_def_type function with the parameters
    let graph = instance[config.graph_def_type](...config.params);
    if (config.additional_graph_def) {
      if (config.additional_graph_def.yaxis) {
        graph = graph.withYAxis(config.additional_graph_def.yaxis);
      }
      if (config.additional_graph_def.markers) {
        graph = graph.withMarkers(config.additional_graph_def.markers);
      }
    }
    return graph;
  }

  takeSnapshot(start, end, title) {
    const startUnix = start
      ? this.getStartMomentUnix(start, end)
      : this.getStartMomentUnix(this.config.start, this.config.end);
    const endUnix = end
      ? this.getEndMomentUnix(end)
      : this.getEndMomentUnix(this.config.end);
    const snapshotTitle = title || this.config.title;
    return this.createSnapshot(
      snapshotTitle,
      this.graph.getObject(),
      startUnix,
      endUnix
    );
  }

  takeSnapshotFromGraphObject(start, end, title, graph) {
    const startUnix = this.getStartMomentUnix(start, end)
    const endUnix = this.getEndMomentUnix(end)
    return this.createSnapshot(
      title,
      graph.getObject(),
      startUnix,
      endUnix
    );
  }
}

module.exports = GraphSnaphshot;
