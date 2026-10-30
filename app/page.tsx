import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Cycle from "@/components/Cycle";
import Services from "@/components/Services";
import Integrations from "@/components/Integrations";
import Control from "@/components/Control";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Problem />
        <Cycle />
        <Services />
        <Integrations />
        <Control />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
