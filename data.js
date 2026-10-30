/* Generated programmatically from data/glofas/teso_v4/results.json — do not hand-edit numbers. */
window.TRIGGERLAB_DATA = {
  "desinventar": {
    "KATAKWI": {
      "record_years": [
        2001,
        2007,
        2008,
        2010,
        2011,
        2012,
        2013,
        2014,
        2017,
        2018,
        2020,
        2021
      ],
      "event_years_dedup": [
        2001,
        2007,
        2008,
        2010,
        2011,
        2012,
        2013,
        2014,
        2017,
        2018,
        2020,
        2021
      ],
      "n_records": 91,
      "n_events_dedup": 33
    },
    "AMURIA": {
      "record_years": [
        2007,
        2008,
        2010,
        2011,
        2012,
        2013,
        2018,
        2021
      ],
      "event_years_dedup": [
        2007,
        2008,
        2010,
        2011,
        2012,
        2013,
        2018,
        2021
      ],
      "n_records": 60,
      "n_events_dedup": 25
    },
    "MAGORO": {
      "record_years": [
        2007,
        2010,
        2012,
        2017,
        2020
      ],
      "n_records": 16
    },
    "NGARIAM": {
      "record_years": [
        2001,
        2007,
        2010,
        2012,
        2017,
        2020,
        2021
      ],
      "n_records": 14
    },
    "MAGORO_NGARIAM": {
      "record_years": [
        2001,
        2007,
        2010,
        2012,
        2017,
        2020,
        2021
      ],
      "n_records": 30
    }
  },
  "points": {
    "apapi_magoro": {
      "point_id": "apapi_magoro",
      "label": "Magoro",
      "n_proxy_days": 1050,
      "proxy_span": [
        "2009-01-02",
        "2014-12-29"
      ],
      "n_hist_days": 2191,
      "danger95_proxy": 7.712499999999999,
      "danger95_hist": 7.5625,
      "sensitivity_proxy": [
        {
          "percentile": 93.0,
          "level": 7.1875,
          "n_exceedance_days": 73,
          "exceedance_years": [
            2010,
            2011,
            2012,
            2013
          ]
        },
        {
          "percentile": 95.0,
          "level": 7.712499999999999,
          "n_exceedance_days": 53,
          "exceedance_years": [
            2010,
            2011,
            2012,
            2013
          ]
        },
        {
          "percentile": 99.0,
          "level": 9.668359375,
          "n_exceedance_days": 11,
          "exceedance_years": [
            2011,
            2012
          ]
        }
      ],
      "hist95_exceedance_years": [
        2010,
        2011,
        2012,
        2013
      ],
      "proxy_vs_hist_corr": 0.9999434719221935,
      "proxy_vs_hist_n": 1050,
      "n_inits": {
        "4": 1050,
        "7": 1050
      },
      "actions": {
        "water_storage_purification": {
          "n_inits_scored": 1040,
          "by_trigger": {
            "0.30": {
              "hits": 48,
              "misses": 115,
              "false_alarms": 1,
              "correct_negatives": 876,
              "pod": 0.294478527607362,
              "far_pairs": 0.02040816326530612,
              "pofd": 0.0011402508551881414,
              "operational_far": 0.0,
              "n_actions": 8,
              "n_actions_hit": 8
            },
            "0.50": {
              "hits": 37,
              "misses": 126,
              "false_alarms": 1,
              "correct_negatives": 876,
              "pod": 0.22699386503067484,
              "far_pairs": 0.02631578947368421,
              "pofd": 0.0011402508551881414,
              "operational_far": 0.0,
              "n_actions": 8,
              "n_actions_hit": 8
            },
            "0.70": {
              "hits": 33,
              "misses": 130,
              "false_alarms": 1,
              "correct_negatives": 876,
              "pod": 0.20245398773006135,
              "far_pairs": 0.029411764705882353,
              "pofd": 0.0011402508551881414,
              "operational_far": 0.0,
              "n_actions": 7,
              "n_actions_hit": 7
            }
          }
        },
        "water_drainage": {
          "n_inits_scored": 1006,
          "by_trigger": {
            "0.30": {
              "hits": 49,
              "misses": 247,
              "false_alarms": 0,
              "correct_negatives": 710,
              "pod": 0.16554054054054054,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 5,
              "n_actions_hit": 5
            },
            "0.50": {
              "hits": 38,
              "misses": 258,
              "false_alarms": 0,
              "correct_negatives": 710,
              "pod": 0.12837837837837837,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 5,
              "n_actions_hit": 5
            },
            "0.70": {
              "hits": 34,
              "misses": 262,
              "false_alarms": 0,
              "correct_negatives": 710,
              "pod": 0.11486486486486487,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 5,
              "n_actions_hit": 5
            }
          }
        },
        "food_storage": {
          "n_inits_scored": 1039,
          "by_trigger": {
            "0.30": {
              "hits": 43,
              "misses": 122,
              "false_alarms": 3,
              "correct_negatives": 871,
              "pod": 0.2606060606060606,
              "far_pairs": 0.06521739130434782,
              "pofd": 0.003432494279176201,
              "operational_far": 0.0,
              "n_actions": 6,
              "n_actions_hit": 6
            },
            "0.50": {
              "hits": 31,
              "misses": 134,
              "false_alarms": 2,
              "correct_negatives": 872,
              "pod": 0.18787878787878787,
              "far_pairs": 0.06060606060606061,
              "pofd": 0.002288329519450801,
              "operational_far": 0.0,
              "n_actions": 6,
              "n_actions_hit": 6
            },
            "0.70": {
              "hits": 19,
              "misses": 146,
              "false_alarms": 2,
              "correct_negatives": 872,
              "pod": 0.11515151515151516,
              "far_pairs": 0.09523809523809523,
              "pofd": 0.002288329519450801,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            }
          }
        }
      },
      "headline_bootstrap": {
        "0.30": {
          "p_far_gt_0.5": 0.0,
          "far_ci_low": 0.0,
          "far_ci_high": 0.06896551724137931,
          "n_valid": 9998,
          "block_samples": 30
        },
        "0.50": {
          "p_far_gt_0.5": 0.0,
          "far_ci_low": 0.0,
          "far_ci_high": 0.08333333333333333,
          "n_valid": 9996,
          "block_samples": 30
        },
        "0.70": {
          "p_far_gt_0.5": 0.0,
          "far_ci_low": 0.0,
          "far_ci_high": 0.09090909090909091,
          "n_valid": 9993,
          "block_samples": 30
        }
      }
    },
    "akokoro_gauge": {
      "point_id": "akokoro_gauge",
      "label": "Akokoro gauge pixel",
      "n_proxy_days": 1050,
      "proxy_span": [
        "2009-01-02",
        "2014-12-29"
      ],
      "n_hist_days": 2191,
      "danger95_proxy": 40.314062499999984,
      "danger95_hist": 36.36328125,
      "sensitivity_proxy": [
        {
          "percentile": 93.0,
          "level": 32.16265625000001,
          "n_exceedance_days": 74,
          "exceedance_years": [
            2011,
            2012,
            2013
          ]
        },
        {
          "percentile": 95.0,
          "level": 40.314062499999984,
          "n_exceedance_days": 53,
          "exceedance_years": [
            2011,
            2012,
            2013
          ]
        },
        {
          "percentile": 99.0,
          "level": 65.61812499999999,
          "n_exceedance_days": 11,
          "exceedance_years": [
            2012,
            2013
          ]
        }
      ],
      "hist95_exceedance_years": [
        2011,
        2012,
        2013
      ],
      "proxy_vs_hist_corr": 0.9999895576640849,
      "proxy_vs_hist_n": 1050,
      "n_inits": {
        "4": 1050,
        "7": 1050
      },
      "actions": {
        "water_storage_purification": {
          "n_inits_scored": 1040,
          "by_trigger": {
            "0.30": {
              "hits": 50,
              "misses": 51,
              "false_alarms": 2,
              "correct_negatives": 937,
              "pod": 0.49504950495049505,
              "far_pairs": 0.038461538461538464,
              "pofd": 0.002129925452609159,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            },
            "0.50": {
              "hits": 49,
              "misses": 52,
              "false_alarms": 0,
              "correct_negatives": 939,
              "pod": 0.48514851485148514,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            },
            "0.70": {
              "hits": 48,
              "misses": 53,
              "false_alarms": 0,
              "correct_negatives": 939,
              "pod": 0.4752475247524752,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            }
          }
        },
        "water_drainage": {
          "n_inits_scored": 1006,
          "by_trigger": {
            "0.30": {
              "hits": 50,
              "misses": 154,
              "false_alarms": 2,
              "correct_negatives": 800,
              "pod": 0.24509803921568626,
              "far_pairs": 0.038461538461538464,
              "pofd": 0.0024937655860349127,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            },
            "0.50": {
              "hits": 49,
              "misses": 155,
              "false_alarms": 0,
              "correct_negatives": 802,
              "pod": 0.24019607843137256,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            },
            "0.70": {
              "hits": 48,
              "misses": 156,
              "false_alarms": 0,
              "correct_negatives": 802,
              "pod": 0.23529411764705882,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 2,
              "n_actions_hit": 2
            }
          }
        },
        "food_storage": {
          "n_inits_scored": 1039,
          "by_trigger": {
            "0.30": {
              "hits": 47,
              "misses": 56,
              "false_alarms": 1,
              "correct_negatives": 935,
              "pod": 0.4563106796116505,
              "far_pairs": 0.020833333333333332,
              "pofd": 0.0010683760683760685,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            },
            "0.50": {
              "hits": 46,
              "misses": 57,
              "false_alarms": 0,
              "correct_negatives": 936,
              "pod": 0.44660194174757284,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            },
            "0.70": {
              "hits": 43,
              "misses": 60,
              "false_alarms": 0,
              "correct_negatives": 936,
              "pod": 0.4174757281553398,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            }
          }
        }
      },
      "headline_bootstrap": {
        "0.30": {
          "p_far_gt_0.5": 0.0027165710836100213,
          "far_ci_low": 0.0,
          "far_ci_high": 0.3333333333333333,
          "n_valid": 9939,
          "block_samples": 30
        },
        "0.50": {
          "p_far_gt_0.5": 0.0,
          "far_ci_low": 0.0,
          "far_ci_high": 0.0,
          "n_valid": 9925,
          "block_samples": 30
        },
        "0.70": {
          "p_far_gt_0.5": 0.0,
          "far_ci_low": 0.0,
          "far_ci_high": 0.0,
          "n_valid": 9750,
          "block_samples": 30
        }
      }
    },
    "akokoro_kapelebyong": {
      "point_id": "akokoro_kapelebyong",
      "label": "Kapelebyong",
      "n_proxy_days": 1050,
      "proxy_span": [
        "2009-01-02",
        "2014-12-29"
      ],
      "n_hist_days": 2191,
      "danger95_proxy": 1.1449218749999996,
      "danger95_hist": 1.12890625,
      "sensitivity_proxy": [
        {
          "percentile": 93.0,
          "level": 0.9453125,
          "n_exceedance_days": 73,
          "exceedance_years": [
            2011,
            2012
          ]
        },
        {
          "percentile": 95.0,
          "level": 1.1449218749999996,
          "n_exceedance_days": 53,
          "exceedance_years": [
            2011,
            2012
          ]
        },
        {
          "percentile": 99.0,
          "level": 1.7579687499999999,
          "n_exceedance_days": 11,
          "exceedance_years": [
            2011,
            2012
          ]
        }
      ],
      "hist95_exceedance_years": [
        2011,
        2012
      ],
      "proxy_vs_hist_corr": 0.9994916465581528,
      "proxy_vs_hist_n": 1050,
      "n_inits": {
        "4": 1050,
        "7": 1050
      },
      "actions": {
        "water_storage_purification": {
          "n_inits_scored": 1040,
          "by_trigger": {
            "0.30": {
              "hits": 56,
              "misses": 39,
              "false_alarms": 3,
              "correct_negatives": 942,
              "pod": 0.5894736842105263,
              "far_pairs": 0.05084745762711865,
              "pofd": 0.0031746031746031746,
              "operational_far": 0.0,
              "n_actions": 5,
              "n_actions_hit": 5
            },
            "0.50": {
              "hits": 48,
              "misses": 47,
              "false_alarms": 2,
              "correct_negatives": 943,
              "pod": 0.5052631578947369,
              "far_pairs": 0.04,
              "pofd": 0.0021164021164021165,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            },
            "0.70": {
              "hits": 43,
              "misses": 52,
              "false_alarms": 1,
              "correct_negatives": 944,
              "pod": 0.45263157894736844,
              "far_pairs": 0.022727272727272728,
              "pofd": 0.0010582010582010583,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            }
          }
        },
        "water_drainage": {
          "n_inits_scored": 1006,
          "by_trigger": {
            "0.30": {
              "hits": 56,
              "misses": 107,
              "false_alarms": 3,
              "correct_negatives": 840,
              "pod": 0.34355828220858897,
              "far_pairs": 0.05084745762711865,
              "pofd": 0.0035587188612099642,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            },
            "0.50": {
              "hits": 48,
              "misses": 115,
              "false_alarms": 2,
              "correct_negatives": 841,
              "pod": 0.294478527607362,
              "far_pairs": 0.04,
              "pofd": 0.002372479240806643,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            },
            "0.70": {
              "hits": 43,
              "misses": 120,
              "false_alarms": 1,
              "correct_negatives": 842,
              "pod": 0.26380368098159507,
              "far_pairs": 0.022727272727272728,
              "pofd": 0.0011862396204033216,
              "operational_far": 0.0,
              "n_actions": 3,
              "n_actions_hit": 3
            }
          }
        },
        "food_storage": {
          "n_inits_scored": 1039,
          "by_trigger": {
            "0.30": {
              "hits": 54,
              "misses": 42,
              "false_alarms": 4,
              "correct_negatives": 939,
              "pod": 0.5625,
              "far_pairs": 0.06896551724137931,
              "pofd": 0.0042417815482502655,
              "operational_far": 0.3333333333333333,
              "n_actions": 6,
              "n_actions_hit": 4
            },
            "0.50": {
              "hits": 48,
              "misses": 48,
              "false_alarms": 1,
              "correct_negatives": 942,
              "pod": 0.5,
              "far_pairs": 0.02040816326530612,
              "pofd": 0.0010604453870625664,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            },
            "0.70": {
              "hits": 39,
              "misses": 57,
              "false_alarms": 0,
              "correct_negatives": 943,
              "pod": 0.40625,
              "far_pairs": 0.0,
              "pofd": 0.0,
              "operational_far": 0.0,
              "n_actions": 4,
              "n_actions_hit": 4
            }
          }
        }
      },
      "headline_bootstrap": {
        "0.30": {
          "p_far_gt_0.5": 0.001408734151740793,
          "far_ci_low": 0.0,
          "far_ci_high": 0.2,
          "n_valid": 9938,
          "block_samples": 30
        },
        "0.50": {
          "p_far_gt_0.5": 0.0008104548677945497,
          "far_ci_low": 0.0,
          "far_ci_high": 0.13333333333333333,
          "n_valid": 9871,
          "block_samples": 30
        },
        "0.70": {
          "p_far_gt_0.5": 0.0007099391480730223,
          "far_ci_low": 0.0,
          "far_ci_high": 0.08333333333333333,
          "n_valid": 9860,
          "block_samples": 30
        }
      }
    }
  }
};
