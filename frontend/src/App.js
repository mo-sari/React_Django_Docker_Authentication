import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  CreateNewPassword,
  ForgotPassword,
  Login,
  Logout,
  AccountActivation,
  Register,
  PasswordChangeConfirmation,
} from "./views/auth";
import { Cart, Checkout, Home, Search, CourseDetail } from "./views/base";
import "./authentication.css";
import Layout from "./components/Layout";
import Missing from "./components/Missing";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import { StudentCoruseDetail, StudentDashboard } from "./views/student";
import { StudentCourseDetailProvider } from "./context/StudentCourseDetailContext";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}

        {/* Auth routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="logout" element={<Logout />} />
        <Route path="/activate/:uid/:token" element={<AccountActivation />} />
        <Route path="/forgot-password/" element={<ForgotPassword />} />
        <Route
          path="/password/reset/confirm/:uid/:token/"
          element={<CreateNewPassword />}
        />
        <Route
          path="/password-reset-complete/"
          element={<PasswordChangeConfirmation />}
        />

        <Route path="/" element={<Home />} />
        <Route path="/course-detail/:slug" element={<CourseDetail />} />
        <Route path="/search/" element={<Search />} />

        {/* we want to protect these routes */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>
            {/* Cart Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/cart/" element={<Cart />} />
            <Route path="/checkout/:order_oid/" element={<Checkout />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route
              path="/student/courses/:enrollment_id"
              element={
                <StudentCourseDetailProvider>
                  <StudentCoruseDetail />
                </StudentCourseDetailProvider>
              }
            />
          </Route>

          {/* catch all */}
        </Route>
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
