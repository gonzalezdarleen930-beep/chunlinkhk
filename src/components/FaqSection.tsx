import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "1. 申請需時多久?",
    a: "申請後最快10分鐘可知結果",
  },
  {
    q: "2. 申請需要什麼資格?",
    a: "· 香港永久性居民\n· 18歲或以上",
  },
  {
    q: "3. 申請貸款有何步驟？",
    a: "· 步驟一︰ 網上遞交申請表 / 電話申請\n· 步驟二︰ 進行貸款評估\n· 步驟三︰ 貸款批核結果通知\n· 步驟四︰ 簽署貸款合約然後獲取現金",
  },
  {
    q: "4. 富毅信貸有限公司提供什麼類型的貸款服務？",
    a: "富毅信貸有限公司提供無抵押私人貸款、公務員貸款、樓宇按揭、業主貸款、清卡數貸款等各類貸款服務。",
  },
  {
    q: "5. 申請人可透過什麼途徑申請貸款？",
    a: "富毅信貸有限公司提供多種簡單快捷的申請途徑，客戶可自由選擇方便自己的方法。\n· 網上申請\n· 電話申請\n· 親臨本公司申請",
  },
  {
    q: "6. 經富毅信貸有限公司申請任何貸款，是否須繳付手續費或其他附加費用嗎？",
    a: "是不需要。富毅信貸有限公司絕對不會收取客人任何手續費或附加費用。",
  },
  {
    q: "7. 申請貸款時，一般需遞交什麼文件",
    a: "· 香港永久性居民身份證\n· 最近3個月之入息證明（例如: 糧單, 稅單, 銀行月結單,僱傭合約,員工證等）\n· 最近3個月之住址證明（例如: 銀行月結單, 水費單, 電費單, 煤氣單, 電話費單）",
  },
  {
    q: "8. 貸款人可選擇哪些還款方式？",
    a: "恒生銀行，大眾銀行或親臨本公司繳交供款",
  },
  {
    q: "9. 是否可以不用親臨本公司作貸款申請？",
    a: "是的。客戶可以隨時隨地透過網上申請或電話申請貸款，而可以不用親臨本公司。",
  },
  {
    q: "10. 如有其他疑問，可於哪裡查詢？",
    a: "客戶可於辦公時間內致電貸款熱線96396851或親臨本公司查詢",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

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
              key={i}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                {open === i ? (
                  <ChevronUp size={16} className="text-primary shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
                )}
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground whitespace-pre-line border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
