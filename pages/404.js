import Footer from "../components/footer";
import Header from "../components/header";
import Meta from "../components/meta";
import Error from "../components/error";

export default function Custom404() {
  return (
    <div>
      <Meta title="Not found" />
      <Header />
      <Error
        title="Not Found"
        message="Oops! It looks like the page you were trying to reach couldn't be found."
      />
      <Footer />
    </div>
  );
}
