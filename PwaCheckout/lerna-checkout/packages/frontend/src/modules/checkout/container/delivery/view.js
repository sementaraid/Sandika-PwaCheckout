import { useCheckoutContext } from "@app/modules/checkout/store";
import { SET_DELIVERY_METHOD, REFRESH_CART_ON_SHIPPING_METHODS_CHANGE } from "@app/modules/checkout/store/action";
import { GQLClientRequest } from "@app/graphql/client";
import {
  SCHEMA_REMOVE_PICKUP_DELIVERY,
  SCHEMA_UPDATE_SHIPPING_ADDRESS_ON_CART,
  SCHEMA_GET_PICKUP_STORE
} from "@app/graphql/schema";

const View = () => {

  const [{ IS_LOGIN, CUSTOMER_DATA, CART, SELECTED }, dispatch] = useCheckoutContext();

  const onClickDelivery = async (value) => {
    try {
      if (value !== SELECTED.delivery) {


        /**
         * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
         * FROM THIS LINE, IT WILL CHECK THE SELECTED SHIPPING METHOD
         * IS THERE ANY SELECTED SHIPPING METHOD CURRENTLY
         * IF SELECTED SHIPPING METHOD DOES NOT EXIST, IT WILL SKIP
         * SET DEFAULT ADDRESS AND SET SHIPPING BILLING ADDRESS ON CART PROCESS
         * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
         */

        /**
         * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
         * HOME DELIVERY
         * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
         */
        if (value === 0 && (typeof CART.shipping_addresses[0] === "undefined" || !CART.shipping_addresses[0].selected_shipping_method)) {
          return dispatch(SET_DELIVERY_METHOD({
            delivery: value
          }))
        }

        if (value === 0 && CART.shipping_addresses[0].selected_shipping_method) {
          const response_RemovePickupDelivery = await GQLClientRequest(SCHEMA_REMOVE_PICKUP_DELIVERY, { cart_id: CART.id })
          if (!response_RemovePickupDelivery.status === "failed") { throw response_RemovePickupDelivery }

          /**
           * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
           * FOR CUSTOMER
           * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
           */
          if (IS_LOGIN) {
            const defaultShippingAddress = CUSTOMER_DATA.addresses.filter(data => data.default_billing)[0];
            const response_UpdateAddressOnCart = await GQLClientRequest(SCHEMA_UPDATE_SHIPPING_ADDRESS_ON_CART, {
              cart_id: CART.id,
              address_id: defaultShippingAddress.id
            })
            if (response_UpdateAddressOnCart.status === "failed") { throw response_UpdateAddressOnCart }

            return dispatch(SET_DELIVERY_METHOD({
              cart: {
                ...response_RemovePickupDelivery.data.removePickupStore,
                ...response_UpdateAddressOnCart.data.setBillingAddressOnCart.cart
              },
              delivery: value
            }))
          }

          /**
           * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
           * FOR GUEST
           * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
           */
          else {
            return dispatch(SET_DELIVERY_METHOD({
              cart: response_RemovePickupDelivery.data.removePickupStore,
              delivery: value
            }))
          }
        }

        /**
         * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
         * PICKUP DELIVERY
         * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
         */
        else if (value === 1) {
          return dispatch(SET_DELIVERY_METHOD({
            delivery: value
          }))
        }
      }
      return;
    }
    catch (err) {
      console.log(err)
    }

  }

  return (
    <>
      <div className="container-delivery">
        <div className="block">
          <div className="block-title">
            <h4>Delivery</h4>
          </div>
          <div className="block-content">
            <p className="form-text text-muted">Warning : If you change delivery method, you need to add your address again</p>
            <div className="delivery-options">
              <div className={`delivery-option home-delivery ${SELECTED.delivery === 0 && 'active'}`} onClick={() => onClickDelivery(0)}>
                <h6>Home Delivery</h6>
                <p>We deliver your order to your home</p>
              </div>
              <div className={`delivery-option pickup-delivery ${SELECTED.delivery === 1 && 'active'}`} onClick={() => onClickDelivery(1)}>
                <h6>Pickup Delivery</h6>
                <p>Pickup your order at our store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default View;