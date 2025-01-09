import { Text, View } from "react-native";
import { useObject, useQuery } from "@realm/react";
import { useColorScheme } from "nativewind";
import { BSON } from "realm";
import { OrderSchema, WorkTimeSchema } from "@/schema";
import useOrders from "@/hooks/useOrders";
import dayjs from "@/utils/dayjs";
import { useAppSelector } from "@/store/hooks";
import { user, workTime } from "@/store/storeSlice";
import { useTimer } from "@/hooks/useTimer";
import { useMemo } from "react";

export type FinancyDayProps = {};

export function FinancyDay({}: FinancyDayProps) {
  const { colorScheme } = useColorScheme();

  const userFromStore = useAppSelector(user);

  const workTimeFromStore = useAppSelector(workTime);

  const allWorkTime = useQuery(WorkTimeSchema);

  const currentWorkTime = useMemo(() => {
    return allWorkTime.find((x) => x._id.toString() === workTimeFromStore?.id);
  }, []);

  const [dayWeek, day, year] = dayjs(new Date())
    .locale("ru")
    .format("dddd, D MMMM, YYYY")
    .split(",");

  // const order = useObject(OrderSchema, new BSON.ObjectId(orderId));

  const { time } = useTimer({
    startTime: currentWorkTime?.from,
    durationDays: 0,
  });

  const zp = useMemo(() => {
    if (!userFromStore) {
      return 0;
    }
    return Math.round(
      time.hours * userFromStore.oklad +
        time.minutes * (userFromStore.oklad / 60) +
        time.seconds * (userFromStore.oklad / 3600)
    );
  }, [time, userFromStore?.oklad]);

  return (
    <View className="p-2">
      <View className="flex flex-col items-center">
        {/* <View className="flex flex-row">
          <View className="flex-auto flex flex-row">
            <Text className="text-lg leading-8 font-medium text-p-600 dark:text-p-300">
              №
            </Text>
            <Text className="text-3xl leading-8 font-medium text-p-600 dark:text-p-300">
              {order.number}
            </Text>
          </View>
          <Text className="text-lg leading-5 font-medium text-p-600 dark:text-p-300">
            {order.object}
          </Text>
        </View> */}

        <Text className="text-lg leading-5 font-medium text-g-950 dark:text-s-100">
          {dayWeek}
        </Text>
        <Text className="text-3xl font-medium text-g-950 dark:text-s-100">
          {day}
        </Text>
        <Text className="text-lg leading-5 font-medium text-g-950 dark:text-s-100">
          {year}
        </Text>
      </View>
      <View>
        <Text className="text-xl font-bold">{zp} ₽</Text>
      </View>
    </View>
  );
}
