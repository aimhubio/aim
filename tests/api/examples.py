example_request_es_json = {
  "chart": {
    "focused": {
      "step": 3,
      "metric": {
        "runHash": None,
        "metricName": None,
        "traceContext": None
      },
      "circle": {
        "active": True,
        "step": 3,
        "runHash": "58dbeae1-fca8-11ea-902b-0a19547ebb2e",
        "metricName": "bleu",
        "traceContext": "eyJzdWJzZXQiOiJ0ZXN0In0"
      }
    },
    "settings": {
      "zoomMode": False,
      "singleZoomMode": True,
      "zoomHistory": [],
      "highlightMode": "metric",
      "persistent": {
        "displayOutliers": False,
        "zoom": {
          "4": {
            "x": [
              3,
              26
            ],
            "y": [
              28,
              31
            ]
          }
        },
        "interpolate": False,
        "indicator": False,
        "xAlignment": "step",
        "xScale": 1,
        "yScale": 0,
        "pointsCount": 50,
        "smoothingAlgorithm": "ema",
        "smoothFactor": 0.25,
        "aggregated": True
      }
    },
    "hiddenMetrics": [
      "58dbeae1-fca8-11ea-902b-0a19547ebb2e/bleu/eyJzdWJzZXQiOiJ2YWwifQ",
      "5787a2c7-fca8-11ea-902b-0a19547ebb2e/bleu/eyJzdWJzZXQiOiJ2YWwifQ"
    ],
    "tooltipOptions": {
      "display": True,
      "fields": []
    }
  },
  "search": {
    "query": "bleu",
    "v": 1
  },
  "searchInput": {
    "value": "bleu",
    "selectInput": "bleu",
    "selectConditionInput": ""
  },
  "contextFilter": {
    "groupByColor": [
      "params.dataset.preproc"
    ],
    "groupByStyle": [
      "params.hparams.max_k"
    ],
    "groupByChart": [
      "params.dataset.preproc"
    ],
    "groupAgainst": {
      "color": False,
      "style": False,
      "chart": False
    },
    "aggregatedArea": "std_dev",
    "aggregatedLine": "avg",
    "seed": {
      "color": 10,
      "style": 10
    },
    "persist": {
      "color": 1,
      "style": 1
    }
  },
  "sortFields": [
    [
      "hparams.max_k",
      "asc"
    ]
  ],
  "colorPalette": 0,
  "screen": {
    "panelFlex": 0.5556756756756757,
    "viewMode": "resizable"
  },
  "table": {
    "rowHeightMode": "short",
    "excludedFields": [
      "params.dataset.name",
      "params.hparams.clip_norm",
      "params.hparams.label_smoothing",
      "params.hparams.max_tokens",
      "params.hparams.seg",
      "params.hparams.upscale_primary",
      "params.hparams.warmup_steps",
      "params.hparams.batch_size"
    ],
    "columnsOrder": {
      "left": [
        "experiment",
        "run"
      ],
      "middle": [
        "params.hparams.max_k",
        "params.dataset.preproc",
        "metric",
        "context",
        "step",
        "epoch",
        "time",
        "params.dataset.name",
        "params.hparams.align",
        "params.hparams.anchors",
        "params.hparams.batch_size",
        "params.hparams.clip_norm",
        "params.hparams.delayed_batches",
        "params.hparams.dropout",
        "params.hparams.filter",
        "params.hparams.label_smoothing",
        "params.hparams.learning_rate",
        "params.hparams.max_tokens",
        "params.hparams.method",
        "params.hparams.normalize",
        "params.hparams.pooling",
        "params.hparams.seed",
        "params.hparams.seg",
        "params.hparams.upscale_primary",
        "params.hparams.warmup_steps"
      ],
      "right": [
        "value"
      ]
    },
    "columnsWidths": {
      "time": 152,
      "params.dataset.preproc": 127
    }
  }
}
example_response_es_json = {
        "chart": {
            "focused": {
                "metric": {
                    "runHash": None,
                    "metricName": None,
                    "traceContext": None
                },
                "circle": {
                    "active": True,
                    "runHash": "58dbeae1-fca8-11ea-902b-0a19547ebb2e",
                    "metricName": "bleu",
                    "traceContext": "eyJzdWJzZXQiOiJ0ZXN0In0",
                    "step": 3,
                    "param": None,
                    "contentType": None
                },
                "step": 3
            },
            "settings": {
                "zoomMode": False,
                "singleZoomMode": True,
                "zoomHistory": [],
                "highlightMode": "metric",
                "persistent": {
                    "displayOutliers": False,
                    "zoom": {
                        "4": {
                            "x": [
                                3,
                                26
                            ],
                            "y": [
                                28,
                                31
                            ]
                        }
                    },
                    "interpolate": False,
                    "indicator": False,
                    "xAlignment": "step",
                    "xScale": 1,
                    "yScale": 0,
                    "pointsCount": 50,
                    "smoothingAlgorithm": "ema",
                    "smoothFactor": 0.25,
                    "aggregated": True
                }
            },
            "tooltipOptions": {
                "display": True,
                "fields": []
            },
            "hiddenMetrics": [
                "58dbeae1-fca8-11ea-902b-0a19547ebb2e/bleu/eyJzdWJzZXQiOiJ2YWwifQ",
                "5787a2c7-fca8-11ea-902b-0a19547ebb2e/bleu/eyJzdWJzZXQiOiJ2YWwifQ"
            ]
        },
        "search": {
            "query": "bleu",
            "v": 1
        },
        "searchInput": {
            "value": "bleu",
            "selectInput": "bleu",
            "selectConditionInput": ""
        },
        "contextFilter": {
            "groupByColor": [
                "params.dataset.preproc"
            ],
            "groupByStyle": [
                "params.hparams.max_k"
            ],
            "groupByChart": [
                "params.dataset.preproc"
            ],
            "aggregatedArea": "std_dev",
            "aggregatedLine": "avg",
            "groupAgainst": {
                "color": False,
                "style": False,
                "chart": False
            },
            "seed": {
                "color": 10,
                "style": 10
            },
            "persist": {
                "color": 1,
                "style": 1
            }
        },
        "colorPalette": 0,
        "sortFields": [
            [
                "hparams.max_k",
                "asc"
            ]
        ],
        "screen": {
            "viewMode": "resizable",
            "panelFlex": 0.5556756756756757
        },
        "table": {
            "columnsOrder": {
                "left": [
                    "experiment",
                    "run"
                ],
                "middle": [
                    "params.hparams.max_k",
                    "params.dataset.preproc",
                    "metric",
                    "context",
                    "step",
                    "epoch",
                    "time",
                    "params.dataset.name",
                    "params.hparams.align",
                    "params.hparams.anchors",
                    "params.hparams.batch_size",
                    "params.hparams.clip_norm",
                    "params.hparams.delayed_batches",
                    "params.hparams.dropout",
                    "params.hparams.filter",
                    "params.hparams.label_smoothing",
                    "params.hparams.learning_rate",
                    "params.hparams.max_tokens",
                    "params.hparams.method",
                    "params.hparams.normalize",
                    "params.hparams.pooling",
                    "params.hparams.seed",
                    "params.hparams.seg",
                    "params.hparams.upscale_primary",
                    "params.hparams.warmup_steps"
                ],
                "right": [
                    "value"
                ]
            },
            "rowHeightMode": "short",
            "columnsWidths": {
                "time": 152,
                "params.dataset.preproc": 127
            },
            "excludedFields": [
                "params.dataset.name",
                "params.hparams.clip_norm",
                "params.hparams.label_smoothing",
                "params.hparams.max_tokens",
                "params.hparams.seg",
                "params.hparams.upscale_primary",
                "params.hparams.warmup_steps",
                "params.hparams.batch_size"
            ]
        }
    }
