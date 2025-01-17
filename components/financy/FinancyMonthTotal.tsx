import { Text, View } from "react-native";
import { useQuery } from "@realm/react";
import { useColorScheme } from "nativewind";
import { WorkTimeSchema } from "@/schema";
import dayjs from "@/utils/dayjs";
import { useAppSelector } from "@/store/hooks";
import { financyFilter, user, workTime } from "@/store/storeSlice";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Card from "../Card";
import { TimerData } from "@/hooks/useTimer";

export type FinancyMonthTotalProps = {
  from: string;
  to: string;
  time: TimerData;
};

export function FinancyMonthTotal({ from, to, time }: FinancyMonthTotalProps) {
  const { colorScheme } = useColorScheme();

  const { t } = useTranslation();

  const userFromStore = useAppSelector(user);

  const financyFilterFromStore = useAppSelector(financyFilter);

  const workTimeFromStore = useAppSelector(workTime);

  const allWorkTime = useQuery(WorkTimeSchema, (items) =>
    items.filtered("workerId == $0", userFromStore?.id)
  );

  const allWorkTimeMonth = useMemo(() => {
    return allWorkTime
      .filter(
        (x) =>
          dayjs(x.to).year() > 1 &&
          dayjs(x.date).isBetween(
            dayjs(from).startOf("day"),
            dayjs(to).endOf("day"),
            "day",
            "[]"
          )
      )
      .sort((a, b) => a.from.localeCompare(b.from));
  }, [allWorkTime, to, from]);

  const isToday = useMemo(() => {
    return (
      dayjs(workTimeFromStore?.date).month() ===
      financyFilterFromStore.monthIndex
    );
  }, [workTimeFromStore, to, from]);

  const zp = useMemo(() => {
    if (!userFromStore) {
      return 0;
    }
    const to =
      dayjs(workTimeFromStore?.to).year() > 1
        ? workTimeFromStore?.to
        : dayjs(new Date()).utc().format();

    const _timeWorkMinutes = dayjs(to).diff(
      dayjs(workTimeFromStore?.from),
      "minutes",
      true
    );

    return workTimeFromStore
      ? _timeWorkMinutes * (workTimeFromStore.oklad / 60)
      : 0;
  }, [time]);

  const zpFullDay = useMemo(() => {
    // if (!allWorkTimeMonth.length) {
    //   return;
    // }

    // return allWorkTimeToday.map((x) => {
    //   const to =
    //     dayjs(x.to).year() > 1 ? x.to : dayjs(new Date()).utc().format();

    //   const _timeWorkMinutes = dayjs(to).diff(dayjs(x.from), "minutes", true);
    //   return Math.ceil(_timeWorkMinutes) * (x.oklad / 60);
    // });
    const totalFromDb = allWorkTimeMonth.reduce((a, b) => a + b.total, 0);
    return totalFromDb + (isToday ? Math.ceil(zp) : 0);
  }, [allWorkTimeMonth, zp, time]);

  return (
    <Card className="mt-4">
      <View className="flex flex-row gap-2">
        <Text className="flex-auto text-lg leading-6 text-p-600 dark:text-p-300">
          {t("totalZpBy", {
            date: `${financyFilterFromStore.monthText}, ${financyFilterFromStore.year}`,
          })}
          :
        </Text>
        <Text className="text-2xl font-bold leading-6 text-p-600 dark:text-p-300">
          {zpFullDay || 0} ₽
        </Text>
      </View>
      {/* {msFullDay && (
          <View className="flex flex-row gap-2">
            <Text className="text-lg leading-6 text-s-500 dark:text-s-400">
              {t("totalTimeDay")}:
            </Text>
            <TaskWorkerTime
              className="text-lg leading-6 text-s-800 dark:text-s-200"
              time={getObjectTime(msFullDay)}
            />
          </View>
        )} */}
    </Card>
  );
}
