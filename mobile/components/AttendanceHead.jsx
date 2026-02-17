import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import strike from "../assets/icons/strike.png";
import noStrike from "../assets/icons/noStrike.png";

const AttendanceHead = ({ attendance, now }) => {
  let size = 0;
  const baseSize = 22;
  const day = now.getDate();
  const [shownAttendances, setShownAttendances] = useState([
    { date: day - 5, strike: false },
    { date: day - 4, strike: false },
    { date: day - 3, strike: false },
    { date: day - 2, strike: false },
    { date: day - 1, strike: false },
    { date: day, strike: false },
    { date: day + 1, strike: false },
    { date: day + 2, strike: false },
    { date: day + 3, strike: false },
    { date: day + 4, strike: false },
    { date: day + 5, strike: false },
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
      { date: day - 5, strike: false },
      { date: day - 4, strike: false },
      { date: day - 3, strike: false },
      { date: day - 2, strike: false },
      { date: day - 1, strike: false },
      { date: day, strike: false },
      { date: day + 1, strike: false },
      { date: day + 2, strike: false },
      { date: day + 3, strike: false },
      { date: day + 4, strike: false },
      { date: day + 5, strike: false },
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
