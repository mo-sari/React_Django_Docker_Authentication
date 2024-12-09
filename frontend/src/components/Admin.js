import { Link } from "react-router-dom";
import Users from "./Users";

const Admin = () => {
  return (
    <section>
      <h1>Admins Page</h1>
      <br />
      <Users />
      <br />
      <div className="flexGrow">
        <Link to="/home">Home</Link>
      </div>
    </section>
  );
};

export default Admin;
