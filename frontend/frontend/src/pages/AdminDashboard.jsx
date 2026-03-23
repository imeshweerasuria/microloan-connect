export default function AdminDashboard() {
  return (
    <div style={{ padding: "24px" }}>
      <h2>Admin Dashboard</h2>

      <p>Welcome Admin 👋</p>

      <div style={{ marginTop: "20px" }}>
        <p>✔ Verify Borrowers</p>
        <p>✔ Approve / Reject Loans</p>
        <p>✔ Monitor Platform Activity</p>
        <p>✔ View Analytics Dashboard</p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>System Status</h3>
        <ul>
          <li>Users Registered: (dynamic later)</li>
          <li>Loans Submitted: (dynamic later)</li>
          <li>Active Loans: (dynamic later)</li>
        </ul>
      </div>
    </div>
  );
}