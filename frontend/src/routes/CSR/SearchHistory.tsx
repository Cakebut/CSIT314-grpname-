import React, { useState } from "react";
import { Download, Search } from "lucide-react"; // Import necessary icons from lucide-react
import "./SearchHistory.css";

// Define structure for service record
interface ServiceRecord {
  serviceName: string;
  date: string
  location: string;
  serviceType: string;
  status: "Completed" | "Pending";
}

const initialRecords: ServiceRecord[] = [
  {
    serviceName: "Community Food Drive",
    date: "Oct 15, 2025",
    location: "Downtown Community Center",
    serviceType: "Food Distribution",
    status: "Completed",
  },
  {
    serviceName: "Senior Home Visit",
    date: "Oct 8, 2025",
    location: "Sunrise Senior Living",
    serviceType: "Elder Care",
    status: "Pending",
  },
  {
    serviceName: "Environmental Cleanup",
    date: "Sep 22, 2025",
    location: "River Park",
    serviceType: "Environmental",
    status: "Completed",
  },
  {
    serviceName: "Youth Mentoring Session",
    date: "Sep 10, 2025",
    location: "Lincoln High School",
    serviceType: "Education",
    status: "Pending",
  },
  {
    serviceName: "Medical Supply Distribution",
    date: "Aug 28, 2025",
    location: "City Health Clinic",
    serviceType: "Healthcare",
    status: "Completed",
  },
  {
    serviceName: "Homeless Shelter Support",
    date: "Aug 15, 2025",
    location: "Safe Haven Shelter",
    serviceType: "Food Distribution",
    status: "Pending",
  },
  {
    serviceName: "Tree Planting Initiative",
    date: "Jul 30, 2025",
    location: "Central Park",
    serviceType: "Environmental",
    status: "Completed",
  },
  {
    serviceName: "Hospital Volunteer Work",
    date: "Jul 12, 2025",
    location: "General Hospital",
    serviceType: "Healthcare",
    status: "Pending",
  },
];

const SearchHistory: React.FC = () => {
  const [records, setRecords] = useState<ServiceRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterServiceType, setFilterServiceType] = useState<string>("All Types");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleSearch = () => {
    // Here we can add filtering logic based on searchQuery, filterServiceType, startDate, and endDate
    const filteredRecords = initialRecords.filter((record) => {
      const matchesQuery =
        searchQuery === "" ||
        record.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesServiceType =
        filterServiceType === "All Types" || record.serviceType === filterServiceType;
      const matchesDateRange =
        (!startDate || new Date(record.date) >= new Date(startDate)) &&
        (!endDate || new Date(record.date) <= new Date(endDate));

      return matchesQuery && matchesServiceType && matchesDateRange;
    });

    setRecords(filteredRecords);
  };

  const handleDownloadHistory = () => {
    const csvRows = [
      ["Service Name", "Date", "Location", "Service Type", "Status"],
      ...records.map((record) => [
        record.serviceName,
        record.date,
        record.location,
        record.serviceType,
        record.status,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `service-history.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="search-history-container">
      <header className="header">
        <h1>Search History</h1>
        <p>View and filter your completed volunteer service activities</p>

        <div className="stats">
          <div className="stat">
            <span>Total Services</span>
            <span>{records.length}</span>
          </div>
          <div className="stat">
            <span>Pending</span>
            <span>{records.filter((r) => r.status === "Pending").length}</span>
          </div>
          <div className="stat">
            <span>Completed</span>
            <span>{records.filter((r) => r.status === "Completed").length}</span>
          </div>
        </div>
      </header>

      <div className="filters">
        <div className="filter-item">
          <label>Service Type</label>
          <select
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
          >
            <option>All Types</option>
            <option>Food Distribution</option>
            <option>Environmental</option>
            <option>Healthcare</option>
            <option>Education</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="apply-filters" onClick={handleSearch}>
          <Search className="icon" /> Apply Filters
        </button>
        <button className="clear-filters" onClick={() => setSearchQuery("")}>
          Clear Filters
        </button>
      </div>

      <div className="service-records">
        <table>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Date</th>
              <th>Location</th>
              <th>Service Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.serviceName}>
                <td>{record.serviceName}</td>
                <td>{record.date}</td>
                <td>{record.location}</td>
                <td>{record.serviceType}</td>
                <td className={record.status === "Completed" ? "completed" : "pending"}>
                  {record.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleDownloadHistory} className="download-button">
        <Download className="icon" /> Download History
      </button>
    </div>
  );
};

export default SearchHistory;
