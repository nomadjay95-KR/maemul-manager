import { Suspense } from "react";
import Link from "next/link";
import { fetchProperties } from "@/lib/queries/properties";
import { fetchInquiries } from "@/lib/queries/inquiries";
import { fetchSchedulesByMonth } from "@/lib/queries/schedules";
import {
  fetchMonthlyContracts,
  fetchMonthlyRevenue,
  fetchUpcomingBalances,
  fetchCurrentMonthSummary,
} from "@/lib/queries/statistics";
import PropertyFilter from "@/components/properties/PropertyFilter";
import PropertyCard from "@/components/properties/PropertyCard";
import InquiryFilter from "@/components/inquiries/InquiryFilter";
import InquiryCard from "@/components/inquiries/InquiryCard";
import LockButton from "@/components/properties/LockButton";
import TabNav from "@/components/layout/TabNav";
import EmptyState from "@/components/ui/EmptyState";
import CalendarView from "@/components/calendar/CalendarView";
import SummaryCards from "@/components/statistics/SummaryCards";
import ContractChart from "@/components/statistics/ContractChart";
import RevenueChart from "@/components/statistics/RevenueChart";
import UpcomingBalancesView from "@/components/statistics/UpcomingBalances";

const VALID_PROPERTY_STATUS = ["active", "reserved", "completed"] as const;
const VALID_PROPERTY_TYPE = ["villa", "shop"] as const;
const VALID_INQUIRY_STATUS = ["active", "resolved"] as const;

function parseEnum<T extends string>(value: string | undefined, valid: readonly T[]): T | undefined {
  if (!value) return undefined;
  return valid.includes(value as T) ? (value as T) : undefined;
}

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    type?: string;
    search?: string;
    orderBy?: string;
    year?: string;
    month?: string;
  }>;
}

export default async function MainPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab =
    params.tab === "inquiries"
      ? "inquiries"
      : params.tab === "calendar"
        ? "calendar"
        : params.tab === "statistics"
          ? "statistics"
          : "properties";

  const TAB_TITLES = {
    properties: "매물장",
    inquiries: "문의장",
    calendar: "캘린더",
    statistics: "통계",
  } as const;

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 pt-4 pb-28 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-foreground">
          {TAB_TITLES[tab]}
        </h1>
        <LockButton />
      </div>

      {/* 탭 */}
      <Suspense fallback={null}>
        <TabNav />
      </Suspense>

      {/* 탭 콘텐츠 */}
      <div className="mt-4">
        {tab === "properties" ? (
          <PropertiesTab
            status={params.status}
            type={params.type}
            search={params.search}
            orderBy={params.orderBy}
          />
        ) : tab === "inquiries" ? (
          <InquiriesTab
            status={params.status}
            search={params.search}
            orderBy={params.orderBy}
          />
        ) : tab === "calendar" ? (
          <CalendarTab year={params.year} month={params.month} />
        ) : (
          <StatisticsTab />
        )}
      </div>

      {/* 하단 고정 등록 버튼 (캘린더 탭에서는 숨김) */}
      {tab !== "calendar" && tab !== "statistics" && (
        <div className="fixed bottom-6 left-4 right-4 z-40 flex justify-center">
          <Link
            href={tab === "properties" ? "/properties/new" : "/inquiries/new"}
            className="block w-full max-w-[400px] h-[52px] rounded-xl text-[17px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            {tab === "properties" ? "+ 매물 등록" : "+ 문의 등록"}
          </Link>
        </div>
      )}
    </main>
  );
}

async function PropertiesTab({
  status,
  type,
  search,
  orderBy,
}: {
  status?: string;
  type?: string;
  search?: string;
  orderBy?: string;
}) {
  const properties = await fetchProperties({
    status: parseEnum(status, VALID_PROPERTY_STATUS),
    type: parseEnum(type, VALID_PROPERTY_TYPE),
    search: search || undefined,
    orderBy: orderBy || undefined,
  });

  return (
    <>
      <Suspense fallback={null}>
        <PropertyFilter />
      </Suspense>
      <div className="mt-4 flex flex-col gap-3">
        {properties.length === 0 ? (
          <EmptyState title="매물이 없습니다" description="새 매물을 등록해보세요." />
        ) : (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>
    </>
  );
}

async function InquiriesTab({
  status,
  search,
  orderBy,
}: {
  status?: string;
  search?: string;
  orderBy?: string;
}) {
  const inquiries = await fetchInquiries({
    status: parseEnum(status, VALID_INQUIRY_STATUS),
    search: search || undefined,
    orderBy: orderBy || undefined,
  });

  return (
    <>
      <Suspense fallback={null}>
        <InquiryFilter />
      </Suspense>
      <div className="mt-4 flex flex-col gap-3">
        {inquiries.length === 0 ? (
          <EmptyState title="문의가 없습니다" description="새 문의를 등록해보세요." />
        ) : (
          inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))
        )}
      </div>
    </>
  );
}

async function CalendarTab({
  year,
  month,
}: {
  year?: string;
  month?: string;
}) {
  const now = new Date();
  const y = year ? parseInt(year, 10) : now.getFullYear();
  const m = month ? parseInt(month, 10) : now.getMonth() + 1;

  const schedules = await fetchSchedulesByMonth(y, m);

  return <CalendarView year={y} month={m} schedules={schedules} />;
}

async function StatisticsTab() {
  const [summary, contracts, revenue, balances] = await Promise.all([
    fetchCurrentMonthSummary(),
    fetchMonthlyContracts(),
    fetchMonthlyRevenue(),
    fetchUpcomingBalances(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <SummaryCards
        contractCount={summary.contractCount}
        expectedRevenue={summary.expectedRevenue}
      />
      <ContractChart data={contracts} />
      <RevenueChart data={revenue} />
      <UpcomingBalancesView balances={balances} />
    </div>
  );
}
