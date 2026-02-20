import { useState, useEffect } from "react";
import AppGradient from "../Component/AppGradient";
import { useNavigate } from "react-router-dom";
import SearchAndFilter from "../Component/SearchAndFilter";
import ApiClient from "../utils/ApiClient";
import AddTransaction from "../Component/AddTransaction";

const ManagePayments = () => {
  const navigate = useNavigate();
  const [addPayment, setAddPayment] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [filteredTransactionData, setFilteredTransactionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const filterSelections = [
    "Member Id",
    "Name",
    "Date",
    "Status",
    "Amount",
    "Plan",
    "Method",
  ];

  useEffect(() => {
    offlineData();
    fetchTransactions();
  }, []);

  const offlineData = () => {
    const transactions = localStorage.getItem("transactions");
    if (transactions) {
      setTransactionHistory(JSON.parse(transactions));
      search(filterSelections[0], true, JSON.parse(transactions));
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem(
        "transactions",
        JSON.stringify(res.data.transactions),
      );
      setTransactionHistory(res.data.transactions);
      search(filterSelections[0], true, res.data.transactions);
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to fetch transactions");
    }
  };

  const saveTransaction = async (saveData) => {
    const token = localStorage.getItem("adminToken");
    try {
      await ApiClient.post("/admin/transaction", saveData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
      setAddPayment(false);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to save transaction");
      setLoading(false);
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
      Date: "paid_at",
      "Member Id": "id",
      Name: "full_name",
      Status: "status",
      Amount: "amount",
      Plan: "payment_for",
      Method: "payment_method",
    };
    const filterBy = filter[filterDataBy];
    let data = Datas ?? transactionHistory;

    if (searchText) {
      data = data.filter((item) => {
        if (filterDataBy === "Name") {
          return item.payer[filterBy]
            .toLowerCase()
            .includes(searchText.toLowerCase());
        } else if (filterDataBy === "Member Id") {
          return item.payer[filterBy].toString().includes(searchText);
        } else if (filterDataBy === "Date") {
          const dateFormated = formatDate(item[filterBy]);
          return dateFormated.includes(searchText.toLowerCase());
        } else if (filterDataBy === "Amount") {
          return item[filterBy].toString().includes(searchText);
        } else {
          return item[filterBy]
            .toLowerCase()
            .includes(searchText.toLowerCase());
        }
      });
    }

    const sorted = [...data].sort((a, b) => {
      const modifier = isAssending ? 1 : -1;
      if (filterDataBy === "Date") {
        return (new Date(a[filterBy]) - new Date(b[filterBy])) * modifier;
      }
      if (filterDataBy === "Member Id") {
        return (a.payer[filterBy] - b.payer[filterBy]) * modifier;
      }
      if (filterDataBy === "Name") {
        return a.payer[filterBy].localeCompare(b.payer[filterBy]) * modifier;
      }
      if (filterDataBy === "Amount") {
        return (a[filterBy] - b[filterBy]) * modifier;
      }
      return a[filterBy].localeCompare(b[filterBy]) * modifier;
    });

    setFilteredTransactionData(sorted);
  };

  return (
    <AppGradient>
      <div className="flex flex-col max-h-screen px-2">
        <SearchAndFilter filterSelections={filterSelections} search={search} />

        <div className="flex justify-between items-center h-10 px-6 my-4">
          <div className="flex flex-row">
            <p className="text-white text-[20px] font-jura leading-none">
              Transaction History-
            </p>
            <p className="text-white text-[20px] font-jura leading-none">
              {filteredTransactionData.length}
            </p>
          </div>
          <button
            className="bg-[#56C556] rounded-[25px] h-[45px] w-[130px] flex items-center justify-center"
            onClick={() => setAddPayment(true)}
          >
            <p className="text-white text-[18px] font-jura text-center leading-none">
              Add Transaction
            </p>
          </button>
        </div>

        <div className="flex-1 px-2 mb-6 overflow-scroll bg-[#25252A]/60 rounded-xl">
          <div className="flex bg-[#4b4b50] justify-between sticky top-0 flex-row items-center gap-3 px-2">
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Name
            </p>
            <p className="text-white w-[85px] bg-black/20 h-full py-1 text-center">
              Member Id
            </p>
            <p className="text-white w-[350px] bg-black/20 h-full py-1 text-center">
              Id
            </p>
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Paid At
            </p>
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Plan
            </p>
            <p className="text-white w-[85px] bg-black/20 h-full py-1 text-center">
              Amount
            </p>
            <p className="text-white w-[200px] bg-black/20 h-full py-1 text-center">
              Payment Method
            </p>
            <p className="text-white w-[100px] bg-black/20 h-full py-1 text-center">
              Status
            </p>
          </div>
          {Array.isArray(filteredTransactionData) &&
            filteredTransactionData.map((item, index) => (
              <div
                key={index}
                className="flex flex-row items-center justify-between px-2 my-1 h-10 bg-white/10 rounded-xl"
              >
                <div className="flex flex-row items-center flex-1 justify-between">
                  <p className="text-black max-h-4 overflow-hidden text-center text-[16px] w-[100px] font-jura leading-none">
                    {item.payer.full_name}
                  </p>
                  <p className="text-black text-center text-[16px] w-[85px] font-jura leading-none">
                    {item.payer.id}
                  </p>

                  <p className="text-black text-start text-[16px] w-[350px] font-jura leading-none">
                    {item.id}
                  </p>
                  <p className="text-black text-center text-[16px] w-[100px] font-jura leading-none">
                    {formatDate(item.paid_at)}
                  </p>

                  <p className="text-black text-start max-h-4 overflow-hidden text-[16px] w-[100px] font-jura leading-none">
                    {item.payment_for}
                  </p>
                  <p className="text-black text-start max-h-4 overflow-hidden text-[16px] w-[85px] font-jura leading-none">
                    {item.amount} Birr
                  </p>

                  <p className="text-black text-start text-[16px] w-[200px] max-h-4 overflow-hidden font-jura leading-none">
                    {item.payment_method}
                  </p>
                  <p className="text-black text-start text-[16px] w-[100px] font-jura leading-none">
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {addPayment && (
          <AddTransaction
            setRemove={setAddPayment}
            save={saveTransaction}
            setLoading={setLoading}
            loading={loading}
            setErrorMessage={setErrorMessage}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </AppGradient>
  );
};

export default ManagePayments;
