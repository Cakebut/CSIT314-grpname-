// import { useState } from "react";
// import { LogOut, Users, Key, FileText, Download, X, CheckCircle, XCircle } from "lucide-react";
// import "./UserAccounts.css";

// // Mock data
// const mockUsers = [
//   { id: "001", username: "john_doe", roleName: "Admin", status: "Active" },
//   { id: "002", username: "jane_smith", roleName: "PIN", status: "Active" },
//   { id: "003", username: "bob_wilson", roleName: "User", status: "Inactive" },
//   { id: "004", username: "alice_jones", roleName: "PIN", status: "Active" },
//   { id: "005", username: "mike_brown", roleName: "Admin", status: "Active" },
// ];

// function UserAccounts() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [isExportOpen, setIsExportOpen] = useState(false);
//   const [isSuccessOpen, setIsSuccessOpen] = useState(false);
//   const [fileName, setFileName] = useState("Sample02.pdf");
//   const [exportedCount, setExportedCount] = useState(0);

//   const handleReset = () => {
//     setSearchTerm("");
//     setRoleFilter("all");
//     setStatusFilter("all");
//   };

//   const getStatusBadge = (status: string) => {
//     if (status === "Active") {
//       return (
//         <span className="badge active">
//           <CheckCircle className="icon" />
//           Active
//         </span>
//       );
//     }
//     return (
//       <span className="badge inactive">
//         <XCircle className="icon" />
//         Inactive
//       </span>
//     );
//   };

//   return (
//     <div className="user-accounts-container">
//       {/* Content */}
//       <div className="content">
//         {/* Title */}
//         <div className="header">
//           <div>
//             <h1>User Accounts</h1>
//             <p>Manage user accounts and permissions</p>
//           </div>
//           <button className="create-account-btn">+ Create Account</button>
//         </div>

//         {/* Filters */}
//         <div className="filters">
//           <div className="filter-group">
//             <input
//               type="text"
//               placeholder="Search by username"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="input"
//             />
            
//             <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="select">
//               <option value="all">All Roles</option>
//               <option value="admin">Admin</option>
//               <option value="pin">PIN</option>
//               <option value="user">User</option>
//             </select>

//             <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>

//             <button onClick={handleReset} className="reset-btn">
//               Reset
//             </button>

//             <button 
//               onClick={() => setIsExportOpen(true)} 
//               className="export-btn"
//             >
//               <Download className="icon" />
//               Export File
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Username</th>
//                 <th>Role Name</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {mockUsers.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="no-data">
//                     No users found
//                   </td>
//                 </tr>
//               ) : (
//                 mockUsers.map((user) => (
//                   <tr key={user.id}>
//                     <td>{user.id}</td>
//                     <td>{user.username}</td>
//                     <td>{user.roleName}</td>
//                     <td>{getStatusBadge(user.status)}</td>
//                     <td>
//                       <div className="actions">
//                         <button className="action-btn edit-btn">Edit</button>
//                         <button className="action-btn delete-btn">Delete</button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Export Dialog */}
//       {isExportOpen && (
//         <div className="dialog export-dialog">
//           <div className="dialog-header">
//             <h2>Export</h2>
//           </div>
//           <div className="dialog-body">
//             <label htmlFor="fileName">File Name</label>
//             <input
//               id="fileName"
//               value={fileName}
//               onChange={(e) => setFileName(e.target.value)}
//               className="input"
//             />
//           </div>
//           <div className="dialog-footer">
//             <button onClick={() => setIsExportOpen(false)} className="cancel-btn">Cancel</button>
//             <button
//               onClick={() => {
//                 const recordCount = mockUsers.length;
//                 setExportedCount(recordCount);
//                 setIsExportOpen(false);
//                 setIsSuccessOpen(true);
//               }}
//               className="export-btn"
//             >
//               Export
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Success Dialog */}
//       {isSuccessOpen && (
//         <div className="dialog success-dialog">
//           <div className="dialog-header">
//             <h2>Success!</h2>
//           </div>
//           <div className="dialog-body">
//             <div className="success-message">
//               <CheckCircle className="icon" />
//               User data successfully exported. {exportedCount} records included.
//             </div>
//             <ul className="export-details">
//               <li>File exported as {fileName}</li>
//               <li>All user data has been compiled</li>
//               <li>Export completed successfully</li>
//             </ul>
//           </div>
//           <div className="dialog-footer">
//             <button onClick={() => setIsSuccessOpen(false)} className="close-btn">Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UserAccounts;

import React, { useState } from "react";
import "./UserAccounts.css";

interface User {
  id: string;
  username: string;
  role: string;
  status: "Active" | "Inactive";
}

const initialUsers: User[] = [
  { id: "001", username: "john_doe", role: "Admin", status: "Active" },
  { id: "002", username: "jane_smith", role: "PIN", status: "Active" },
  { id: "003", username: "bob_wilson", role: "User", status: "Inactive" },
  { id: "004", username: "alice_jones", role: "PIN", status: "Active" },
  { id: "005", username: "mike_brown", role: "Admin", status: "Active" },
];

const UserAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleEdit = (id: string) => {
    alert(`Edit user with ID: ${id}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesUsername = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All Roles" || user.role === filterRole;
    const matchesStatus = filterStatus === "All Status" || user.status === filterStatus;

    return matchesUsername && matchesRole && matchesStatus;
  });

  return (
    <div className="user-accounts-container">

      <div className="user-accounts-top">
        <div>
        <header className="header"></header>
          <h1>User Accounts</h1>
          <p>Manage user accounts and permissions</p>
        </div>
        <button className="create-btn">+ Create Account</button>
      </div>

          <div className="actions">
            <input
              type="text"
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>PIN</option>
              <option>User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="reset-btn" onClick={() => { setSearchQuery(""); setFilterRole("All Roles"); setFilterStatus("All Status"); }}>
              Reset
            </button>
            <button className="export-btn">Export File</button>
          </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(user.id)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

    </div>
  );
};

export default UserAccounts;
