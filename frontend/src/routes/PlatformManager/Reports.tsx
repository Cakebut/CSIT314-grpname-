import React, { useState } from "react";
import { Download } from "lucide-react"; // Import the Download icon
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"; // Recharts components
import { BarChart, Bar, Cell } from "recharts"; // For bar chart
import { PieChart, Pie, Cell as PieCell } from "recharts"; // For pie chart

// Dummy data for the report (for demo purposes)
const totalRequests = 8;
const completedRequests = 6;
const pendingRequests = 2;
const activeCSRs = 5;

const hourlyData = [
  { time: "12AM", completed: 1, total: 3 },
  { time: "6AM", completed: 2, total: 4 },
  { time: "12PM", completed: 3, total: 2 },
  { time: "6PM", completed: 4, total: 5 },
];

const regionData = [
  { region: "Central", requests: 9 },
  { region: "North", requests: 7 },
  { region: "East", requests: 5 },
  { region: "West", requests: 3 },
  { region: "South", requests: 4 },
];

const serviceTypesData = [
  { name: "Grocery Shopping", value: 29 },
  { name: "Medical Escort", value: 25 },
  { name: "Companionship", value: 14 },
  { name: "Tech Support", value: 14 },
  { name: "Home Repairs", value: 18 },
];

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>("Daily");
  const [selectedDate, setSelectedDate] = useState<string>("03/11/2025");

  // Handle the report download (example for CSV)
  const handleDownloadReport = () => {
    const csvContent = `Date,Total Requests,Completed,Pending,Active CSRs\n${selectedDate},${totalRequests},${completedRequests},${pendingRequests},${activeCSRs}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `volunteer-service-report-${selectedDate}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-container">
      <div className="reports-top">
        <div>
        <header className="reports-header"></header>
          <h1>Volunteer Services Report</h1>
          <p>A collection of data analytics and statistics for the volunteer services</p>
        </div>
      </div>

      {/* Date Range and Date Selector */}
      <div className="reports-date-range-selector">
        <label>Date Range:</label>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
        <label>Select Date:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      {/* Key Statistics Section */}
      <div className="reports-stats-section">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p>{totalRequests}</p>
          <p className="reports-percentage-change">+12% from last day</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{completedRequests}</p>
          <p className="reports-percentage-change">75% completion rate</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p>{pendingRequests}</p>
          <p className="reports-percentage-change">Awaiting assignment</p>
        </div>
        <div className="stat-card">
          <h3>Active CSRs</h3>
          <p>{activeCSRs}</p>
          <p className="reports-percentage-change">Volunteers this day</p>
        </div>
      </div>

      {/* Graphs */}
      <div className="reports-graphs">
        <div className="reports-graph-row">
          <div className="reports-graph-card">
            <h3>Hourly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#4caf50" />
                <Line type="monotone" dataKey="total" stroke="#2196f3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="reports-graph-card">
            <h3>Top Service Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={serviceTypesData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
                  {serviceTypesData.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.value > 20 ? "#82ca9d" : "#8884d8"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="reports-graph-row">
          <div className="reports-graph-card">
            <h3>Requests by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#8884d8">
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#4caf50" : "#2196f3"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Download Report Button */}
      <div className="reports-download-button">
        <button onClick={handleDownloadReport}>
          <Download className="icon" /> Download Report
        </button>
      </div>
    </div>
  );
};

export default Reports;
