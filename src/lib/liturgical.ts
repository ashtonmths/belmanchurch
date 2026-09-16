/**
 * What the Church celebrates on a given day, worked out in code so the
 * homepage banner is always right without anybody having to update it.
 *
 * Follows the General Roman Calendar as it is kept in India, where Epiphany,
 * Ascension and Corpus Christi are celebrated on Sundays.
 */

export type Season = "Advent" | "Christmas" | "Lent" | "Triduum" | "Easter" | "Ordinary Time";
export type Colour = "white" | "red" | "green" | "violet" | "rose";

export type LiturgicalDay = {
  /** Name of the day, e.g. "St. Joseph, Husband of the Blessed Virgin Mary". */
  title: string;
  /** Solemnity, Feast, Memorial, Sunday or Weekday. */
  rank: string;
  season: Season;
  colour: Colour;
  /** A line of parish context, only on days that have one. */
  note?: string;
};

const DAY = 24 * 60 * 60 * 1000;

/** Midnight local time, so day arithmetic never trips over the clock. */
function atMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a: Date, b: Date) => Math.round((atMidnight(a).getTime() - atMidnight(b).getTime()) / DAY);
const same = (a: Date, b: Date) => daysBetween(a, b) === 0;
const key = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Today's date in Belman, whatever time zone the server happens to run in.
 * Vercel runs in UTC, which is five and a half hours behind the parish.
 */
export function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = parts.split("-").map(Number);
  return new Date(y!, m! - 1, d);
}

/** Easter Sunday in the Gregorian calendar (Meeus/Jones/Butcher). */
export function easter(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return new Date(year, Math.floor(n / 31) - 1, (n % 31) + 1);
}

/** The Sunday on or before a date. */
const sundayOnOrBefore = (d: Date) => addDays(d, -d.getDay());

/** First Sunday of Advent: the fourth Sunday before Christmas Day. */
function firstAdvent(year: number) {
  return addDays(sundayOnOrBefore(new Date(year, 11, 25)), -21);
}

/** Every date that moves with Easter, plus the Christmas-season Sundays. */
function movableDates(year: number) {
  const e = easter(year);
  const christmas = new Date(year, 11, 25);
  // Epiphany is kept on the Sunday between 2 and 8 January.
  const epiphany = sundayOnOrBefore(new Date(year, 0, 8));
  return {
    epiphany,
    baptism: addDays(epiphany, 7),
    // The Sunday inside the Christmas octave, or 30 December when there is none.
    holyFamily: (() => {
      const s = sundayOnOrBefore(new Date(year, 11, 31));
      return daysBetween(s, christmas) > 0 ? s : new Date(year, 11, 30);
    })(),
    ashWednesday: addDays(e, -46),
    palmSunday: addDays(e, -7),
    holyThursday: addDays(e, -3),
    goodFriday: addDays(e, -2),
    holySaturday: addDays(e, -1),
    easter: e,
    divineMercy: addDays(e, 7),
    // India celebrates the Ascension on the Sunday before Pentecost.
    ascension: addDays(e, 42),
    pentecost: addDays(e, 49),
    trinity: addDays(e, 56),
    corpusChristi: addDays(e, 63),
    sacredHeart: addDays(e, 68),
    immaculateHeart: addDays(e, 69),
    advent: firstAdvent(year),
    christTheKing: addDays(firstAdvent(year), -7),
  };
}

const ORDINAL = [
  "",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
] as const;
const ordinal = (n: number) => {
  if (ORDINAL[n]) return ORDINAL[n];
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
  return `${n}${suffix}`;
};

type Fixed = [title: string, rank: string, colour: Colour, note?: string];

/**
 * Solemnities, feasts and the memorials people know by name. Days that are not
 * listed simply show the season, which is what a weekday in Ordinary Time is.
 */
