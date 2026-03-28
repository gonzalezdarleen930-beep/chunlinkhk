CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin inserts faqs" ON public.faqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates faqs" ON public.faqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes faqs" ON public.faqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.faqs (question, answer, sort_order) VALUES
('1. 申請需時多久?', '申請後最快10分鐘可知結果', 1),
('2. 申請需要什麼資格?', '· 香港永久性居民
· 18歲或以上', 2),
('3. 申請貸款有何步驟？', '· 步驟一︰ 網上遞交申請表 / 電話申請
· 步驟二︰ 進行貸款評估
· 步驟三︰ 貸款批核結果通知
· 步驟四︰ 簽署貸款合約然後獲取現金', 3),
('4. 富毅信貸有限公司提供什麼類型的貸款服務？', '富毅信貸有限公司提供無抵押私人貸款、公務員貸款、樓宇按揭、業主貸款、清卡數貸款等各類貸款服務。', 4),
('5. 申請人可透過什麼途徑申請貸款？', '富毅信貸有限公司提供多種簡單快捷的申請途徑，客戶可自由選擇方便自己的方法。
· 網上申請
· 電話申請
· 親臨本公司申請', 5),
('6. 經富毅信貸有限公司申請任何貸款，是否須繳付手續費或其他附加費用嗎？', '是不需要。富毅信貸有限公司絕對不會收取客人任何手續費或附加費用。', 6),
('7. 申請貸款時，一般需遞交什麼文件', '· 香港永久性居民身份證
· 最近3個月之入息證明（例如: 糧單, 稅單, 銀行月結單,僱傭合約,員工證等）
· 最近3個月之住址證明（例如: 銀行月結單, 水費單, 電費單, 煤氣單, 電話費單）', 7),
('8. 貸款人可選擇哪些還款方式？', '恒生銀行，大眾銀行或親臨本公司繳交供款', 8),
('9. 是否可以不用親臨本公司作貸款申請？', '是的。客戶可以隨時隨地透過網上申請或電話申請貸款，而可以不用親臨本公司。', 9),
('10. 如有其他疑問，可於哪裡查詢？', '客戶可於辦公時間內致電貸款熱線96396851或親臨本公司查詢', 10);