import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import toObject from "dayjs/plugin/toObject";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/ru";
import isBetween from "dayjs/plugin/isBetween";
// import "dayjs/locale/en";
// import "dayjs/locale/pl";
// import "dayjs/locale/uk";
// import "dayjs/locale/de";
// import "dayjs/locale/fr";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);
dayjs.extend(toObject);
dayjs.extend(isBetween);
dayjs.extend(utc);

export default dayjs;
