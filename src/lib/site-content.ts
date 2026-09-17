import { z } from "zod";
import { MASS_TIMINGS, OFFICE_HOURS, OTHER_SERVICES } from "~/lib/parish";

/**
 * Page content that admins can edit. Each key is stored as JSON in the
 * SiteContent table; when a key has never been saved, the default below is used.
 */

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const serviceSchema = z.object({
  label: z.string().trim().min(1).max(80),
  times: z.array(z.string().trim().min(1).max(40)).min(1).max(6),
  note: z.string().trim().max(300).optional(),
  /** Used for the live "Next Mass" card and Google's opening hours. */
  days: z.array(z.enum(DAYS)).optional(),
});

export const infoItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().max(3000),
  /**
   * Konkani text. Text copied from the old website uses a legacy Kannada
   * font encoding and is displayed with that font (see `.font-konkani`).
   */
  bodyKonkani: z.string().trim().max(8000).optional(),
  imageUrl: z.string().regex(/^(\/|https:\/\/)/).optional(),
  /** Attribution for photos that are not the parish's own, e.g. Wikimedia Commons. */
  imageCredit: z.string().trim().max(200).optional(),
  imageCreditUrl: z.string().url().optional(),
  /** Short fact shown as a badge, e.g. a founding year. */
  badge: z.string().trim().max(40).optional(),
});

/** Colour wash over the homepage carousel photos. */
export const tintSchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #EAC696"),
  /** Percent opacity of the tint layer. */
  strength: z.number().int().min(0).max(85),
});

export type HeroTint = z.infer<typeof tintSchema>;
export type ServiceItem = z.infer<typeof serviceSchema>;
export type InfoItem = z.infer<typeof infoItemSchema>;

const ASSOCIATIONS: InfoItem[] = [
  {
    title: "ICYM",
    badge: "Youth",
    body: "The parish unit of the Indian Catholic Youth Movement, the largest Catholic youth movement in India. It brings young people together for faith formation, leadership training, service projects and cultural programmes, and takes an active part in parish celebrations.",
  },
  {
    title: "YCS",
    badge: "Students",
    body: "Young Christian Students, a movement for school and college students recognised by the Catholic Bishops' Conference of India in 1969. It helps students look at the realities of student life in the light of the Gospel and act on what they see.",
  },
  {
    title: "Altar Servers",
    badge: "Liturgy",
    body: "Children who serve at the altar during Holy Mass and other celebrations. Regular training and weekly meetings help them serve with reverence and understand the liturgy they take part in.",
  },
  {
    title: "Marian Sodality",
    badge: "Devotion",
    body: "Girls of the parish who grow in devotion to Our Lady through prayer, the rosary and service. The sodality meets on Sundays and learns from Mary's example of faith and humility.",
  },
  {
    title: "Missionary Childhood Association",
    badge: "Since 2017",
    body: "Children praying for and caring about other children around the world. It nurtures a missionary spirit through prayer, small sacrifices and sharing with those in need.",
  },
  {
    title: "Catholic Sabha",
    badge: "Since 1989",
    body: "Speaks for the Catholic community on social and civic matters, and organises talent awards for children, speech competitions, tree planting, health initiatives and awareness programmes.",
  },
  {
    title: "Secular Franciscan Order",
    badge: "Since 1966",
    body: "Lay men and women who follow the way of St. Francis of Assisi in everyday life, living out simplicity, prayer, compassion and care for creation.",
  },
  {
    title: "St. Vincent de Paul Society",
    badge: "Charity",
    body: "Part of the international society founded in Paris in 1833 by Frédéric Ozanam. Members visit and support the poor, the sick and families in difficulty with help that is practical, personal and discreet.",
  },
  {
    title: "Stree Sangathan",
    badge: "Since 2008",
    body: "The women's association of the parish, built around five values: love, sacrifice, unity, service and compassion. It meets every month and celebrates International Women's Day each year.",
  },
  {
    title: "Bethkati UAE",
    badge: "Abroad",
    body: "Parishioners living and working in the United Arab Emirates, staying connected with one another and supporting the parish and its people back home.",
  },
  {
    title: "Belwak Kuwait",
    badge: "Abroad",
    body: "Belman parishioners in Kuwait, keeping the community together far from home and supporting initiatives in their home parish.",
  },
];

