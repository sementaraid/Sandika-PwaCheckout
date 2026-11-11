import * as Yup from "yup";
import { useFormik } from "formik";
import { useState } from "react";
import { useAlert } from "react-alert";
import { GQLClientRequest } from "@app/graphql/client";
import Autocomplete from "react-autocomplete";
import GoogleMaps from "@app/components/google_maps"
import { useCheckoutContext } from "@app/modules/checkout/store";
import { COUNTRY_OPTIONS } from "@app/modules/checkout/container/shipping_addresses/country.json";
import { UPDATE_CUSTOMER_DEFAULT_ADDRESS, REFRESH_CART } from "@app/modules/checkout/store/action";
import {
  SCHEMA_GET_REGIONS,
  SCHEMA_GET_CITIES,
  SCHEMA_CREATE_CUSTOMER_ADDRESS,
  SCHEMA_CREATE_GUEST_ADDRESS,
  SCHEMA_CUSTOMER,
  SCHEMA_UPDATE_SHIPPING_ADDRESS_ON_CART,
  SCHEMA_UPDATE_GUEST_SHIPPING_ADDRESS_ON_CART
} from "@app/graphql/schema";
import {
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";


const AddAddressForm = ({ data }) => {
  const alert = useAlert();
  const [{ STORE_CONFIG, CART, IS_LOGIN }, dispatch] = useCheckoutContext();
  const [mapPosition, setMapPosition] = useState({
    lat: '-6.197361',
    lng: '106.774535',
  });
  const onDragPosition = (value) => {
    return setMapPosition(value);
  };

  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);

  const ADDRESS_FORM_SCHEMA = Yup.object().shape({
    firstname: Yup.string().required("Required"),
    lastname: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    state: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
    street: Yup.string().required("Required"),
    phone: Yup.string().required("Required"),
    postcode: Yup.string().required("Required")
  })

  const ADDRESS_FORM = useFormik({
    validationShcema: ADDRESS_FORM_SCHEMA,
    initialValues: {
      firstname: "",
      lastname: "",
      country: "",
      state: "",
      street: "",
      city: "",
      phone: "",
      postcode: ""
    },
    onSubmit: async (values) => {
      const region_id = regions.filter((data) => data.label === values.state)[0].id;
      const region_code = regions.filter((data) => data.label === values.state)[0].code;
      const country_id = COUNTRY_OPTIONS.filter((data) => data.label === values.country)[0].id;

      const body = {
        firstname: values.firstname,
        lastname: values.lastname,
        telephone: values.phone,
        street: values.street,
        country: {
          id: country_id,
          full_name_locale: values.country,
          full_name_english: values.country
        },
        country_code: country_id,
        region: region_code,
        region_code: region_code,
        region_id: region_id,
        city: values.city,
        postcode: values.postcode,
        maps: "",
        default_shipping_billing: true,
        default_billing: true,
        default_shipping: true,
        address_id: null,
        latitude: mapPosition.latitude,
        longitude: mapPosition.longitude,
        cart_id: CART.id
      };


      try {
        if (IS_LOGIN) {
          const response_CreateAddress = await GQLClientRequest(SCHEMA_CREATE_CUSTOMER_ADDRESS, body);
          if (response_CreateAddress.status === "failed") { throw response_CreateAddress };

          const response_UpdateAddressOnCart = await GQLClientRequest(SCHEMA_UPDATE_SHIPPING_ADDRESS_ON_CART, {
            cart_id: CART.id,
            address_id: response_CreateAddress.data.createCustomerAddress.id
          })
          if (response_UpdateAddressOnCart.status === "failed") { throw response_UpdateAddressOnCart };

          const result_FetchCustomerAddress = await GQLClientRequest(SCHEMA_CUSTOMER);
          if (result_FetchCustomerAddress.status === "failed") { throw result_FetchCustomerAddress }

          dispatch(UPDATE_CUSTOMER_DEFAULT_ADDRESS({
            cart: response_UpdateAddressOnCart.data.setBillingAddressOnCart.cart,
            customerData: result_FetchCustomerAddress.data.customer
          }))
        }
        else {
          const response_CreateGuestAddress = await GQLClientRequest(SCHEMA_CREATE_GUEST_ADDRESS, body);
          if (response_CreateGuestAddress.status === "failed") { throw response_CreateGuestAddress };

          const response_UpdateGuestAddressOnCart = await GQLClientRequest(SCHEMA_UPDATE_GUEST_SHIPPING_ADDRESS_ON_CART, {
            cart_id: CART.id,
            ...body
          })
          if (response_UpdateGuestAddressOnCart.status === "failed") { throw response_UpdateGuestAddressOnCart };

          dispatch(REFRESH_CART(response_UpdateGuestAddressOnCart.data.setBillingAddressOnCart.cart))
        }


        return setOpen(false)
      }
      catch (err) {
        alert.error(err.message);
      }
    }
  })

  const onToggleModal = () => {
    return setOpen(!open)
  }

  const onCountryChange = async (value) => {
    const country_id = COUNTRY_OPTIONS.filter((data) => data.label === value)[0].id
    ADDRESS_FORM.setFieldValue("country", value);
    GQLClientRequest(SCHEMA_GET_REGIONS, { country_id: country_id }).then(({ data: { getRegions } }) => {
      setRegions(getRegions.item.map((data) => ({ code: data.code, label: data.name, id: data.region_id })))
      return;
    });
  }

  const onStateChange = async (value) => {
    const region_id = regions.filter((data) => data.label === value)[0].id
    ADDRESS_FORM.setFieldValue("state", value);
    GQLClientRequest(SCHEMA_GET_CITIES, { region_id: region_id }).then(({ data: { getCityByRegionId } }) => {
      setCities(getCityByRegionId.item.map((data) => ({ id: data.id, label: data.city, postcode: data.postcode })))
      return;
    });
  }

  const onCityChange = async (value) => {
    const postcode = cities.filter((data) => data.label === value)[0].postcode
    ADDRESS_FORM.setFieldValue("city", value);
    ADDRESS_FORM.setFieldValue("postcode", postcode);
    return;
  }


  return (
    <>
      <button className="btn btn-primary" onClick={onToggleModal}>Add Address</button>
      <Modal size="lg" centered isOpen={open} toggle={onToggleModal} className="address-form-modal">
        <ModalHeader tag="h6" toggle={onToggleModal}>
          Address Form
        </ModalHeader>
        <ModalBody>
          <form onSubmit={ADDRESS_FORM.handleSubmit}>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="firstname">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstname"
                  id="firstname"
                  onChange={ADDRESS_FORM.handleChange} />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="lastname">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastname"
                  id="lastname"
                  onChange={ADDRESS_FORM.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="street">Street</label>
              <input
                type="text"
                className="form-control"
                name="street"
                id="street"
                placeholder="1234 Main St"
                onChange={ADDRESS_FORM.handleChange}
                autoComplete="off" />
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="country">Country</label>
                <div className="form-group mb-0">
                  <Autocomplete
                    className="form-control"
                    getItemValue={(data) => data.label}
                    items={COUNTRY_OPTIONS}
                    shouldItemRender={(item, value) => {
                      if (!value) { return item }
                      return item.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
                    }}
                    renderItem={(item, isHighlighted) => {
                      return <div className="dropdown-item" style={{
                        background: isHighlighted ? '#007bff' : 'white',
                        color: isHighlighted ? "white" : "black"
                      }} key={item.id}>
                        {item.label}
                      </div>
                    }}
                    renderMenu={children => (
                      <div className="autocomplete-menu">
                        {children}
                      </div>
                    )}
                    value={ADDRESS_FORM.values.country || ""}
                    onChange={(e) => { ADDRESS_FORM.setFieldValue("country", e.target.value) }}
                    onSelect={(val) => { onCountryChange(val) }}
                    wrapperStyle={{
                      width: "100%",
                      position: "relative"
                    }}
                    inputProps={{
                      className: "form-control"
                    }}
                  />
                </div>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="state">State/Province</label>
                <Autocomplete
                  className="form-control mb-0"
                  getItemValue={(data) => data.label}
                  items={regions}
                  shouldItemRender={(item, value) => {
                    if (!value) { return item }
                    return item.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
                  }}
                  renderItem={(item, isHighlighted) => {
                    return <div className="dropdown-item" style={{
                      background: isHighlighted ? '#007bff' : 'white',
                      color: isHighlighted ? "white" : "black"
                    }} key={item.id}>
                      {item.label}
                    </div>
                  }}
                  renderMenu={children => (
                    <div className="autocomplete-menu">
                      {children}
                    </div>
                  )}
                  value={ADDRESS_FORM.values.state || ""}
                  onChange={(e) => { ADDRESS_FORM.setFieldValue("state", e.target.value) }}
                  onSelect={(val) => { onStateChange(val) }}
                  wrapperStyle={{
                    width: "100%",
                    position: "relative"
                  }}
                  inputProps={{
                    className: "form-control"
                  }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-12">
                <label htmlFor="state">City</label>
                <Autocomplete
                  className="form-control mb-0"
                  getItemValue={(data) => data.label}
                  items={cities}
                  shouldItemRender={(item, value) => {
                    if (!value) { return item }
                    return item.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
                  }}
                  renderItem={(item, isHighlighted) => {
                    return <div className="dropdown-item" style={{
                      background: isHighlighted ? '#007bff' : 'white',
                      color: isHighlighted ? "white" : "black"
                    }} key={item.id}>
                      {item.label}
                    </div>
                  }}
                  renderMenu={children => (
                    <div className="autocomplete-menu">
                      {children}
                    </div>
                  )}
                  value={ADDRESS_FORM.values.city || ""}
                  onChange={(e) => { ADDRESS_FORM.setFieldValue("city", e.target.value) }}
                  onSelect={(val) => { onCityChange(val) }}
                  wrapperStyle={{
                    width: "100%",
                    position: "relative"
                  }}
                  inputProps={{
                    className: "form-control"
                  }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="postcode">Post Code</label>
                <input type="text" className="form-control" name="postcode" id="postcode" value={ADDRESS_FORM.values.postcode} readOnly />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="phone">Phone</label>
                <input type="text" className="form-control" name="phone" id="phone" onChange={ADDRESS_FORM.handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-12 google-maps">
                {STORE_CONFIG.icube_pinlocation_gmap_key && <GoogleMaps
                  gmap_key={STORE_CONFIG.icube_pinlocation_gmap_key}
                  mapPosition={mapPosition}
                  dragMarkerDone={onDragPosition}
                />}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export default AddAddressForm;