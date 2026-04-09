import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Clock, CheckCircle, XCircle } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

interface LoanAccount {
  id: string;
  loan_number: string;
  loan_amount: number;
  outstanding_principal: number;
  total_outstanding: number;
  remaining_periods: number;
  monthly_payment: number;
  annual_interest_rate: number;
  loan_date: string;
  loan_expiry_date: string;
  repayment_day: number;
}

interface LoanApplication {
  id: string;
  status: string;
  applied_loan_amount: number;
  pre_approved_amount: number;
  name_chinese: string;
  name_english: string;
  hkid: string;
  dob: string;
  gender: string;
  marital_status: string;
  children: string;
  phone: string;
  email: string;
  address: string;
  property_type: string;
  cohabitants: string;
  occupation: string;
  monthly_salary: number;
  payment_method: string;
  loan_amount: number;
  previous_applications: string;
  referral_source: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "已批核") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle size={12} />
        已批核
      </span>
    );
  }
  if (status === "不成功") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
        <XCircle size={12} />
        不成功
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock size={12} />
      審批中
    </span>
  );
}

export default function Dashboard() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [fetching, setFetching] = useState(true);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      try {
        const [{ data: loanData }, { data: appData }, { data: profileData }] = await Promise.all([
          supabase.from("loan_accounts").select("*").order("created_at", { ascending: false }),
          supabase.from("loan_applications").select("*").order("created_at", { ascending: false }),
          supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
        ]);
        setLoans(loanData ?? []);
        setApplications(appData ?? []);
        // Priority: profiles table > loan application name
        const name = profileData?.display_name || (appData && appData.length > 0 ? appData[0].name_chinese : "");
        setDisplayName(name);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  const latestApp = applications[0];

  return (
    <div className="min-h-screen bg-muted">
      {/* Top bar */}
      <header className="bg-background border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="富毅信貸有限公司" className="h-10 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
              >
                管理員面板
              </Link>
            )}
            <div className="flex flex-col items-end text-sm text-muted-foreground">
              {displayName && (
                <span className="font-medium text-foreground text-sm">{displayName}</span>
              )}
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span className="hidden sm:inline truncate max-w-[150px]">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={14} />
              <span>登出</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Date + Application Status header */}
        <div className="bg-primary text-primary-foreground rounded-xl px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">今日日期</p>
            <p className="text-xl font-bold">{todayString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-primary-foreground/70 text-xs">預批額度</p>
              <p className="font-bold text-lg">
                HKD {Number(latestApp?.pre_approved_amount ?? 10000).toLocaleString()}
              </p>
            </div>
            {latestApp && (
              <>
                <div className="h-8 w-px bg-primary-foreground/30" />
                <div className="text-right">
                  <p className="text-primary-foreground/70 text-xs">申請金額</p>
                  <p className="font-bold text-lg">HKD {Number(latestApp.applied_loan_amount).toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-primary-foreground/30" />
                <div>
                  <p className="text-primary-foreground/70 text-xs mb-1">申請狀態</p>
                  <StatusBadge status={latestApp.status} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Application details */}
        {applications.map((app) => (
          <div key={app.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground text-sm">貸款申請詳情</h2>
              <StatusBadge status={app.status} />
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "中文姓名", value: app.name_chinese },
                { label: "英文姓名", value: app.name_english },
                { label: "身份證號碼", value: app.hkid },
                { label: "出生日期", value: app.dob },
                { label: "性別", value: app.gender },
                { label: "婚姻狀況", value: app.marital_status },
                { label: "子女數目", value: app.children },
                { label: "聯絡電話", value: app.phone },
                { label: "電郵地址", value: app.email },
                { label: "住宅地址", value: app.address },
                { label: "物業類型", value: app.property_type },
                { label: "同住人數", value: app.cohabitants },
                { label: "職業", value: app.occupation },
                { label: "每月收入", value: `HKD ${Number(app.monthly_salary).toLocaleString()}` },
                { label: "出糧方式", value: app.payment_method },
                { label: "申請金額", value: `HKD ${Number(app.applied_loan_amount).toLocaleString()}` },
                { label: "貸款金額", value: `HKD ${Number(app.loan_amount).toLocaleString()}` },
                { label: "預批額度", value: `HKD ${Number(app.pre_approved_amount).toLocaleString()}` },
                { label: "曾否申請貸款", value: app.previous_applications },
                { label: "轉介來源", value: app.referral_source },
                { label: "申請日期", value: formatDate(app.created_at) },
              ].filter(item => item.value && item.value !== "HKD 0").map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 py-2 border-b border-border/50 last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Loan accounts */}
        {loans.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            暫時未有貸款記錄
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="bg-muted/50 border-b border-border px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">貸款編號</p>
                  <p className="font-bold text-foreground text-lg">{loan.loan_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">貸款額</p>
                  <p className="font-bold text-primary text-lg">HKD {Number(loan.loan_amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "貸款額", value: `HKD ${Number(loan.loan_amount).toLocaleString()}` },
                  { label: "未償還本金", value: `HKD ${Number(loan.outstanding_principal).toLocaleString()}` },
                  { label: "總結欠", value: `HKD ${Number(loan.total_outstanding).toLocaleString()}` },
                  { label: "餘下還款期", value: `${loan.remaining_periods}期` },
                  { label: "每月還款額", value: `HKD ${Number(loan.monthly_payment).toLocaleString()}` },
                  { label: "實際年利率", value: `${loan.annual_interest_rate}%` },
                  { label: "貸款日期", value: formatDate(loan.loan_date) },
                  { label: "貸款到期日", value: formatDate(loan.loan_expiry_date) },
                  { label: "還款日", value: `每月的第${loan.repayment_day}日` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1 py-2 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
