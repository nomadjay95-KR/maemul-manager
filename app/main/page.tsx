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
import { fetchNotes } from "@/lib/queries/notes";
import { fetchUsersForAdmin } from "@/lib/queries/users";
import { fetchUpcomingEvents } from "@/lib/queries/notifications";
import { fetchSharedLinksWithAddresses } from "@/lib/queries/share";
import { getAuthUser } from "@/lib/auth";
import PropertyFilter from "@/components/properties/PropertyFilter";
import PropertyListWithSelect from "@/components/properties/PropertyListWithSelect";
import InquiryFilter from "@/components/inquiries/InquiryFilter";
import InquiryCard from "@/components/inquiries/InquiryCard";
import LockButton from "@/components/properties/LockButton";
import TabNav from "@/components/layout/TabNav";
import PropertyExportButton from "@/components/properties/ExportButton";
import InquiryExportButton from "@/components/inquiries/ExportButton";
import EmptyState from "@/components/ui/EmptyState";
import CalendarView from "@/components/calendar/CalendarView";
import SummaryCards from "@/components/statistics/SummaryCards";
import ContractChart from "@/components/statistics/ContractChart";
import RevenueChart from "@/components/statistics/RevenueChart";
import UpcomingBalancesView from "@/components/statistics/UpcomingBalances";
import NoteLayout from "@/components/notes/NoteLayout";
import UserManagement from "@/components/users/UserManagement";
import SharedLinkManagement from "@/components/share/SharedLinkManagement";
import NotificationBanner from "@/components/notifications/NotificationBanner";

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
    noteId?: string;
    dealType?: string;
    deposit?: string;
    rent?: string;
    rooms?: string;
    occupancy?: string;
    age?: string;
    floor?: string;
  }>;
}

type TabValue = "properties" | "inquiries" | "calendar" | "statistics" | "notes" | "users" | "shared-links";

const VALID_TABS: TabValue[] = ["properties", "inquiries", "calendar", "statistics", "notes", "users", "shared-links"];

export default async function MainPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const authUser = await getAuthUser();

  const tab: TabValue = VALID_TABS.includes(params.tab as TabValue)
    ? (params.tab as TabValue)
    : "properties";

  const upcomingEvents = await fetchUpcomingEvents();

  const TAB_TITLES: Record<TabValue, string> = {
    properties: "매물장",
    inquiries: "문의장",
    calendar: "캘린더",
    statistics: "통계",
    notes: "메모장",
    users: "사용자 관리",
    "shared-links": "공유 링크",
  };

  // 하단 등록 버튼 표시 여부 및 설정
  const showBottomButton = tab === "properties" || tab === "inquiries" || tab === "notes";
  const bottomButtonHref =
    tab === "properties"
      ? "/properties/new"
      : tab === "inquiries"
        ? "/inquiries/new"
        : "/notes/new";
  const bottomButtonLabel =
    tab === "properties"
      ? "+ 매물 등록"
      : tab === "inquiries"
        ? "+ 문의 등록"
        : "+ 메모 작성";

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 pt-4 pb-28 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-foreground">
          {TAB_TITLES[tab]}
        </h1>
        <div className="flex items-center gap-2">
          {authUser && (
            <span className="text-base text-muted-foreground font-medium">
              {authUser.name}
            </span>
          )}
          <LockButton />
        </div>
      </div>

      {/* 탭 */}
      <Suspense fallback={null}>
        <TabNav role={authUser?.role} />
      </Suspense>

      {/* 다가오는 일정 알림 */}
      <div className="mt-4">
        <NotificationBanner events={upcomingEvents} />
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {tab === "properties" ? (
          <PropertiesTab
            status={params.status}
            type={params.type}
            search={params.search}
            orderBy={params.orderBy}
            dealType={params.dealType}
            deposit={params.deposit}
            rent={params.rent}
            rooms={params.rooms}
            occupancy={params.occupancy}
            age={params.age}
            floor={params.floor}
          />
        ) : tab === "inquiries" ? (
          <InquiriesTab
            status={params.status}
            search={params.search}
            orderBy={params.orderBy}
          />
        ) : tab === "calendar" ? (
          <CalendarTab year={params.year} month={params.month} />
        ) : tab === "statistics" ? (
          <StatisticsTab />
        ) : tab === "users" ? (
          <UsersTab currentUserId={authUser?.id} />
        ) : tab === "shared-links" ? (
          <SharedLinksTab />
        ) : (
          <NotesTab noteId={params.noteId} />
        )}
      </div>

      {/* 하단 고정 등록 버튼 */}
      {showBottomButton && (
        <div className="fixed bottom-6 left-4 right-4 z-40 flex justify-center">
          <Link
            href={bottomButtonHref}
            className="block w-full max-w-[400px] h-[52px] rounded-xl text-[17px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            {bottomButtonLabel}
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
  dealType,
  deposit,
  rent,
  rooms,
  occupancy,
  age,
  floor,
}: {
  status?: string;
  type?: string;
  search?: string;
  orderBy?: string;
  dealType?: string;
  deposit?: string;
  rent?: string;
  rooms?: string;
  occupancy?: string;
  age?: string;
  floor?: string;
}) {
  const properties = await fetchProperties({
    status: parseEnum(status, VALID_PROPERTY_STATUS),
    type: parseEnum(type, VALID_PROPERTY_TYPE),
    search: search || undefined,
    orderBy: orderBy || undefined,
    dealType: dealType || undefined,
    deposit: deposit || undefined,
    rent: rent || undefined,
    rooms: rooms || undefined,
    occupancy: occupancy || undefined,
    age: age || undefined,
    floor: floor || undefined,
  });

  return (
    <>
      <Suspense fallback={null}>
        <PropertyFilter exportButton={<PropertyExportButton properties={properties} />} />
      </Suspense>
      <div className="mt-4">
        {properties.length === 0 ? (
          <EmptyState title="매물이 없습니다" description="새 매물을 등록해보세요." />
        ) : (
          <PropertyListWithSelect properties={properties} />
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
        <InquiryFilter exportButton={<InquiryExportButton inquiries={inquiries} />} />
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

async function NotesTab({ noteId }: { noteId?: string }) {
  const notes = await fetchNotes();

  return <NoteLayout notes={notes} selectedNoteId={noteId} />;
}

async function UsersTab({ currentUserId }: { currentUserId?: string }) {
  const users = await fetchUsersForAdmin();

  return <UserManagement users={users} currentUserId={currentUserId} />;
}

async function SharedLinksTab() {
  const links = await fetchSharedLinksWithAddresses();

  return <SharedLinkManagement links={links} />;
}
