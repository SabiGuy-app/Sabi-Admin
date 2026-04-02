import React from "react";
import {
  MdArrowDropUp,
  MdOutlineCalendarToday,
  MdBarChart,
} from "react-icons/md";
import Card from "components/card";
import {
  lineChartDataTotalSpent,
  lineChartOptionsTotalSpent,
} from "variables/charts";
import LineChart from "components/charts/LineChart";

const TotalSpent = ({ stats, loading }) => {
  const totalRevenue = stats?.revenue?.total || 0;
  const last7DaysRevenue = stats?.revenue?.last7Days || 0;
  const displayRevenue = loading
    ? "Loading..."
    : `₦${totalRevenue.toLocaleString()}`;

  return (
    <Card extra="!p-[20px] text-center">
      <div className="flex justify-between">
        <button className="linear mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand-100 p-2 text-brand-600 transition duration-200 hover:cursor-pointer hover:bg-brand-200 active:bg-brand-300 dark:bg-brand-700/30 dark:text-brand-400 dark:hover:opacity-90 dark:active:opacity-80">
          <MdOutlineCalendarToday />
          <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
            This month
          </span>
        </button>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-brand-100 p-2 text-brand-500 !transition !duration-200 hover:bg-brand-200 active:bg-brand-300 dark:bg-brand-700/30 dark:text-brand-400 dark:hover:bg-brand-700/50 dark:active:bg-brand-700">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="flex flex-col">
          <p className="mt-[20px] text-3xl font-bold text-brand-600 dark:text-brand-400">
            {displayRevenue}
          </p>
          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Total Revenue
            </p>
            <div className="flex flex-row items-center justify-center">
              <MdArrowDropUp className="font-medium text-brand-500" />
              <p className="text-sm font-bold text-brand-500">
                {" "}
                {last7DaysRevenue > 0 ? "+2.45%" : "0%"}{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="h-full w-full">
          <LineChart
            options={lineChartOptionsTotalSpent}
            series={lineChartDataTotalSpent}
          />
        </div>
      </div>
    </Card>
  );
};

export default TotalSpent;
