import * as Yup from "yup";
import { useFormik } from "formik";
import { useCheckoutContext } from "@app/modules/checkout/store";
import { REFRESH_CART } from "@app/modules/checkout/store/action";
import { GQLClientRequest } from "@app/graphql/client";
import { SCHEMA_UPDATE_EMAIL_ON_CART } from "@app/graphql/schema";

const View = () => {
  const [{ CART }, dispatch] = useCheckoutContext();

  const EMAIL_FORM_SCHEMA = Yup.object().shape({
    email: Yup.string().email().required("Email is required")
  })

  const EMAIL_FORM = useFormik({
    enabeReinitialize: true,
    validationSchema: EMAIL_FORM_SCHEMA,
    initialValues: {
      email: CART.email
    },
    onSubmit: async (value) => {
      try {
        const response_UpdateGuestEmail = await GQLClientRequest(SCHEMA_UPDATE_EMAIL_ON_CART, { cart_id: CART.id, email: value.email })
        if (!response_UpdateGuestEmail) { throw new response_UpdateGuestEmail }

        return dispatch(REFRESH_CART({
          cart: response_UpdateGuestEmail.data.setGuestEmailOnCart.cart
        }))
      }
      catch (err) {
        console.log(err)
      }
    }
  })

  return (
    <div className="container-email">
      <div className="block">
        <div className="block-title">
          <h4>Email</h4>
        </div>
        <div className="block-content">
          <form className="form-inline" onSubmit={EMAIL_FORM.handleSubmit}>
            <div className="form-group mr-sm-3">
              <label htmlFor="email" className="sr-only">Email</label>
              <input type="email" className="form-control" id="email" placeholder={CART.email || "example@gmail.com"} onChange={EMAIL_FORM.handleChange} />
            </div>
            <button type="submit" className="btn btn-primary">Confirm email</button>
          </form>
          <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
        </div>
      </div>
    </div>
  )
};

export default View;