const FIXED: Record<string, Fixed> = {
  "01-01": ["Mary, the Holy Mother of God", "Solemnity", "white"],
  "01-02": ["St. Basil the Great and St. Gregory Nazianzen", "Memorial", "white"],
  "01-17": ["St. Anthony the Abbot", "Memorial", "white"],
  "01-21": ["St. Agnes", "Memorial", "red"],
  "01-24": ["St. Francis de Sales", "Memorial", "white"],
  "01-25": ["The Conversion of St. Paul the Apostle", "Feast", "white"],
  "01-28": ["St. Thomas Aquinas", "Memorial", "white"],
  "01-31": ["St. John Bosco", "Memorial", "white"],

  "02-02": ["The Presentation of the Lord", "Feast", "white"],
  "02-03": ["St. Blaise", "Memorial", "red"],
  "02-05": ["St. Agatha", "Memorial", "red"],
  "02-10": ["St. Scholastica", "Memorial", "white"],
  "02-11": ["Our Lady of Lourdes", "Memorial", "white"],
  "02-14": ["St. Cyril and St. Methodius", "Memorial", "white"],
  "02-22": ["The Chair of St. Peter the Apostle", "Feast", "white"],

  "03-07": ["St. Perpetua and St. Felicity", "Memorial", "red"],
  "03-17": ["St. Patrick", "Memorial", "white"],
  "03-19": [
    "St. Joseph, Husband of the Blessed Virgin Mary",
    "Solemnity",
    "white",
    "The patronal feast of our parish.",
  ],
  "03-25": ["The Annunciation of the Lord", "Solemnity", "white"],

  "04-25": ["St. Mark the Evangelist", "Feast", "red"],
  "04-29": ["St. Catherine of Siena", "Feast", "white"],

  "05-01": ["St. Joseph the Worker", "Memorial", "white", "A second feast of our patron."],
  "05-02": ["St. Athanasius", "Memorial", "white"],
  "05-03": ["St. Philip and St. James, Apostles", "Feast", "red"],
  "05-13": ["Our Lady of Fatima", "Memorial", "white"],
  "05-14": ["St. Matthias the Apostle", "Feast", "red"],
  "05-26": ["St. Philip Neri", "Memorial", "white"],
  "05-31": ["The Visitation of the Blessed Virgin Mary", "Feast", "white"],

  "06-01": ["St. Justin", "Memorial", "red"],
  "06-03": ["St. Charles Lwanga and companions", "Memorial", "red"],
  "06-11": ["St. Barnabas the Apostle", "Memorial", "red"],
  "06-13": [
    "St. Anthony of Padua",
    "Memorial",
    "white",
    "Kept with a novena and feast at our shrine in Pakala.",
  ],
  "06-21": ["St. Aloysius Gonzaga", "Memorial", "white"],
  "06-24": ["The Nativity of St. John the Baptist", "Solemnity", "white"],
  "06-29": ["St. Peter and St. Paul, Apostles", "Solemnity", "red"],

  "07-03": ["St. Thomas the Apostle", "Feast", "red", "The apostle who brought the faith to India."],
  "07-11": ["St. Benedict", "Memorial", "white"],
  "07-16": ["Our Lady of Mount Carmel", "Memorial", "white"],
  "07-22": ["St. Mary Magdalene", "Feast", "white"],
  "07-25": ["St. James the Apostle", "Feast", "red"],
  "07-26": ["St. Joachim and St. Anne", "Memorial", "white"],
  "07-31": ["St. Ignatius of Loyola", "Memorial", "white"],

  "08-01": ["St. Alphonsus Liguori", "Memorial", "white"],
  "08-04": ["St. John Vianney", "Memorial", "white"],
  "08-06": ["The Transfiguration of the Lord", "Feast", "white"],
  "08-08": ["St. Dominic", "Memorial", "white"],
  "08-10": ["St. Lawrence", "Feast", "red"],
  "08-11": ["St. Clare", "Memorial", "white"],
  "08-14": ["St. Maximilian Kolbe", "Memorial", "red"],
  "08-15": ["The Assumption of the Blessed Virgin Mary", "Solemnity", "white"],
  "08-20": ["St. Bernard", "Memorial", "white"],
  "08-21": ["St. Pius X", "Memorial", "white"],
  "08-22": ["The Queenship of the Blessed Virgin Mary", "Memorial", "white"],
  "08-24": ["St. Bartholomew the Apostle", "Feast", "red"],
  "08-27": ["St. Monica", "Memorial", "white"],
  "08-28": ["St. Augustine", "Memorial", "white"],
  "08-29": ["The Passion of St. John the Baptist", "Memorial", "red"],

  "09-03": ["St. Gregory the Great", "Memorial", "white"],
  "09-08": [
    "The Nativity of the Blessed Virgin Mary",
    "Feast",
    "white",
    "Kept along this coast as Monti Fest, with new corn blessed and shared.",
  ],
  "09-10": ["Weekday", "Weekday", "green", "Belman became a parish in its own right on this day in 1894."],
  "09-13": ["St. John Chrysostom", "Memorial", "white"],
  "09-14": ["The Exaltation of the Holy Cross", "Feast", "red"],
  "09-15": ["Our Lady of Sorrows", "Memorial", "white"],
  "09-21": ["St. Matthew the Apostle", "Feast", "red"],
  "09-23": ["St. Pius of Pietrelcina", "Memorial", "white"],
  "09-27": ["St. Vincent de Paul", "Memorial", "white"],
  "09-29": ["St. Michael, St. Gabriel and St. Raphael, Archangels", "Feast", "white"],
  "09-30": ["St. Jerome", "Memorial", "white"],

  "10-01": ["St. Therese of the Child Jesus", "Memorial", "white"],
  "10-02": ["The Guardian Angels", "Memorial", "white"],
  "10-04": ["St. Francis of Assisi", "Memorial", "white"],
  "10-07": ["Our Lady of the Rosary", "Memorial", "white"],
  "10-15": ["St. Teresa of Avila", "Memorial", "white"],
  "10-18": ["St. Luke the Evangelist", "Feast", "red"],
  "10-22": ["St. John Paul II", "Memorial", "white"],
  "10-28": ["St. Simon and St. Jude, Apostles", "Feast", "red"],

  "11-01": ["All Saints", "Solemnity", "white"],
  "11-02": ["The Commemoration of All the Faithful Departed", "Commemoration", "violet"],
  "11-04": ["St. Charles Borromeo", "Memorial", "white"],
  "11-09": ["The Dedication of the Lateran Basilica", "Feast", "white"],
  "11-11": ["St. Martin of Tours", "Memorial", "white"],
  "11-21": ["The Presentation of the Blessed Virgin Mary", "Memorial", "white"],
  "11-22": ["St. Cecilia", "Memorial", "red"],
  "11-30": ["St. Andrew the Apostle", "Feast", "red"],

  "12-03": ["St. Francis Xavier", "Feast", "white", "Patron of the missions and of the Indies."],
  "12-06": ["St. Nicholas", "Memorial", "white"],
  "12-07": ["St. Ambrose", "Memorial", "white"],
  "12-08": ["The Immaculate Conception of the Blessed Virgin Mary", "Solemnity", "white"],
  "12-12": ["Our Lady of Guadalupe", "Memorial", "white"],
  "12-13": ["St. Lucy", "Memorial", "red"],
  "12-14": ["St. John of the Cross", "Memorial", "white"],
  "12-25": ["The Nativity of the Lord", "Solemnity", "white"],
  "12-26": ["St. Stephen, the first martyr", "Feast", "red"],
  "12-27": ["St. John the Apostle", "Feast", "white"],
  "12-28": ["The Holy Innocents", "Feast", "red"],
};

