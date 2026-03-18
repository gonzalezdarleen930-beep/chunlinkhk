import heroBanner from "@/assets/hero-banner.jpg";
import { useState } from "react";

const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=85296396851&text&type=phone_number&app_absent=0";

const MONTHS = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

export default function HeroSection() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [monthly, setMonthly] = useState<number | null>(null);

  function calculate() {
    if (loanAmount < 10000 || loanAmount > 200000 || selectedMonth === 0) {
      setMonthly(null);
      return;
    }
    const rate = 0.36 / 12;
    const n = selectedMonth;
    const m = (loanAmount * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    setMonthly(m);
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden">
        <img
          src={heroBanner}
          alt="富毅信貸有限公司"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 max-w-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-gold leading-tight mb-2">
              助你一臂
            </h1>
            <h1 className="text-3xl md:text-4xl font-bold text-gold leading-tight mb-4">
              鬆一口氣
            </h1>
            <p className="text-background/90 text-sm mb-6">
              我們一直為客戶財務方面提供專業服務。
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              立即申請
            </a>
          </div>
        </div>
      </section>

      {/* Loan Calculator */}
      <section className="bg-background py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
            <div className="space-y-6">
              {/* Amount slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-foreground">金額</label>
                  <span className="text-primary font-bold">HK$ {loanAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={200000}
                  step={1000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="loan-slider w-full"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((loanAmount - 10000) / 190000) * 100}%, hsl(var(--border)) ${((loanAmount - 10000) / 190000) * 100}%, hsl(var(--border)) 100%)`
                  }}
                />
              </div>

              {/* Month selector */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-foreground">分期月份</label>
                  <span className="text-primary font-bold">{selectedMonth} 個月</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMonth(m)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                        selectedMonth === m
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculate}
                className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                預先計算
              </button>

              {/* Result */}
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">每個月還款金額：</p>
                <p className="text-2xl font-bold text-primary">
                  {monthly ? `HK$ ${monthly.toFixed(0)}` : "--"}
                </p>
              </div>

              {/* Notes */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>· 貸款金額應在$ <strong>10,000</strong>-$ <strong>200,000</strong> 之間。</p>
                <p>· 客戶可獲享之利率將按其個人信貸狀況而定，實際利率不超過年息 <strong>36.00</strong>%，還款期一般為 <strong>3</strong> 個月至 <strong>36</strong> 個月。</p>
                <p>· 擁有對貸款審批之最終決定權。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
