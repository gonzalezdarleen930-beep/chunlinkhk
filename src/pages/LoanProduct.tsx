import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const WHATSAPP_URL = "https://wa.me/85296396851?text=你好，我想查詢貸款內容";

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
}

export default function LoanProduct() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("loan_products")
        .select("*")
        .eq("slug", slug ?? "")
        .single();
      setProduct(data as Product | null);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">找不到此貸款產品</h1>
            <Link to="/" className="text-primary hover:underline">返回首頁</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        return <h2 key={i} className="text-2xl md:text-3xl font-bold text-foreground mt-8 mb-4">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={i} className="text-xl font-semibold text-foreground mt-6 mb-3">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith("- **")) {
        const match = trimmed.match(/^- \*\*(.+?)\*\*[：:](.+)$/);
        if (match) {
          return (
            <div key={i} className="flex items-start gap-3 py-2">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <p className="text-muted-foreground"><span className="font-semibold text-foreground">{match[1]}</span>：{match[2]}</p>
            </div>
          );
        }
      }
      if (trimmed.startsWith("- ")) {
        return (
          <div key={i} className="flex items-start gap-3 py-1">
            <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
            <p className="text-muted-foreground">{trimmed.slice(2)}</p>
          </div>
        );
      }
      if (trimmed === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-muted-foreground leading-relaxed">{trimmed}</p>;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          {product.image_url ? (
            <div className="absolute inset-0">
              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-primary/5" />
          )}
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{product.description}</p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/online"
                className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                立即申請
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-md border border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                WhatsApp 查詢
              </a>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4">
            {renderContent(product.content)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
