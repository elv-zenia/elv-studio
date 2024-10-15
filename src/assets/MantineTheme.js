import {createTheme} from "@mantine/core";

const theme = createTheme({
  fontFamily: "Helvetica Neue, Helvetica, sans-serif",
  headings: {
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
  },
  primaryColor: "elv-violet",
  primaryShade: 3,
  scale: 1,
  colors: {
    "elv-violet": [
      "#f9e9ff",
      "#ebcfff",
      "#d29cff",
      "#b964ff", // eluvio color
      "#a437fe",
      "#971afe",
      "#9009ff",
      "#7c00e4",
      "#8f5aff", // eluvio color
      "#5f00b3",
      "#380c61", // eluvio color
    ],
    "elv-gray": [
      "#f5f5f5",
      "#f0f0f0",
      "#d7d7d7", // eluvio color
      "#bdbdbd", // eluvio color
      "rgba(0,0,0,0.06)", // eluvio color
      "#8b8b8b",
      "#848484",
      "#717171",
      "#4b494e", // eluvio color
      "#3c3c3c" // eluvio color
    ],
    "elv-neutral": [
      "#f8f2fe",
      "#ecece8", // eluvio color
      "#cdc8d3",
      "#b2aaba", // eluvio color
      "#a9a0b2", // eluvio color
      "#7b7580", // eluvio color
      "#847791",
      "#71667e",
      "#665972",
      "#594c66"
    ]
  },
  components: {
    Accordion: {
      styles: () => ({
        control: {
          backgroundColor: "var(--mantine-color-elv-gray-4)"
        },
        label: {
          lineHeight: 1,
          paddingTop: "var(--mantine-spacing-xs)",
          paddingBottom: "var(--mantine-spacing-xs)",
          fontWeight: 600,
          color: "var(--mantine-color-elv-gray-8)"
        },
        item: {
          "--item-border-color": "transparent"
        },
        panel: {
          color: "var(--mantine-color-elv-gray-8)"
        },
        content: {
          padding: 0
        }
      })
    },
    Badge: {
      styles: () => ({
        root: {
          "--badge-height-lg": "calc(37.5px* var(--mantine-scale))"
        }
      })
    },
    Dropzone: {
      styles: () => ({
        root: {
          border: "none",
          borderRadius: "5px",
          backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='%23380c61' stroke-width='2' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")"
        }
      })
    },
    Modal: {
      styles: () => ({
        root: {
          "--modal-size-xxl": "calc(55.75rem * var(--mantine-scale))"
        }
      })
    },
    Switch: {
      styles: () => ({
        root: {
          "--switch-height-xxl": "calc(2.625rem*var(--mantine-scale))",
          "--switch-width-xxl": "calc(4.75rem*var(--mantine-scale))",
          "--switch-thumb-size-xxl": "calc(2rem* var(--mantine-scale))",
          "--switch-label-font-size-xxl": "calc(0.75rem* var(--mantine-scale))",
          "--switch-track-label-padding-xxl": "calc(0.25rem* var(--mantine-scale))"
        }
      })
    },
    Table: {
      vars: (theme, props) => {
        if(props.size === "xxs") {
          return {
            root: {
              "--text-fz": "0.75rem"
            }
          };
        }
      }
    },
    Tabs: {
      styles: () => ({
        list: {
          "--tabs-list-border-size": "1px"
        }
      })
    }
  }
});

export default theme;
