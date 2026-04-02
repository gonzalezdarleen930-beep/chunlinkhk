const WHATSAPP_URL = "https://wa.me/85296396851?text=你好，我想查詢貸款內容";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">關於我們</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              本公司於2016年創辦，作為一間本地金融經濟主要市場服務為主私人財務公司，我們致力為每位客人作出公司融資以至個人財務產品服務，以誠意真心服務每位顧客提供稱心貼心的貸款服務，解決燃眉之急。
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              立即申請
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "2016", label: "年創立" },
              { num: "12小時", label: "極速批核" },
              { num: "36%", label: "最高年息" },
              { num: "120期", label: "最長還款期" },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-xl p-6 text-center border border-border">
                <div className="text-2xl font-bold text-primary mb-1">{item.num}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
