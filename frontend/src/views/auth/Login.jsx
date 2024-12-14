import React from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import axios from "../../api/axios";
import { LOGIN_URL } from "../../constants/urls";

function Login() {
  const { setAuth } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const emailRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState("mohsen.ansari.wtf@gmail.com");
  const [pwd, setPwd] = useState("aaa???123A");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", pwd);

    try {
      const response = await axios.post(LOGIN_URL, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      const accessToken = response?.data?.access;
      const user = jwtDecode(accessToken) ?? null;
      setAuth({ user, accessToken });
      setEmail("");
      setPwd("");
      console.log("login completed");
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <>
      <BaseHeader />
      <section
        className="container d-flex flex-column vh-100"
        style={{ marginTop: "150px" }}
      >
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <form className="needs-validation" onSubmit={handleSubmit}>
                  <p
                    ref={errRef}
                    className={errMsg ? "errmsg" : "offscreen"}
                    aria-live="assertive"
                  >
                    {errMsg}
                  </p>
                  <h1>Login</h1>
                  <br />
                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">
                      Email:
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      name="email"
                      ref={emailRef}
                      autoComplete="off"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password:
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      onChange={(e) => setPwd(e.target.value)}
                      value={pwd}
                      required
                    />
                  </div>

                  <div className="d-grid">
                    <button
                      disabled={!email || !pwd ? true : false}
                      type="submit"
                      className="btn btn-primary"
                      style={{ letterSpacing: "2px" }}
                    >
                      Sign in <i className="fas fa-sign-in-alt"></i>
                    </button>
                  </div>
                </form>
                <br></br>
                <span>
                  Need an Account?
                  <Link
                    to="/register/"
                    className="ms-1"
                    style={{ letterSpacing: "2px" }}
                  >
                    Sign Up
                  </Link>
                  <div>
                    <br />
                    <Link to="/forgot-password/">Forgot your password?</Link>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default Login;
