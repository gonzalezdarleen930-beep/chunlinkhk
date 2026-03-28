
-- Loan products table for the 4 product pages
CREATE TABLE public.loan_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read loan_products" ON public.loan_products
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin inserts loan_products" ON public.loan_products
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin updates loan_products" ON public.loan_products
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin deletes loan_products" ON public.loan_products
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Advantages table for the advantages section
CREATE TABLE public.advantages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT '⚡',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.advantages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read advantages" ON public.advantages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin inserts advantages" ON public.advantages
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin updates advantages" ON public.advantages
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin deletes advantages" ON public.advantages
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Seed loan products
INSERT INTO public.loan_products (slug, title, description, content, sort_order) VALUES
('debt-consolidation', '一筆清，舒緩易', '整合多項債務，一筆過清還，減輕每月還款壓力。', E'## 一筆清，舒緩易\n\n### 適合人士\n適合有多項貸款或信用卡結欠的人士，希望整合債務以降低每月還款額及利息支出。\n\n### 產品特點\n- **整合所有債務**：將多項貸款及信用卡結欠合而為一，只需每月繳付一筆還款\n- **降低利率**：享受更優惠的利率，減少利息支出\n- **靈活還款期**：可選擇最適合您的還款期，減輕每月負擔\n- **快速批核**：最快即日批核，助您儘快解決債務問題\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有有效香港身份證\n- 有穩定收入來源\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。', 1),
('personal-loan', '私人貸款', '靈活運用資金，滿足您的不同需要。', E'## 私人貸款\n\n### 適合人士\n適合在職人士、專業人士、公務員及物業持有人，無論用於個人進修、家居裝修、婚禮開支或其他個人用途。\n\n### 產品特點\n- **貸款額靈活**：根據您的需要及還款能力，提供合適的貸款方案\n- **還款期彈性**：多種還款期可供選擇，配合您的財務狀況\n- **手續簡便**：只需提供基本文件，申請程序簡單快捷\n- **即日批核**：最快即日得知申請結果\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有有效香港身份證\n- 有穩定收入來源\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。', 2),
('secured-loan', '抵押品貸款', '以資產作抵押，享受更優惠的貸款條件。', E'## 抵押品貸款\n\n### 適合人士\n適合持有資產（如汽車、珠寶、名錶等）的人士，願意以資產作為抵押品以獲取更佳貸款條件。\n\n### 產品特點\n- **更高貸款額**：以抵押品價值為基礎，提供更高的貸款額度\n- **更低利率**：有抵押品支持，可享受更具競爭力的利率\n- **多種抵押品接受**：汽車、珠寶、名錶等均可作為抵押品\n- **快速估價批核**：專業估價團隊，即時為您的資產進行評估\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有有效香港身份證\n- 提供合資格的抵押品\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。', 3),
('property-loan', '物業貸款', '以物業作擔保，釋放物業價值。', E'## 物業貸款\n\n### 適合人士\n適合物業持有人，希望透過物業的價值獲取資金，用於投資、裝修、周轉或其他用途。\n\n### 產品特點\n- **高額貸款**：根據物業估值提供高額貸款\n- **超低利率**：物業作擔保，享受市場最優惠利率\n- **長還款期**：最長還款期可達數年，每月供款更輕鬆\n- **免提前還款罰息**：可隨時提前還款，無額外收費\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有香港物業\n- 物業業權清晰\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。', 4);

-- Seed advantages (from OK Finance reference)
INSERT INTO public.advantages (icon, title, description, sort_order) VALUES
('💰', '貸款額高達月薪21倍', '根據您的收入及信貸狀況，提供高達月薪21倍的貸款額度，滿足您的資金需要。', 1),
('📅', '還款期長達72個月', '靈活的還款期選擇，最長可達72個月，每月供款輕鬆自在，減輕還款壓力。', 2),
('📉', '特低利息', '提供市場最具競爭力的利率，HK$10,000貸款每日利息只需約HK$1.05，為您節省更多。', 3),
('⚡', '即場得知申請結果', '專業的批核團隊為您即場處理申請，讓您即時得知貸款審批結果，無需漫長等待。', 4);
