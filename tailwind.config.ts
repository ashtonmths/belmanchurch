import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["var(--font-serif)", ...fontFamily.serif],
        cursive: ["'Great Vibes'", "cursive"],
      },
      colors: {
        primary: "#EAC696",
        secondary: "#C8AE7D",
        accent: "#765827",
        textcolor: "#65451F",
        cream: "#FBF7F0",
        ink: "#16110C",
      },
    },
  },
  plugins: [],
} satisfies Config;