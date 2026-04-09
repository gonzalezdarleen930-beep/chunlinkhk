import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.jpg";

export default function Footer() {
  const [whatsappNumber, setWhatsappNumber] = useState("85296396851");

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setWhatsappNumber(data.value);
      });
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=你好，我想查詢貸款內容`;

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoImg} alt="富毅信貸有限公司" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-sm opacity-70 mb-3">放債人牌照號碼: 1841/2025</p>
            <a href="/PrivacyPolicy" className="text-sm opacity-70 hover:opacity-100 underline">
              忠告：借錢梗要還，咪俾錢中介<br />
              投訴電話 : 96396851
            </a>
          </div>

          <div className="flex-shrink-0">
            <h4 className="text-sm font-semibold mb-3 opacity-80">網站連結</h4>
            <ul className="space-y-2">
              {[
                { label: "關於我們", href: "/#about" },
                { label: "貸款優勢", href: "/#advantages" },
                { label: "私隱條款", href: "/PrivacyPolicy" },
                { label: "使用條款", href: "/Termsofuse" },
                { label: "放債人條例", href: "/MoneyLendersOrdinance" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0">
            <h4 className="text-sm font-semibold mb-3 opacity-80">聯絡方式</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>(852) 96396851</li>
              <li>contact@grit-credit.com</li>
              <li className="max-w-[220px]">香港夏愨道18號海富中心一座1201</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-background/20 text-xs opacity-50 text-center">
          © Copyright 2025 富毅信貸有限公司. All Rights Reserved.
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed right-4 bottom-24 z-50 flex flex-col gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          style={{ backgroundColor: "#25D366" }}
          title="WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </footer>
  );
}
