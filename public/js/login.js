import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  // console.log(email, password);
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v2/users/login",
      data: { email, password },
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfuly");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v2/users/logout",
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged out successfuly");
      location.reload(true);
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};
