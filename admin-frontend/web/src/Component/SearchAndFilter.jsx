import React, { useEffect, useState } from "react";
import { IoSearch, IoFilter } from "react-icons/io5";

const SearchAndFilter = ({ filterSelections, search }) => {
  const [filterDataBy, setFilterDataBy] = useState(filterSelections[0]);
  const [filterChange, setFilterChange] = useState(false);
  const [isAssending, setIsAssending] = useState(true);
  const [searchText, setSearchText] = useState("");

  return (
    <div className="h-16 pb-4 mt-4 w-full flex justify-between px-5 items-center border-b border-[#474747]">
      <div className="flex items-center gap-2">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          type="text"
          placeholder="Search"
          className="bg-white w-[150px] h-8 rounded-full px-5 outline-none text-sm"
        />
        <IoSearch
          size={24}
          className="text-black"
          onClick={() => {
            search(filterDataBy, isAssending, null, searchText);
          }}
        />
      </div>
      <div className="flex items-center gap-2 z-20">
        <div className="bg-[#CDC8C8] h-8 px-2 min-w-20 rounded-full flex flex-col items-center justify-start">
          <button
            onClick={() => setFilterChange(!filterChange)}
            className="items-center flex-1 w-full"
          >
            <p className="text-black text-[16px] font-jura">{filterDataBy}</p>
          </button>
          {filterChange && (
            <div className="flex flex-col bg-[#CDC8C8] rounded-b-xl w-16 mt-1">
              {filterSelections.map((item, index) => {
                if (item === filterDataBy) return;
                return (
                  <button
                    key={index}
                    className="border-t-[1px] border-black"
                    onClick={() => {
                      setFilterDataBy(item);
                      setFilterChange(false);
                      search(item, isAssending, null, searchText);
                    }}
                  >
                    <p className="text-black text-[16px] font-jura">{item}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <IoFilter
          size={24}
          className={`${isAssending && "transform scale-y-[-1]"}`}
          onClick={() => {
            console.log;
            setIsAssending(!isAssending);
            search(filterDataBy, !isAssending, null, searchText);
          }}
        />
      </div>
    </div>
  );
};

export default SearchAndFilter;
