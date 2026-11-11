/**
 * ----------------------------------------------------------------
 * SAMPLE DATA FOR DEMO MODE
 * ----------------------------------------------------------------
 * Shapes follow the Swift / Magento GraphQL responses that the
 * schemas in `src/graphql/schema` ask for. All names, addresses and
 * prices are made up for the portfolio demo.
 */

const CURRENCY = "IDR";
const ASSET_BASE = `${process.env.PUBLIC_URL || ""}/demo/`;

export const money = (value) => ({ value, currency: CURRENCY });

export const STORE_CONFIG = {
  secure_base_media_url: ASSET_BASE,
  secure_base_static_url: ASSET_BASE,
  customer_password_minimum_password_length: "8",
  customer_password_required_character_classes_number: "3",
  base_media_url: ASSET_BASE,
  base_static_url: ASSET_BASE,
  base_url: "#",
  base_currency_code: CURRENCY,
  code: "default",
  catalog_search_engine: "elasticsearch7",
  copyright: "Sandika Demo Store",
  catalog_default_sort_by: "position",
  category_url_suffix: ".html",
  default_title: "Sandika Demo Store",
  default_keywords: "",
  default_description: "",
  default_display_currency_code: CURRENCY,
  date_of_birth: "optional",
  gender: "optional",
  header_logo_src: "sandika.svg",
  head_shortcut_icon: "",
  icube_pinlocation_gmap_key: "",
  locale: "id_ID",
  logo_alt: "Sandika",
  logo_width: 160,
  logo_height: 40,
  store_name: "Sandika Demo Store",
  welcome: "Selamat datang",
  timezone: "Asia/Jakarta",
  title_prefix: "",
  title_suffix: "",
  title_separator: "-",
  website_id: 1,
  weight_unit: "kgs",
  oauth_access_token_lifetime_customer: 1,
  // Groups for the shipping and payment accordions: "group": "carrier_method,..."
  shipments_configuration: JSON.stringify({
    "sg-regular": "jne_reg,sicepat_reg,anteraja_reg",
    "sg-express": "jne_yes,gosend_sameday",
    "sg-freeshipping": "freeshipping_freeshipping"
  }),
  payments_configuration: JSON.stringify({
    "pg-virtual account": "bca_va,bni_va,mandiri_va",
    "pg-e-wallet": "gopay,shopeepay",
    "pg-credit card": "credit_card"
  }),
  snap_client_key: "",
  allow_guest_checkout: true,
  snap_is_production: "0",
  aw_blog_general_enabled: false,
  pickup_store: true,
  cookie_restriction: false,
  global_promo: { enable: false, text_color: "", background_color: "" },
  weltpixel_newsletter_general_enable: "0",
  weltpixel_newsletter_general_version: "",
  weltpixel_newsletter_general_overlay_color: "",
  weltpixel_newsletter_general_overlay_opacity: "",
  weltpixel_newsletter_general_display_mode: "",
  weltpixel_newsletter_general_display_mobile: "",
  weltpixel_newsletter_general_mobile_version: "",
  weltpixel_newsletter_general_popup_cookie_lifetime: "",
  weltpixel_newsletter_general_terms_conditions_consent: "",
  weltpixel_newsletter_general_terms_conditions_text: "",
  weltpixel_newsletter_general_enable_trigger_button: "",
  weltpixel_newsletter_general_trigger_button_title: "",
  weltpixel_newsletter_general_trigger_button_color: "",
  weltpixel_newsletter_general_trigger_button_backgroundcolor: "",
  aw_blog_general_comments_enabled: false,
  aw_blog_general_disqus_forum_code: "",
  aw_blog_related_products_block_layout: "",
  aw_blog_related_products_block_position: "",
  aw_blog_related_products_products_limit: 0,
  aw_blog_related_products_display_add_to_cart: false,
  weltpixel_RecentlyViewedBar_general_enable: "0",
  weltpixel_thankyoupage_create_account_enable: "0"
};

