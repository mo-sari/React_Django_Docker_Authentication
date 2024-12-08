import React from "react";
import { useState, useEffect, useRef } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes, FaCheck } from "react-icons/fa";
import axios from "../../api/axios";
import { REGISTER_URL } from "../../constants/urls";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%]).{8,24}$/;

function Register() {
  const navigate = useNavigate();
  const emailRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", user);
    formData.append("email", email);
    formData.append("password", pwd);
    formData.append("re_password", matchPwd);

    try {
      await axios.post(REGISTER_URL, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setUser("");
      setPwd("");
      setMatchPwd("");
      setEmail("");
      navigate("/login");
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
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
                <form onSubmit={handleSubmit}>
                  <p
                    ref={errRef}
                    className={errMsg ? "errmsg" : "hide"}
                    aria-live="assertive"
                  >
                    {errMsg}
                  </p>
                  <h1>Register</h1>
                  <br />
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email:
                      <FaCheck className={validEmail ? "valid" : "hide"} />
                      <FaTimes
                        className={validEmail || !email ? "hide" : "invalid"}
                      />
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="email"
                      ref={emailRef}
                      autoComplete="off"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      required
                      aria-invalid={validEmail ? "false" : "true"}
                      aria-describedby="emailnote"
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                    />
                    <p
                      id="emailnote"
                      className={
                        emailFocus && email && !validEmail
                          ? "instructions"
                          : "hide"
                      }
                    >
                      Enter a valid email address.
                      <br />
                      Must include an "@" symbol and a domain (e.g.,
                      example@example.com).
                      <br />
                      Only letters, numbers, dots, underscores, and hyphens are
                      allowed before the "@".
                      <br />
                      The domain must have at least one dot (e.g., .com, .org).
                    </p>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username:
                      <FaCheck className={validName ? "valid" : "hide"} />
                      <FaTimes
                        className={validName || !user ? "hide" : "invalid"}
                      />
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="username"
                      autoComplete="off"
                      onChange={(e) => setUser(e.target.value)}
                      value={user}
                      required
                      aria-invalid={validName ? "false" : "true"}
                      aria-describedby="uidnote"
                      onFocus={() => setUserFocus(true)}
                      onBlur={() => setUserFocus(false)}
                    />
                    <p
                      id="uidnote"
                      className={
                        userFocus && user && !validName
                          ? "instructions"
                          : "hide"
                      }
                    >
                      4 to 24 characters.
                      <br />
                      Must begin with a letter.
                      <br />
                      Letters, numbers, underscores, hyphens allowed.
                    </p>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password:
                      <FaCheck className={validPwd ? "valid" : "hide"} />
                      <FaTimes
                        className={validPwd || !pwd ? "hide" : "invalid"}
                      />
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      id="password"
                      onChange={(e) => setPwd(e.target.value)}
                      value={pwd}
                      required
                      aria-invalid={validPwd ? "false" : "true"}
                      aria-describedby="pwdnote"
                      onFocus={() => setPwdFocus(true)}
                      onBlur={() => setPwdFocus(false)}
                    />
                    <p
                      id="pwdnote"
                      className={
                        pwdFocus && !validPwd ? "instructions" : "hide"
                      }
                    >
                      8 to 24 characters.
                      <br />
                      Must include uppercase and lowercase letters, a number and
                      a special character.
                      <br />
                      Allowed special characters:{" "}
                      <span aria-label="exclamation mark">?</span>{" "}
                      <span aria-label="exclamation mark">!</span>{" "}
                      <span aria-label="at symbol">@</span>{" "}
                      <span aria-label="hashtag">#</span>{" "}
                      <span aria-label="dollar sign">$</span>{" "}
                      <span aria-label="percent">%</span>
                    </p>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirm_pwd" className="form-label">
                      Confirm Password:
                      <FaCheck
                        className={validMatch && matchPwd ? "valid" : "hide"}
                      />
                      <FaTimes
                        className={validMatch || !matchPwd ? "hide" : "invalid"}
                      />
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      id="confirm_pwd"
                      onChange={(e) => setMatchPwd(e.target.value)}
                      value={matchPwd}
                      required
                      aria-invalid={validMatch ? "false" : "true"}
                      aria-describedby="confirmnote"
                      onFocus={() => setMatchFocus(true)}
                      onBlur={() => setMatchFocus(false)}
                    />
                    <p
                      id="confirmnote"
                      className={
                        matchFocus && !validMatch ? "instructions" : "hide"
                      }
                    >
                      Must match the first password input field.
                    </p>
                  </div>

                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn btn-primary w-100 "
                    disabled={
                      !validName || !validPwd || !validMatch ? true : false
                    }
                    style={{ letterSpacing: "2px" }}
                  >
                    Sign Up <i className="fas fa-user-plus"></i>
                  </button>

                  <br />
                </form>

                <br />
                <span>
                  Already have an account?
                  <Link
                    to="/login/"
                    className="ms-1"
                    style={{ letterSpacing: "2px" }}
                  >
                    Sign In
                  </Link>
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

export default Register;
