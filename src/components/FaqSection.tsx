import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setFaqs(data);
      });
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-16 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">問題中心</h2>
          <p className="text-muted-foreground">FAQ</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.id}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.question}</span>
                {open === i ? (
                  <ChevronUp size={16} className="text-primary shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
                )}
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground whitespace-pre-line border-t border-border pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
