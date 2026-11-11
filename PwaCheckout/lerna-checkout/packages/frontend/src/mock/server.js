/**
 * ----------------------------------------------------------------
 * MOCK GRAPHQL SERVER (DEMO MODE)
 * ----------------------------------------------------------------
 * Answers the same queries and mutations as the real backend, but
 * from an in-memory cart, so the checkout runs without Magento.
 *
 * Each request is matched by its root field names (for example
 * `cart` or `setShippingMethodsOnCart`). Every root field in the
 * document gets an answer, so a request with two mutations
 * returns both, the same as a real GraphQL server.
 */
import {
  money,
  STORE_CONFIG,
  CUSTOMER_ADDRESSES,
  STORE_CREDIT,
  REWARD_POINTS,
  CART_ITEMS,
  SHIPPING_METHODS,
  PAYMENT_METHODS,
  EXTRA_FEES,
  MEMBER_DISCOUNT,
  PICKUP_STORES,
  REGIONS,
  CITIES
} from "./data";

const CART_ID = "demo-cart-7Hq2Lx";
const clone = (value) => JSON.parse(JSON.stringify(value));

/**
 * ----------------------------------------------------------------
 * IN-MEMORY STATE
 * Resets on every page load.
 * ----------------------------------------------------------------
 */
const db = {
  email: "",
  addresses: clone(CUSTOMER_ADDRESSES),
  items: clone(CART_ITEMS),
  shippingAddress: null,
  selectedShipping: null,
  selectedPayment: null,
  pickupPerson: { email: null, handphone: null, name: null },
  pickupStore: null,
  extraFeeOptions: [],
  useRewardPoints: false,
  useStoreCredit: false,
  nextAddressId: 200
};

// The logged-in demo customer starts with the default address on the cart
const defaultAddress = db.addresses.find((address) => address.default_shipping);
db.shippingAddress = toCartAddress(defaultAddress);

function toCartAddress(address) {
  return {
    firstname: address.firstname,
    lastname: address.lastname,
    street: address.street,
    city: address.city,
    postcode: address.postcode,
    telephone: address.telephone,
    company: null,
    region: { code: address.region.region_code, label: address.region.region },
    country: { code: address.country.code, label: address.country.label },
    latitude: address.latitude,
    longitude: address.longitude
  };
}

/**
 * ----------------------------------------------------------------
 * CART CALCULATION
 * ----------------------------------------------------------------
 */
const subtotalOf = () => db.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const availableShippingMethods = () => {
  if (!db.shippingAddress || db.pickupStore) return [];
  const subtotal = subtotalOf();
  return SHIPPING_METHODS.map((method) => {
    const available = !method.minSubtotal || subtotal >= method.minSubtotal;
    return {
      available,
      method_code: method.method_code,
      carrier_code: method.carrier_code,
      method_title: method.method_title,
      carrier_title: method.carrier_title,
      amount: money(method.price),
      shipping_promo_name: method.price === 0 ? "Gratis ongkir" : null,
      error_message: available ? "" : `Spend at least Rp ${method.minSubtotal.toLocaleString("id-ID")}`,
      price_incl_tax: { value: method.price }
    };
  });
};

const selectedShippingMethod = () => {
  if (db.pickupStore) {
    return { method_code: "pickup", carrier_code: "pickup", carrier_title: "Pickup at store", amount: money(0) };
  }
  if (!db.selectedShipping) return null;
  const method = SHIPPING_METHODS.find((m) => m.carrier_code === db.selectedShipping.carrier_code && m.method_code === db.selectedShipping.method_code);
  return method ? { method_code: method.method_code, carrier_code: method.carrier_code, carrier_title: method.carrier_title, amount: money(method.price) } : null;
};

const appliedExtraFee = () => {
  const options = EXTRA_FEES.flatMap((fee) => fee.options).filter((option) =>
    db.extraFeeOptions.some((selected) => String(selected.option_id) === String(option.option_id))
  );
  const total = options.reduce((sum, option) => sum + option.price, 0);
  return {
    extrafee_value: options.length ? money(total) : null,
    select_options: options,
    show_on_cart: true,
    title: "Extra fee"
  };
};

