import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

/** The parish keeps Indian Standard Time, wherever the server happens to run. */
export const PARISH_TIMEZONE = "Asia/Kolkata";

/**
 * A date read in Belman's own time zone.
 *
 * Pages are rendered on a server that runs in UTC, so formatting a date
 * without this would show a Mass at 9:30 AM as the evening before.
 */
export const inParishTime = (date: Date | string) => dayjs(date).tz(PARISH_TIMEZONE);
