# Query Format

Sample JSON

```json
{
  "key": "cds-slo",
  "title": "CDS Request Times (last 4 hrs)",
  "end": "now",
  "start": {
    "number": 4,
    "period": "hours"
  },
  "factory": "InstStatsdRequestsGraphFactory",
  "graph_def_type": "requestTimes",
  "params": [
    "request",
    {
      "app": "cds",
      "env": "production"
    }
  ],
  "additional_graph_def": {
    "yaxis": {
      "max": "auto",
      "scale": "linear",
      "min": "auto",
      "label": "",
      "includeZero": true
    },
    "markers": [
      {
        "value": "y = 200",
        "type": "warning dashed",
        "label": "SLO"
      }
    ]
  }
}
```

## Environment Variables

- DATADOG_API_APP_KEY
- DATADOG_API_API_KEY
- DATADOG_GRAPH_RESPONSE_DELAY

## Example

Currently there's an example_graphs folder and also the calling example in index.js
