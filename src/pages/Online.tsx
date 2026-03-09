import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agreed) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">申請已提交！</h2>
            <p className="text-muted-foreground mb-6">感謝您的申請，我們的專員將盡快與您聯絡。</p>
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
              本人確認本人已滿十八歲，並證實本人已參閱及明白駿嶺財務有限公司的私隱政策聲明及個人資料(客戶)聲明。同時，本人同意駿嶺財務有限公司使用本人已填寫的個人資料聯絡本人，以跟進貸款事宜。同意駿嶺財務有限公司在審批貸款申請及以後向本人之信貸狀況進行審核時，可向信貸機構提出要求索取。本人之信貸報告，而此審核可按月進行。駿嶺財務有限公司對貸款申請批核與否有絕對決定權，而毋須作解釋。 駿嶺財務有限公司致力保護客戶的個人資料及貸款資料，我們絕不會透露其填寫之資料給予任何人士，亦不會將客戶資料與其他公司交換以謀取利益。 本公司保留隨時終止貸款之權利及貸款之最終批核權。
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
                此項必須填寫哦 <span className="text-destructive">*</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!form.agreed}
              className="w-full md:w-auto px-10 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
