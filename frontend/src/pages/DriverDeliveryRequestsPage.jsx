import Navbar from "../components/Navbar";
import DriverDeliveryRequestsWindow from "../components/DriverDeliveryRequestsWindow";

const DriverDeliveryRequestsPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <DriverDeliveryRequestsWindow />
      </div>
    </>
  );
};

export default DriverDeliveryRequestsPage;
