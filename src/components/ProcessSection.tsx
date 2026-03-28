import { Phone, ClipboardList, FileSearch, CheckCircle, Banknote } from "lucide-react";

const steps = [
  {
    icon: Phone,
    step: "1",
    title: "免費諮詢",
    desc: "電話或WhatsApp洽詢方案",
  },
  {
    icon: ClipboardList,
    step: "2",
    title: "評估方案",
    desc: "專員評估狀況，說明利率、額度等細節",
  },
  {
    icon: FileSearch,
    step: "3",
    title: "送件審核",
    desc: "遞交申請資料送審",
  },
  {
    icon: CheckCircle,
    step: "4",
    title: "貸款批核",
    desc: "資料審核、對保，預備撥款",
  },
  {
    icon: Banknote,
    step: "5",
    title: "迅速撥款",
    desc: "批核通過，撥款入帳",
  },
];

export default function ProcessSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">申辦流程</h2>
          <p className="text-muted-foreground">簡單五步 · 極速批核</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative flex flex-col items-center text-center group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-primary/20" />
              )}
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4 relative z-10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <s.icon size={28} className="text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="text-xs font-semibold text-primary mb-1">Step {s.step}</div>
              <h3 className="text-base font-bold text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
