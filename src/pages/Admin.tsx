import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, X, Check, LogOut, Users, CreditCard, ChevronDown, KeyRound, FileText, Clock, CheckCircle, XCircle, HelpCircle, ArrowUp, ArrowDown, Package, Star } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

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

interface LoanApplication {
  id: string;
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
  applied_loan_amount: number;
  previous_applications: string;
  referral_source: string;
  pre_approved_amount: number;
  status: string;
  created_at: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

interface LoanProductItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  sort_order: number;
}

interface AdvantageItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
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

const STATUS_OPTIONS = ["審批中", "已批核", "不成功"];

function StatusBadge({ status }: { status: string }) {
  if (status === "已批核") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <CheckCircle size={11} />已批核
    </span>
  );
  if (status === "不成功") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
      <XCircle size={11} />不成功
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock size={11} />審批中
    </span>
  );
}

export default function Admin() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<MemberUser[]>([]);
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "loans" | "applications" | "faqs" | "products" | "advantages">("applications");

  // FAQ management
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);

  // Loan products management
  const [productList, setProductList] = useState<LoanProductItem[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProductItem | null>(null);
  const [productSlug, setProductSlug] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productContent, setProductContent] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productLoading, setProductLoading] = useState(false);

  // Advantages management
  const [advantageList, setAdvantageList] = useState<AdvantageItem[]>([]);
  const [showAdvantageForm, setShowAdvantageForm] = useState(false);
  const [editingAdvantage, setEditingAdvantage] = useState<AdvantageItem | null>(null);
  const [advIcon, setAdvIcon] = useState("⚡");
  const [advTitle, setAdvTitle] = useState("");
  const [advDesc, setAdvDesc] = useState("");
  const [advLoading, setAdvLoading] = useState(false);

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

  // Change password
  const [changePwMember, setChangePwMember] = useState<MemberUser | null>(null);
  const [newPw, setNewPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");

  // Application detail modal
  const [viewApp, setViewApp] = useState<LoanApplication | null>(null);
  const [appStatusLoading, setAppStatusLoading] = useState(false);

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

  async function fetchApplications() {
    const { data } = await supabase
      .from("loan_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApplications((data ?? []) as LoanApplication[]);
  }

  async function fetchFaqs() {
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    setFaqList((data ?? []) as FaqItem[]);
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from("loan_products")
      .select("*")
      .order("sort_order", { ascending: true });
    setProductList((data ?? []) as LoanProductItem[]);
  }

  async function fetchAdvantages() {
    const { data } = await supabase
      .from("advantages")
      .select("*")
      .order("sort_order", { ascending: true });
    setAdvantageList((data ?? []) as AdvantageItem[]);
  }

  async function fetchData() {
    setFetching(true);
    // Load DB data first (fast), then edge function (slower due to cold start)
    await Promise.all([fetchLoans(), fetchApplications(), fetchFaqs(), fetchProducts(), fetchAdvantages()]);
    setFetching(false);
    // Load members in background (edge function can be slow)
    fetchMembers();
  }

  // FAQ handlers
  function openNewFaq() {
    setEditingFaq(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setShowFaqForm(true);
  }

  function openEditFaq(faq: FaqItem) {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setShowFaqForm(true);
  }

  async function handleSaveFaq(e: React.FormEvent) {
    e.preventDefault();
    setFaqLoading(true);
    if (editingFaq) {
      await supabase.from("faqs").update({ question: faqQuestion, answer: faqAnswer }).eq("id", editingFaq.id);
    } else {
      const maxOrder = faqList.length > 0 ? Math.max(...faqList.map(f => f.sort_order)) : 0;
      await supabase.from("faqs").insert([{ question: faqQuestion, answer: faqAnswer, sort_order: maxOrder + 1 }]);
    }
    setFaqLoading(false);
    setShowFaqForm(false);
    setEditingFaq(null);
    await fetchFaqs();
  }

  async function handleDeleteFaq(id: string) {
    if (!confirm("確定刪除此問題？")) return;
    await supabase.from("faqs").delete().eq("id", id);
    await fetchFaqs();
  }

  async function handleMoveFaq(faq: FaqItem, direction: "up" | "down") {
    const idx = faqList.findIndex(f => f.id === faq.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqList.length) return;
    const other = faqList[swapIdx];
    await Promise.all([
      supabase.from("faqs").update({ sort_order: other.sort_order }).eq("id", faq.id),
      supabase.from("faqs").update({ sort_order: faq.sort_order }).eq("id", other.id),
    ]);
    await fetchFaqs();
  }

  // Product handlers
  function openNewProduct() {
    setEditingProduct(null); setProductSlug(""); setProductTitle(""); setProductDesc(""); setProductContent(""); setProductImageUrl(""); setShowProductForm(true);
  }
  function openEditProduct(p: LoanProductItem) {
    setEditingProduct(p); setProductSlug(p.slug); setProductTitle(p.title); setProductDesc(p.description); setProductContent(p.content); setProductImageUrl(p.image_url || ""); setShowProductForm(true);
  }
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault(); setProductLoading(true);
    if (editingProduct) {
      await supabase.from("loan_products").update({ slug: productSlug, title: productTitle, description: productDesc, content: productContent, image_url: productImageUrl }).eq("id", editingProduct.id);
    } else {
      const maxOrder = productList.length > 0 ? Math.max(...productList.map(p => p.sort_order)) : 0;
      await supabase.from("loan_products").insert([{ slug: productSlug, title: productTitle, description: productDesc, content: productContent, image_url: productImageUrl, sort_order: maxOrder + 1 }]);
    }
    setProductLoading(false); setShowProductForm(false); setEditingProduct(null); await fetchProducts();
  }
  async function handleDeleteProduct(id: string) {
    if (!confirm("確定刪除此貸款產品？")) return;
    await supabase.from("loan_products").delete().eq("id", id); await fetchProducts();
  }
  async function handleMoveProduct(item: LoanProductItem, direction: "up" | "down") {
    const idx = productList.findIndex(p => p.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= productList.length) return;
    const other = productList[swapIdx];
    await Promise.all([
      supabase.from("loan_products").update({ sort_order: other.sort_order }).eq("id", item.id),
      supabase.from("loan_products").update({ sort_order: item.sort_order }).eq("id", other.id),
    ]);
    await fetchProducts();
  }

  // Advantage handlers
  function openNewAdvantage() {
    setEditingAdvantage(null); setAdvIcon("⚡"); setAdvTitle(""); setAdvDesc(""); setShowAdvantageForm(true);
  }
  function openEditAdvantage(a: AdvantageItem) {
    setEditingAdvantage(a); setAdvIcon(a.icon); setAdvTitle(a.title); setAdvDesc(a.description); setShowAdvantageForm(true);
  }
  async function handleSaveAdvantage(e: React.FormEvent) {
    e.preventDefault(); setAdvLoading(true);
    if (editingAdvantage) {
      await supabase.from("advantages").update({ icon: advIcon, title: advTitle, description: advDesc }).eq("id", editingAdvantage.id);
    } else {
      const maxOrder = advantageList.length > 0 ? Math.max(...advantageList.map(a => a.sort_order)) : 0;
      await supabase.from("advantages").insert([{ icon: advIcon, title: advTitle, description: advDesc, sort_order: maxOrder + 1 }]);
    }
    setAdvLoading(false); setShowAdvantageForm(false); setEditingAdvantage(null); await fetchAdvantages();
  }
  async function handleDeleteAdvantage(id: string) {
    if (!confirm("確定刪除此優勢項目？")) return;
    await supabase.from("advantages").delete().eq("id", id); await fetchAdvantages();
  }
  async function handleMoveAdvantage(item: AdvantageItem, direction: "up" | "down") {
    const idx = advantageList.findIndex(a => a.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= advantageList.length) return;
    const other = advantageList[swapIdx];
    await Promise.all([
      supabase.from("advantages").update({ sort_order: other.sort_order }).eq("id", item.id),
      supabase.from("advantages").update({ sort_order: item.sort_order }).eq("id", other.id),
    ]);
    await fetchAdvantages();
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
    await supabase.from("loan_accounts").delete().eq("user_id", memberId);
    await supabase.from("user_roles").delete().eq("user_id", memberId);
    await fetchData();
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!changePwMember) return;
    setPwError("");
    setPwSuccess("");
    setPwLoading(true);
    const { data, error } = await supabase.functions.invoke("change-member-password", {
      body: { user_id: changePwMember.id, new_password: newPw },
    });
    setPwLoading(false);
    if (error || data?.error) {
      setPwError(data?.error || "修改密碼失敗，請重試。");
    } else {
      setPwSuccess("✅ 密碼已成功更改！");
      setNewPw("");
      setTimeout(() => {
        setChangePwMember(null);
        setPwSuccess("");
      }, 1500);
    }
  }

  async function handleUpdateAppStatus(appId: string, newStatus: string) {
    setAppStatusLoading(true);
    await supabase.from("loan_applications").update({ status: newStatus }).eq("id", appId);
    await fetchApplications();
    if (viewApp && viewApp.id === appId) {
      setViewApp({ ...viewApp, status: newStatus });
    }
    setAppStatusLoading(false);
  }

  async function handleDeleteApp(appId: string) {
    if (!confirm("確定刪除此申請記錄？")) return;
    await supabase.from("loan_applications").delete().eq("id", appId);
    setViewApp(null);
    await fetchApplications();
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
            <img src={logoImg} alt="富毅信貸有限公司" className="h-10 w-auto object-contain" />
            <div className="text-sm font-bold text-foreground leading-tight hidden sm:block">管理員面板</div>
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
        <div className="grid grid-cols-3 gap-4">
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
          <div className="bg-card rounded-xl border border-border px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">待審申請</p>
              <p className="text-2xl font-bold text-foreground">{applications.filter(a => a.status === "審批中").length}</p>
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {[
            { key: "applications", label: "貸款申請", icon: <FileText size={14} /> },
            { key: "members", label: "會員管理", icon: <Users size={14} /> },
            { key: "loans", label: "貸款帳戶", icon: <CreditCard size={14} /> },
            { key: "products", label: "貸款項目", icon: <Package size={14} /> },
            { key: "advantages", label: "服務優勢", icon: <Star size={14} /> },
            { key: "faqs", label: "問題中心", icon: <HelpCircle size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.key === "applications" && applications.filter(a => a.status === "審批中").length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  {applications.filter(a => a.status === "審批中").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Member success message */}
        {memberSuccess && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-primary font-medium">
            {memberSuccess}
          </div>
        )}

        {/* ===== APPLICATIONS TAB ===== */}
        {activeTab === "applications" && (
          <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">貸款申請記錄</h2>
              <span className="ml-auto text-xs text-muted-foreground">{applications.length} 筆申請</span>
            </div>
            <div className="divide-y divide-border">
              {applications.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground text-sm">暫時未有申請記錄</div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{app.name_chinese} ({app.name_english})</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>📞 {app.phone}</span>
                        <span>✉️ {app.email}</span>
                        <span>申請額: HKD {Number(app.loan_amount).toLocaleString()}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString("zh-HK")}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Quick status buttons */}
                      {STATUS_OPTIONS.filter(s => s !== app.status).map(s => (
                        <button
                          key={s}
                          onClick={() => handleUpdateAppStatus(app.id, s)}
                          disabled={appStatusLoading}
                          className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted transition-colors text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                      <button
                        onClick={() => setViewApp(app)}
                        className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                      >
                        詳情
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ===== MEMBERS TAB ===== */}
        {activeTab === "members" && (
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

            {showNewMember && (
              <form onSubmit={handleCreateMember} className="px-6 py-5 border-b border-border bg-muted/30 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">建立新會員帳號</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>電郵地址</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className={inputClass} placeholder="member@example.com" />
                  </div>
                  <div>
                    <label className={labelClass}>密碼</label>
                    <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="至少6位" />
                  </div>
                </div>
                {memberError && <p className="text-sm text-destructive">{memberError}</p>}
                <button type="submit" disabled={memberLoading} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {memberLoading ? "建立中..." : "確認建立"}
                </button>
              </form>
            )}

            <div className="divide-y divide-border">
              {members.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">暫時未有會員</div>
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
                          onClick={() => { openNewLoan(member.id); setActiveTab("loans"); }}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                        >
                          <Plus size={12} />
                          新增貸款
                        </button>
                        <button
                          onClick={() => { setChangePwMember(member); setNewPw(""); setPwError(""); setPwSuccess(""); }}
                          className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground"
                          title="修改密碼"
                        >
                          <KeyRound size={13} />
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
        )}

        {/* ===== LOANS TAB ===== */}
        {activeTab === "loans" && (
          <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">貸款帳戶管理</h2>
              </div>
              <div className="flex items-center gap-2">
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

            {showLoanForm && (
              <div className="px-6 py-5 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {editingLoan ? "編輯貸款記錄" : "新增貸款記錄"}
                </h3>
                <form onSubmit={handleSaveLoan} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      <input type="text" value={loanForm.repayment_bank} onChange={(e) => setLoanForm({ ...loanForm, repayment_bank: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>還款帳戶號碼</label>
                      <input type="text" value={loanForm.repayment_account} onChange={(e) => setLoanForm({ ...loanForm, repayment_account: e.target.value })} className={inputClass} />
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
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === "products" && (
          <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">貸款項目管理</h2>
              </div>
              <button onClick={() => { showProductForm ? setShowProductForm(false) : openNewProduct(); }} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                {showProductForm ? <X size={14} /> : <Plus size={14} />}
                {showProductForm ? "取消" : "新增產品"}
              </button>
            </div>
            {showProductForm && (
              <form onSubmit={handleSaveProduct} className="px-6 py-5 border-b border-border bg-muted/30 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">{editingProduct ? "編輯產品" : "新增產品"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>網址代碼 (slug)</label>
                    <input type="text" value={productSlug} onChange={(e) => setProductSlug(e.target.value)} required className={inputClass} placeholder="例：personal-loan" />
                  </div>
                  <div>
                    <label className={labelClass}>標題</label>
                    <input type="text" value={productTitle} onChange={(e) => setProductTitle(e.target.value)} required className={inputClass} placeholder="例：私人貸款" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>簡述</label>
                  <input type="text" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} required className={inputClass} placeholder="產品簡述" />
                </div>
                <div>
                  <label className={labelClass}>封面圖片 URL</label>
                  <input type="text" value={productImageUrl} onChange={(e) => setProductImageUrl(e.target.value)} className={inputClass} placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <label className={labelClass}>內容 (支持 Markdown 格式)</label>
                  <textarea value={productContent} onChange={(e) => setProductContent(e.target.value)} required rows={10} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y font-mono" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={productLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    <Check size={14} />{productLoading ? "儲存中..." : "儲存"}
                  </button>
                  <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted">取消</button>
                </div>
              </form>
            )}
            <div className="divide-y divide-border">
              {productList.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground text-sm">暫時未有貸款產品</div>
              ) : (
                productList.map((p, idx) => (
                  <div key={p.id} className="px-6 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">/loan/{p.slug}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleMoveProduct(p, "up")} disabled={idx === 0} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30"><ArrowUp size={12} /></button>
                      <button onClick={() => handleMoveProduct(p, "down")} disabled={idx === productList.length - 1} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30"><ArrowDown size={12} /></button>
                      <button onClick={() => openEditProduct(p)} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground"><Edit2 size={12} /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ===== ADVANTAGES TAB ===== */}
        {activeTab === "advantages" && (
          <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">服務優勢管理</h2>
              </div>
              <button onClick={() => { showAdvantageForm ? setShowAdvantageForm(false) : openNewAdvantage(); }} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                {showAdvantageForm ? <X size={14} /> : <Plus size={14} />}
                {showAdvantageForm ? "取消" : "新增優勢"}
              </button>
            </div>
            {showAdvantageForm && (
              <form onSubmit={handleSaveAdvantage} className="px-6 py-5 border-b border-border bg-muted/30 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">{editingAdvantage ? "編輯優勢" : "新增優勢"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>圖標 (Emoji)</label>
                    <input type="text" value={advIcon} onChange={(e) => setAdvIcon(e.target.value)} required className={inputClass} placeholder="⚡" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>標題</label>
                    <input type="text" value={advTitle} onChange={(e) => setAdvTitle(e.target.value)} required className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>描述</label>
                  <textarea value={advDesc} onChange={(e) => setAdvDesc(e.target.value)} required rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={advLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    <Check size={14} />{advLoading ? "儲存中..." : "儲存"}
                  </button>
                  <button type="button" onClick={() => { setShowAdvantageForm(false); setEditingAdvantage(null); }} className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted">取消</button>
                </div>
              </form>
            )}
            <div className="divide-y divide-border">
              {advantageList.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground text-sm">暫時未有優勢項目</div>
              ) : (
                advantageList.map((a, idx) => (
                  <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{a.icon}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleMoveAdvantage(a, "up")} disabled={idx === 0} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30"><ArrowUp size={12} /></button>
                      <button onClick={() => handleMoveAdvantage(a, "down")} disabled={idx === advantageList.length - 1} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30"><ArrowDown size={12} /></button>
                      <button onClick={() => openEditAdvantage(a)} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground"><Edit2 size={12} /></button>
                      <button onClick={() => handleDeleteAdvantage(a.id)} className="p-1.5 rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ===== FAQS TAB ===== */}
        {activeTab === "faqs" && (
          <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">問題中心管理</h2>
              </div>
              <button
                onClick={() => { showFaqForm ? setShowFaqForm(false) : openNewFaq(); }}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {showFaqForm ? <X size={14} /> : <Plus size={14} />}
                {showFaqForm ? "取消" : "新增問題"}
              </button>
            </div>

            {showFaqForm && (
              <form onSubmit={handleSaveFaq} className="px-6 py-5 border-b border-border bg-muted/30 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">{editingFaq ? "編輯問題" : "新增問題"}</h3>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">問題</label>
                  <input type="text" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} required className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">答案</label>
                  <textarea value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} required rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={faqLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    <Check size={14} />
                    {faqLoading ? "儲存中..." : "儲存"}
                  </button>
                  <button type="button" onClick={() => { setShowFaqForm(false); setEditingFaq(null); }} className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted">
                    取消
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-border">
              {faqList.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground text-sm">暫時未有問題</div>
              ) : (
                faqList.map((faq, idx) => (
                  <div key={faq.id} className="px-6 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{faq.question}</p>
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleMoveFaq(faq, "up")} disabled={idx === 0} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => handleMoveFaq(faq, "down")} disabled={idx === faqList.length - 1} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30">
                        <ArrowDown size={12} />
                      </button>
                      <button onClick={() => openEditFaq(faq)} className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDeleteFaq(faq.id)} className="p-1.5 rounded-md border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {/* Change Password Modal */}
      {changePwMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-base">修改登入密碼</h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[240px]">{changePwMember.email}</p>
              </div>
              <button onClick={() => { setChangePwMember(null); setNewPw(""); setPwError(""); setPwSuccess(""); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            </div>
            {pwSuccess ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-primary font-medium text-center">{pwSuccess}</div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">新密碼</label>
                  <input type="text" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6} className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="請輸入新密碼（最少6位）" autoComplete="new-password" />
                </div>
                {pwError && <p className="text-sm text-destructive">{pwError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={pwLoading} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    <Check size={14} />
                    {pwLoading ? "更改中..." : "確認更改"}
                  </button>
                  <button type="button" onClick={() => { setChangePwMember(null); setNewPw(""); setPwError(""); }} className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted">
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {viewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl p-6 space-y-5 my-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-base">申請詳情</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(viewApp.created_at).toLocaleDateString("zh-HK")}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={viewApp.status} />
                <button onClick={() => setViewApp(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Status changer */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-xs font-medium text-foreground mr-1">更改狀態：</span>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleUpdateAppStatus(viewApp.id, s)}
                  disabled={appStatusLoading || viewApp.status === s}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    viewApp.status === s
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: "中文姓名", value: viewApp.name_chinese },
                { label: "英文姓名", value: viewApp.name_english },
                { label: "香港身份證", value: viewApp.hkid },
                { label: "出生日期", value: viewApp.dob },
                { label: "性別", value: viewApp.gender },
                { label: "婚姻狀況", value: viewApp.marital_status },
                { label: "子女", value: viewApp.children },
                { label: "手提電話", value: viewApp.phone },
                { label: "電郵地址", value: viewApp.email },
                { label: "住宅地址", value: viewApp.address },
                { label: "物業類型", value: viewApp.property_type },
                { label: "同住人", value: viewApp.cohabitants },
                { label: "職業", value: viewApp.occupation },
                { label: "每月薪金", value: `HKD ${Number(viewApp.monthly_salary).toLocaleString()}` },
                { label: "支薪方式", value: viewApp.payment_method },
                { label: "申請貸款金額", value: `HKD ${Number(viewApp.loan_amount).toLocaleString()}` },
                { label: "曾申請事項", value: viewApp.previous_applications },
                { label: "從何得知本公司", value: viewApp.referral_source },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value || "—"}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleDeleteApp(viewApp.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-destructive/30 text-destructive text-sm hover:bg-destructive/10"
              >
                <Trash2 size={13} />
                刪除申請
              </button>
              <button onClick={() => setViewApp(null)} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
