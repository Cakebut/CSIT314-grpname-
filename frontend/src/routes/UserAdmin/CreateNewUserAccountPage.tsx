import "./CreateNewUserAccountPage.css";

function CreateUser() {
  return (
    <div className="create-user-container">
      <h2>Create New User</h2>
      <form>
        <input type="text" placeholder="User ID" />
        <input type="text" placeholder="Name" />
        <input type="password" placeholder="Password" />
        <select>
          <option value="">Select Role</option>
          <option value="User Admin">User Admin</option>
          <option value="PIN">PIN</option>
          <option value="CSR Rep">CSR Rep</option>
          <option value="Platform Manager">Platform Manager</option>
        </select>
        <select>
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Suspend">Suspend</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreateUser;
