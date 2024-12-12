import React, { useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";

function CreateNewPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [new_password, setNewPassword] = useState("");
  const [re_new_password, setRe_NewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO...must rethink the error handling
    try {
      const res = await axios.post("auth/users/reset_password_confirm/", {
        uid,
        token,
        new_password,
        re_new_password,
      });

      setIsLoading(false);
      setNewPassword("");
      setRe_NewPassword("");
      navigate("/password-reset-complete/");
    } catch (error) {
      alert("error: ", error);
      setIsLoading(false);
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
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">Create New Password</h1>
                  <span>Choose a new password for your account</span>
                </div>
                <form
                  className="needs-validation"
                  onSubmit={handleSubmit}
                  noValidate=""
                >
                  <div className="mb-3">
                    <label htmlFor="new_password" className="form-label">
                      Enter New Password
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      className="form-control"
                      name="new_password"
                      placeholder="**************"
                      value={new_password}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="re_new_password" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="re_new_password"
                      className="form-control"
                      name="re_new_password"
                      placeholder="**************"
                      value={re_new_password}
                      onChange={(e) => setRe_NewPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>

                  <div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        Save New Password{" "}
                        <i className="fas fa-check-circle"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default CreateNewPassword;