const buildCart = () => {
  const subtotal = subtotalOf();
  const discount = Math.round(subtotal * MEMBER_DISCOUNT.rate);
  const shipping = selectedShippingMethod();
  const extraFee = appliedExtraFee();
  const shippingCost = shipping ? shipping.amount.value : 0;
  const feeCost = extraFee.extrafee_value ? extraFee.extrafee_value.value : 0;

  let remaining = subtotal - discount + shippingCost + feeCost;
  const rewardAmount = db.useRewardPoints ? -Math.min(REWARD_POINTS.balanceCurrency, remaining) : 0;
  remaining += rewardAmount;
  const creditAmount = db.useStoreCredit ? -Math.min(STORE_CREDIT.current_balance.value, remaining) : 0;
  remaining += creditAmount;

  const shippingAddress = db.shippingAddress && {
    is_valid_city: true,
    ...db.shippingAddress,
    selected_shipping_method: shipping,
    available_shipping_methods: availableShippingMethods()
  };

  return {
    id: CART_ID,
    email: db.email,
    total_quantity: db.items.reduce((sum, item) => sum + item.quantity, 0),
    dest_location: {
      dest_latitude: db.shippingAddress ? db.shippingAddress.latitude : null,
      dest_longitude: db.shippingAddress ? db.shippingAddress.longitude : null
    },
    pickup_store_person: clone(db.pickupPerson),
    available_payment_methods: clone(PAYMENT_METHODS),
    selected_payment_method: db.selectedPayment
      ? { code: db.selectedPayment.code, title: db.selectedPayment.title, purchase_order_number: null }
      : { code: "", title: "", purchase_order_number: null },
    applied_cashback: { data: [], is_cashback: false, total_cashback: 0 },
    applied_reward_points: { is_use_reward_points: db.useRewardPoints, reward_points_amount: rewardAmount },
    applied_coupons: null,
    applied_extra_fee: extraFee,
    addtional_fees: { data: clone(EXTRA_FEES), show_on_cart: true },
    applied_giftcard: null,
    applied_store_credit: { store_credit_amount: creditAmount, is_use_store_credit: db.useStoreCredit },
    prices: {
      discounts: discount ? [{ amount: money(discount), label: MEMBER_DISCOUNT.label }] : [],
      subtotal_excluding_tax: money(subtotal),
      subtotal_including_tax: money(subtotal),
      applied_taxes: [],
      grand_total: money(Math.max(0, remaining))
    },
    available_free_items: [],
    promoBanner: [],
    shipping_addresses: shippingAddress ? [shippingAddress] : [],
    billing_address: db.shippingAddress && {
      city: db.shippingAddress.city,
      company: null,
      country: db.shippingAddress.country,
      firstname: db.shippingAddress.firstname,
      lastname: db.shippingAddress.lastname,
      postcode: db.shippingAddress.postcode,
      region: db.shippingAddress.region,
      street: db.shippingAddress.street,
      telephone: db.shippingAddress.telephone
    },
    items: db.items.map((item) => {
      const rowTotal = money(item.price * item.quantity);
      return {
        __typename: item.configurable_options ? "ConfigurableCartItem" : "SimpleCartItem",
        id: item.id,
        quantity: item.quantity,
        configurable_options: item.configurable_options || null,
        pickup_item_store_info: { is_pickup: Boolean(db.pickupStore), loc_code: db.pickupStore ? db.pickupStore.code : null },
        prices: {
          row_total: rowTotal,
          row_total_including_tax: rowTotal,
          discounts: [],
          price: money(item.price),
          price_including_tax: money(item.price)
        },
        product: clone(item.product)
      };
    })
  };
};

const cartPayload = () => ({ cart: buildCart() });

const customerPayload = () => ({
  store_credit: clone(STORE_CREDIT),
  addresses: clone(db.addresses)
});

const setDefaultAddress = (addressId) => {
  db.addresses.forEach((address) => {
    address.default_billing = address.id === addressId;
    address.default_shipping = address.id === addressId;
  });
};

const clearPickup = () => {
  db.pickupStore = null;
  db.pickupPerson = { email: null, handphone: null, name: null };
};

const fail = (message) => {
  const error = new Error(message);
  error.isMockError = true;
  throw error;
};

/**
 * ----------------------------------------------------------------
 * RESOLVERS, keyed by GraphQL root field
 * ----------------------------------------------------------------
 */