empty_es_json = {
    "chart": {
      "focused": {
        "metric": {
          "runHash": None,
          "metricName": None,
          "traceContext": None
        },
        "circle": {
          "active": None,
          "runHash": None,
          "metricName": None,
          "traceContext": None,
          "step": None,
          "param": None,
          "contentType": None
        },
        "step": None
      },
      "settings": {
        "zoomMode": None,
        "singleZoomMode": None,
        "zoomHistory": None,
        "highlightMode": None,
        "persistent": {
          "displayOutliers": None,
          "zoom": None,
          "interpolate": None,
          "indicator": None,
          "xAlignment": None,
          "xScale": None,
          "yScale": None,
          "pointsCount": None,
          "smoothingAlgorithm": None,
          "smoothFactor": None,
          "aggregated": None
        }
      },
      "tooltipOptions": {
        "display": None,
        "fields": None
      },
      "hiddenMetrics": None
    },
    "search": {
      "query": None,
      "v": None
    },
    "searchInput": {
      "value": None,
      "selectInput": None,
      "selectConditionInput": None
    },
    "contextFilter": {
      "groupByColor": None,
      "groupByStyle": None,
      "groupByChart": None,
      "aggregatedArea": None,
      "aggregatedLine": None,
      "groupAgainst": {
        "color": None,
        "style": None,
        "chart": None
      },
      "seed": {
        "color": None,
        "style": None
      },
      "persist": {
        "color": None,
        "style": None
      }
    },
    "colorPalette": None,
    "sortFields": None,
    "screen": {
      "viewMode": None,
      "panelFlex": None
    },
    "table": {
      "columnsOrder": {
        "left": None,
        "middle": None,
        "right": None
      },
      "rowHeightMode": None,
      "columnsWidths": None,
      "excludedFields": None
    }
  }
incorrect_es_json = {
  "chart": {
    "focused": {
      "step": "here we go"
    }
  }
}