export const CUSTOMER = {
  firstname: "Ayu",
  lastname: "Lestari",
  email: "ayu.lestari@example.com"
};

export const CUSTOMER_ADDRESSES = [
  {
    id: 101,
    city: "Kota Yogyakarta",
    default_billing: true,
    default_shipping: true,
    extension_attributes: [],
    firstname: "Ayu",
    lastname: "Lestari",
    postcode: "55223",
    country_code: "ID",
    country: { code: "ID", label: "Indonesia" },
    region: { region: "DI Yogyakarta", region_code: "YO" },
    street: ["Jl. Kaliurang Km 5 No. 12, Caturtunggal"],
    telephone: "081234567890",
    longitude: "110.3780",
    latitude: "-7.7590"
  },
  {
    id: 102,
    city: "Jakarta Selatan",
    default_billing: false,
    default_shipping: false,
    extension_attributes: [],
    firstname: "Ayu",
    lastname: "Lestari",
    postcode: "12190",
    country_code: "ID",
    country: { code: "ID", label: "Indonesia" },
    region: { region: "DKI Jakarta", region_code: "JK" },
    street: ["Jl. Jend. Sudirman Kav. 52-53, Senayan (kantor)"],
    telephone: "081234567890",
    longitude: "106.8106",
    latitude: "-6.2253"
  }
];

export const STORE_CREDIT = {
  enabled: true,
  current_balance: money(50000)
};

export const REWARD_POINTS = {
  balance: 2500,
  balanceCurrency: 25000,
  formatedBalanceCurrency: "Rp 25.000",
  formatedSpendRate: "100 points = Rp 1.000",
  spendRate: 10,
  transaction_history: {
    total_count: 2,
    page_info: { current_page: 1, page_size: 10, total_pages: 1 },
    items: [
      { balance: 2500, comment: "Order #100000231", expirationDate: "2027-05-01", points: 1300, transactionDate: "2026-10-02", transactionId: 2 },
      { balance: 1200, comment: "Order #100000198", expirationDate: "2027-03-14", points: 1200, transactionDate: "2026-08-14", transactionId: 1 }
    ]
  }
};

const product = (id, name, sku, category, image) => ({
  id,
  name,
  categories: [{ name: category }],
  url_key: sku.toLowerCase(),
  sku,
  stock_status: "IN_STOCK",
  small_image: { url: `${ASSET_BASE}products/${image}`, label: name }
});

export const CART_ITEMS = [
  {
    id: "501",
    quantity: 1,
    price: 349000,
    configurable_options: [{ option_label: "Size", value_label: "L" }],
    product: product(11, "Kemeja Batik Parang Kawung", "BTK-PRG-L", "Fashion", "batik.svg")
  },
  {
    id: "502",
    quantity: 1,
    price: 275000,
    product: product(12, "Tote Bag Anyaman Rotan", "TAS-RTN-01", "Accessories", "rotan.svg")
  },
  {
    id: "503",
    quantity: 2,
    price: 89000,
    product: product(13, "Kopi Arabika Gayo 250 g", "KOPI-GAYO-250", "Food & Drink", "kopi.svg")
  },
  {
    id: "504",
    quantity: 1,
    price: 65000,
    product: product(14, "Lilin Aromaterapi Sereh", "LLN-SRH-01", "Home", "lilin.svg")
  }
];

// carrier_method identifiers match `shipments_configuration` above
export const SHIPPING_METHODS = [
  { carrier_code: "jne", method_code: "reg", carrier_title: "JNE", method_title: "Reguler (2-3 hari)", price: 18000 },
  { carrier_code: "sicepat", method_code: "reg", carrier_title: "SiCepat", method_title: "REG (2-3 hari)", price: 16000 },
  { carrier_code: "anteraja", method_code: "reg", carrier_title: "AnterAja", method_title: "Reguler (2-4 hari)", price: 15000 },
  { carrier_code: "jne", method_code: "yes", carrier_title: "JNE", method_title: "YES (1 hari)", price: 32000 },
  { carrier_code: "gosend", method_code: "sameday", carrier_title: "GoSend", method_title: "Same Day", price: 28000 },
  { carrier_code: "freeshipping", method_code: "freeshipping", carrier_title: "Free Shipping", method_title: "Min. belanja Rp 500.000", price: 0, minSubtotal: 500000 }
];

