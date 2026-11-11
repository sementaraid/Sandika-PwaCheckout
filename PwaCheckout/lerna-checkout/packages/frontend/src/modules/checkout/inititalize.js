import { useQuery } from "@app/helper/useQuery";
import { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { GQLClientRequest } from "@app/graphql/client";
import { config } from "@app/config.json";
import { IS_DEMO } from "@app/helper/demo";
import {
  SCHEMA_STORE_CONFIG,
  SCHEMA_GET_CART,
  SCHEMA_GET_CART_ITEMS,
  SCHEMA_GET_PICKUP_STORE,
  SCHEMA_GET_CUSTOMER,
  SCHEMA_GET_CUSTOMER_REWARD_POINTS,
  INTERNAL_GENERATE_SESSION,
  INTERNAL_DELETE_SESSION
} from "@app/graphql/schema";


const useInitialData = () => {

  const STATE = useQuery();
  const alert = useAlert();
  const [state, setState] = useState({
    loading: true,
    data: {
      isLogin: false,
      storeConfig: {},
      store: [],
      customerData: {
        addresses: [],
        rewardPoints: {},
        storeCredits: {}
      },
      cart: {},
      selected: {
        delivery: 0,
        address: null,
        shipping: null,
        payment: null
      },
    }
  })


  useEffect(async () => {
    let isLogin = false;

    /**
     * --------------------------------------------------------
     * GRAPHQL internal delete session
     * GRAPHQL get storeConfig
     * --------------------------------------------------------
     */

    try {
      const response_InternalDeleteSession = await GQLClientRequest(INTERNAL_DELETE_SESSION);
      if (response_InternalDeleteSession.status === "failed") { throw response_InternalDeleteSession }

      const response_StoreConfig = await GQLClientRequest(SCHEMA_STORE_CONFIG);
      if (response_StoreConfig.status === "failed") { throw response_StoreConfig };

      /**
       * --------------------------------------------------------
       * IF (storeConfig.allow_guest_checkout === false)
       * then the page will be redirect to login page
       * --------------------------------------------------------
       */
      if (!response_StoreConfig.data.storeConfig.allow_guest_checkout) {
        window.location.replace(response_StoreConfig.data.storeConfig.base_url);
      }

      const response_InternalGenerateSession = await GQLClientRequest(INTERNAL_GENERATE_SESSION, { state: STATE });
      if (response_InternalGenerateSession.status === "failed") { throw response_InternalGenerateSession };

      if (response_InternalGenerateSession.data.internalGenerateSession.isLogin) { isLogin = true; }

      const response_Customer = isLogin ? await GQLClientRequest(SCHEMA_GET_CUSTOMER) : { status: "success", data: { customer: {} }, message: "" };
      if (response_Customer.status === "failed") { throw response_Customer };

      const response_CustomerRewardPoint = isLogin ? await GQLClientRequest(SCHEMA_GET_CUSTOMER_REWARD_POINTS) : { status: "success", data: { customerRewardPoints: {} }, message: "" };
      if (response_CustomerRewardPoint.status === "failed") { throw response_CustomerRewardPoint };

      const response_Cart = await GQLClientRequest(SCHEMA_GET_CART, { cart_id: response_InternalGenerateSession.data.internalGenerateSession.cartId });
      if (response_Cart.status === "failed") { throw response_Cart };

      const response_CartItems = await GQLClientRequest(SCHEMA_GET_CART_ITEMS, { cart_id: response_InternalGenerateSession.data.internalGenerateSession.cartId });
      if (response_CartItems.status === "failed") { throw response_CartItems };

      const response_PickupStore = config.delivery.pickup ? await GQLClientRequest(SCHEMA_GET_PICKUP_STORE, { cart_id: response_InternalGenerateSession.data.internalGenerateSession.cartId }) : { status: "success", data: {} };
      if (response_PickupStore.status === "failed") { throw response_PickupStore };

      const { data: { cart } } = response_Cart;

      /**
       * --------------------------------------------------------
       * APPEND SCRIPT
       * --------------------------------------------------------
       */
      const script = document.createElement('script');
      if (!IS_DEMO && !document.getElementById("snap-midtrans")) {
        const snapSrcUrl = response_StoreConfig.data.storeConfig.snap_is_production === "1" ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
        const myMidtransClientKey = response_StoreConfig.data.storeConfig.snap_client_key;

        script.id = "midtrans-js";
        script.src = snapSrcUrl;
        script.setAttribute('data-client-key', myMidtransClientKey);
        script.async = true;

        document.body.appendChild(script);
      };


      setState({
        loading: false,
        data: {
          ...state.data,
          isLogin: isLogin,
          storeConfig: response_StoreConfig.data.storeConfig,
          store: config.delivery.pickup ? response_PickupStore.data.getPickupStore.store : [],
          cart: { ...cart, ...response_CartItems.data.cart },
          customerData: {
            addresses: response_Customer.data.customer.addresses,
            rewardPoints: response_CustomerRewardPoint.data.customerRewardPoints,
            storeCredits: response_Customer.data.customer.store_credit
          },
          selected: {
            ...state.data.selected,
            delivery: cart.pickup_store_person.email ? 1 : 0,
            payment: cart.selected_payment_method?.code ? `${cart.selected_payment_method.code}#####${cart.selected_payment_method.title}` : null,
            shipping: cart.shipping_addresses[0]?.selected_shipping_method ? `${cart.shipping_addresses[0].selected_shipping_method.carrier_code}_${cart.shipping_addresses[0].selected_shipping_method.method_code}_${cart.shipping_addresses[0].selected_shipping_method.carrier_title}` : null
          }
        }
      })


    }
    catch (err) {
      alert.error(err.message);
    }


    return () => {
      if (document.getElementById("midtrans-js")) {
        const script = document.getElementById('midtrans-js');
        document.body.removeChild(script);
      }
    }

  }, [])

  return state
};

export { useInitialData };