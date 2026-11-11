import { useState, useRef, Fragment } from "react";
import { useAlert } from "react-alert";
import { useCheckoutContext } from "@app/modules/checkout/store";
import { useCurrency } from "@app/helper/useCurrency";
import { GQLClientRequest } from "@app/graphql/client";
import { REFRESH_CART_ON_EXTRAFEE_CHANGE } from "@app/modules/checkout/store/action";
import { SCHEMA_UPDATE_EXTRAFEE_ON_CART } from "@app/graphql/schema";


const Type_CheckBox = ({
  title,
  options,
  applied_extra_fee,
  disabled,
  onUpdateExtraFee,
  handleExtraFeeRefValue,
  id_fee
}) => {
  const currency = useCurrency()
  const typeCheckBoxRefs = useRef(new Array(options.length).fill(null));
  const body = useRef(applied_extra_fee.map(data => ({ label: data.label, option_id: data.option_id })))

  const handleChecked = (value, key, id_fee) => {
    if (typeCheckBoxRefs.current[key].checked) {
      body.current[key] = JSON.parse(value)
    } else {
      body.current[key] = null
    }
    const payload = body.current.filter(data => data !== null).length > 0 ? body.current.filter(data => data !== null) : null
    return handleExtraFeeRefValue(payload, id_fee)
  }

  return (
    <>
      <div className="option">
        <div className="option-title">{title}</div>
        <div className="option-content">
          {options.map((option, key) => (
            <div className="form-row" key={key}>
              <div className="form-group col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    className="form-check-input"
                    name={`${option.label}`}
                    id={`${option.label}_${option.option_id}`}
                    value={JSON.stringify({
                      label: option.label,
                      option_id: option.option_id
                    })}
                    ref={(el) => typeCheckBoxRefs.current[key] = el}
                    onChange={(e) => handleChecked(e.target.value, key, id_fee)}
                    defaultChecked={applied_extra_fee.filter(data => data.label === option.label).length > 0}
                  />
                  <label className="form-check-label" htmlFor={`${option.label}_${option.option_id}`}>
                    {option.label} {currency.format(option.price)}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const Type_Dropdown = ({
  title,
  options,
  applied_extra_fee,
  disabled,
  onUpdateExtraFee,
  handleExtraFeeRefValue,
  id_fee
}) => {
  const currency = useCurrency()
  const typeDropdownRefs = useRef(null);
  const body = useRef(applied_extra_fee.map(data => ({ label: data.label, option_id: data.option_id })))

  const handleChange = (value, id_fee) => {
    const data = value.length > 0 ? [JSON.parse(typeDropdownRefs.current.value)] : [];
    return handleExtraFeeRefValue(data, id_fee)
  }

  return (
    <>
      <div className="option">
        <div className="option-title">{title}</div>
        <div className="option-content">
          <div className="form-row">
            <div className="form-group col-md-6">
              <select
                className="form-control"
                name={`${title}`}
                id={`${title}`}
                onChange={(e) => handleChange(e.target.value, id_fee)}
                ref={typeDropdownRefs}
                defaultValue={applied_extra_fee.length > 0 ? JSON.stringify(applied_extra_fee.map(data => ({ label: data.label, option_id: data.option_id }))[0]) : "[]"}
              >
                <option value={``}></option>
                {options.map((option, key) => (
                  <option
                    key={key}
                    value={JSON.stringify({
                      label: option.label,
                      option_id: option.option_id
                    })}
                  >{option.label} {currency.format(option.price)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}


const Type_Radio = ({ title, options, applied_extra_fee, disabled, onUpdateExtraFee }) => {
  const currency = useCurrency()
  const typeRadioRefs = useRef(new Array(options.length).fill(null));

  const handleChange = (key, value) => {
    const data = typeRadioRefs.current
      .filter((element) => element.checked)
      .map((element) => element.value)

    const temp = applied_extra_fee.filter(applied => applied.option_id !== data.map(
      data => JSON.parse(data)
    ).filter(data => data.option_id !== JSON.parse(value).option_id)[0].option_id)

    const payload = temp.concat([JSON.parse(value)]).map((data) => (JSON.stringify({
      label: data.label,
      option_id: data.option_id
    }))).map((data => JSON.parse(data)));

    return onUpdateExtraFee(payload)
  }

  return (
    <>
      <div className="option">
        <div className="option-title">{title}</div>
        <div className="option-content">
          {options.map((option, key) => (
            <div className="form-row" key={key}>
              <div className="form-group col-md-6">
                <div className="form-check">
                  <input
                    type="radio"
                    disabled={disabled}
                    className="form-check-input"
                    name={`${option.label}_${option.option_id}`}
                    id={`${option.label}_${option.option_id}`}
                    value={JSON.stringify({
                      label: option.label,
                      option_id: option.option_id
                    })}
                    ref={(el) => typeRadioRefs.current[key] = el}
                    checked={applied_extra_fee.filter(data => data.label === option.label).length > 0}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={`${option.label}_${option.option_id}`}>{option.label} {currency.format(option.price)}</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>

  )
}


const View = ({ extra_fee, applied_extra_fee, cart_id }) => {
  const [_, dispatch] = useCheckoutContext();
  const extraFeeRef = useRef(new Array(extra_fee.length).fill(null))
  const [loading, setLoading] = useState(false);
  const alert = useAlert();

  const onUpdateExtraFee = async (payload) => {
    setLoading(true)
    try {
      const body = {
        cart_id: cart_id,
        select_options: payload.filter(data => data)
      }
      const response_UpdateExtraFeeOnCart = await GQLClientRequest(SCHEMA_UPDATE_EXTRAFEE_ON_CART, body)
      if (!response_UpdateExtraFeeOnCart) { throw response_UpdateExtraFeeOnCart }
      dispatch(REFRESH_CART_ON_EXTRAFEE_CHANGE({
        cart: response_UpdateExtraFeeOnCart.data.updateExtraFeeOnCart.cart
      }))
    }
    catch (err) {
      alert.error(err.message)
    }
    return setLoading(false)
  }

  const handleExtraFeeRefValue = (data, key) => {
    extraFeeRef.current[key] = data;
    const body = [];
    const clean = extraFeeRef.current.filter(data => data !== null)

    for (var i = 0; i < clean.length; i++) {
      if (clean[i].length > 0) {
        for (var j = 0; j < clean[i].length; j++) {
          body.push(clean[i][j])
        }
      }
      else {
        body.push(clean[i][0])
      }
    }

    return onUpdateExtraFee(body)
  }

  return (
    <div className="extra-fee">
      <div className="extra-fee-content">
        {extra_fee.length > 0 && extra_fee.map((data, key) => (
          <Fragment key={key}>
            {(data.enabled && data.frontend_type === "radio") && <Type_Radio
              title={data.fee_name}
              options={data.options}
              applied_extra_fee={applied_extra_fee}
              onUpdateExtraFee={onUpdateExtraFee}
              disabled={loading}
              id_fee={key}
              handleExtraFeeRefValue={handleExtraFeeRefValue}
              key={key}
            />}
            {(data.enabled && data.frontend_type === "checkbox") && <Type_CheckBox
              title={data.fee_name}
              options={data.options}
              applied_extra_fee={applied_extra_fee}
              onUpdateExtraFee={onUpdateExtraFee}
              disabled={loading}
              id_fee={key}
              handleExtraFeeRefValue={handleExtraFeeRefValue}
              key={key}
            />}
            {(data.enabled && data.frontend_type === "dropdown") && <Type_Dropdown
              title={data.fee_name}
              options={data.options}
              applied_extra_fee={applied_extra_fee}
              onUpdateExtraFee={onUpdateExtraFee}
              disabled={loading}
              id_fee={key}
              handleExtraFeeRefValue={handleExtraFeeRefValue}
              key={key}
            />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

const ContainerExtraFee = () => {
  const [{ CART }] = useCheckoutContext();
  const EXTRA_FEE = CART.addtional_fees.data || [];
  const APPLIED_EXTRA_FEE = CART.applied_extra_fee.select_options || [];

  return <View
    extra_fee={EXTRA_FEE}
    applied_extra_fee={APPLIED_EXTRA_FEE}
    cart_id={CART.id} />
};

export default ContainerExtraFee;