export const PAYMENT_METHODS = [
  { code: "bca_va", title: "BCA Virtual Account" },
  { code: "bni_va", title: "BNI Virtual Account" },
  { code: "mandiri_va", title: "Mandiri Virtual Account" },
  { code: "gopay", title: "GoPay" },
  { code: "shopeepay", title: "ShopeePay" },
  { code: "credit_card", title: "Credit Card" }
];

export const EXTRA_FEES = [
  {
    enabled: true,
    fee_name: "Packaging",
    frontend_type: "radio",
    id_fee: "1",
    options: [
      { default: true, label: "Standard box", option_id: "1", price: 0 },
      { default: false, label: "Gift wrap", option_id: "2", price: 15000 }
    ]
  },
  {
    enabled: true,
    fee_name: "Protection",
    frontend_type: "checkbox",
    id_fee: "2",
    options: [
      { default: false, label: "Shipping insurance", option_id: "3", price: 5000 }
    ]
  }
];

export const MEMBER_DISCOUNT = { label: "Member discount 5%", rate: 0.05 };

export const PICKUP_STORES = [
  {
    code: "YK01",
    name: "Sandika Malioboro",
    street: "Jl. Malioboro No. 60",
    city: "Kota Yogyakarta",
    region: "DI Yogyakarta",
    zone: "Jawa",
    telephone: "0274 512345",
    postcode: "55271",
    lat: "-7.7926",
    long: "110.3658",
    country_id: "ID"
  },
  {
    code: "YK02",
    name: "Sandika Jakal",
    street: "Jl. Kaliurang Km 7,5 No. 3",
    city: "Sleman",
    region: "DI Yogyakarta",
    zone: "Jawa",
    telephone: "0274 887766",
    postcode: "55581",
    lat: "-7.7447",
    long: "110.3818",
    country_id: "ID"
  },
  {
    code: "JK01",
    name: "Sandika Kemang",
    street: "Jl. Kemang Raya No. 18",
    city: "Jakarta Selatan",
    region: "DKI Jakarta",
    zone: "Jawa",
    telephone: "021 7190011",
    postcode: "12730",
    lat: "-6.2607",
    long: "106.8133",
    country_id: "ID"
  }
];

export const REGIONS = {
  ID: [
    { code: "YO", name: "DI Yogyakarta", region_id: 500 },
    { code: "JK", name: "DKI Jakarta", region_id: 501 },
    { code: "JB", name: "Jawa Barat", region_id: 502 },
    { code: "BA", name: "Bali", region_id: 503 }
  ],
  SG: [
    { code: "SG", name: "Singapore", region_id: 600 }
  ],
  US: [
    { code: "CA", name: "California", region_id: 12 },
    { code: "NY", name: "New York", region_id: 43 }
  ]
};

export const CITIES = {
  500: [
    { id: 1, city: "Kota Yogyakarta", postcode: "55223" },
    { id: 2, city: "Sleman", postcode: "55581" },
    { id: 3, city: "Bantul", postcode: "55711" }
  ],
  501: [
    { id: 4, city: "Jakarta Selatan", postcode: "12190" },
    { id: 5, city: "Jakarta Pusat", postcode: "10110" }
  ],
  502: [
    { id: 6, city: "Bandung", postcode: "40111" },
    { id: 7, city: "Bogor", postcode: "16111" }
  ],
  503: [
    { id: 8, city: "Denpasar", postcode: "80111" },
    { id: 9, city: "Badung", postcode: "80351" }
  ],
  600: [
    { id: 10, city: "Singapore", postcode: "018956" }
  ],
  12: [
    { id: 11, city: "San Francisco", postcode: "94103" }
  ],
  43: [
    { id: 12, city: "New York", postcode: "10001" }
  ]
};
