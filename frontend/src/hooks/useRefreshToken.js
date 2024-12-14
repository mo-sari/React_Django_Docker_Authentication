import axios from "../api/axios";
import { useAuthContext } from "../context/AuthContext";
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
    console.log(response.data);
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
