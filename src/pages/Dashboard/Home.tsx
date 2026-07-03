import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import westepLogo from "../../assets/westep-logo.png";
import westepDarkLogo from "../../assets/westep-logo-dark.png";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Westep Superadmin Boshqaruv paneli"
        description="Westep superadmin boshqaruv paneli"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-brand-500">Westep</p>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Superadmin boshqaruv paneli
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tizim, rollar va biznes domen bog'lanishlarini shu yerdan boshqarasiz.
                </p>
              </div>
              <img
                src={westepDarkLogo}
                alt="Westep Logo"
                className="h-14 w-auto object-contain dark:hidden"
              />
              <img
                src={westepLogo}
                alt="Westep Logo"
                className="hidden h-14 w-auto object-contain dark:block"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
