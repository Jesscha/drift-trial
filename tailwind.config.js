/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  safelist: [
    // Add neutrals colors to safelist
    {
      pattern:
        /^(bg|text|border)-neutrals-(0|10|20|30|40|50|60|70|80|90|100|110)$/,
      variants: ["hover", "dark", "dark:hover"],
    },
    {
      pattern:
        /^(bg|text|border)-purple-(0|10|20|30|40|50|60|70|80|90|100|110|120)$/,
      variants: ["hover", "dark", "dark:hover"],
    },
    {
      pattern:
        /^(bg|text|border)-(red|green|lightBlue|darkBlue|blueGrey|yellow|pink)-(0|10|20|30|40|50|60|70|80|90|100|110)$/,
      variants: ["hover", "dark", "dark:hover"],
    },
    {
      pattern:
        /^bg-(primary|brand|buy|sell|prize|alpha-program|negative-bg|warning-bg|faq-bg|fuel|swift)-gradient$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Define Drift colors directly with hex values
        neutrals: {
          0: "#ffffff",
          10: "#fafafa",
          20: "#d4d4d8",
          30: "#a1a1aa",
          40: "#787883",
          50: "#555562",
          60: "#353541",
          70: "#27272f",
          80: "#19191f",
          90: "#121217",
          100: "#0d0d12",
          110: "#000000",
        },
        purple: {
          0: "#f1e8ff",
          10: "#e2d2ff",
          20: "#d4bbff",
          30: "#c6a5ff",
          40: "#b58aff",
          50: "#9162f6",
          60: "#711eff",
          70: "#5a18cc",
          80: "#441299",
          90: "#2d0c66",
          100: "#22094c",
          110: "#160433",
          120: "#3b265f",
        },
        darkBlue: {
          0: "#dae8fa",
          10: "#97b1d2",
          20: "#6683a7",
          30: "#465e7a",
          40: "#2e4665",
          50: "#152a44",
          60: "#132236",
          70: "#111d2e",
          80: "#101a27",
          90: "#0b141f",
          100: "#080f18",
          110: "#030a13",
        },
        lightBlue: {
          0: "#f3f9fe",
          10: "#e4edf7",
          20: "#cfddef",
          30: "#93abce",
          40: "#6b8bb7",
          50: "#436aa1",
          60: "#1b498b",
          70: "#163a6f",
          80: "#102c53",
          90: "#0b1d38",
          100: "#08162a",
          110: "#050f1c",
        },
        blueGrey: {
          0: "#f0f4f8",
          10: "#dae0e7",
          20: "#c1ccd7",
          30: "#a8b7c7",
          40: "#8fa2b7",
          50: "#768da7",
          60: "#5f7895",
          70: "#50647c",
          80: "#405064",
          90: "#303c4b",
          100: "#202832",
          110: "#101419",
        },
        green: {
          0: "#d6f5e7",
          10: "#c2efdb",
          20: "#a5e3c8",
          30: "#85e0b8",
          40: "#5dd5a0",
          50: "#34cb88",
          60: "#29b577",
          70: "#209d66",
          80: "#1f7a52",
          90: "#155136",
          100: "#11352e",
          110: "#0a291b",
        },
        red: {
          0: "#ffe7e5",
          10: "#ffdbd9",
          20: "#ffb8b2",
          30: "#ffa099",
          40: "#ff887f",
          50: "#ff615c",
          60: "#e54d48",
          70: "#c94641",
          80: "#a13c39",
          90: "#742e2b",
          100: "#502523",
          110: "#3d2624",
        },
        yellow: {
          0: "#fff6d9",
          10: "#fff1c5",
          20: "#ffecb2",
          30: "#ffe38c",
          40: "#ffdd75",
          50: "#f2c94c",
          60: "#e3bb42",
          70: "#b99b3f",
          80: "#9a7f2e",
          90: "#6d5a20",
          100: "#413511",
          110: "#2b2209",
        },
        pink: {
          0: "#ffebf1",
          10: "#ffd7e3",
          20: "#ffc3d5",
          30: "#ffafc7",
          40: "#ff88ab",
          50: "#f76490",
          60: "#ff3873",
          70: "#cf2d5d",
          80: "#9f2247",
          90: "#6f1631",
          100: "#571126",
          110: "#3f0b1b",
        },
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(90deg, #e8a2a0 0%, #9468f1 50%, #71cce9 100%)",
        "brand-gradient":
          "linear-gradient(114.67deg, rgba(255, 255, 255, 0.2) 16.59%, rgba(0, 0, 0, 0) 56.74%), linear-gradient(137.87deg, #f6f063 0%, rgba(224, 119, 116, 0) 30%), linear-gradient(83.36deg, #ff3873 3.72%, #9162f6 46.75%, #3fe5ff 94.51%)",
        "buy-gradient":
          "linear-gradient(91.2deg, #34CB88 0.14%, #29B074 99.86%)",
        "sell-gradient": "linear-gradient(90deg, #E54D48 0%, #C94641 100%)",
        "prize-gradient":
          "linear-gradient(96deg, #FFDEAD -0.21%, #FFCF52 53.39%, #FCA239 106.99%)",
        "alpha-program-gradient":
          "linear-gradient(90deg, #009AB2 0%, #10243E 100%)",
        "negative-bg-gradient":
          "linear-gradient(90deg, rgba(255, 136, 127, 0.15) 0%, rgba(255, 136, 127, 0) 100%), rgba(255, 255, 255, 0)",
        "warning-bg-gradient":
          "linear-gradient(90deg, rgba(242, 201, 76, 0.2) 0%, rgba(242, 201, 76, 0) 100%), #080F1800",
        "faq-bg-gradient":
          "radial-gradient(ellipse at top, rgba(25, 29, 44, 0.5) 0%, rgba(25, 29, 44, 0) 100%)",
        "fuel-gradient":
          "linear-gradient(181deg, #132236 0%, #F3ABFF 41%, #69EBFF 62%, #132236 84%)",
        "swift-gradient": "linear-gradient(90deg, #C046FA 0%, #4070FF 100%)",
      },
    },
  },
  plugins: [],
};
