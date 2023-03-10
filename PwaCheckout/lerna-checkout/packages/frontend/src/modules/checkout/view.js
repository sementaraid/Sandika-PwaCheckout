import { useCheckoutContext } from "@app/modules/checkout/store";
import Layout from "@app/modules/checkout/layout";
import {
  ContainerEmail,
  ContainerDelivery,
  ContainerShippingAddress,
  ContainerShippingMethods,
  ContainerPickupForm,
  ContainerPickupLocation,
  ContainerAdditionalFees,
  ContainerPaymentMethods,
  ContainerSummary,
  ContainerPlaceOrder
} from "@app/modules/checkout/container";

const View = () => {
  const [{ SELECTED }] = useCheckoutContext();

  return (
    <Layout>
      <div className="row">
        <div className="col-md-8">
          {/** 
           * ------------------
           * EMAIL SECTION
           * ------------------
          */}
          <ContainerEmail />


          {/** 
           * ------------------
           * DELIVERY SECTION
           * ------------------
          */}
          <ContainerDelivery />


          {/** 
           * ------------------
           * SHIPPING ADDRESS
           * SHIPPING METHODS
           * ------------------
          */}
          {SELECTED.delivery === 0 && <>
            <ContainerShippingAddress />
            <ContainerShippingMethods />
          </>}


          {/** 
           * ------------------
           * PIKCUP METHODS
           * ------------------
          */}
          {SELECTED.delivery === 1 && <>
            <ContainerPickupForm />
            {/* <ContainerPickupLocation /> */}
          </>}


          {/** 
           * ------------------
           * PAYMENT METHODS
           * ------------------
          */}
          <ContainerPaymentMethods />


          {/** 
           * ------------------
           * EXTRA FEE SECTION
           * ------------------
          */}
          <ContainerAdditionalFees />


          {/** 
           * ------------------
           * PLACE ORDER
           * ------------------
          */}
          <ContainerPlaceOrder />
        </div>
        <div className="col-md-4">
          <ContainerSummary />
        </div>
      </div>
    </Layout>
  )
}

export default View;