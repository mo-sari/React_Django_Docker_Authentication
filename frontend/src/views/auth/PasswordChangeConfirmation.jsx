import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PasswordChangeConfirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  }, [navigate]);

  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="alert alert-success" role="alert">
          Your password has been successfully changed! Redirecting to login...
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeConfirmation;
