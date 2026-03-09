import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WalletSection from "@/components/WalletSection";
import MintSection from "@/components/MintSection";
import SupportSection from "@/components/SupportSection";
import IpponSection from "@/components/IpponSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WalletSection />
        <MintSection />        
        <IpponSection />
        {/*<SupportSection />*/}
      </main>
      <Footer />
    </>
  );
}