/** Konkani descriptions of each commission, from the old parish website. */
const COMMISSION_KONKANI: Record<string, string> = {
  "Bible":
    "zÉªÁZÁ GvÁZÉgï D¤ ªÀiÁUÁÚ÷åZÉgï PÉÃA¢ æ vï Q æ Ã¹ÛÃ ¸ÀªÀÄÄzÁAiÀiï ªÀÄí¼ÉÆî zsÉåÃAiÀiï æ ªÀÄwAvï zÀªÀÅö£ï ºÁå DAiÉÆÃUÁ ªÀÄÄSÁAvï æ ¦üUÀðeÉAvï ¥À«vï æ ¥ÀÅ¸ÀÛPÁZÉÆ DAiÀiÁÛgï, ¨sÀÄUÁåðAPï D¤ ªÀíqÁAPï ¥À«vï æ æ ¥ÀÅ¸ÀÛPÁZÉA ²©gï, ¨ÉÊ§¯ï PÁè¹ D¤ ¯ÉQìAiÉÆ ¢«£Á vÀ¨Éðw D¸Á PÀ£ïð ¥À«vïæ ¥ÀÅ¸ÀÛPÁa eÁuÁéAiÀiï ¯ÉÆPÁPï ¢¯Áå. D¤ ºÁZÉÆ ¥sÀ¼ï eÁªïß DvÁA ºÀAiÉÄðPÁ WÀgÁ ºÀAiÉÄðPÁ ªÀåQÛPï KPï ¨ÉÊ§¯ï ¥Àw D¸Á. D¤ PÀÄmÁäAvï ¸ÀzÁA æ ¥À«vïæ ¥ÀÅ¸ÀÛPï ªÁaÑ ¸ÀªÀAiÀiï gÀÄvÁ eÁ¯Áå.",
  "Catechetics":
    "¥À«vïæ ¸À¨sÉa ²PÀªïÚ ªÉ¼Á-PÁ¼ÁPï ¸Àj eÁªïß §zÀèvÁ. » ²PÀªïÚ ¨sÁªÁxÁåðAPï ¯Á¨ÁÑöå SÁwgï QÃ¹ÛÃ ²PÀëuï UÀeÉðZÉA. DªÉÆÑ Q æ Ã¸ÁÛAªï ²PÀëuï DAiÉÆÃUï ºÀAiÉÄðPÁ ªÀ¸Áð Q æ Ã¸ÁÛAªï ²PÀëuï ²PÀëPÁAPï eÉÆPÁÛ÷å æ ¸ÀA¥À£ÀÆä¼ï ªÀåQÛ xÁªïß vÀ¨Éðvï PÀgïß, DAiÀiÁÛgÁZÁ QÃ¸ÁÛAªï ²PÀëuÁPï vÀAiÀiÁgï PÀgÁÛ. vÀ±ÉAZï ªÀ¸Áð£ï ªÀgÀ¸ï æ zÉÆvÉÆ£ÉðZÁå ¢¸ÁZÉA GzÁÏl£ï D¤ zÉÆvÉÆ£ÉðZÉÆ ¢Ã¸ï DZÀgÀuï PÀgïß ¨sÀÄUÁåðAPï QÃ¸ÁÛAªï ²PÀëuÁZÉÆ ªÀÄºÀvïé æ PÀ½vï PÀgÁÛ.",
  "Ecumenism":
    "««zsï Q¸ÁÛAªï ¥ÀAUÀqï Q æ Ã¸ÁÛ SÁwgï ªÁªÀÅgÁÛ£Á ªÁAiÀiïÖ ¸ÀªÀÄÓtÂ G¨ÉÆÓAa ¸ÀºÀeï. æ zÉPÀÄ£ï ºÀAiÉÄðPÁè÷åAPï ¸ÀªÀÄÓtÂ UÀeÉða. » ¸ÀªÀÄÓtÂ ¦üUÀðeÉAvï ¸Àªïð QæÃ¹ÛÃ JPÀémï DAiÉÆÃUï ¢Ãªïß D¸Á. ªÀ¸ÁðPï KPï ¥Á«ÖA QæÃ¹ÛÃ JPÁÛgÁ SÁwgï ªÀiÁUÉÚA ZÀ¯ÉÆªïß ªÀígÁÛ.",
  "Education":
    "²PÁ¥ï ªÀÄ£ÁêAPï ªÀÄ£Áê¥ÀjA fAiÉÄAªïÌ ²PÀAiÀiÁÛ. ²PÁ¥ï ¥ÀPÀvï ¨sÀÄUÁåðAPï ªÀiÁvï £ÀíAiÀiï, ²PÁ¥ï æ d¯Áä xÁªïß ¥sÉÆAqÁ ¥ÀAiÀiÁðAvï. DªÀiÁÑ÷å ¦üUÀðeÉAvï ²PÁà DAiÉÆÃUï ²PÀëPÁAPï vÀ¨Éðw ªÀiÁAqÀÄ£ï ºÁqÁÛ. ²PÁàPï ªÉÄ¼ÁÑ ««zsï ¸ÀPÁðj ¸Ë®vÁåA «±ÁAvï ªÀiÁºÉvï PÁjåA ªÀiÁAqÀÄ£ï ºÁqÁÛ. ºÁå ªÀ«ðA DªÀiÁÑ÷å ¦üUÀðeÉAvï ºÀAiÉÄðPï ¨sÀÄUÉðA ¸ÀPÁðj ¸ÀªÀèvÉÆå D¥ÁÚAiÀiÁÛ.",
  "Family":
    "PÀÄmÁªÀiï KPï ¸ÀÜ½ÃAiÀiï ¥À«vï ¸À¨sÁ. DªÉÄÑA PÀÄlªÀiï ¸ÁPÉðA D¸Áè÷ågï ¥À«vï æ ¸À¨sÁ ¸ÁQð æ D¸ÉÆAPï ¸Ázsïå. ºÁå ¢±É£ï ¥À«vï ¸À¨sÁ D«ÄÑA PÀÄmÁäA Q æ Ã¸ïÛ-PÉÃA¢ æ vï §½µïÖ D¤ ¸ÀAvÉÆ¸ï¨sÀjvï D¸ÉÆAPï C¥ÉQëÃvÁ æ zÉPÀÄ£ï DªÀiÁÑ÷å ¦üUÀðeÉAvï ºÀAiÉÄðPÁ ªÀ¸Áð AiÀÄÄªÀduÁAPï PÀÄmÁä f«vÁPï ¥À¬Äê° D¤ ¯ÁVê° vÀAiÀiÁgÁAiÀiï PÀvÁð. PÁeÁgÁ G¥ÁæAvï¬ÄÃ PÁeÁjÃ eÉÆqÁåAPï ºÀAvÁ-ºÀAvÁPï vÀ¨Éðvï PÀjÑA PÁAiÀiÁðPÀæªÀiÁA D¸Á PÉ¯ÁåAvï.",
  "Health":
    "JPÁ ªÀåQÛPï ¨sÀ¯Á¬ÄÌ ZÀqï UÀeÉða. §j ¨sÀ¯Á¬ÄÌ £Á eÁ¯Áågï Qwè UÉæÃ¸ïÛPÁAiÀiï D¸Áè÷åjÃ G¥ÁÌgÁPï ¥ÀqÁ£Á. ¦üUÀðeÉAvï ¨sÀ¯Á¬ÄÌ DAiÉÆÃUï ¹ÛçÃAiÀiÁAPï vÀ±ÉAZï ªÀÄ¯ÁÎqÁåAPï ¨sÀ¯ÁAiÉÄÌ ¸ÀA§A¢ü PÁAiÀÄðPÀªÀiÁA æ ªÀiÁAqÀÄ£ï ºÁqïß ¨sÀ¯ÁAiÉÄÌ «±ÁåAvï eÁUÀÈw D¸Á PÀvÁð. ¨sÀ¯ÁAiÉÄÌ ¸ÀA§A¢ü ¸ÀPÁðgÁ xÁªïß ªÉÄ¼ÁÑ÷å AiÉÆÃd£ÁA «±ÁåAvï D¤ ºÉ¯ïÛ-PÁqïð PÀZÁåð «±ÁåAvï ªÀiÁºÉvï ¢vÁ. DvÁA ZÀqÁªÀvï PÀÄmÁäA ºÉÆå ¸ÀªÀèvÉÆå D¥ÁÚAiÀiÁÛvï.",
  "Interreligious Dialogue":
    "D«Ä Q¸ÁÛAªï ¥À æ xÉéZÉA «ÄÃmï D¤ GeÁéqï. ºÉgï zsÀªÀiÁðAZÁå ¯ÉÆPÁ ªÀÄzsÉA æ fAiÉÄvÁ¸ÁÛ£Á ªÀiÁAiÀiÁªÉÆUÁ£ï fAiÉÄªïß QæÃ¸ÁÛPï ¸ÁPïë ¢AªÉÑA DªÉÄÑ PÁªÀiï. zÉPÀÄ£ï CAvÀgï-zsÀ«ÄðÃAiÀiï ¸ÀAªÁzï ªÀ¸ÁðPï KPï ¥Á«ÖA Q¸Àä¸ï ¸ËºÁzïð PÀÆl D¸Á PÀgïß, zÀÄ¸Á æ öå zsÀªÀiÁðZÁå ¯ÉÆPÁAPï Q æ ¸ÁÛZÉÆ ¸ÀAzÉÃ±ï ¢AªÉÑA æ ¥ÀAiÀÄvïß PÀgïß D¸Á. ¸ËºÁzïð ¸À«Äw gÀZÀ£ï PÀgïß ««zsï ¸ÀAzÀ¨sÁðA¤ ¸ÁAUÁvÁ ªÉÄ¼ÁÛvï.",
  "Justice & Peace":
    "gÁªÉÇAPï KPï ¸ÀéAvï WÀgï D¸Áè÷ågï ZÀqÁªÀvï ¸ÀªÀÄ¸Éì ¥ÀjºÁgï eÁ¯Áè÷å¥ÀjA. ¤Ãvï D¤ ±ÁAw DAiÉÆÃUÁ£ï PÀÄmÁäAvï C¥Áè÷å ªÀÄÄ¼ÁªÁå zÁPÁè÷åAa ¸À«ÄÃPÁë ¥ÀÇgÁ PÉ¯Áå D¤ ¦üUÀðeÉZÁ PÀA¥ÀÇålgÁAvï ¨sÀwð PÉ¯Áå. 18 ªÀ¸ÁðA ¨sÀgï¯Áè÷å ¸Àªïð ¸ÁAzÁåAa £ÁAªÁ ªÀÄvÀzÁ£ï ¥ÀmÉÖAvï zÁPÀ¯ï PÉ¯ÁåAvï. ªÀÄvÀzÁ£ï eÁUÀÈw ¢¯Áå.",
  "Labour":
    "ªÀÄ¤¸ï ¢¸ÉÆàqÁÛöå UÁæ¸Á SÁwgï ªÁªïæ PÀvÁð. ªÀiÁAAiÀiï-UÁAªï ¸ÁAqÀÄ£ï zÀÄ¸Áæ÷å UÁAªÁPï ªÀZÉÆ£ï ªÁªï PÀvÁð. ºÁAaA dvÀ£ï WÉA«Ñ ¥À«vï æ ¸À¨sÉaA dªÁ¨ÁÝj zÉPÀÄ£ï ¦üUÀðeÉZÁå ªÁå¦Û ©üvÀgï Q æ ¸ÁÛAªï æ zÉÃ±ÁAvÀgï ªÁªÁær D¸Ávï eÁ¯Áågï vÁAa UÉÆ«îPï dvÀ£ï WÉA«Ñ ªÁªÁæ DAiÉÆÃUÁZÉA PÁªÀiï. ºÉA PÁªÀiï ªÁªÁæ DAiÉÆÃUï PÀvÉðÃ D¸Á. D¤ C¸ÀAWÀnvï ªÁªÁæqÁåAaA £ÁAªÁA PÁ«ÄðPï E¯ÁSÉAvï £ÉÆAzÁªÀuï PÀZÉðA PÁªÀiï ZÁ®Ä D¸Á.",
  "Laity":
    "¯Á¬ÄPï Qæ¸ÁÛPï f«vÁ ¸ÁPïì ¢AªÉÇÑ KPï ¸ÀªÀÄÄzÁAiÀiï. ¯Á¬ÄPï ªÀÄÄSÉ° ¦üUÀðeï «UÁgÁZÉ «¸ÁÛgÉè¯É ºÁvï. zÉPÀÄ£ï ««zsï ¯Á¬ÄPï ªÀÄÄSÉ¯ÁåAPï UÉÆ«î¨Á¥ÁA¤ vÀ¨Éðw ¢¯Áå. zÁPÁè÷åPï UÀÄPÁðgï, ¥Àæw¤¢ü, G¥ÁzsÀåPïë, PÁAiÀÄðzÀ²ð D¤ ¸ÀAAiÉÆÃdPï DªÀiÁÑ÷å ¦üUÀðeÉAvï ºÁå ¸Àªïð ªÀÄÄSÉ¯ÁåAPï vÀ¨Éðw eÁ¯Áå. D¤ vÁAa dªÁ¨ÁÝj D¤ PÁAiÉÄÝ PÀ½vï eÁ¯Áåvï. ºÁZÉ ªÀ«ðA ¦üUÀðeï UÉÆ«îPï ªÀÄAqÀ½ ¦üUÀðeÉZÁ C©üªÀÈzÉÞ SÁwgï §gÁå£ï ªÁªï PÀgïß D¸Á.",
  "Liturgy":
    "JªÀÌj¸ïÛ QÃ¹ÛÃ f«vÁZÉA ²Rgï D¤ ºÁå JªÀÌj¸ÁÛ ªÀ«ðA D«Ä ¥ÉÇÃ¶vï eÁvÁAªï. ºÉÆ æ ¥À«vïæ JªÀÌj¸ïÛ CxÁð¨sÀjvï jw£ï DZÀgÀuï PÀgÀÄAPï zÉÃªï¸ÀÄÛw DAiÉÆÃUï ¤gÀAvÀgï vÀ¨Éðw D¸Á PÀvÁð. ºÀAiÉÄðPÁ ªÀ¸Áð UÁAiÀiÁ£ï ªÀÄAqÀ¼ÉPï, ªÁZÁà÷åAPï D¤ QÃvÀð£ï UÁªÁà÷åAPï vÀ¨Éðvï PÀgÁÛ. vÀ¨ÉðvÉZÉÆ ¥sÀ¼ï eÁªïß DªÀiÁÑ÷å ¦üUÀðeÉAvï ºÀAiÉÄðPÁ ªÁqÁåAvï ªÀÄí¼Áî÷å¥ÀjA UÁAiÀiÁ£ï PÀgÀÄAPï, ªÁZÁàA ªÁZÀÄAPï D¤ QÃvÀð£ï UÁAªïÌ vÀAiÀiÁgï eÁ¯ÁåAvï.",
  "Proclamation & Evangelization":
    "¸ÀÄªÁvÁð ¥À¸Ágï PÀZÉðA PÁªÀiï ºÀAiÉÄðPÁ ¥À«vï æ ¸Áß£ï ªÉÄ¼ï¯Áè÷å æ ªÀåQÛZÉA eÁªÁß¸Á. ¸ÀÄªÁvÁð ¥À¸Ágï eÁ¯ÉÆè ¸ÀªÀÄÄzÁAiÀiï ¸ÀA¸ÁgÁgï ¸ÀÄªÁvÁð ¥À æ ¸Ágï PÀgÁÛ. ¦üUÀðeÉAvï «Ä²£Àj æ ¨sÀÄUÁðåAZÉÆ ªÉÄÃ¼ï D¸ÉÆ£ï ºÀAiÉÄðPÁ ªÀÄ»£ÁåAvï ¸ÁAUÁvÁ ªÉÄ¼ÁÛvï D¤ zÁ£ï JPÁÖAAiÀiï PÀgÁÛvï D¤ ¸ÀA¸Ágï¨sÀgï ¨sÀÄUÁðåA SÁwgï ªÀiÁUÁÛvï. ºÀAiÉÄðPÁ ªÀ¸Áð «Ä¸ÁAªï DAiÀiÁÛgï CxÁð¨sÀjvï jw£ï DZÀgÀuï PÀgïß ««zsï jw£ï zÁ£ï JPÁÖAAiÀiï PÀgïß «Ä¸ÁAªÁPï zsÁqïß ¢vÁvï. C±ÉA «Ä¸ÁAªÁ xÀAAiÀiï D«ÄÑ eÁªÁ¨ÁÝj ¦üUÀðeÉAvï PÀ½vï eÁ¯Áå.",
  "Seminary & Religious Formation":
    "¦üUÀðeÉAvï ¸É«Ä£Àj DAiÉÆÃUï zÉÃªï-D¥ÀªÁÚöåPï GvÉÛÃd£ï ¢AªÁÑ÷å ¢±É£ï ªÁªÀÅgÁÛ. ºÀAiÉÄðPÁ ªÀ¸Áð ºÉÊ¸ÀÆÌ¯ï ¨sÀÄUÁåðAPï CPÉÆÖÃ§gï vÀ±ÉAZï J¦æ¯ï ªÀÄ»£ÁåAvï eÁAªÁÑ÷å PÁåA¥Á ªÉ¼Ágï ¨sÀÄUÁåðAPï zÉÃªïD¥ÀªÁÚöå «±ÁAvï vÀ¨Éðw ¢¯Áå. D¤ ºÁZÉÆ ¥sÀ¼ï eÁªïß JPÉÆè vÀ£ÁðmÉÆ §| ®£Áqïð ¸É«Ä£ÀjPï ¨sÀwð eÁAªïÌ æ DAiÉÆÛ eÁ¯Á. D¤ 10-« ¸ÀA¥Éè¯Áå JPÁ ¨sÀÄUÁåð£ï ¥ÁzÁæ÷å¨ï eÁAªïÌ D±Á GZÁgÁèå.",
  "Small Christian Communities":
    "UÀeÉðAvï D¸ï¯Áè÷å DªÀiÁÑ÷å ¨sÁªÁ-¨sÀ¬ÄÚAPï D«Ä ¥ÁªÁè÷ågï zÉªÁZÉA gÁeï gÀÆ¦vï eÁvÁ. ªÁqÉÆ KPï ¸ÀÜ½ÃAiÀiï ¥À«vï ¸À¨sÁ-RAAiÀÄìgï zÉÆÃUï ªÁ vÉÃUï ªÀÄíeÉ £ÁA«A ¸ÁAUÁvÁ ªÉÄ¼ÁÛvï xÀAAiÀiï æ ºÁAªï D¸ÁA ªÀÄí¼ÁA DªÀiÁÑ÷å ¸ÉÆªÀiÁå£ï. ªÁqÁå dªÀiÁvÉ ªÉ¼Ágï ¸ÁAUÁvÁ AiÉÄÃªïß zÉªÁZÁ GvÁAZÉgï ¤AiÀiÁ¼ï æ PÀgïß JPÁªÉÄPÁZÁ UÀeÁðAPï ¥ÁAªÉÑA. ¯Áí£ï-Q¸ÁÛAªï ¸ÀªÀÄÄzÁAiÀiï ºÀAiÉÄðPÁ ªÁqÁåAvï ¥É æ ÃgÀPï, ¥É æ ÃgÀQ D¸ÉÆ£ï ªÁqÁå æ dªÀiÁw §gÁå£ï ZÀ¯ÁÛvï. ¦üUÀðeÉAvï KPï ¥Áåmï ¥ÀAUÀqï gÀavï PÀgïß ºÀAiÉÄðPÁ ªÁqÁåPï JPÁ ºÀAvÁa vÀ¨Éðw ¥ÀÇgÁ eÁ¯Áå. ºÀAiÉÄðPÁ ªÀ¸Áð ¸ÀªÀÄÆzÁAiÀiï ¢ªÀ¸ï DZÀgÀuï PÀgïß ªÁqÁåªÁgï ¸ÁA¸ÀÌöÈwPï PÁjåA ªÀiÁAqÀÄ£ï ºÁqÁè÷åAvï. ¦üUÀðeÉAvï, ªÁqÁåAvï ¸ÀA§Azsï §gÉÆ eÁ¯Á. ¸À¨Ágï ¸ÀªÀÄ¸Éå EvÁåxïð eÁ¯Áåvï. ¯ÉÆÃPï ªÁqÁå dªÀiÁvÉAvï QæÃAiÀiÁ¼ï ¥Ávïæ WÉvÁvï.",
  "Social Communications":
    "DAiÀiÁÑ÷å ºÁå PÀA¥ÀÇålgï PÁ¼Ágï ««zsï ¸ÀA¥ÀPïð ¸ÁzsÀ£ÁA ªÀÄÄSÁAvï ¸ÀÄªÁvÁð æ ¥À¸Ágï PÀgÀÄAPï KPï §gÉÆ DªÁÌ¸ï. D¤ ¸ÀA¥ÀPïð ªÀiÁzsÀåªÀiÁZÉÆ ªÁAiÀiïÖ ¥À æ ¨sÁªï DªÀiÁÑ÷å AiÀÄÄªÀduÁAZÉgï ¨sÀ¥ÀÇðgï æ ¥ÀqÉÆ£ï D¸Á. zÉPÀÄ£ï ¸ÁªÀiÁfPï ¸ÀA¥ÀPïð ¸ÁzsÀ£ÁA DAiÉÆÃUï ²PÀëPÁAPï, AiÀÄÄªÀduÁAPï vÀ±ÉAZï ªÀír¯ÁAPï ªÀiÁzsÀåªÀiÁZÁå ªÁAiÀiïÖ ¥À¨sÁªÁ «²A eÁUÀÈw ºÁqÁÑ÷å ¢±É£ï ««zsï ºÀAvÁA¤, ««zsï PÁAiÀiÁðPÀ æ ªÀiÁA ªÀiÁAqÀÄ£ï æ ºÁqÁè÷åAvï. ºÁZÉÆ ¥ÀjuÁªÀiï eÁªïß AiÀÄÄªÀduÁA ªÁmÁì¥ï ªÀÄÄSÁAvï zÉªÁZÉA GvÁgï zÁqÀÄAPï D¤ ¹éÃPÁgï æ PÀgÀÄAPï ²PÁèöåAvï.",
  "Social Development":
    "£ÉÊ¸ÀVðPï ¸ÀA¥À£ÀÆä¯ÁA G¥ÀAiÉÆÃUï PÀgïß PÀ±ÉA JPÁ PÀÄmÁä£ï ¸ÁéªÀ®A© eÁªÉåvï ªÀÄíuï ¸ÁªÀiÁfPï C©üªÀÈ¢Þ zÁPÀªïß ¢vÁ. ¨sÀÄAAiÀiï, GzÁPï D¤ gÁ£ï ºÁZÉÆ §gÉÆ G¥ÀAiÉÆÃUï PÀ¸ÉÆ PÀZÉÆð ªÀÄíuï zÁPÀAªÁÑ÷å SÁwgï DªÀiÁÑ÷å ¦üUÀðeÉAvï ¥sÀ¼ÁAZÉA UÁqÁð£ï, 6 GzÁÌ fgÀªÉÚ ¥sÉÆAqï D¸Á PÀgïß, eÉÆPÁÛ÷å ¸ÀA¥À£ÀÆä¼ï ªÀåQÛPï D¥Àªïß ºÁå «±ÁåAvï eÁUÀæw ¢¯Áå. DvÁA ºÀAiÉÄðPÁ WÀgÁ ¥ÁªÁìAvï gÀhÄqÁA ¯ÁAiÀiÁÛvï D¤ ¥ÁªÁìZÉA GzÀPï ¨sÀÄ«ÄAvï fgÀAªÁÑ÷å SÁwgï GzÁÌ fgÀ«Ú ¥sÉÆAqï D¸Á PÀvÁðvï. ¸À¨ÁgÁAPï ºÉA ¥sÁAiÀiÁÝöåZÉA eÁ¯ÁA.",
  "Women":
    "PÀÄmÁäAvï ¹ÛçÃ ¥ÀªÀÄÄSï ¥Ávï æ WÉvÁ. ¥À«vï æ ¸À¨sÁ ¹ÛçÃ ¸ÁéªÀ®A© eÁAªïÌ D±ÉvÁ. DªÀiÁÑ÷å ¦üUÀðeÉAvï æ ¹ÛçÃAiÀiÁA SÁwgï ¨sÀ¯ÁÊPÉ ¸ÀA§A¢ü PÁAiÀÄðPÀªÀiÁA ªÀiÁAqÀÄ£ï ºÁqïß ¨sÀ¯ÁAiÉÄÌ «±ÁåAvï eÁUÀ æ w ¢¯Áå. ºÀAiÉÄðPÁ æ ªÁqÁåAvï ¸Àé¸ÀºÁAiÀÄ UÀÆ¥ï D¸Á PÉ¯Áåvï D¤ ¸ÀPÁðj ¸Ë®vÉÆå eÉÆÃqïß D¸Ávï. ¦üUÀðeÉAvï KPï ªÀÄºÁ¸ÀAWï æ gÀavï PÉ¯Á. ¸Àªïð ¹ÛçAiÀiÁAPï ªÀÄ£Áê ºÀPÁÌA D¤ ¸ÀA«zsÁ£Á «±ÁåAvï vÀ¨Éðw ¢¯Áå. 30% ªÀAiÀiïæ ¹ÛçÃAiÉÆ ªÁqïð ¸À¨sÁ, UÁªÀÄ¸À¨sÁ D¤ dªÀiÁ§A¢Avï PÁAiÀiÁð¼ï jw£ï ¨sÁUï WÉvÁvï. 4 ¹ÛçAiÉÆ UÁ æ ªÀÄ ¥ÀAZÁAiÀÄvïZÉ ¸ÁAzÉ æ eÁªÁß¸Ávï.",
  "Youth":
    "AiÀÄÄªÀduï DªÀiÁÑ÷å ¸ÀªÀÄÄzÁAiÉÄZÉ §¼ÀéAvï SÁA¨É. D«ÄÑ ªÀÄÄTè ¥À«vï ¸À¨sÁ vÁAZÁ ºÁvÁAvï æ D¸Á. zÉPÀÄ£ï AiÀÄÄªÀduÁA¤ ¸ÁPÉð ªÁmÉ£ï D¤ ¢±É£ï ZÀªÉÆÌAa UÀeïð. AiÀÄÄªÀ DAiÉÆÃUï ºÁå ¢±É£ï “AiÀÄÆ PÁåmï” PÁè¹ ZÀ®ªïß ªÀívÁð. gÁdQÃAiÀiï eÁUÀw ¢AªÁÑ÷å SÁwgï vÀ±ÉAZï AiÀÄÄªÀduÁA¤ ªÁqïð ¸À¨sÁ D¤ UÁ æ ªÀÄ ¸À¨sÁA¤ æ ¨sÁUï WÉAªÉÑ ¢±É£ï ««zsï vÀ¨Éðvï PÁjåA ¦üUÀðeï, ªÁgÁqÉÆ D¤ ¢AiÉÄ¸Éeï ºÀAvÁgï ªÀiÁAqÀÄ£ï ºÁqÉÛÃ DAiÀiÁè. ¸ÀPÁðj ºÀÄzÉÝ D¥ÁÚAªÁÑ÷å «±ÁåAvï¬ÄÃ vÀ¨Éðw PÁ¬ÄðA eÁ¬ÄÛA eÁ¯ÁåAvï. AiÀÄÄªÀduÁAa vÁ¯ÉAvÁA Hfðvï PÀZÁð SÁwgï ªÉÊ.¹.J¸ï gÀhiÁªÀiï (Zoom) vÀ¸À°A PÁAiÀÄðPÀªÀiÁA ªÀiÁAqÀÄ£ï ºÁqÀÄAPï ¥ÉÇ æ ÃvÁìºï ¢vÉÃ DAiÀiÁè. æ ºÁå ªÀ«ðA DvÁA AiÀÄÄªÀduÁA xÀAAiÀiï eÁUÀw D¤ ªÀÄÄSÉÃ®àuï ªÁqÁèA.",
};

