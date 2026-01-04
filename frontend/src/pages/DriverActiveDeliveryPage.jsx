import Navbar from "../components/Navbar";
import DriverActiveDeliveryWindow from "../components/DriverActiveDeliveryWindow";

const DriverActiveDeliveryPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <DriverActiveDeliveryWindow />
      </div>
    </>
  );
};

export default DriverActiveDeliveryPage;
