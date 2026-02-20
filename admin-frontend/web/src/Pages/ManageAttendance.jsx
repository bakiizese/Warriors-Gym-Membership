import React, { useEffect, useState } from "react";
import AppGradient from "../Component/AppGradient";
import { useNavigate } from "react-router-dom";
import SearchAndFilter from "../Component/SearchAndFilter";
import ApiClient from "../utils/ApiClient";

const AttendanceLogs = () => {
  const navigate = useNavigate();
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [filteredAttendanceLog, setfilteredAttendanceLog] = useState([]);
  const filterSelections = ["Member Id", "Name", "Gender", "Date", "Check In"];

  useEffect(() => {
    offlineData();
    fetchAttendance();
  }, []);

  const offlineData = () => {
    const attendances = localStorage.getItem("attendances");
    if (attendances) {
      setAttendanceLog(JSON.parse(attendances));
      search(filterSelections[0], true, JSON.parse(attendances));
    }
  };

  const fetchAttendance = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("/admin/attendanceLog", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem(
        "attendances",
        JSON.stringify(res.data.attendanceLog),
      );
      setAttendanceLog(res.data.attendanceLog);
      search(filterSelections[0], true, res.data.attendanceLog);
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (createdAt, onlyTime = false) => {
    const date = new Date(createdAt);
    if (onlyTime) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const search = (
    filterDataBy,
    isAssending,
    Datas = null,
    searchText = null,
  ) => {
    const filter = {
      Date: "check_in",
      "Member Id": "id",
      Name: "full_name",
      Gender: "gender",
      "Check In": "check_in",
    };
    const filterBy = filter[filterDataBy];
    let data = Datas ?? attendanceLog;

    if (searchText) {
      data = data.filter((item) => {
        if (filterDataBy === "Check In") {
          console.log("in check");
          const dateFormated = formatDate(item[filterBy], true);
          return dateFormated.toLowerCase().includes(searchText.toLowerCase());
        } else if (filterDataBy === "Member Id") {
          return item.attendanceMember[filterBy]
            .toString()
            .includes(searchText);
        } else if (filterDataBy === "Date") {
          const dateFormated = formatDate(item[filterBy]);
          return dateFormated.includes(searchText.toLowerCase());
        }
        return item.attendanceMember[filterBy]
          .toLowerCase()
          .includes(searchText.toLowerCase());
      });
    }

    const sorted = [...data].sort((a, b) => {
      const modifier = isAssending ? 1 : -1;
      if (["Date", "Check In"].includes(filterDataBy)) {
        return (new Date(a[filterBy]) - new Date(b[filterBy])) * modifier;
      }
      if (filterDataBy === "Member Id") {
        return (
          (a.attendanceMember[filterBy] - b.attendanceMember[filterBy]) *
          modifier
        );
      }
      if (filterDataBy === "Name") {
        return (
          a.attendanceMember[filterBy].localeCompare(
            b.attendanceMember[filterBy],
          ) * modifier
        );
      }

      return a[filterBy].localeCompare(b[filterBy]) * modifier;
    });

    setfilteredAttendanceLog(sorted);
  };

  return (
    <AppGradient>
      <div className="flex flex-col max-h-screen">
        <SearchAndFilter filterSelections={filterSelections} search={search} />

        <div className="flex items-center h-10 px-6 my-2">
          <p className="text-white text-[20px] font-jura leading-none">
            Attendance Log-
          </p>
          <p className="text-white text-[20px] font-jura leading-none">
            {filteredAttendanceLog.length}
          </p>
        </div>

        <div className="flex-1 w-full overflow-auto px-2 mx-2 mb-6 bg-[#25252A]/60 rounded-xl">
          <div className="flex bg-[#4b4b50] justify-between sticky top-0 flex-row items-center gap-3 px-2 py-1">
            <p className="text-white w-[100px] text-center">Date</p>
            <p className="text-white w-[105px] text-center">Member</p>
            <p className="text-white w-[95px] text-center">Member Id</p>
            <p className="text-white w-[67px] text-center">Gender</p>
            <p className="text-white w-[80px] text-center">Check In</p>
            <p className="text-white w-[85px] text-center">Check Out</p>
          </div>

          {filteredAttendanceLog.map((item, index) => (
            <div
              key={index}
              className="flex flex-row items-center gap-3 bg-white/10 rounded-xl my-1 px-2 py-1 justify-between"
            >
              <p className="text-black w-[100px] text-center">
                {formatDate(item.check_in)}
              </p>
              <p className="text-black w-[105px] text-center">
                {item.attendanceMember.full_name}
              </p>
              <p className="text-black w-[95px] text-center">
                {item.attendanceMember.id}
              </p>
              <p className="text-black w-[67px] text-center">
                {item.attendanceMember.gender}
              </p>
              <p className="text-black w-[80px] text-center">
                {formatDate(item.check_in, true)}
              </p>
              <p className="text-black w-[85px] text-center">
                {item.check_out || "--------"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppGradient>
  );
};

export default AttendanceLogs;