const COMMISSIONS: InfoItem[] = [
  {
    title: "Seminary & Religious Formation",
    body: "Encourages vocations to the priesthood and religious life, and walks with young people who are discerning a call.",
  },
  {
    title: "Bible",
    body: "Helps parishioners know, love and live the Word of God through Bible Sunday, Bible camps for children and adults, Bible classes and training in Lectio Divina. Today every home, and every person, in the parish has a Bible, and reading Scripture together has become a family habit.",
  },
  {
    title: "Catechetics",
    body: "Runs Sunday catechism for children and young people and prepares them for the sacraments, together with the catechism teachers.",
  },
  {
    title: "Liturgy",
    body: "Prepares the parish's celebrations of Mass and the sacraments, working with readers, choirs and altar servers through the liturgical year.",
  },
  {
    title: "Family",
    body: "Supports married couples and families through marriage preparation, family prayer and care for elders and grandparents.",
  },
  {
    title: "Youth",
    body: "Guides the parish's young people, working with ICYM and YCS on faith formation, leadership and service.",
  },
  {
    title: "Laity",
    body: "Encourages lay people to take up their role in the life of the Church and in society.",
  },
  {
    title: "Women",
    body: "Promotes the dignity, faith formation and leadership of women, working closely with the Stree Sangathan.",
  },
  {
    title: "Small Christian Communities",
    body: "Nurtures the ward communities where neighbouring families pray together, read Scripture and support one another.",
  },
  {
    title: "Proclamation & Evangelization",
    body: "Helps the parish share the Gospel through word and witness, including retreats and missionary initiatives.",
  },
  {
    title: "Social Communications",
    body: "Looks after parish communication: announcements, the Bethkati newsletter, media and this website.",
  },
  {
    title: "Education",
    body: "Encourages and guides students, supports the parish schools, and recognises the achievements of young people.",
  },
  {
    title: "Health",
    body: "Promotes health awareness and care for the sick, including awareness programmes on public-health concerns.",
  },
  {
    title: "Social Development",
    body: "Works on initiatives that improve living conditions and help families in need become self-reliant.",
  },
  {
    title: "Labour",
    body: "Stands with workers and promotes fair working conditions and the dignity of labour.",
  },
  {
    title: "Ecumenism",
    body: "Builds friendship and cooperation with Christians of other churches.",
  },
  {
    title: "Interreligious Dialogue",
    body: "Promotes harmony, respect and dialogue with neighbours of other faiths.",
  },
  {
    title: "Justice & Peace",
    body: "Raises awareness of human rights, justice and peace, and responds to injustice in society.",
  },
];

