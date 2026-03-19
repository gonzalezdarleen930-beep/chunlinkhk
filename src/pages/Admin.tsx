import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, X, Check, LogOut } from "lucide-react";

interface MemberUser {
  id: string;
  email: string;
}

interface LoanAccount {
  id: string;
  user_id: string;
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

const EMPTY_LOAN: Omit<LoanAccount, "id"> = {
  user_id: "",
  loan_number: "123456",
  loan_amount: 100000,
  outstanding_principal: 100000,
  total_outstanding: 100000,
  remaining_periods: 24,
  monthly_payment: 5000,
  annual_interest_rate: 9.22,
  loan_date: "2026-01-01",
  loan_expiry_date: "2028-01-01",
  repayment_bank: "眾安銀行",
  repayment_account: "123144",
  repayment_day: 10,
};

export default function Admin() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<MemberUser[]>([]);
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [fetching, setFetching] = useState(true);

  // New member form
  const [showNewMember, setShowNewMember] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  // Loan form
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanAccount | null>(null);
  const [loanForm, setLoanForm] = useState<Omit<LoanAccount, "id">>(EMPTY_LOAN);
  const [loanError, setLoanError] = useState("");
  const [loanLoading, setLoanLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchData();
  }, [user, isAdmin]);

  async function fetchData() {
    setFetching(true);
    // Fetch members via edge function (admin only)
    const { data: loansData } = await supabase
      .from("loan_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    setLoans(loansData ?? []);

    // Get unique user_ids from loans to display members
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "member");

    if (rolesData) {
      // We'll show members from user_roles; we can't list auth.users directly from client
      // Instead store email in loan_accounts or use a profiles approach
      // For now, we derive them from loans
      const userIds = [...new Set((loansData ?? []).map((l: LoanAccount) => l.user_id))];
      const memberList = userIds.map((id) => {
        const loan = loansData?.find((l: LoanAccount) => l.user_id === id);
        return { id, email: `會員 (${id.slice(0, 8)}...)` };
      });
      setMembers(memberList);
    }
    setFetching(false);
  }

  async function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    setMemberError("");
    setMemberLoading(true);

    // Use admin edge function to create user
    const { data, error } = await supabase.functions.invoke("create-member", {
      body: { email: newEmail, password: newPassword },
    });

    if (error || data?.error) {
      setMemberError(data?.error || "建立會員失敗，請重試。");
    } else {
      setShowNewMember(false);
      setNewEmail("");
      setNewPassword("");
      fetchData();
    }
    setMemberLoading(false);
  }

  function openNewLoan(userId?: string) {
    setEditingLoan(null);
    setLoanForm({ ...EMPTY_LOAN, user_id: userId ?? "" });
    setShowLoanForm(true);
    setLoanError("");
  }

  function openEditLoan(loan: LoanAccount) {
    setEditingLoan(loan);
    setLoanForm({ ...loan });
    setShowLoanForm(true);
    setLoanError("");
  }

  async function handleSaveLoan(e: React.FormEvent) {
    e.preventDefault();
    if (!loanForm.user_id) {
      setLoanError("請輸入會員 User ID");
      return;
    }
    setLoanLoading(true);
    setLoanError("");

    if (editingLoan) {
      const { error } = await supabase
        .from("loan_accounts")
        .update(loanForm)
        .eq("id", editingLoan.id);
      if (error) setLoanError("更新失敗: " + error.message);
    } else {
      const { error } = await supabase
        .from("loan_accounts")
        .insert([loanForm]);
      if (error) setLoanError("新增失敗: " + error.message);
    }

    setLoanLoading(false);
    if (!loanError) {
      setShowLoanForm(false);
      fetchData();
    }
  }

  async function handleDeleteLoan(id: string) {
    if (!confirm("確定刪除此貸款記錄？")) return;
    await supabase.from("loan_accounts").delete().eq("id", id);
    fetchData();
  }

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

  const inputClass = "w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const labelClass = "block text-xs font-medium text-foreground mb-1";

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">富</span>
            </div>
            <div>
              <div className="text-sm font-bold text-foreground leading-tight">管理員面板</div>
              <div className="text-xs text-muted-foreground leading-tight">富毅信貸有限公司</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              會員儀表板
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut size={14} />
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Create Member Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">建立新會員帳號</h2>
            <button
              onClick={() => { setShowNewMember(!showNewMember); setMemberError(""); }}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {showNewMember ? <X size={14} /> : <Plus size={14} />}
              {showNewMember ? "取消" : "新增會員"}
            </button>
          </div>

          {showNewMember && (
            <form onSubmit={handleCreateMember} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>電郵地址</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="member@example.com"
                  />
                </div>
                <div>
                  <label className={labelClass}>密碼</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className={inputClass}
                    placeholder="至少6位"
                  />
                </div>
              </div>
              {memberError && <p className="text-sm text-destructive">{memberError}</p>}
              <button
                type="submit"
                disabled={memberLoading}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {memberLoading ? "建立中..." : "確認建立"}
              </button>
            </form>
          )}
        </section>

        {/* Loan Accounts Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">貸款帳戶管理</h2>
            <button
              onClick={() => openNewLoan()}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              新增貸款
            </button>
          </div>

          {/* Loan Form */}
          {showLoanForm && (
            <div className="px-6 py-5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {editingLoan ? "編輯貸款記錄" : "新增貸款記錄"}
              </h3>
              <form onSubmit={handleSaveLoan} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>會員 User ID *</label>
                    <input type="text" value={loanForm.user_id} onChange={(e) => setLoanForm({ ...loanForm, user_id: e.target.value })} required className={inputClass} placeholder="貼上會員的 UUID" />
                  </div>
                  <div>
                    <label className={labelClass}>貸款編號</label>
                    <input type="text" value={loanForm.loan_number} onChange={(e) => setLoanForm({ ...loanForm, loan_number: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>貸款額 (HKD)</label>
                    <input type="number" value={loanForm.loan_amount} onChange={(e) => setLoanForm({ ...loanForm, loan_amount: Number(e.target.value) })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>未償還本金 (HKD)</label>
                    <input type="number" value={loanForm.outstanding_principal} onChange={(e) => setLoanForm({ ...loanForm, outstanding_principal: Number(e.target.value) })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>總結欠 (HKD)</label>
                    <input type="number" value={loanForm.total_outstanding} onChange={(e) => setLoanForm({ ...loanForm, total_outstanding: Number(e.target.value) })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>餘下還款期</label>
                    <input type="number" value={loanForm.remaining_periods} onChange={(e) => setLoanForm({ ...loanForm, remaining_periods: Number(e.target.value) })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>每月還款額 (HKD)</label>
                    <input type="number" value={loanForm.monthly_payment} onChange={(e) => setLoanForm({ ...loanForm, monthly_payment: Number(e.target.value) })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>實際年利率 (%)</label>
                    <input type="number" step="0.01" value={loanForm.annual_interest_rate} onChange={(e) => setLoanForm({ ...loanForm, annual_interest_rate: Number(e.target.value) })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>貸款日期</label>
                    <input type="date" value={loanForm.loan_date} onChange={(e) => setLoanForm({ ...loanForm, loan_date: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>貸款到期日</label>
                    <input type="date" value={loanForm.loan_expiry_date} onChange={(e) => setLoanForm({ ...loanForm, loan_expiry_date: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>還款銀行</label>
                    <input type="text" value={loanForm.repayment_bank} onChange={(e) => setLoanForm({ ...loanForm, repayment_bank: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>還款帳戶</label>
                    <input type="text" value={loanForm.repayment_account} onChange={(e) => setLoanForm({ ...loanForm, repayment_account: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>還款日 (每月第X日)</label>
                    <input type="number" min={1} max={31} value={loanForm.repayment_day} onChange={(e) => setLoanForm({ ...loanForm, repayment_day: Number(e.target.value) })} required className={inputClass} />
                  </div>
                </div>
                {loanError && <p className="text-sm text-destructive">{loanError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={loanLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    <Check size={14} />
                    {loanLoading ? "儲存中..." : "儲存"}
                  </button>
                  <button type="button" onClick={() => setShowLoanForm(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted">
                    <X size={14} />
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loans list */}
          <div className="divide-y divide-border">
            {loans.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                暫時未有貸款記錄
              </div>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">#{loan.loan_number}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        HKD {Number(loan.loan_amount).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">User: {loan.user_id.slice(0, 16)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {loan.loan_date} → {loan.loan_expiry_date} · 每月 HKD {Number(loan.monthly_payment).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditLoan(loan)} className="p-2 rounded-md border border-border hover:bg-muted transition-colors text-foreground">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteLoan(loan.id)} className="p-2 rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* User IDs helper */}
        <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">已登記貸款的會員 User IDs</h2>
            <p className="text-xs text-muted-foreground mt-1">新增貸款時需要填入對應的 User ID</p>
          </div>
          <div className="divide-y divide-border">
            {loans.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">無記錄</p>
            ) : (
              [...new Map(loans.map(l => [l.user_id, l])).values()].map((loan) => (
                <div key={loan.user_id} className="px-6 py-3 flex items-center justify-between">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground select-all">
                    {loan.user_id}
                  </code>
                  <span className="text-xs text-muted-foreground ml-4">#{loan.loan_number}</span>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
