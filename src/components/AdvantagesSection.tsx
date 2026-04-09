import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Advantage {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

const fallbackAdvantages = [
  { icon: "💰", title: "貸款額高達月薪21倍", description: "根據您的收入及信貸狀況，提供高達月薪21倍的貸款額度。" },
  { icon: "📅", title: "還款期長達72個月", description: "靈活的還款期選擇，每月供款輕鬆自在。" },
  { icon: "📉", title: "特低利息", description: "HK$10,000貸款每日利息只需約HK$1.05。" },
  { icon: "⚡", title: "即場得知申請結果", description: "專業的批核團隊為您即場處理申請。" },
];

export default function AdvantagesSection() {
  const [advantages, setAdvantages] = useState<Advantage[]>([]);

  useEffect(() => {
    supabase
      .from("advantages")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setAdvantages(data as Advantage[]);
      });
  }, []);

  const items = advantages.length > 0 ? advantages : fallbackAdvantages;

  return (
    <section id="advantages" className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">服務優勢</h2>
          <p className="text-muted-foreground">我們提供的一站式財務方面提供專業服務。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={"id" in item ? (item as Advantage).id : idx}
              className="bg-card rounded-xl p-8 text-center border border-border shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-5">{item.description}</p>
              <Link
                to="/online"
                className="inline-flex items-center justify-center px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                立即申請
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
