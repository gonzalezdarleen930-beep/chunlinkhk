const WHATSAPP_URL = "https://wa.me/85296396851?text=你好，我想查詢貸款內容";

const advantages = [
  {
    icon: "⚡",
    title: "特快批核",
    desc: "申請後最快10分鐘可知結果，讓您即時了解貸款狀況。",
  },
  {
    icon: "💰",
    title: "利率低",
    desc: "為客戶提供市場最具競爭力的利率，減輕還款壓力。",
  },
  {
    icon: "✅",
    title: "免TU",
    desc: "無需信貸記錄查核，讓更多有需要的客戶獲得協助。",
  },
];

export default function AdvantagesSection() {
  return (
    <section id="advantages" className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">我們的優勢</h2>
          <p className="text-muted-foreground">我們提供的一站式財務方面提供專業服務。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {advantages.map((item) => (
            <div
              key={item.title}
              className="bg-card rounded-xl p-8 text-center border border-border shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-5">{item.desc}</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                立即申請
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