const resolvers = {
  internalDeleteSession: () => ({ result: true }),
  internalGenerateSession: () => ({ result: true, isLogin: true, cartId: CART_ID, redirect_path: "" }),
  storeConfig: () => clone(STORE_CONFIG),
  customer: () => customerPayload(),
  customerRewardPoints: () => clone(REWARD_POINTS),
  cart: () => buildCart(),
  getPickupStore: () => ({
    store: PICKUP_STORES.map((store) => ({
      ...store,
      items: db.items.map((item) => ({ qty: 99, quote_id: CART_ID, sku: item.product.sku }))
    }))
  }),
  getRegions: ({ country_id }) => ({
    item: (REGIONS[country_id] || []).map((region) => ({ ...region, __typename: "Region" })),
    __typename: "Regions"
  }),
  getCityByRegionId: ({ region_id }) => ({ item: clone(CITIES[region_id] || []) }),

  createCustomerAddress: (vars) => {
    const address = {
      id: db.nextAddressId++,
      city: vars.city,
      default_billing: true,
      default_shipping: true,
      extension_attributes: [],
      firstname: vars.firstname,
      lastname: vars.lastname,
      postcode: vars.postcode,
      country_code: vars.country_code,
      country: { code: vars.country_code, label: vars.country?.full_name_english || vars.country_code },
      region: {
        region: (REGIONS[vars.country_code] || []).find((r) => r.region_id === vars.region_id)?.name || vars.region,
        region_code: vars.region_code || vars.region
      },
      street: [vars.street],
      telephone: vars.telephone,
      longitude: vars.longitude || null,
      latitude: vars.latitude || null
    };
    db.addresses.push(address);
    setDefaultAddress(address.id);
    return clone(address);
  },

  updateCustomerAddress: ({ address_id }) => {
    const address = db.addresses.find((a) => a.id === address_id) || fail("Address not found.");
    setDefaultAddress(address.id);
    return clone(address);
  },

  setShippingAddressesOnCart: (vars) => {
    if (vars.address_id) {
      const address = db.addresses.find((a) => a.id === vars.address_id) || fail("Address not found.");
      db.shippingAddress = toCartAddress(address);
    } else {
      const regionName = (REGIONS[vars.country_code] || []).find((r) => r.code === vars.region)?.name || vars.region;
      db.shippingAddress = {
        firstname: vars.firstname,
        lastname: vars.lastname,
        street: [vars.street],
        city: vars.city,
        postcode: vars.postcode,
        telephone: vars.telephone,
        company: null,
        region: { code: vars.region, label: regionName },
        country: { code: vars.country_code, label: vars.country?.full_name_english || vars.country_code },
        latitude: vars.latitude || null,
        longitude: vars.longitude || null
      };
    }
    clearPickup();
    db.selectedShipping = null;
    return cartPayload();
  },

  // Billing is always "same as shipping" in this checkout
  setBillingAddressOnCart: () => cartPayload(),

  setShippingMethodsOnCart: ({ carrier_code, method_code }) => {
    const method = availableShippingMethods().find((m) => m.carrier_code === carrier_code && m.method_code === method_code);
    if (!method || !method.available) fail("This shipping method is not available for your cart.");
    db.selectedShipping = { carrier_code, method_code };
    return cartPayload();
  },

  setPaymentMethodOnCart: ({ payment_method }) => {
    const method = PAYMENT_METHODS.find((m) => m.code === payment_method.code) || fail("Payment method not found.");
    db.selectedPayment = method;
    return cartPayload();
  },

  updateExtraFeeOnCart: ({ select_options }) => {
    db.extraFeeOptions = (select_options || []).filter(Boolean);
    return cartPayload();
  },

  setPickupStore: ({ code, extension_attributes }) => {
    const store = PICKUP_STORES.find((s) => s.code === code) || fail("Store not found.");
    db.pickupStore = store;
    db.pickupPerson = {
      name: extension_attributes.pickup_person_name,
      email: extension_attributes.pickup_person_email,
      handphone: extension_attributes.pickup_person_phone
    };
    db.selectedShipping = null;
    db.shippingAddress = {
      firstname: store.name,
      lastname: "",
      street: [store.street],
      city: store.city,
      postcode: store.postcode,
      telephone: store.telephone,
      company: null,
      region: { code: store.region, label: store.region },
      country: { code: "ID", label: "Indonesia" },
      latitude: store.lat,
      longitude: store.long
    };
    // Returns the cart itself, not { cart }, like the real schema
    return buildCart();
  },

  removePickupStore: () => {
    clearPickup();
    db.shippingAddress = null;
    db.selectedShipping = null;
    return buildCart();
  },

  setGuestEmailOnCart: ({ email }) => {
    db.email = email;
    return cartPayload();
  },

  updateCartItems: ({ cart_item_id, quantity }) => {
    const item = db.items.find((i) => String(i.id) === String(cart_item_id)) || fail("Cart item not found.");
    if (quantity > 10) fail("The most you can buy of this item is 10.");
    item.quantity = Math.max(1, quantity);
    return cartPayload();
  },

  applyRewardPointsToCart: () => { db.useRewardPoints = true; return cartPayload(); },
  removeRewardPointsFromCart: () => { db.useRewardPoints = false; return cartPayload(); },
  applyStoreCreditToCart: () => { db.useStoreCredit = true; return cartPayload(); },
  removeStoreCreditFromCart: () => { db.useStoreCredit = false; return cartPayload(); }
};

/**
 * ----------------------------------------------------------------
 * REQUEST HANDLER
 * Same return shape as GQLClientRequest in graphql/client.
 * ----------------------------------------------------------------
 */
const rootFieldsOf = (document) => {
  const operation = (document.definitions || []).find((d) => d.kind === "OperationDefinition");
  if (!operation) return [];
  return operation.selectionSet.selections
    .filter((s) => s.kind === "Field")
    .map((s) => ({ name: s.name.value, key: s.alias ? s.alias.value : s.name.value }));
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 350));

export const mockRequest = async (document, variables = {}) => {
  await delay();
  try {
    const data = {};
    rootFieldsOf(document).forEach(({ name, key }) => {
      const resolver = resolvers[name] || fail(`Demo mode has no mock data for "${name}".`);
      data[key] = resolver(variables);
    });
    if (process.env.NODE_ENV === "development") {
      console.debug("[mock graphql]", Object.keys(data).join(", "), variables, data);
    }
    return { status: "success", data, message: "" };
  } catch (error) {
    return { status: "failed", data: null, message: error.message };
  }
};
