import axios from "../api/axios";
import { useAuthContext } from "../context/AuthProvider";
import { jwtDecode } from "jwt-decode";
const useRefreshToken = () => {
  const { setAuth } = useAuthContext();

  const refresh = async () => {
    const response = await axios.post(
      "auth/jwt/refresh/",
      {},
      {
        withCredentials: true,
      }
    );
    setAuth((prev) => {
      return {
        ...prev,
        accessToken: response.data.access,
        user: jwtDecode(response.data.access) ?? null,
      };
    });
    return response.data.access;
  };
  return refresh;
};

export default useRefreshToken;
