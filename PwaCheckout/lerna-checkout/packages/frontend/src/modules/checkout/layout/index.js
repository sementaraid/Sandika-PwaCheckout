import { useCheckoutContext } from "@app/modules/checkout/store";
import { IS_DEMO } from "@app/helper/demo";

const Layout = ({ children }) => {

  const [STATE] = useCheckoutContext();
  const logoUrl = STATE.STORE_CONFIG.base_media_url + 'logo/' + STATE.STORE_CONFIG.header_logo_src;

  return (
    <div className="sandika">
      {IS_DEMO && <div className="demo-notice">Demo mode: sample data, no real orders or payments.</div>}
      <div className="header">
        <a href={STATE.STORE_CONFIG.base_url}>
          <img src={logoUrl} className="logo" />
        </a>
      </div>
      <div className="maincontent">
        {children}
      </div>
    </div>
  )
};

export default Layout;