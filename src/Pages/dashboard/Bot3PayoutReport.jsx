import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const Bot3PayoutReport = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const regno = sessionStorage.getItem("Regno");

  // Format amount function
  const formatAmount = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date function
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // WALLET ADDRESS TRUNCATE FUNCTION
  const truncateWallet = (wallet) => {
    if (!wallet || wallet === "0") return "-";
    if (wallet.length > 15) {
      return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
    }
    return wallet;
  };

  // ✅ POORI ROW KA COLOR
  const getRowColor = (status) => {
    switch (status) {
      case "Approved":
        return "#e8f5e9"; // Halka Green
      case "Pending":
        return "#fff8e1"; // Halka Yellow
      case "Process":
        return "#f3e5f5"; // Halka Purple
      case "Reject":
        return "#ffebee"; // Halka Red
      default:
        return "transparent"; 
    }
  };

  // ✅ BADGE KA COLOR
  const getBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success";
      case "Pending":
        return "bg-warning text-dark";
      case "Process":
        return "bg-primary"; // ya custom CSS class
      case "Reject":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Fetch Capital Payout History
  useEffect(() => {
    const fetchCapitalPayoutHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(
          `/IncomePayout/capital-payout-history/${regno}`
        );

        if (res.data?.result === "true") {
          const data = res.data.response?.data || [];
          setRecords(data);
        } else {
          console.warn("⚠️ API result is not true");
          setRecords([]);
          setError("No data found");
        }
      } catch (error) {
        console.error(" API Error:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch data");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (regno) {
      fetchCapitalPayoutHistory();
    } else {
      console.warn("⚠️ No Regno found");
      setLoading(false);
    }
  }, [regno]);

  // Filter records based on search term
  const filteredRecords = records.filter((row) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      row.TransDate?.toLowerCase().includes(searchLower) ||
      row.transType?.toLowerCase().includes(searchLower) ||
      row.debit?.toString().toLowerCase().includes(searchLower) ||
      row.credit?.toString().toLowerCase().includes(searchLower) ||
      row.Remark?.toLowerCase().includes(searchLower) ||
      row.Status?.toLowerCase().includes(searchLower) ||
      row.ACID?.toString().toLowerCase().includes(searchLower) ||
      row.payid?.toString().toLowerCase().includes(searchLower) ||
      row.bankname?.toLowerCase().includes(searchLower) 
    );
  });

  // Pagination logic
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (pageIndex - 1) * itemsPerPage;
  const currentRecords = filteredRecords.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when search term or items per page changes
  useEffect(() => {
    setPageIndex(1);
  }, [searchTerm, itemsPerPage]);

  const columns = [
    "S.No.",
    "Status",
    "Date",
    "Amount",
    "Charges %",
    "Net Payable",
    "Wallet ID",
    "Pay Hash",
    "Remark",
  ];

  return (
    <div className="Table-container royalty-main-wrapper mb-5 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h3 className="mb-0">Bot 3 Payout History</h3>
      </div>

      <div className="d-flex justify-content-between entries-search-bar entries-control mb-3">
        <div className="entries-control">
          <label>Show entries:</label>
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            {[10, 25, 50, 75, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="search-wrapper mt-3">
          <input
            className="form-control search-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-3">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="report-card">
        <div style={{ overflowX: "auto", width: "100%" }}>
          <CustomTable columns={columns} loading={loading}>
            {currentRecords.length > 0 ? (
              currentRecords.map((row, index) => {
                // Har row ke liye color nikalna
                const currentRowColor = getRowColor(row.Status);

                return (
                  <tr key={index} style={{ whiteSpace: "nowrap" }}>
                    {/* ✅ Har TD mein backgroundColor lagaya gaya hai taaki white background override ho jaye */}
                    <td className="text-center" style={{ backgroundColor: currentRowColor }}>
                      <div className="sr-no-circle">{startIndex + index + 1}</div>
                    </td>
                      <td style={{ backgroundColor: currentRowColor }}>
                      <span className={`badge ${getBadgeClass(row.Status)}`}>
                        {row.Status || "-"}
                      </span>
                    </td>
                    <td style={{ backgroundColor: currentRowColor }}>
                      {formatDate(row.TransDate)}
                    </td>
                    <td style={{ color: "green", fontWeight: "600", backgroundColor: currentRowColor }}>
                      {row.debit > 0 ? formatAmount(row.debit) : "0.00"}
                    </td>
                    <td style={{ color: "#ef4444", fontWeight: "600", backgroundColor: currentRowColor }}>
                      {row.othercharge}%
                    </td>
                    <td style={{ color: "green", fontWeight: "600", backgroundColor: currentRowColor }}>
                      {formatAmount(row.netPayable)}
                    </td>
                    <td
                      style={{
                        color: "green",
                        fontSize: "13px",
                        backgroundColor: currentRowColor,
                      }}
                      title={row.bankname || "-"}
                    >
                      {truncateWallet(row.bankname)}
                    </td>
                     <td
  style={{
    color: "green",
    fontSize: "13px",
    backgroundColor: currentRowColor,
    cursor: row.trCode ? "pointer" : "default", // Agar hash hai toh pointer dikhega
  }}
  title={row.trCode || "-"}
>
  {row.trCode && row.trCode !== "0" ? (
    <a
      href={`https://bscscan.com/search?q=${row.trCode}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "green", textDecoration: "underline" }}
    >
      {truncateWallet(row.trCode)}
    </a>
  ) : (
    "-"
  )}
</td>
                    <td
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        backgroundColor: currentRowColor,
                      }}
                      title={row.Remark || "-"}
                    >
                      {row.Remark || "-"}
                    </td>
                  
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  {loading ? "Loading..." : "No records found"}
                </td>
              </tr>
            )}
          </CustomTable>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={pageIndex}
            totalPages={totalPages}
            totalRecords={totalItems}
            onPageChange={setPageIndex}
          />
        )}
      </div>
    </div>
  );
};

export default Bot3PayoutReport;