/** Which season a date falls in, and the colour worn that day. */
function seasonOf(date: Date, m: ReturnType<typeof movableDates>): { season: Season; colour: Colour } {
  if (daysBetween(date, m.advent) >= 0 && daysBetween(date, new Date(date.getFullYear(), 11, 24)) <= 0)
    return { season: "Advent", colour: "violet" };
  if (daysBetween(date, new Date(date.getFullYear(), 11, 25)) >= 0)
    return { season: "Christmas", colour: "white" };
  if (daysBetween(date, m.baptism) <= 0) return { season: "Christmas", colour: "white" };
  if (daysBetween(date, m.holyThursday) >= 0 && daysBetween(date, m.easter) < 0)
    return { season: "Triduum", colour: "red" };
  if (daysBetween(date, m.ashWednesday) >= 0 && daysBetween(date, m.easter) < 0)
    return { season: "Lent", colour: "violet" };
  if (daysBetween(date, m.easter) >= 0 && daysBetween(date, m.pentecost) <= 0)
    return { season: "Easter", colour: "white" };
  return { season: "Ordinary Time", colour: "green" };
}

/** How the Sundays of Ordinary Time are numbered, 2 through 34. */
function ordinaryTimeSunday(date: Date, m: ReturnType<typeof movableDates>) {
  if (daysBetween(date, m.ashWednesday) < 0) return 2 + daysBetween(date, addDays(m.baptism, 7)) / 7;
  return 34 - daysBetween(m.christTheKing, date) / 7;
}

