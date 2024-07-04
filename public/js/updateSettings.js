import axios from "axios";
import { showAlert } from "./alerts";

export const updateSettings = async (data, type) => {
  try {
    // console.log(data);
    const res = await axios({
      method: "PATCH",
      url:
        type === "data"
          ? "/api/v2/users/updateMe"
          : "/api/v2/users/updateMyPassword",
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type} has been updated successfuly`);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
