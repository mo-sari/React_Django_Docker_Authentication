import axios from "../api/axios";
import { useAuthContext } from "../context/AuthProvider";

const useRefreshToken = () => {
  const { setAuth, auth } = useAuthContext();

  const refresh = async () => {
    const formData = new FormData();
    formData.append("refresh", auth.refreshToken);
    const response = await axios.post("auth/jwt/refresh/", formData, {
      withCredentials: true,
    });
    setAuth((prev) => {
      console.log(JSON.stringify(prev));
      console.log(response.data.access);
      console.log(response.data.refresh);
      return {
        ...prev,
        accessToken: response.data.access,
        refreshToken: response.data.refresh,
      };
    });
    return response.data.access;
  };
  return refresh;
};

export default useRefreshToken;