/** What the Church celebrates on `date`. */
export function liturgicalDay(date = new Date()): LiturgicalDay {
  const d = atMidnight(date);
  const m = movableDates(d.getFullYear());
  const { season, colour } = seasonOf(d, m);
  const isSunday = d.getDay() === 0;

  const day = (title: string, rank: string, c: Colour = colour, note?: string): LiturgicalDay => ({
    title,
    rank,
    season,
    colour: c,
    note,
  });

  // 1. Days that move with Easter or Christmas outrank everything else.
  if (same(d, m.easter)) return day("Easter Sunday of the Resurrection of the Lord", "Solemnity", "white");
  if (same(d, m.goodFriday)) return day("Good Friday of the Passion of the Lord", "Solemnity", "red");
  if (same(d, m.holyThursday)) return day("Holy Thursday, the Lord's Supper", "Solemnity", "white");
  if (same(d, m.holySaturday)) return day("Holy Saturday and the Easter Vigil", "Solemnity", "white");
  if (same(d, m.palmSunday)) return day("Palm Sunday of the Passion of the Lord", "Solemnity", "red");
  if (same(d, m.ashWednesday)) return day("Ash Wednesday", "Ash Wednesday", "violet");
  if (same(d, m.pentecost)) return day("Pentecost Sunday", "Solemnity", "red");
  if (same(d, m.ascension)) return day("The Ascension of the Lord", "Solemnity", "white");
  if (same(d, m.trinity)) return day("The Most Holy Trinity", "Solemnity", "white");
  if (same(d, m.corpusChristi)) return day("The Body and Blood of Christ", "Solemnity", "white");
  if (same(d, m.sacredHeart)) return day("The Most Sacred Heart of Jesus", "Solemnity", "white");
  if (same(d, m.immaculateHeart))
    return day("The Immaculate Heart of the Blessed Virgin Mary", "Memorial", "white");
  if (same(d, m.divineMercy)) return day("Divine Mercy Sunday", "Solemnity", "white");
  if (same(d, m.christTheKing)) return day("Our Lord Jesus Christ, King of the Universe", "Solemnity", "white");
  if (same(d, m.holyFamily)) return day("The Holy Family of Jesus, Mary and Joseph", "Feast", "white");
  if (same(d, m.epiphany)) return day("The Epiphany of the Lord", "Solemnity", "white");
  if (same(d, m.baptism)) return day("The Baptism of the Lord", "Feast", "white");

  const daysAfterEaster = daysBetween(d, m.easter);
  if (daysAfterEaster > 0 && daysAfterEaster < 7)
    return day(`${d.toLocaleDateString("en-IN", { weekday: "long" })} within the Octave of Easter`, "Solemnity", "white");
  if (daysBetween(d, m.palmSunday) > 0 && daysBetween(d, m.holyThursday) < 0)
    return day(`${d.toLocaleDateString("en-IN", { weekday: "long" })} of Holy Week`, "Holy Week", "violet");

  // 2. Saints and feasts on a set date.
  const fixed = FIXED[key(d)];
  if (fixed && fixed[1] !== "Weekday") {
    // A Sunday outranks a memorial, but not a solemnity or a feast of the Lord.
    if (!isSunday || fixed[1] === "Solemnity" || fixed[1] === "Feast")
      return day(fixed[0], fixed[1], fixed[2], fixed[3]);
  }
  const note = fixed?.[3];

  // 3. Otherwise the day takes its name from the season.
  if (isSunday) {
    if (season === "Advent") {
      const n = 1 + daysBetween(d, m.advent) / 7;
      // Gaudete Sunday, when rose vestments may be worn.
      return day(`${ordinal(n)} Sunday of Advent`, "Sunday", n === 3 ? "rose" : colour, note);
    }
    if (season === "Lent") {
      // The first Sunday of Lent is the Sunday after Ash Wednesday.
      const n = 1 + daysBetween(d, addDays(m.ashWednesday, 4)) / 7;
      // Laetare Sunday, when rose vestments may be worn.
      return day(`${ordinal(n)} Sunday of Lent`, "Sunday", n === 4 ? "rose" : colour, note);
    }
    if (season === "Easter")
      return day(`${ordinal(1 + daysAfterEaster / 7)} Sunday of Easter`, "Sunday", colour, note);
    if (season === "Christmas") return day("Sunday of the Christmas season", "Sunday", colour, note);
    return day(`${ordinal(ordinaryTimeSunday(d, m))} Sunday in Ordinary Time`, "Sunday", colour, note);
  }

  // A weekday is named after the week it belongs to, which runs from Sunday.
  const weekday = d.toLocaleDateString("en-IN", { weekday: "long" });
  const sunday = sundayOnOrBefore(d);

  if (season === "Lent") {
    if (daysBetween(d, addDays(m.ashWednesday, 4)) < 0)
      return day(`${weekday} after Ash Wednesday`, "Weekday", colour, note);
    const n = 1 + daysBetween(sunday, addDays(m.ashWednesday, 4)) / 7;
    return day(`${weekday} of the ${ordinal(n)} Week of Lent`, "Weekday", colour, note);
  }
  if (season === "Easter")
    return day(`${weekday} of the ${ordinal(1 + daysBetween(sunday, m.easter) / 7)} Week of Easter`, "Weekday", colour, note);
  if (season === "Advent")
    return day(`${weekday} of the ${ordinal(1 + daysBetween(sunday, m.advent) / 7)} Week of Advent`, "Weekday", colour, note);
  if (season === "Christmas") return day(`${weekday} of the Christmas season`, "Weekday", colour, note);

  // Ordinary Time: the week after the Baptism of the Lord is the first.
  const week = daysBetween(sunday, m.baptism) <= 0 ? 1 : ordinaryTimeSunday(sunday, m);
  return day(`${weekday} of the ${ordinal(week)} Week in Ordinary Time`, "Weekday", colour, note);
}