const COMMISSIONS_WITH_KONKANI: InfoItem[] = COMMISSIONS.map((c) => ({
  ...c,
  bodyKonkani: COMMISSION_KONKANI[c.title],
}));

const INSTITUTIONS: InfoItem[] = [
  {
    title: "St. Joseph's Higher Primary School",
    badge: "1896",
    imageUrl: "/institutions/higher-primary.jpg",
    body: "The parish's oldest school. Fr. Nicholas Carneiro began it in 1896 in a small hut of mud and stone on the church campus, when there was no other school in the area. Fr. Denis R. Lewis later built a new school building in front of the church.",
  },
  {
    title: "St. Joseph's High School",
    badge: "1982",
    imageUrl: "/institutions/high-school.jpg",
    body: "Founded on 2 June 1982 and later granted permanent recognition by the Government of Karnataka. It offers education in a Christian atmosphere and welcomes children of every religion, caste and background.",
  },
  {
    title: "St. Joseph's English Medium School",
    badge: "2012",
    imageUrl: "/institutions/english-medium.jpg",
    body: "Opened on 1 June 2012 with Classes 6 to 8, extended to Class 10 in 2015 and to Classes 1 to 5 in 2016, with a kindergarten block added in the 2018 to 2019 school year. It is known for discipline, service and value-based education.",
  },
  {
    title: "Don Bosio Convent",
    badge: "1966",
    imageUrl: "/institutions/convent.jpg",
    body: "The sisters came to Belman in April 1966 at the invitation of Bishop Basil Salvadore D'Souza, and the present convent was blessed in 1969. They teach in the parish schools and share in the pastoral life of the parish and of neighbouring Mukamar.",
  },
];

