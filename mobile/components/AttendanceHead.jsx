import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import strike from "../assets/icons/strike.png";
import noStrike from "../assets/icons/noStrike.png";
import { addDays, subDays } from "date-fns";

const AttendanceHead = ({ attendance, now }) => {
  let size = 0;
  const baseSize = 22;
  const [shownAttendances, setShownAttendances] = useState([
    { date: subDays(now, 5).getDate(), strike: false },
    { date: subDays(now, 4).getDate(), strike: false },
    { date: subDays(now, 3).getDate(), strike: false },
    { date: subDays(now, 2).getDate(), strike: false },
    { date: subDays(now, 1).getDate(), strike: false },
    { date: now.getDate(), strike: false },
    { date: addDays(now, 1).getDate(), strike: false },
    { date: addDays(now, 2).getDate(), strike: false },
    { date: addDays(now, 3).getDate(), strike: false },
    { date: addDays(now, 4).getDate(), strike: false },
    { date: addDays(now, 5).getDate(), strike: false },
  ]);

  const attendanceNumber = () => {
    setShownAttendances((prev) =>
      prev.map((item) =>
        attendance.includes(item.date)
          ? { ...item, strike: true }
          : { ...item, strike: false },
      ),
    );
  };

  useEffect(() => {
    setShownAttendances([
      { date: subDays(now, 5).getDate(), strike: false },
      { date: subDays(now, 4).getDate(), strike: false },
      { date: subDays(now, 3).getDate(), strike: false },
      { date: subDays(now, 2).getDate(), strike: false },
      { date: subDays(now, 1).getDate(), strike: false },
      { date: now.getDate(), strike: false },
      { date: addDays(now, 1).getDate(), strike: false },
      { date: addDays(now, 2).getDate(), strike: false },
      { date: addDays(now, 3).getDate(), strike: false },
      { date: addDays(now, 4).getDate(), strike: false },
      { date: addDays(now, 5).getDate(), strike: false },
    ]);
    attendanceNumber();
  }, [attendance, now]);

  return (
    <View className="flex-1 flex flex-row justify-center items-center gap-1">
      {Array.isArray(shownAttendances) &&
        shownAttendances.map((item, index) => {
          if (index <= 5) {
            size += 3.5;
          } else {
            size -= 3.5;
          }
          return (
            <View
              key={index}
              className="items-center justify-center"
              style={{
                height: baseSize + size,
                width: baseSize + size,
              }}
            >
              <Image
                source={item.strike ? strike : noStrike}
                resizeMode="stretch"
                className="absolute bottom-0"
                style={{
                  height: item.strike ? baseSize + size * 1.5 : baseSize + size,
                  width: baseSize + size,
                }}
              />

              <Text
                className={`text-center text-black ${index === 5 ? "font-jura-bold opacity-100" : "font-jura opacity-30"} leading-none`}
                style={{ fontSize: baseSize - 7 + size / 2 }}
              >
                {item.date}
              </Text>
            </View>
          );
        })}
    </View>
  );
};

export default AttendanceHead;
