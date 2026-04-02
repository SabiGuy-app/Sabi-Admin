// import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import {
  MdBarChart,
  MdDashboard,
  MdPerson,
  MdAttachMoney,
} from "react-icons/md";
import { useState, useEffect } from "react";
import Widget from "components/widget/Widget";
import { dashboardAPI } from "services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getDashboardStats();
        console.log("Dashboard Stats:", data);
        setStats(data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);
  return (
    <div>
      {/* SabiGuy Dashboard KPIs */}

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Active Providers"}
          subtitle={loading ? "Loading..." : stats?.users?.providers || "0"}
        />
        <Widget
          icon={<MdPerson className="h-6 w-6" />}
          title={"Active Buyers"}
          subtitle={loading ? "Loading..." : stats?.users?.buyers || "0"}
        />
        <Widget
          icon={<MdPerson className="h-6 w-6" />}
          title={"Active Users"}
          subtitle={loading ? "Loading..." : stats?.users?.total || "0"}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Active Bookings"}
          subtitle={loading ? "Loading..." : stats?.bookings?.active || "0"}
        />
        <Widget
          icon={<MdAttachMoney className="h-6 w-6" />}
          title={"Total Revenue"}
          subtitle={
            loading
              ? "Loading..."
              : `₦${(stats?.revenue?.total || 0).toLocaleString()}`
          }
        />
        {error && (
          <div className="col-span-full rounded-lg bg-red-100 p-4">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}
        {/* <Widget
          icon={<MdStar className="h-7 w-7" />}
          title={"Last 30 Days Revenue"}
          subtitle={
            loading
              ? "Loading..."
              : `₦${(stats?.revenue?.last30Days || 0).toLocaleString()}`
          }
        /> */}
        <Widget
          icon={<MdDashboard className="h-6 w-6" />}
          title={"Pending KYC"}
          subtitle={loading ? "Loading..." : stats?.kyc?.pending || "0"}
        />
      </div>

      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent stats={stats} loading={loading} />
        <WeeklyRevenue stats={stats} loading={loading} />
      </div>

      {/* Tables & Charts */}

      {/* <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div>
          <CheckTable
            columnsData={columnsDataCheck}
            tableData={tableDataCheck}
          />
        </div>


        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard />
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