const TOURISM: InfoItem[] = [
  {
    title: "St. Anthony's Shrine, Pakala",
    badge: "2 km",
    imageUrl: "/shrine/shrine-statue.jpg",
    body: "The parish's own shrine at Pakala, Manjarapalke, about 2 km from the church towards Karkala. Devotees of every faith come daily to pray and light candles, and many know St. Anthony here as ‘Pakala Dever’. The feast on 13 June draws large crowds.",
  },
  {
    title: "Tingal Hill",
    badge: "Belman",
    imageUrl: "/tourism/tingal-hill.jpg",
    body: "A hill near Belman, crowned by a cross, where the parish walks the Way of the Cross together during Lent, joined by faithful from neighbouring parishes.",
  },
  {
    title: "Arbi Falls, Nitte",
    badge: "Nitte",
    body: "A small, peaceful waterfall on the Manjaltar river near Nitte, about 5 km from Karkala, and a favourite spot for picnics and day outings. The rocks are slippery, so take care near the water.",
  },
  {
    title: "Karkala",
    badge: "Temple town",
    imageUrl: "/tourism/karkala-gomateshwara.jpg",
    imageCredit: "Photo: Vaikoovery, CC BY-SA 3.0, Wikimedia Commons",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Gomateshwara_Statue%2C_Karkala.jpg",
    body: "The nearby taluk town, known for its giant monolithic statue of Gomateshwara and the Sri Venkataramana Temple, whose history reaches back to the 14th century.",
  },
  {
    title: "St. Lawrence Shrine, Attur",
    badge: "Karkala",
    imageUrl: "/tourism/attur-st-lawrence.jpg",
    imageCredit: "Photo: Kensplanet, CC BY 3.0, Wikimedia Commons",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:St._Lawrence_Shrine_%28Karkala%29.jpg",
    body: "A much-loved pilgrimage church near Karkala whose annual feast in January draws devotees of all faiths from across the coast.",
  },
  {
    title: "Nandalike",
    badge: "Heritage",
    body: "Birthplace of the celebrated Kannada poet Muddana (1870 to 1901), and home to the colourful Siri Jatre festival.",
  },
  {
    title: "Padubidri Beach",
    badge: "Beach",
    body: "A quiet stretch of sand on the highway between Udupi and Mangalore. Padubidri is also known for the Dakkebali ritual, held every two years.",
  },
  {
    title: "Kaup Beach",
    badge: "Beach",
    imageUrl: "/tourism/kaup-lighthouse.jpg",
    imageCredit: "Photo: KshitizBathwal / Skyscape Photography, CC BY-SA 4.0, Wikimedia Commons",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Kapu_Beach_Lighthouse_.jpg",
    body: "A beautiful beach with a historic lighthouse, a short drive south of Udupi.",
  },
  {
    title: "Malpe Beach & St. Mary's Islands",
    badge: "Udupi",
    imageUrl: "/tourism/st-marys-islands.jpg",
    imageCredit: "Photo: Dil Shad Roshan, CC BY-SA 4.0, Wikimedia Commons",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:St._Mary%27s_islands%2C_Udupi_1767.jpg",
    body: "About 6 km from Udupi, Malpe has a long golden beach. A ferry from Malpe reaches St. Mary's Islands, famous for their rare hexagonal basalt rock columns.",
  },
  {
    title: "Udupi",
    badge: "Pilgrimage",
    imageUrl: "/tourism/udupi-krishna-matha.jpg",
    imageCredit: "Photo: Ashok Prabhakaran from Chennai, India, CC BY-SA 2.0, Wikimedia Commons",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Udupi_Sri_Krishna_Matha_Temple.jpg",
    body: "About 60 km from Mangalore, Udupi is a centre of education, culture and pilgrimage, best known for the Sri Krishna Temple and its ‘Kanakana Kindi’ window.",
  },
  {
    title: "Manipal",
    badge: "University town",
    imageUrl: "/tourism/manipal.jpg",
    imageCredit: "Photo: shantheri, CC BY-SA 4.0, Wikimedia Commons",
    imageCreditUrl: "https://commons.wikimedia.org/wiki/File:Night_in_Manipal.jpg",
    body: "The university town next to Udupi, known for its colleges, hospitals and lively student life.",
  },
];

