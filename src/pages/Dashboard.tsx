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
  repayment_bank: string;
  repayment_account: string;
  repayment_day: number;
}

interface LoanApplication {
  id: string;
  status: string;
  applied_loan_amount: number;
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const [{ data: loanData }, { data: appData }] = await Promise.all([
        supabase.from("loan_accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("loan_applications").select("id, status, applied_loan_amount, created_at").order("created_at", { ascending: false }),
      ]);
      setLoans(loanData ?? []);
      setApplications(appData ?? []);
      setFetching(false);
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
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">富</span>
            </div>
            <div>
              <div className="text-sm font-bold text-foreground leading-tight">富毅信貸有限公司</div>
              <div className="text-xs text-muted-foreground leading-tight">GRIT CREDIT LIMITED</div>
            </div>
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
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User size={14} />
              <span className="hidden sm:inline truncate max-w-[150px]">{user?.email}</span>
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
          {latestApp && (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-primary-foreground/70 text-xs">申請金額</p>
                  <p className="font-bold text-lg">HKD {Number(latestApp.applied_loan_amount).toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-primary-foreground/30" />
                <div>
                  <p className="text-primary-foreground/70 text-xs mb-1">申請狀態</p>
                  <StatusBadge status={latestApp.status} />
                </div>
              </div>
            </div>
          )}
          {!latestApp && (
            <div className="text-right">
              <p className="text-primary-foreground/70 text-sm">歡迎回來</p>
              <p className="font-medium text-sm truncate max-w-[180px]">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Application status card (if has applications) */}
        {applications.length > 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">貸款申請狀態</h2>
            </div>
            <div className="divide-y divide-border">
              {applications.map((app) => (
                <div key={app.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">申請日期</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(app.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">申請金額</p>
                    <p className="text-sm font-semibold text-foreground">HKD {Number(app.applied_loan_amount).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loan accounts */}
        {loans.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            暫時未有貸款記錄
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              {/* Loan header */}
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

              {/* Loan details grid */}
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
                  { label: "還款銀行", value: loan.repayment_bank },
                  { label: "還款帳戶", value: loan.repayment_account },
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
