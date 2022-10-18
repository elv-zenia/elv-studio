export const s3Regions = [
  {name: "Africa (Cape Town)", value: "af-south-1"},
  {name: "Asia Pacific (Hong Kong)", value: "ap-east-1"},
  {name: "Asia Pacific (Jakarta)", value: "ap-southeast-3"},
  {name: "Asia Pacific (Mumbai)", value: "ap-south-1"},
  {name: "Asia Pacific (Osaka)", value: "ap-northeast-3"},
  {name: "Asia Pacific (Seoul)", value: "ap-northeast-2"},
  {name: "Asia Pacific (Singapore)", value: "ap-southeast-1"},
  {name: "Asia Pacific (Sydney)", value: "ap-southeast-2"},
  {name: "Asia Pacific (Tokyo)", value: "ap-northeast-1"},
  {name: "AWS GovCloud (US-East)", value: "us-gov-east-1"},
  {name: "AWS GovCloud (US-West)", value: "us-gov-west-1"},
  {name: "Canada (Central)", value: "ca-central-1"},
  {name: "China (Beijing)", value: "cn-north-1"},
  {name: "China (Ningxia)", value: "cn-northwest-1"},
  {name: "Europe (Frankfurt)", value: "eu-central-1"},
  {name: "Europe (Ireland)", value: "eu-west-1"},
  {name: "Europe (London)", value: "eu-west-2"},
  {name: "Europe (Milan)", value: "eu-south-1"},
  {name: "Europe (Paris)", value: "eu-west-3"},
  {name: "Europe (Stockholm)", value: "eu-north-1"},
  {name: "Middle East (Bahrain)", value: "me-south-1"},
  {name: "Middle East (UAE)", value: "me-central-1"},
  {name: "South America (São Paulo)", value: "sa-east-1"},
  {name: "US East (Ohio)", value: "us-east-2"},
  {name: "US East (N. Virginia)", value: "us-east-1"},
  {name: "US West (N. California)", value: "us-west-1"},
  {name: "US West (Oregon)", value: "us-west-2"}
];

const segmentSpecs = {
  "segment_specs": {
    "audio": {
      "segs_per_chunk": 15,
      "target_dur": 2
    },
    "video": {
      "segs_per_chunk": 15,
      "target_dur": 2
    }
  }
};

