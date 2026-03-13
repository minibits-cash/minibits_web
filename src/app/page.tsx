import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WalletSection from "@/components/WalletSection";
import MintSection from "@/components/MintSection";
import IpponSection from "@/components/IpponSection";
import NostrSectionLoader from "@/components/NostrSectionLoader";
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
        <NostrSectionLoader />
      </main>
      <Footer />
    </>
  );
}
