import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Termsofuse() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">使用條款</h1>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>請細閱下列條款。若閣下存取本網站及其中任何網頁，即視為同意無條件接受下列各項條款。</p>
            <p>駿嶺香港有限公司("本公司")保留對使用條款的修訂權。本公司可隨時修改、增加及刪減使用條款的內容。任何的內容修訂一經發佈即告生效。本公司建議客人不定期瀏覽此網頁，留意本公司的使用條款有否任何更新，以取得最新資訊。</p>
            <p>本網站記載的資料僅供一般參考之用，不宜視為專業意見。請翻閱此等資料的人士在需要時，尋求適當的專業指導。本公司對此等資料的提供，已力求準確、完整和及時。特別是，在此等資訊及資料的有關方面，本公司並不就某一特定用途的非侵權、保安、準確性、適合性、或不含電腦病毒作出任何保證。倘資料有誤或欠全，本公司恕不承擔任何責任。</p>
            <p>本網站所載各項產品和服務由駿嶺香港有限公司按照香港特別行政區放債人牌照在有關司法管轄區合法提供，若任何司法管轄區限制本財務公司分發此等資料，則此等網頁內所載資料並不擬給予位於或居於有關司法管轄區內的人士使用。存取此等網頁的人士須知悉及遵守任何有關限制。</p>
            <div className="border-t border-border pt-4 mt-6">
              <p><strong>放債人牌照號碼：</strong>2079/2021</p>
              <p><strong>地址：</strong>九龍旺角彌敦道610號荷李活商業中心1609室</p>
              <p className="mt-2">忠告：借錢梗要還，咪俾錢中介。</p>
              <p>投訴熱線：23912866</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