const ladderSpecs = {
  "ladder_specs": {
    "{\"media_type\":\"audio\",\"channels\":1}": {
      "rung_specs": [
        {
          "bit_rate": 128000,
          "media_type": "audio",
          "pregenerate": true
        }
      ]
    },
    "{\"media_type\":\"audio\",\"channels\":2}": {
      "rung_specs": [
        {
          "bit_rate": 192000,
          "media_type": "audio",
          "pregenerate": true
        }
      ]
    },
    "{\"media_type\":\"audio\",\"channels\":6}": {
      "rung_specs": [
        {
          "bit_rate": 384000,
          "media_type": "audio",
          "pregenerate": true
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":273,\"aspect_ratio_width\":640}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 2538
        },
        {
          "bit_rate": 6000000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1692
        },
        {
          "bit_rate": 2640000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1270
        },
        {
          "bit_rate": 1450000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 1016
        },
        {
          "bit_rate": 1070000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        },
        {
          "bit_rate": 690000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        }

      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":267,\"aspect_ratio_width\":640}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 2538
        },
        {
          "bit_rate": 6000000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1692
        },
        {
          "bit_rate": 2640000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1270
        },
        {
          "bit_rate": 1450000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 1016
        },
        {
          "bit_rate": 1070000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        },
        {
          "bit_rate": 690000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":729,\"aspect_ratio_width\":1280}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":1,\"aspect_ratio_width\":2}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 2160
        },
        {
          "bit_rate": 5000000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1440
        },
        {
          "bit_rate": 2250000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1080
        },
        {
          "bit_rate": 1200000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 864
        },
        {
          "bit_rate": 910000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 720
        },
        {
          "bit_rate": 580000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 720
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":67,\"aspect_ratio_width\":120}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":539,\"aspect_ratio_width\":960}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":11,\"aspect_ratio_width\":15}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":11,\"aspect_ratio_width\":20}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":12296,\"aspect_ratio_width\":21851}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":131072,\"aspect_ratio_width\":192165}": {
      "rung_specs": [
        {
          "bit_rate": 5500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1620
        },
        {
          "bit_rate": 2400000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1080
        },
        {
          "bit_rate": 1400000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 810
        },
        {
          "bit_rate": 900000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 648
        },
        {
          "bit_rate": 680000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 440000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":135,\"aspect_ratio_width\":176}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":135,\"aspect_ratio_width\":316}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 2528
        },
        {
          "bit_rate": 6000000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1692
        },
        {
          "bit_rate": 2640000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1270
        },
        {
          "bit_rate": 1450000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 1016
        },
        {
          "bit_rate": 1070000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        },
        {
          "bit_rate": 690000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":135,\"aspect_ratio_width\":76}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1920,
          "media_type": "video",
          "pregenerate": true,
          "width": 1080
        },
        {
          "bit_rate": 4500000,
          "height": 1280,
          "media_type": "video",
          "pregenerate": false,
          "width": 720
        },
        {
          "bit_rate": 2000000,
          "height": 960,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 1100000,
          "height": 768,
          "media_type": "video",
          "pregenerate": false,
          "width": 432
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":16,\"aspect_ratio_width\":9}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1920,
          "media_type": "video",
          "pregenerate": true,
          "width": 1080
        },
        {
          "bit_rate": 4500000,
          "height": 1280,
          "media_type": "video",
          "pregenerate": false,
          "width": 720
        },
        {
          "bit_rate": 2000000,
          "height": 960,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 1100000,
          "height": 768,
          "media_type": "video",
          "pregenerate": false,
          "width": 432
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":17,\"aspect_ratio_width\":40}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 2538
        },
        {
          "bit_rate": 6000000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1692
        },
        {
          "bit_rate": 2640000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1270
        },
        {
          "bit_rate": 1450000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 1016
        },
        {
          "bit_rate": 1070000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        },
        {
          "bit_rate": 690000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":173,\"aspect_ratio_width\":320}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1036,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4700000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1334
        },
        {
          "bit_rate": 2080000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1000
        },
        {
          "bit_rate": 1145000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 800
        },
        {
          "bit_rate": 843000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 666
        },
        {
          "bit_rate": 541000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 666
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":2,\"aspect_ratio_width\":3}": {
      "rung_specs": [
        {
          "bit_rate": 5500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1620
        },
        {
          "bit_rate": 2400000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1080
        },
        {
          "bit_rate": 1400000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 810
        },
        {
          "bit_rate": 900000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 648
        },
        {
          "bit_rate": 680000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 440000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":20,\"aspect_ratio_width\":27}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":240,\"aspect_ratio_width\":427}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":243,\"aspect_ratio_width\":320}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":259,\"aspect_ratio_width\":480}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1036,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4700000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1334
        },
        {
          "bit_rate": 2080000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1000
        },
        {
          "bit_rate": 1145000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 800
        },
        {
          "bit_rate": 843000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 666
        },
        {
          "bit_rate": 541000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 666
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":262144,\"aspect_ratio_width\":319905}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1280
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 853
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 512
        },
        {
          "bit_rate": 540000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 426
        },
        {
          "bit_rate": 350000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 426
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":27,\"aspect_ratio_width\":32}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1280
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 853
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 512
        },
        {
          "bit_rate": 540000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 426
        },
        {
          "bit_rate": 350000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 426
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":27,\"aspect_ratio_width\":40}": {
      "rung_specs": [
        {
          "bit_rate": 5500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1620
        },
        {
          "bit_rate": 2400000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1080
        },
        {
          "bit_rate": 1400000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 810
        },
        {
          "bit_rate": 900000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 648
        },
        {
          "bit_rate": 680000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 440000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":297,\"aspect_ratio_width\":400}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":3,\"aspect_ratio_width\":4}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":30,\"aspect_ratio_width\":53}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":40,\"aspect_ratio_width\":71}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":429,\"aspect_ratio_width\":1024}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 2538
        },
        {
          "bit_rate": 6000000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1692
        },
        {
          "bit_rate": 2640000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1270
        },
        {
          "bit_rate": 1450000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 1016
        },
        {
          "bit_rate": 1070000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        },
        {
          "bit_rate": 690000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":466577,\"aspect_ratio_width\":912058}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1036,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4700000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1334
        },
        {
          "bit_rate": 2080000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1000
        },
        {
          "bit_rate": 1145000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 800
        },
        {
          "bit_rate": 843000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 666
        },
        {
          "bit_rate": 541000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 666
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":480,\"aspect_ratio_width\":853}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":486,\"aspect_ratio_width\":853}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":5,\"aspect_ratio_width\":12}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 2538
        },
        {
          "bit_rate": 6000000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1692
        },
        {
          "bit_rate": 2640000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 1270
        },
        {
          "bit_rate": 1450000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 1016
        },
        {
          "bit_rate": 1070000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        },
        {
          "bit_rate": 690000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 846
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":582543,\"aspect_ratio_width\":776720}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":639,\"aspect_ratio_width\":889}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":65536,\"aspect_ratio_width\":87381}": {
      "rung_specs": [
        {
          "bit_rate": 4900000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1452
        },
        {
          "bit_rate": 3375000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 968
        },
        {
          "bit_rate": 1500000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 726
        },
        {
          "bit_rate": 825000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 580
        },
        {
          "bit_rate": 610000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        },
        {
          "bit_rate": 390000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 484
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":81,\"aspect_ratio_width\":128}": {
      "rung_specs": [
        {
          "bit_rate": 5500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1620
        },
        {
          "bit_rate": 2400000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1080
        },
        {
          "bit_rate": 1400000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 810
        },
        {
          "bit_rate": 900000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 648
        },
        {
          "bit_rate": 680000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 440000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":8192,\"aspect_ratio_width\":12015}": {
      "rung_specs": [
        {
          "bit_rate": 5500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1620
        },
        {
          "bit_rate": 2400000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1080
        },
        {
          "bit_rate": 1400000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 810
        },
        {
          "bit_rate": 900000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 648
        },
        {
          "bit_rate": 680000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 440000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":891,\"aspect_ratio_width\":1600}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":9,\"aspect_ratio_width\":16}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 960
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 768
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        }
      ]
    },
    "{\"media_type\":\"video\",\"aspect_ratio_height\":1,\"aspect_ratio_width\":1}": {
      "rung_specs": [
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": true,
          "width": 1080
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 720
        },
        {
          "bit_rate": 2000000,
          "height": 540,
          "media_type": "video",
          "pregenerate": false,
          "width": 540
        },
        {
          "bit_rate": 1100000,
          "height": 432,
          "media_type": "video",
          "pregenerate": false,
          "width": 432
        },
        {
          "bit_rate": 810000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 360
        },
        {
          "bit_rate": 520000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 360
        }
      ]
    }
  }
};

export const abrProfileClear = {
  "drm_optional": true,
  "store_clear": true,
  "playout_formats": {
    "dash-clear": {
      "drm": null,
      "protocol": {
        "min_buffer_length": 2,
        "type": "ProtoDash"
      }
    },
    "hls-clear": {
      "drm": null,
      "protocol": {
        "type": "ProtoHls"
      }
    }
  },
  ...ladderSpecs,
  ...segmentSpecs
};

export const abrProfileDrm = {
  "drm_optional": false,
  "store_clear": false,
  "playout_formats": {
    "dash-widevine": {
      "drm": {
        "content_id": "",
        "enc_scheme_name": "cenc",
        "license_servers": [],
        "type": "DrmWidevine"
      },
      "protocol": {
        "min_buffer_length": 2,
        "type": "ProtoDash"
      }
    },
    "hls-aes128": {
      "drm": {
        "enc_scheme_name": "aes-128",
        "type": "DrmAes128"
      },
      "protocol": {
        "type": "ProtoHls"
      }
    },
    "hls-fairplay": {
      "drm": {
        "enc_scheme_name": "cbcs",
        "license_servers": [],
        "type": "DrmFairplay"
      },
      "protocol": {
        "type": "ProtoHls"
      }
    },
    "hls-sample-aes": {
      "drm": {
        "enc_scheme_name": "cbcs",
        "type": "DrmSampleAes"
      },
      "protocol": {
        "type": "ProtoHls"
      }
    }
  },
  ...ladderSpecs,
  ...segmentSpecs
};

export const abrProfileRestrictedDrm = {
  "drm_optional": false,
  "store_clear": false,
  "playout_formats": {
    "dash-widevine": {
      "drm": {
        "content_id": "",
        "enc_scheme_name": "cenc",
        "license_servers": [],
        "type": "DrmWidevine"
      },
      "protocol": {
        "min_buffer_length": 2,
        "type": "ProtoDash"
      }
    },
    "hls-fairplay": {
      "drm": {
        "enc_scheme_name": "cbcs",
        "license_servers": [],
        "type": "DrmFairplay"
      },
      "protocol": {
        "type": "ProtoHls"
      }
    }
  },
  ...ladderSpecs,
  ...segmentSpecs
};
