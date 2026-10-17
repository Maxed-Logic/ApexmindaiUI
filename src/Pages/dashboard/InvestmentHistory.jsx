// InvestmentHistory.jsx - With Type column + IncomeType filter (FULL DEDUPE FIX)
import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const InvestmentHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Income Type filter
    const [incomeTypes, setIncomeTypes] = useState([]);
    // ✅ Yahan hum UI ka text store karenge (e.g., "Bot 3")
    const [selectedType, setSelectedType] = useState("All");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const regno = sessionStorage.getItem("Regno");

    // ✅ 1. Display Name (UI ke liye)
    const getDisplayType = (type) => {
        if (!type) return "";
        return type.toLowerCase() === "stake" ? "Bot 3" : type;
    };

    // ✅ 2. Backend API Value (Stake bhejne ke liye)
    const getBackendType = (displayType) => {
        if (!displayType) return "all";
        if (displayType === "All") return "all";
        return displayType.toLowerCase() === "bot 3" ? "stake" : displayType;
    };

    // 🔹 Fetch Income Types from API
    useEffect(() => {
        const fetchIncomeTypes = async () => {
            try {
                const res = await apiClient.get(
                    `/Dashboard/IncomeType/investment`
                );
                console.log("✅ IncomeType API:", res.data);

                if (res.data?.result === "true") {
                    const typesStr =
                        res.data?.response?.data?.[0]?.TransTypes || "";

                    console.log("🔎 RAW TransTypes string:", typesStr);

                    const typesArr = typesStr
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);

                    // ✅ Case-insensitive FULL dedupe
                    const seen = new Set();
                    const uniqueTypes = [];

                    for (const t of typesArr) {
                        const key = t.toLowerCase();
                        if (!seen.has(key)) {
                            seen.add(key);
                            uniqueTypes.push(t);
                        }
                    }

                    // ✅ Agar "All" list me nahi hai toh sabse pehle add karo
                    const hasAll = seen.has("all");
                    const finalTypes = hasAll
                        ? uniqueTypes
                        : ["All", ...uniqueTypes];

                    console.log("✅ Final dropdown types:", finalTypes);
                    setIncomeTypes(finalTypes);

                    // Default select "All"
                    setSelectedType((prev) => prev || finalTypes[0]);
                } else {
                    setIncomeTypes(["All"]);
                    setSelectedType("All");
                }
            } catch (err) {
                console.error("❌ IncomeType API Error:", err);
                setIncomeTypes(["All"]);
                setSelectedType("All");
            }
        };
        fetchIncomeTypes();
    }, []);

    // 🔹 Fetch Investment History
    useEffect(() => {
        const fetchWalletReport = async () => {
            if (!regno) {
                setLoading(false);
                setError("Please login to view your investment history");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // ✅ Yahan hum Backend Type nikal rahe hain
                const apiType = getBackendType(selectedType);

                console.log("🚀 API CALL:", {
                    regno: Number(regno),
                    type: apiType,
                    pageIndex: currentPage,
                    pageSize: itemsPerPage,
                });

                const res = await apiClient.get(
                    `/Dashboard/RechargeTransactionHistory`,
                    {
                        params: {
                            regno: Number(regno),
                            type: apiType,
                            pageIndex: currentPage,
                            pageSize: itemsPerPage,
                        },
                    }
                );

                console.log("✅ FULL RESPONSE:", res.data);

                if (res.data && res.data.result === "true") {
                    const tradingHistoryData =
                        res.data.response?.tradingHistory || [];
                    setRecords(tradingHistoryData);

                    const total =
                        res.data.response?.totalRecords ||
                        res.data.response?.totalCount ||
                        tradingHistoryData.length;

                    setTotalItems(total);
                    setTotalPages(Math.ceil(total / itemsPerPage));
                } else {
                    setRecords([]);
                    setTotalItems(0);
                    setTotalPages(0);
                    setError(res.data?.message || "Failed to fetch data");
                }
            } catch (error) {
                console.error("❌ API Error:", error.response || error);
                setError(
                    error.response?.data?.message ||
                        "An error occurred while fetching data"
                );
                setRecords([]);
                setTotalItems(0);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletReport();
    }, [regno, currentPage, itemsPerPage, selectedType]);

    // 🔹 Client-side search filter
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search me "Bot 3" likhne par bhi Stake wale records milein
        const displayType = getDisplayType(row.Investment || row.TransTypes || row.incomeType || "").toLowerCase();

        return (
            (row.Rdate && row.Rdate.toLowerCase().includes(searchLower)) ||
            (row.remark && row.remark.toLowerCase().includes(searchLower)) ||
            (row.Rkprice &&
                row.Rkprice.toString().toLowerCase().includes(searchLower)) ||
            (row.slabfine &&
                row.slabfine.toString().toLowerCase().includes(searchLower)) ||
            (row.BinaryBuffer &&
                row.BinaryBuffer.toString()
                    .toLowerCase()
                    .includes(searchLower)) ||
            (row.type && row.type.toLowerCase().includes(searchLower)) ||
            displayType.includes(searchLower)
        );
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage, selectedType]);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // ✅ Dropdown handle change
    const handleTypeChange = (e) => {
        setSelectedType(e.target.value); // "Bot 3" set hoga
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return dateString.split("T")[0];
    };

    const columns = [
        "Sl.No.",
        "Date",
        "Investment",
        "Amount",
        "ROI %",
        "Max Caping",
        "Remark",
    ];

    return (
        <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
            <div className="mb-2 p-3">
                <h3>Investment History</h3>
            </div>

            {error && (
                <div className="alert alert-danger mx-3">{error}</div>
            )}

            <div className="entries-search-bar entries-control mb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <div className="d-flex align-items-center gap-2">
                            <label className="fw-semibold">
                                Show entries:
                            </label>
                            <select
                                className="form-select w-auto"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                style={{
                                    borderRadius: "8px",
                                    border: "1px solid rgba(102, 126, 234, 0.2)",
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        {/* 🔹 Type Filter Dropdown */}
                        <div className="d-flex align-items-center gap-2">
                            <label className="fw-semibold">Type:</label>
                            <select
                                className="form-select w-auto"
                                value={selectedType}
                                onChange={handleTypeChange}
                                style={{
                                    borderRadius: "8px",
                                    border: "1px solid rgba(102, 126, 234, 0.2)",
                                }}
                            >
                                {incomeTypes.map((t, i) => {
                                    // ✅ Yahan UI text "Bot 3" ban raha hai
                                    const displayValue = getDisplayType(t);
                                    return (
                                        <option key={`type-${i}-${t}`} value={displayValue}>
                                            {displayValue}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <input
                            className="form-control"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                minWidth: "250px",
                                borderRadius: "8px",
                                border: "1px solid rgba(102, 126, 234, 0.2)",
                                padding: "8px 12px",
                            }}
                        />
                    </div>
                </div>
            </div>

            <CustomTable columns={columns} loading={loading}>
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((row, index) => (
                        <tr key={row.Rid || index}>
                            <td className="text-center">
                                <div className="sr-no-circle">
                                    {(currentPage - 1) * itemsPerPage +
                                        index +
                                        1}
                                </div>
                            </td>
                            <td
                                style={{
                                    fontWeight: "500",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {formatDate(row.Rdate)}
                            </td>
                            {/* 🔹 Type column */}
                            <td>
                                <span
                                    className="px-3 py-2 text-info font-medium"
                                >
                                    {/* ✅ Table me bhi Stake ki jagah Bot 3 show hoga */}
                                    {getDisplayType(
                                        row.Investment ||
                                        row.TransTypes ||
                                        row.incomeType ||
                                        selectedType
                                    ) || "-"}
                                </span>
                            </td>
                            <td>
                                <span
                                    className=" px-3 py-2 rounded-pill"
                                    style={{ fontWeight: "bold", color: "green" }}
                                >
                                    ${row.Rkprice || 0}
                                </span>
                            </td>
                            <td
                                className="text-info font-medium"
                                style={{ fontWeight: "bold" }}
                            >
                                {row.slabfine ?? "-"}%
                            </td>
                            <td>
                                <span
                                    className="px-3 py-2 rounded-pill"
                                    style={{ fontWeight: "bold", color: "green" }}
                                >
                                    {row.BinaryBuffer || 0}
                                </span>
                            </td>
                            <td>
                                <span
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: "500",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {row.remark || "-"}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={columns.length}
                            className="text-center py-4"
                        >
                            {loading ? "Loading..." : "No records found"}
                        </td>
                    </tr>
                )}
            </CustomTable>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalItems}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default InvestmentHistory;