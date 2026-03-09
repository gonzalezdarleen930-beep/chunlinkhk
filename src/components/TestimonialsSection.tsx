const testimonials = [
  {
    text: "疫情後公司小店經常被迫停業,出糧交租都係一個大問題,傳統銀行的貸款額亦未必達到我的要求,還好經網上廣告看到駿嶺,可以輕易知道自己預先批核的貸款金額,等我可以渡過難關。",
  },
  {
    text: "結婚擺酒book車book酒店影相都要現金週轉，想大攪令屋企人同親朋戚友為我慶祝咁高興嘅日子，可惜手上現金唔多，好彩駿嶺係我最要急需週轉嘅時候幫手，可以話係我嘅強大應援。",
  },
  {
    text: "呢幾年冇得出國去旅行，網上購物已經成為我嘅習慣，一見有新款或者限量產品越買越多，攪到d咭數就係咁越碌越多，但每次月結單淨係找到最低還款額，都唔知找到幾時，網上見到駿嶺有低息清咭數，諗住試下心態申請，點知回覆快之餘，仲可以供款期數長達36個月，等我再去網上購物都可以輕輕鬆鬆。",
  },
  {
    text: "考到船牌諗住買二手船慶祝，同朋友出海玩下，啱心水但爭少少，朋友介紹咗駿嶺幫手，好快，即日就批出，無諗過現金糧都可以批都咁多，可以輕鬆出海釣魚玩下。",
  },
  {
    text: "自置村屋，住了好久想修葺，兒子出國讀書又想幫他們留點生活費及現金備用，但裝修訂金需要先付，之前問過但無貸款公司幫手，直至認識駿嶺，他們了解我的情況，之後提交需要文件審批，現金即到手。",
  },
  {
    text: "放寬入境隔離，即上網book機票酒去旅行，去玩果陣見到鍾意就買，想要就碌咭，返到嚟見到張咭月結單就知出事，即刻諗起駿嶺，佢哋之前都幫我低息清咭數之餘，仲可以升返TU信貸評級，真係一舉兩得。",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">客戶評語</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gold">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
