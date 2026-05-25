import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
    title: "매물 등록",
    desc: "빌라/상가 매물을 간편하게 등록하고 사진과 함께 관리하세요",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    ),
    title: "문의 매칭",
    desc: "고객 조건에 맞는 매물을 자동으로 매칭하여 빠르게 연결하세요",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
    title: "현황 파악",
    desc: "매물 상태를 한눈에 확인하고 거래 진행 상황을 추적하세요",
  },
];

const STEPS = [
  {
    num: "01",
    title: "매물 등록",
    desc: "빌라/상가 매물 정보와 사진을 등록합니다",
  },
  {
    num: "02",
    title: "문의 접수",
    desc: "고객의 희망 조건과 연락처를 기록합니다",
  },
  {
    num: "03",
    title: "매칭 확인",
    desc: "조건에 맞는 매물을 자동으로 매칭하여 확인합니다",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#212121]">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            하나부동산 매물장
          </span>
          <Link
            href="/lock"
            className="h-12 px-6 inline-flex items-center rounded-xl text-[15px] font-bold bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors"
          >
            시작하기
          </Link>
        </div>
      </nav>

      {/* 헤로 섹션 */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              우리 매물,
              <br />
              <span className="text-[#0066FF]">한눈에</span> 관리하세요
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed">
              빌라·상가 매물 등록부터 고객 문의 매칭까지
              <br className="hidden sm:block" />
              부동산 업무를 하나로 통합합니다
            </p>
            <div className="mt-10">
              <Link
                href="/lock"
                className="inline-flex items-center h-14 px-8 rounded-xl text-lg font-bold bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
              >
                매물 관리 시작하기
              </Link>
            </div>
          </div>
        </div>
        {/* 배경 장식 */}
        <div className="absolute top-10 right-0 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10" />
      </section>

      {/* 구분선 */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <hr className="border-gray-200" />
      </div>

      {/* 기능 소개 섹션 */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-[#0066FF] tracking-widest uppercase mb-3">
              Features
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              필요한 기능만 담았습니다
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 방법 섹션 */}
      <section className="py-16 sm:py-24 bg-[#F5F5F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-[#0066FF] tracking-widest uppercase mb-3">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              3단계로 간편하게
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center md:text-left">
                <span className="text-5xl sm:text-6xl font-bold text-gray-300/60 leading-none">
                  {s.num}
                </span>
                <h3 className="text-lg font-bold mt-3 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  {s.desc}
                </p>
                {/* 화살표 (md 이상에서 마지막 제외) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 -right-6 text-gray-300">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA 섹션 */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-500 mb-10 text-base sm:text-lg">
            복잡한 가입 절차 없이 바로 사용할 수 있습니다
          </p>
          <Link
            href="/lock"
            className="inline-flex items-center h-14 px-8 rounded-xl text-lg font-bold bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
          >
            지금 바로 시작하기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-[#333] text-gray-400 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[15px] font-bold text-gray-200 mb-1">
            하나부동산 매물장
          </p>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
