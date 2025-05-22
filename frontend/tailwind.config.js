/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandcolor100: "#5B6FA9",
        brandcolor200: "#68FFA4",
        neutral100: "#FBF9F8",
        neutral200: "#E8EBED",
        neutral300: "#D5D9DB",
        neutral400: "#C0C9D0",
        neutral500: "#A6B5C0",
        neutral600: "#8596A4",
        neutral700: "#677681",
        neutral800: "#324655",
        neutral900: "#152838",
        neutral1000: "#020923",
        red: "#F24F6D",
        error: "#FF686B",
        warning: "#FFCB47",
        success: "#68FFA4",
        "kakao-container": "#FEE500",
        "kakao-symbol": "#000000",
        "kakao-label": "rgba(0, 0, 0, 0.85)",
      },
      backgroundImage: {
        "blue-gradient":
          "linear-gradient(-24deg, #121722 0%, #485A88 25%, #4260AE 100%)",
        "error-gradient":
          "linear-gradient(to right, rgba(255, 104, 107, 0.7) 0%, rgba(103, 118, 129, 0.7) 40%)",
        "success-gradient":
          "linear-gradient(to right, rgba(104, 255, 164, 0.7) 0%, rgba(103, 118, 129, 0.7) 40%)",
        "warning-gradient":
          "linear-gradient(to right, rgba(255, 203, 71, 0.7) 0%, rgba(103, 118, 129, 0.7) 40%)",
      },
      fontFamily: {
        cafe24: ["Cafe24ClassicType-Regular", "sans-serif"],
        pretendard: ["Pretendard Variable", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".text-stroke-100": {
          "-webkit-text-stroke": "1px #FBF9F8",
        },
        ".text-stroke-1000": {
          "-webkit-text-stroke": "1px #020923",
        },
      });
    },
  ],
};
