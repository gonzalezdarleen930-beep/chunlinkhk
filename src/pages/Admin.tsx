import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, X, Check, LogOut, Users, CreditCard, ChevronDown } from "lucide-react";

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
  loan_number: "",
  loan_amount: 100000,
  outstanding_principal: 100000,
  total_outstanding: 100000,
  remaining_periods: 24,
  monthly_payment: 5000,
  annual_interest_rate: 9.22,
  loan_date: "2026-01-01",
  loan_expiry_date: "2028-01-01",
  repayment_bank: "眾安銀行",
  repayment_account: "",
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
  const [memberSuccess, setMemberSuccess] = useState("");

  // Loan form
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanAccount | null>(null);
  const [loanForm, setLoanForm] = useState<Omit<LoanAccount, "id">>(EMPTY_LOAN);
  const [loanError, setLoanError] = useState("");
  const [loanLoading, setLoanLoading] = useState(false);

  // Selected member for filtering
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchData();
  }, [user, isAdmin]);

  async function fetchMembers() {
    const { data, error } = await supabase.functions.invoke("list-members");
    if (!error && data?.members) {
      setMembers(data.members);
    }
  }

  async function fetchLoans() {
    const { data } = await supabase
      .from("loan_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    setLoans(data ?? []);
  }

  async function fetchData() {
    setFetching(true);
    await Promise.all([fetchMembers(), fetchLoans()]);
    setFetching(false);
  }

  async function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    setMemberError("");
    setMemberSuccess("");
    setMemberLoading(true);

    const { data, error } = await supabase.functions.invoke("create-member", {
      body: { email: newEmail, password: newPassword },
    });

    if (error || data?.error) {
      setMemberError(data?.error || "建立會員失敗，請重試。");
    } else {
      setMemberSuccess(`✅ 已成功建立會員：${data.email}`);
      setNewEmail("");
      setNewPassword("");
      setShowNewMember(false);
      await fetchMembers();
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
      setLoanError("請選擇會員");
      return;
    }
    setLoanLoading(true);
    setLoanError("");

    let saveError = null;

    if (editingLoan) {
      const { error } = await supabase
        .from("loan_accounts")
        .update(loanForm)
        .eq("id", editingLoan.id);
      saveError = error;
    } else {
      const { error } = await supabase
        .from("loan_accounts")
        .insert([loanForm]);
      saveError = error;
    }

    setLoanLoading(false);

    if (saveError) {
      setLoanError("儲存失敗: " + saveError.message);
    } else {
      setShowLoanForm(false);
      setEditingLoan(null);
      await fetchLoans();
    }
  }

  async function handleDeleteLoan(id: string) {
    if (!confirm("確定刪除此貸款記錄？")) return;
    await supabase.from("loan_accounts").delete().eq("id", id);
    await fetchLoans();
  }

  async function handleDeleteMember(memberId: string, memberEmail: string) {
    if (!confirm(`確定刪除會員 ${memberEmail}？此操作不可撤銷。`)) return;
    // Delete their loans first
    await supabase.from("loan_accounts").delete().eq("user_id", memberId);
    // Delete role
    await supabase.from("user_roles").delete().eq("user_id", memberId);
    // We can't delete from auth.users client-side, but removing role is sufficient
    await fetchData();
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  const getMemberEmail = (userId: string) =>
    members.find((m) => m.id === userId)?.email ?? userId.slice(0, 12) + "...";

  const filteredLoans =
    selectedMemberId === "all"
      ? loans
      : loans.filter((l) => l.user_id === selectedMemberId);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">載入中...</p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
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
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
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

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">會員總數</p>
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">貸款記錄</p>
              <p className="text-2xl font-bold text-foreground">{loans.length}</p>
            </div>
          </div>
        </div>

        {/* Member success message */}
        {memberSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            {memberSuccess}
          </div>
        )}

        {/* Members Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">會員管理</h2>
            </div>
            <button
              onClick={() => {
                setShowNewMember(!showNewMember);
                setMemberError("");
                setMemberSuccess("");
              }}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {showNewMember ? <X size={14} /> : <Plus size={14} />}
              {showNewMember ? "取消" : "新增會員"}
            </button>
          </div>

          {/* New member form */}
          {showNewMember && (
            <form onSubmit={handleCreateMember} className="px-6 py-5 border-b border-border bg-muted/30 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">建立新會員帳號</h3>
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

          {/* Members list */}
          <div className="divide-y divide-border">
            {members.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                暫時未有會員
              </div>
            ) : (
              members.map((member) => {
                const memberLoans = loans.filter((l) => l.user_id === member.id);
                return (
                  <div key={member.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium text-foreground truncate">{member.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {memberLoans.length > 0
                          ? `${memberLoans.length} 筆貸款 · 編號: ${memberLoans.map(l => l.loan_number).join(", ")}`
                          : "未有貸款記錄"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openNewLoan(member.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                      >
                        <Plus size={12} />
                        新增貸款
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id, member.email)}
                        className="p-1.5 rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive"
                        title="刪除會員"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Loan Accounts Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">貸款帳戶管理</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Member filter */}
              <div className="relative">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background pl-3 pr-7 text-xs appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">所有會員</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.email}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <button
                onClick={() => openNewLoan()}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                新增貸款
              </button>
            </div>
          </div>

          {/* Loan Form */}
          {showLoanForm && (
            <div className="px-6 py-5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {editingLoan ? "編輯貸款記錄" : "新增貸款記錄"}
              </h3>
              <form onSubmit={handleSaveLoan} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Member selector */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelClass}>選擇會員 *</label>
                    <div className="relative">
                      <select
                        value={loanForm.user_id}
                        onChange={(e) => setLoanForm({ ...loanForm, user_id: e.target.value })}
                        required
                        className={inputClass + " appearance-none pr-8"}
                      >
                        <option value="">-- 請選擇會員 --</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.email}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>貸款編號</label>
                    <input type="text" value={loanForm.loan_number} onChange={(e) => setLoanForm({ ...loanForm, loan_number: e.target.value })} required className={inputClass} placeholder="例：123456" />
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
                    <label className={labelClass}>還款帳戶號碼</label>
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
                  <button type="button" onClick={() => { setShowLoanForm(false); setEditingLoan(null); }} className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted">
                    <X size={14} />
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loans list */}
          <div className="divide-y divide-border">
            {filteredLoans.length === 0 ? (
              <div className="px-6 py-10 text-center text-muted-foreground text-sm">
                {selectedMemberId === "all" ? "暫時未有貸款記錄" : "此會員暫時未有貸款記錄"}
              </div>
            ) : (
              filteredLoans.map((loan) => (
                <div key={loan.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">貸款編號 #{loan.loan_number}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          HKD {Number(loan.loan_amount).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{getMemberEmail(loan.user_id)}</p>
                      <p className="text-xs text-muted-foreground">
                        {loan.loan_date} → {loan.loan_expiry_date} · 餘下 {loan.remaining_periods}期 · 每月 HKD {Number(loan.monthly_payment).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditLoan(loan)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-foreground"
                      >
                        <Edit2 size={12} />
                        編輯
                      </button>
                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive"
                      >
                        <Trash2 size={12} />
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
