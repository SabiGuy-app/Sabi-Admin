import Card from "components/card";
import BarChart from "components/charts/BarChart";
import {
  barChartDataWeeklyRevenue,
  barChartOptionsWeeklyRevenue,
} from "variables/charts";
import { MdBarChart } from "react-icons/md";

const WeeklyRevenue = ({ stats, loading }) => {
  const last7DaysRevenue = stats?.revenue?.last7Days || 0;
  const displayRevenue = loading
    ? "Loading..."
    : `₦${last7DaysRevenue.toLocaleString()}`;

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center dark:bg-navy-800">
      <div className="mb-auto flex items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Last 7 Days Revenue
          </h2>
          <p className="mt-2 text-3xl font-bold text-brand-600 dark:text-brand-400">
            {displayRevenue}
          </p>
        </div>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-brand-100 p-2 text-brand-500 !transition !duration-200 hover:bg-brand-200 active:bg-brand-300 dark:bg-brand-700/30 dark:text-brand-400 dark:hover:bg-brand-700/50 dark:active:bg-brand-700">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="md:mt-16 lg:mt-0">
        <div className="h-[250px] w-full xl:h-[350px]">
          <BarChart
            chartData={barChartDataWeeklyRevenue}
            chartOptions={barChartOptionsWeeklyRevenue}
          />
        </div>
      </div>
    </Card>
  );
};

export default WeeklyRevenue;
