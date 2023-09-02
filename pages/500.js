import Footer from "../components/footer";
import Header from "../components/header";
import Meta from "../components/meta";
import Error from "../components/error";

export default function Custom500() {
  return (
    <div>
      <Meta title="Something Went Wrong!" />
      <Header />
      <Error
        title="Something Went Wrong!"
        message="This error page is displayed when the requested page cannot be found or accessed due to an error."
      />
      <Footer />
    </div>
  );
}
