import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  CreateNewPassword,
  ForgotPassword,
  Login,
  Logout,
  Register,
} from "./views/auth";
import {
  Cart,
  Checkout,
  Home,
  Search,
  CourseDetail,
  Success,
} from "./views/base";
import "./authentication.css";
import Layout from "./components/Layout";
import Missing from "./components/Missing";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import Admin from "./components/Admin";
import { StudentCoruseDetail, StudentDashboard } from "./views/student";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}

        {/* Auth routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="logout" element={<Logout />} />

        <Route path="/" element={<Home />} />
        <Route path="/course-detail/:slug" element={<CourseDetail />} />

        {/* we want to protect these routes */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* catch all */}
        </Route>
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
