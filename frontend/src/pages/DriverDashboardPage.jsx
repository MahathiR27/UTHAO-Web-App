import DriverDashboardWindow from "../components/DriverDashboardWindow";
import Navbar from "../components/Navbar";

const DriverDashboardPage = () => {
  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-4">
        <DriverDashboardWindow />
      </div>
    </div>
  );
};

export default DriverDashboardPage;
