import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function Online() {
  const [form, setForm] = useState({
    nameChinese: "",
    nameEnglish: "",
    hkid: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    children: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    propertyType: "",
    cohabitants: "",
    occupation: "",
    monthlySalary: "",
    paymentMethod: "",
    loanAmount: "",
    previousApplications: "",
    referralSource: "",
    agreed: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agreed) return;
    if (!form.password || form.password.length < 6) {
      setSubmitError("密碼必須至少6位字元");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    // 1. Create auth account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: form.nameChinese } },
    });

    if (signUpError) {
      setSubmitting(false);
      setSubmitError("建立帳號失敗：" + signUpError.message);
      return;
    }

    const userId = signUpData.user?.id ?? null;

    // 2. Insert application with user_id
    const { error } = await supabase.from("loan_applications").insert([{
      user_id: userId,
      name_chinese: form.nameChinese,
      name_english: form.nameEnglish,
      hkid: form.hkid,
      dob: form.dob,
      gender: form.gender,
      marital_status: form.maritalStatus,
      children: form.children,
      phone: form.phone,
      email: form.email,
      address: form.address,
      property_type: form.propertyType,
      cohabitants: form.cohabitants,
      occupation: form.occupation,
      monthly_salary: Number(form.monthlySalary) || 0,
      payment_method: form.paymentMethod,
      loan_amount: Number(form.loanAmount) || 0,
      applied_loan_amount: Number(form.loanAmount) || 0,
      previous_applications: form.previousApplications,
      referral_source: form.referralSource,
      status: "審批中",
    }]);

    // 3. Also create profile + member role if account was created
    if (userId) {
      await Promise.all([
        supabase.from("profiles").insert({ user_id: userId, display_name: form.nameChinese }),
        supabase.from("user_roles").insert({ user_id: userId, role: "member" as const }),
      ]);
    }

    // Sign out after submission so the page stays public
    await supabase.auth.signOut();

    setSubmitting(false);

    if (error) {
      console.error("Submission error:", error);
      setSubmitError("提交失敗：" + (error.message || "請稍後重試。"));
      return;
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Fetch thank-you message from site_settings
  const [thankYouMsg, setThankYouMsg] = useState("登入方式會以電郵形式發送給你，請留意你填寫的電郵以及電話，客戶服務主任會盡快聯絡你。");
  useEffect(() => {
    if (submitted) {
      supabase.from("site_settings").select("value").eq("key", "registration_thank_you").maybeSingle().then(({ data }) => {
        if (data?.value) setThankYouMsg(data.value);
      });
    }
  }, [submitted]);

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">資料提交成功</h2>
            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-3 mb-6">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {thankYouMsg}
              </p>
            </div>
            <a href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              返回首頁
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const selectCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "block text-sm font-medium text-foreground mb-1";
  const requiredSpan = <span className="text-destructive ml-0.5">*</span>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-8">線上申請</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-base font-bold text-primary mb-5">個人資料</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>中文姓名 {requiredSpan}</label>
                  <input type="text" name="nameChinese" value={form.nameChinese} onChange={handleChange} required className={inputCls} placeholder="請輸入中文姓名" />
                </div>
                <div>
                  <label className={labelCls}>英文姓名 {requiredSpan}</label>
                  <input type="text" name="nameEnglish" value={form.nameEnglish} onChange={handleChange} required className={inputCls} placeholder="Please enter English name" />
                </div>
                <div>
                  <label className={labelCls}>香港身份證 {requiredSpan}</label>
                  <input type="text" name="hkid" value={form.hkid} onChange={handleChange} required className={inputCls} placeholder="例如：A123456(7)" />
                </div>
                <div>
                  <label className={labelCls}>出生日期 {requiredSpan}</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>性別 {requiredSpan}</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>婚姻狀況 {requiredSpan}</label>
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option value="已婚">已婚</option>
                    <option value="未婚">未婚</option>
                    <option value="離婚">離婚</option>
                    <option value="喪偶">喪偶</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>子女 {requiredSpan}</label>
                  <select name="children" value={form.children} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option value="育有子女">育有子女</option>
                    <option value="沒有子女">沒有子女</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>手提電話 {requiredSpan}</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className={inputCls} placeholder="例如：91234567" />
                </div>
                <div>
                  <label className={labelCls}>電郵地址 {requiredSpan}</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputCls} placeholder="example@email.com" />
                </div>
                <div>
                  <label className={labelCls}>設定登入密碼 {requiredSpan}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className={inputCls + " pr-10"}
                      placeholder="至少6位字元"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">此密碼將用於登入查看申請進度</p>
                </div>
                <div>
                  <label className={labelCls}>住宅地址 {requiredSpan}</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} required className={inputCls} placeholder="請輸入住宅地址" />
                </div>
                <div>
                  <label className={labelCls}>物業類型 {requiredSpan}</label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option>自置物業</option>
                    <option>家人物業</option>
                    <option>私樓租住</option>
                    <option>宿舍</option>
                    <option>公屋</option>
                    <option>村屋</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>同住人 {requiredSpan}</label>
                  <select name="cohabitants" value={form.cohabitants} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option>父母</option>
                    <option>配偶</option>
                    <option>兄弟姐妹</option>
                    <option>子女</option>
                    <option>自助</option>
                    <option>其他（如有需註明）</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Work Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-base font-bold text-primary mb-5">工作資料</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>職業 {requiredSpan}</label>
                  <input type="text" name="occupation" value={form.occupation} onChange={handleChange} required className={inputCls} placeholder="請輸入職業" />
                </div>
                <div>
                  <label className={labelCls}>每月薪金 {requiredSpan}</label>
                  <input type="number" name="monthlySalary" value={form.monthlySalary} onChange={handleChange} required className={inputCls} placeholder="HK$" />
                </div>
                <div>
                  <label className={labelCls}>支薪方式 {requiredSpan}</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option>現金</option>
                    <option>支票</option>
                    <option>銀行自動轉賬</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loan Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-base font-bold text-primary mb-5">貸款資料</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>本次貸款金額 {requiredSpan}</label>
                  <input type="number" name="loanAmount" value={form.loanAmount} onChange={handleChange} required className={inputCls} placeholder="HK$" />
                </div>
                <div>
                  <label className={labelCls}>曾申請下列事項 {requiredSpan}</label>
                  <select name="previousApplications" value={form.previousApplications} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option>破產</option>
                    <option>債務重組</option>
                    <option>壞賬</option>
                    <option>沒有申請</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>從何得知本公司 {requiredSpan}</label>
                  <select name="referralSource" value={form.referralSource} onChange={handleChange} required className={selectCls}>
                    <option value="">請選擇</option>
                    <option>網上媒體</option>
                    <option>朋友介紹</option>
                    <option>推廣信</option>
                    <option>網上討論區</option>
                    <option>免費報紙</option>
                    <option>報紙</option>
                    <option>廣告媒體</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted rounded-xl p-5 text-xs text-muted-foreground leading-relaxed">
              本人確認本人已滿十八歲，並證實本人已參閱及明白富毅信貸有限公司的私隱政策聲明及個人資料(客戶)聲明。同時，本人同意富毅信貸有限公司使用本人已填寫的個人資料聯絡本人，以跟進貸款事宜。同意富毅信貸有限公司在審批貸款申請及以後向本人之信貸狀況進行審核時，可向信貸機構提出要求索取。本人之信貸報告，而此審核可按月進行。富毅信貸有限公司對貸款申請批核與否有絕對決定權，而毋須作解釋。 富毅信貸有限公司致力保護客戶的個人資料及貸款資料，我們絕不會透露其填寫之資料給予任何人士，亦不會將客戶資料與其他公司交換以謀取利益。 本公司保留隨時終止貸款之權利及貸款之最終批核權。
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreed"
                id="agreed"
                checked={form.agreed}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-primary"
              />
              <label htmlFor="agreed" className="text-sm text-foreground cursor-pointer">
                本人已閱讀並同意上述聲明 <span className="text-destructive">*</span>
              </label>
            </div>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={!form.agreed || submitting}
              className="w-full md:w-auto px-10 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中..." : "提交"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
