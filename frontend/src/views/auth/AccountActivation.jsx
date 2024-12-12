import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const AccountActivation = () => {
  const { uid, token } = useParams(); // Extract UID and token from URL
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.post(`/auth/users/activation/`, {
          uid,
          token,
        });
        setStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        setStatus("error");
      }
    };

    activateAccount();
  }, [uid, token, navigate]);

  return (
    <div className="container mt-5">
      <div className="text-center">
        {status === "loading" && <p>Activating your account, please wait...</p>}
        {status === "success" && (
          <div className="alert alert-success" role="alert">
            Your account has been successfully activated! Redirecting to
            login...
          </div>
        )}
        {status === "error" && (
          <div className="alert alert-danger" role="alert">
            Activation failed. The link might be invalid or expired. Please try
            again or contact support.
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountActivation;
