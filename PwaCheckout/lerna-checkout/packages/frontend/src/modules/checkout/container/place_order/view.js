import { useState, useEffect } from "react";
import { useAlert } from "react-alert";
import { useCheckoutContext } from "@app/modules/checkout/store";
import { IS_DEMO } from "@app/helper/demo";

const View = () => {
  const alert = useAlert();
  const [isAllowToPlaceOrder, setIsAllowToPlaceOrder] = useState(false);
  const [{ SELECTED }] = useCheckoutContext();

  useEffect(() => {
    // Demo mode has no Midtrans Snap script to wait for
    if (IS_DEMO) {
      return;
    }
    const timer = setInterval(() => {
      if (window && typeof window.snap !== "undefined") {
        setIsAllowToPlaceOrder(true);
        clearInterval(timer)
      }
    }, 100)

    return () => setIsAllowToPlaceOrder(false);
  }, [])

  const onPlaceOrder = () => {
    if (IS_DEMO) {
      if (!SELECTED.payment) {
        return alert.error("Choose a payment method first.");
      }
      const [, title] = SELECTED.payment.split('#####');
      return alert.success(`Demo order placed with ${title}. No payment was made.`);
    }
    console.log(SELECTED.payment.split('#####'))
  }

  return (
    <button
      type="submit"
      className="btn btn-primary btn-block"
      disabled={!IS_DEMO && !isAllowToPlaceOrder}
      onClick={() => onPlaceOrder()}>
      Place Order
    </button>
  )
}

export default View;
