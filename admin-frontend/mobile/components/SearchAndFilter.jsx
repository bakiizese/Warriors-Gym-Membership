import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchAndFilter = ({ filterSelections, search }) => {
  const [filterDataBy, setFilterDataBy] = useState(filterSelections[0]);
  const [filterChange, setFilterChange] = useState(false);
  const [isAscending, setIsAscending] = useState(true);
  const [searchText, setSearchText] = useState("");

  return (
    <View className="h-16 pb-4 mt-4 w-full flex-row justify-between px-5 items-center border-b border-[#474747]">
      <View className="flex-row items-center gap-2">
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search"
          className="bg-white w-[160px] h-full rounded-full px-5 py-2 leading-none text-xl"
          returnKeyType="done"
          onSubmitEditing={() =>
            search(filterDataBy, isAscending, null, searchText)
          }
        />

        <TouchableOpacity
          onPress={() => search(filterDataBy, isAscending, null, searchText)}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-2 z-20">
        <View className="bg-[#CDC8C8] h-8 min-w-[80px] rounded-full items-center">
          <TouchableOpacity
            className="flex-1 w-full items-center justify-center px-2"
            onPress={() => setFilterChange(!filterChange)}
          >
            <Text className="text-black text-base">{filterDataBy}</Text>
          </TouchableOpacity>

          {filterChange && (
            <View className="flex-col bg-[#CDC8C8] rounded-b-xl">
              {filterSelections.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    className="border-t border-black py-1 items-center h-8"
                    onPress={() => {
                      setFilterDataBy(item);
                      setFilterChange(false);
                      search(item, isAscending, null, searchText);
                    }}
                  >
                    <Text className="text-black text-base">{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            const newValue = !isAscending;
            setIsAscending(newValue);
            search(filterDataBy, newValue, null, searchText);
          }}
        >
          <Ionicons
            name="filter"
            size={24}
            color="black"
            style={{
              transform: [{ scaleY: isAscending ? -1 : 1 }],
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchAndFilter;
