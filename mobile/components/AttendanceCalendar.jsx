import { View } from "react-native";
import { Calendar } from "react-native-calendars";

const AttendanceCalendar = ({ selected }) => {
  let newSelected = [];

  const formatDate = (createdAt) => {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  for (const attend of selected) {
    const selectFormated = formatDate(attend.check_in);
    newSelected.push(selectFormated);
  }

  const marked = newSelected.reduce((acc, date) => {
    acc[date] = {
      selected: true,
      disableTouchEvent: true,
      selectedColor: "#00FF00B3",
      selectedTextColor: "#000",
    };
    return acc;
  }, {});

  return (
    <View className="flex-1 px-3 justify-center">
      <Calendar
        style={{ backgroundColor: "#00FF0066", height: 365, borderRadius: 20 }}
        markedDates={marked}
      />
    </View>
  );
};

export default AttendanceCalendar;