export const CONTENT = {
  massTimings: {
    label: "Mass timings",
    schema: z.array(serviceSchema).min(1).max(12),
    default: MASS_TIMINGS as ServiceItem[],
  },
  otherServices: {
    label: "Catechism & shrine",
    schema: z.array(serviceSchema).max(12),
    default: OTHER_SERVICES as ServiceItem[],
  },
  officeHours: {
    label: "Parish office hours",
    schema: serviceSchema,
    default: OFFICE_HOURS as ServiceItem,
  },
  associations: {
    label: "Associations",
    schema: z.array(infoItemSchema).max(40),
    default: ASSOCIATIONS,
  },
  commissions: {
    label: "Commissions",
    schema: z.array(infoItemSchema).max(40),
    default: COMMISSIONS_WITH_KONKANI,
  },
  institutions: {
    label: "Institutions",
    schema: z.array(infoItemSchema).max(20),
    default: INSTITUTIONS,
  },
  heroTint: {
    label: "Homepage photo tint",
    schema: tintSchema,
    default: { color: "#16110C", strength: 35 } as HeroTint,
  },
  tourism: {
    label: "Places to visit",
    schema: z.array(infoItemSchema).max(40),
    default: TOURISM,
  },
} as const;

export type ContentKey = keyof typeof CONTENT;
export type ContentValue<K extends ContentKey> = z.infer<(typeof CONTENT)[K]["schema"]>;
export const CONTENT_KEYS = Object.keys(CONTENT) as [ContentKey, ...ContentKey[]];
