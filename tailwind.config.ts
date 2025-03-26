import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        cursive: ["'Great Vibes'", "cursive"],
      },
      colors: {
        primary: "#EAC696",
        secondary: "#C8AE7D",
        accent: "#765827",
        textcolor: "#65451F",
      },
    },
  },
  plugins: [],
} satisfies Config;