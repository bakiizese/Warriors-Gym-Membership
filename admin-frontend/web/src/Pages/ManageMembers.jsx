import { useEffect, useState } from "react";
import axios from "axios";
import remove from "../../src/assets/icons/delete.png";
import profile from "../../src/assets/icons/profile.png";
import MemberCrud from "../Component/MemberCrud";
import SearchAndFilter from "../Component/SearchAndFilter";
import AppGradient from "../Component/AppGradient";
import ApiClient from "../utils/ApiClient";
import Confirmation from "../Component/Confirmation";

const ManageMembers = () => {
  const [addMember, setAddMember] = useState(false);
  const [membersData, setMembersData] = useState([]);
  const [filteredMembersData, setFilteredMembersData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const filterSelections = ["Id", "Name", "Phone Number", "Date", "Status"];
  const [confirm, setConfirm] = useState(false);

  const ADDRESS = import.meta.env.VITE_ADDRESS;

  const saveMember = async (personalData) => {
    setLoading(true);

    const token = localStorage.getItem("adminToken");

    try {
      await ApiClient.post("admin/addMember", personalData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchMembers();
      setAddMember(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.error?.message);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    offlineData();
    fetchMembers();
  }, []);

  const offlineData = () => {
    const members = localStorage.getItem("members");
    if (members) {
      setMembersData(JSON.parse(members));
      search(filterSelections[0], true, JSON.parse(members));
    }
  };

  const fetchMembers = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("admin/members", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("members", JSON.stringify(res.data.members));
      setMembersData(res.data.members);
      search(filterSelections[0], true, res.data.members);
    } catch (err) {
      console.log(err);
    }
  };

  const removeMember = async (memberId) => {
    const token = localStorage.getItem("adminToken");

    try {
      await ApiClient.delete(`admin/member/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirm(false);

      fetchMembers();
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (createdAt) => {
    const date = new Date(createdAt);
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
      Date: "createdAt",
      Id: "id",
      Name: "full_name",
      Status: "activity_status",
      "Phone Number": "phone_number",
    };
    const filterBy = filter[filterDataBy];
    let data = Datas ?? membersData;

    if (searchText) {
      data = data.filter((item) => {
        if (filterDataBy === "Name") {
          return item[filterBy]
            .toLowerCase()
            .includes(searchText.toLowerCase());
        } else if (["Id", "Phone Number"].includes(filterDataBy)) {
          return item[filterBy].toString().includes(searchText);
        } else if (filterDataBy === "Date") {
          const dateFormated = formatDate(item[filterBy]);
          return dateFormated.includes(searchText.toLowerCase());
        }
        return false;
      });
    }

    const sorted = [...data].sort((a, b) => {
      const modifier = isAssending ? 1 : -1;
      if (filterDataBy === "Date") {
        return (new Date(a[filterBy]) - new Date(b[filterBy])) * modifier;
      }
      if (["Id", "Phone Number"].includes(filterDataBy)) {
        return (a[filterBy] - b[filterBy]) * modifier;
      }
      return a[filterBy].localeCompare(b[filterBy]) * modifier;
    });

    setFilteredMembersData(sorted);
  };

  return (
    <AppGradient>
      <div className="flex flex-col max-h-screen">
        <SearchAndFilter filterSelections={filterSelections} search={search} />

        <div className="flex justify-between items-center px-6 my-4">
          <div className="flex flex-row">
            <h2 className="text-white text-[25px] font-jura">Members-</h2>
            <h2 className="text-white text-[25px] font-jura">
              {filteredMembersData.length}
            </h2>
          </div>

          <button
            className="bg-[#56C556] rounded-full h-[45px] w-[130px] text-white font-jura"
            onClick={() => setAddMember(true)}
          >
            Add Member
          </button>
        </div>

        <div className="bg-[#25252A]/60 flex-1 mx-2 mb-6 rounded-xl overflow-y-scroll">
          <div className="flex w-[80%] bg-[#4b4b50] justify-between sticky top-0 flex-row items-center gap-3 px-2">
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Picture
            </p>
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Name
            </p>
            <p className="text-white w-[85px] bg-black/20 h-full py-1 text-center">
              Id
            </p>
            <p className="text-white w-[120px] bg-black/20 h-full py-1 text-center">
              Phone Number
            </p>
            <p className="text-white w-[150px] bg-black/20 h-full py-1 text-center">
              Plan
            </p>
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Joined At
            </p>
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Status
            </p>
          </div>

          {filteredMembersData.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 h-16 flex items-center justify-between px-2 my-1"
            >
              <div className="flex items-center gap-4 justify-between w-[80%]">
                <div className="flex flex-col items-start w-[100px]">
                  <div
                    className={`h-2 w-14 ${
                      item.activity_status === "Active"
                        ? "bg-green-800"
                        : item.activity_status === "Payment Due"
                          ? "bg-red-600"
                          : "bg-gray-500"
                    }`}
                  />

                  <img
                    src={item.image ? `${ADDRESS}/${item.image}` : profile}
                    className="h-[49px] w-[49px] rounded-full border border-green-500 object-cover"
                  />
                </div>

                <p className="text-black text-center text-[18px] w-[100px] font-jura truncate">
                  {item.full_name}
                </p>
                <p className="text-black font-jura w-[85px] text-center">
                  {item.id}
                </p>
                <p className="text-black font-jura text-center w-[120px]">
                  {item.phone_number}
                </p>
                <p className="text-black text-[17px] w-[150px] font-jura text-start">
                  {item.membership?.membershipPlan?.membership_name ??
                    "None-Membership"}
                </p>
                <p className="text-black font-jura text-center w-[100px]">
                  {formatDate(item.createdAt)}
                </p>
                <p className="text-black font-jura text-center w-[100px]">
                  {item.activity_status}
                </p>
              </div>

              <button onClick={() => setConfirm(item.id)}>
                <img src={remove} className="h-8 w-7" />
              </button>
            </div>
          ))}
        </div>
        {confirm && (
          <Confirmation
            setRemove={setConfirm}
            title="Are you sure?"
            content="This will delete all datas associated with this user?"
            onConfirmed={() => removeMember(confirm)}
          />
        )}
        {addMember && (
          <MemberCrud
            setRemove={setAddMember}
            type="Add Member"
            save={saveMember}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            loading={loading}
          />
        )}
      </div>
    </AppGradient>
  );
};

export default ManageMembers;
