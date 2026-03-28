import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import remove from "../../assets/icons/delete.png";
import profile from "../../assets/icons/profile.png";
import AppGradient from "../../components/AppGradient";
import MemberCrud from "../../components/MemberCrud";
import SearchAndFilter from "../../components/SearchAndFilter";
import ApiClient, { ApiClientFile } from "../../utils/ApiClient";
import Confirmation from "../../components/Confirmation";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import edit from "@/assets/icons/edit.png";
import saveImage from "../../utils/saveImage";

const ManageMembers = () => {
  const router = useRouter();
  const [addMember, setAddMember] = useState(false);
  const [membersData, setMembersData] = useState();
  const [filteredMembersData, setFilteredMembersData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;

  const [confirm, setConfirm] = useState(false);
  const filterSelections = ["Id", "Name", "Phone Number", "Date", "Status"];
  const { t } = useTranslation();

  const saveMember = async (personalData) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("file", personalData.image ? personalData.image : "");
    formData.append("metadata", JSON.stringify(personalData));
    try {
      const res = await ApiClientFile.post(`/admin/addMember`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });
      fetchMembers();
      setAddMember(false);
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        const offlineSave = await saveLocal(personalData);
        console.log("-", offlineSave);

        if (offlineSave) {
          setAddMember(false);
          offlineData();
        }
        console.log(err.response?.status);
        setLoading(false);

        return;
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setLoading(false);
    }
  };

  const updateMember = async (personalData) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", personalData.image ? personalData.image : "");
    formData.append("metadata", JSON.stringify(personalData));
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClientFile.put(`/admin/updateMember`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });
      fetchMembers();
      setAddMember(false);
      setLoading(false);
      console.log(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        const offlineSave = await updateLocal(personalData);
        if (offlineSave) {
          setAddMember(false);
          offlineData();
        }
        setErrorMessage(backendError?.error?.message);
        console.log(err.response?.status);
        setLoading(false);

        return;
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setLoading(false);
    }
  };

  const saveLocal = async (personalData) => {
    const members = await AsyncStorage.getItem("members");
    const paresedMembers = JSON.parse(members);
    for (const key in paresedMembers) {
      if (paresedMembers[key].phone_number === personalData.phone_number) {
        setErrorMessage("phone number exists in db");
        return 0;
      }
    }

    const MemberLocalAdd = await AsyncStorage.getItem("MemberLocalAdd");
    const parsedMemberLocalAdd = JSON.parse(MemberLocalAdd);

    for (const key in parsedMemberLocalAdd) {
      if (
        parsedMemberLocalAdd[key].phone_number === personalData.phone_number
      ) {
        setErrorMessage("phone number exists in local");
        return 0;
      }
    }
    if (parsedMemberLocalAdd) {
      parsedMemberLocalAdd.push(personalData);
    }
    await AsyncStorage.setItem(
      "MemberLocalAdd",
      JSON.stringify(
        parsedMemberLocalAdd ? parsedMemberLocalAdd : [personalData],
      ),
    );

    paresedMembers.push(personalData);
    await AsyncStorage.setItem("members", JSON.stringify(paresedMembers));

    console.log("saved offline");
    return 1;
  };

  const updateLocal = async (personalData) => {
    const localSaved = await AsyncStorage.getItem("MemberLocalAdd");
    const parsedLocalSaved = JSON.parse(localSaved);

    const members = await AsyncStorage.getItem("members");
    const paresedMembers = JSON.parse(members);

    for (const key in paresedMembers) {
      if (paresedMembers[key].phone_number === personalData.phone_number) {
        paresedMembers[key] = personalData;

        await AsyncStorage.setItem("members", JSON.stringify(paresedMembers));
        return 1;
      }
    }

    for (const key in parsedLocalSaved) {
      if (parsedLocalSaved[key].phone_number === personalData.phone_number) {
        parsedLocalSaved[key] = personalData;

        await AsyncStorage.setItem(
          "MemberLocalAdd",
          JSON.stringify(parsedLocalSaved),
        );
        return 1;
      }
    }
    return 0;
  };

  useEffect(() => {
    offlineData();
    fetchMembers();
  }, []);

  const removeLocal = async (localId) => {
    const localSaved = await AsyncStorage.getItem("MemberLocalAdd");
    const parsedLocalSaved = JSON.parse(localSaved);

    const members = await AsyncStorage.getItem("members");
    const paresedMembers = JSON.parse(members);

    for (const key in paresedMembers) {
      if (paresedMembers[key].phone_number !== localId) {
        const clearedData = paresedMembers.filter(
          (item) => item.phone_number !== localId,
        );
        await AsyncStorage.setItem("members", JSON.stringify(clearedData));
      }
    }

    for (const key in parsedLocalSaved) {
      if (parsedLocalSaved[key].phone_number === localId) {
        const clearedData = parsedLocalSaved.filter(
          (item) => item.phone_number !== localId,
        );
        await AsyncStorage.setItem(
          "MemberLocalAdd",
          JSON.stringify(clearedData),
        );
      }
    }
    setConfirm(false);
    offlineData();
  };

  const offlineData = async () => {
    const members = await AsyncStorage.getItem("members");
    const paresedMembers = JSON.parse(members);
    if (paresedMembers) {
      setMembersData(paresedMembers);
      search(filterSelections[0], true, paresedMembers);
    }
  };

  const fetchMembers = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("admin/members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem("members", JSON.stringify(res.data.members));
      setMembersData(res.data.members);
      search(filterSelections[0], true, res.data.members);
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    }
  };

  const removeMember = async (memberId) => {
    const token = await AsyncStorage.getItem("adminToken");
    console.log(memberId);
    try {
      const res = await ApiClient.delete(`admin/member/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMembers();
      setConfirm(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    }
  };

  const formatDate = (createdAt) => {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const search = (filterDataBy, isAscending, Datas = null, searchText = "") => {
    const filterMap = {
      Date: "createdAt",
      Id: "id",
      Name: "full_name",
      Status: "activity_status",
      "Phone Number": "phone_number",
    };

    const filterBy = filterMap[filterDataBy];
    let data = Datas ?? membersData;

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();

      data = data.filter((item) => {
        if (item[filterBy]) {
          const value = item[filterBy];
          if (filterDataBy === "Name") {
            return value.toLowerCase().includes(lowerSearch);
          }
          if (filterDataBy === "Status") {
            return value.toLowerCase().startsWith(lowerSearch);
          }

          if (["Id", "Phone Number"].includes(filterDataBy)) {
            return value.toString().includes(searchText);
          }

          if (filterDataBy === "Date") {
            const formattedDate = formatDate(value);
            return formattedDate.includes(lowerSearch);
          }

          return false;
        }
      });
    }

    const sorted = [...data].sort((a, b) => {
      const modifier = isAscending ? 1 : -1;

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
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1">
          <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={33} color="black" />
            </Pressable>
            <Text className="text-white h-10 pl-2 leading-none text-[30px] font-jura-bold">
              {t("manageMember.Manage Members")}
            </Text>
          </View>
          <SearchAndFilter
            filterSelections={filterSelections}
            search={search}
          />

          <View className="h-10 w-full flex flex-row justify-between px-6 my-4 items-center">
            <Text className="text-white leading-none text-[25px] font-jura">
              {t("manageMember.Members")} - {filteredMembersData.length}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#56C556] rounded-[25px] h-[45px] w-[130px] px-2 items-center justify-center"
              onPress={() => setAddMember("Add Member")}
            >
              <Text className="text-white leading-none text-[20px] font-jura text-center">
                {t("manageMember.Add Member")}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="bg-[#25252A]/60 mb-6 flex-1 mx-2 rounded-xl">
            {Array.isArray(filteredMembersData) &&
              filteredMembersData.map((item, index) => (
                <View
                  key={index}
                  className={`${item.createdAt ? "bg-white/10" : "bg-gray-600"} h-16 w-full flex flex-row items-center my-1 justify-between`}
                >
                  <View className="flex flex-row items-center gap-2">
                    <View className="flex w-14 h-full items-center">
                      <View
                        className={`${item.activity_status === "Active" ? "bg-green-800" : item.activity_status === "Payment Due" ? "bg-red-600" : "bg-gray-500"} h-2 w-14`}
                      />
                      <Image
                        source={
                          item.image
                            ? typeof item.image === "object"
                              ? { uri: item.image.uri }
                              : { uri: `${ADDRESS}/${item.image}` }
                            : profile
                        }
                        resizeMode="contain"
                        className="h-[49px] w-[49px] rounded-full p-2 border-[1px] border-[#00FF00]"
                      />
                    </View>
                    <View className="w-[100px]">
                      <Text className="text-black leading-none text-[18px] font-jura text-start w-44 h-6">
                        {item.full_name}
                      </Text>
                      <Text className="text-black leading-none text-[17px] font-jura text-start">
                        {item.membership
                          ? item.membership.membershipPlan
                            ? item.membership.membershipPlan.membership_name
                            : t("manageMember.None")
                          : t("manageMember.None")}
                      </Text>
                    </View>
                    <View className="h-full flex justify-center gap-4 pb-2">
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                    </View>
                    <View>
                      <Text className="text-black leading-none text-[18px] font-jura text-start">
                        {item.registration_Date}
                      </Text>
                      <Text className="text-black leading-none text-[18px] font-jura text-start">
                        {item.id}-{item.phone_number}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="mx-3"
                    onPress={() => setAddMember(item)}
                  >
                    <Image source={edit} className="h-8 w-7" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="mx-3"
                    onPress={() =>
                      item?.id
                        ? setConfirm(item.id)
                        : setConfirm([item.phone_number, true])
                    }
                  >
                    <Image source={remove} className="h-8 w-7" />
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
          {confirm && (
            <Confirmation
              setRemove={setConfirm}
              title="Are you sure?"
              content="This will delete all datas associated with this user"
              onConfirmed={() =>
                typeof confirm === "object"
                  ? removeLocal(confirm[0])
                  : removeMember(confirm)
              }
            />
          )}
          {addMember &&
            (addMember === "Add Member" ? (
              <MemberCrud
                setRemove={setAddMember}
                type="Add Member"
                save={saveMember}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                loading={loading}
              />
            ) : (
              <MemberCrud
                setRemove={setAddMember}
                type="Edit Member"
                save={updateMember}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                loading={loading}
                editData={addMember}
              />
            ))}
        </View>
      </SafeAreaView>
    </AppGradient>
  );
};

export default ManageMembers;
