import axios from "axios";
import { showAlert } from "./alerts";
const stripe = Stripe("public_key");

export const bookTour = async (tourId) => {
  try {
    // GET CHECKOUT SESSION FROM API
    const session = await axios(
      `http://127.0.0.1:3000/api/v2/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // CREATE CHECKOUT FORM AND CHARGE CREDIT CARD
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", "Error. Try again later");
  }
};
