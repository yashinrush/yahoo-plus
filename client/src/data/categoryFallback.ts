import type { Article } from '../types/index.js';

export const CLIENT_CATEGORY_ARTICLES: Record<'ja' | 'en', Record<string, Article[]>> = {
  ja: {
    technology: [
      {
        id: 'cl-tech-1',
        title: '国産2nm次世代半導体の量産試作ラインが稼働 AI半導体需要に対応',
        description: '北海道千歳市の拠点にて、最先端EUV露光装置を用いた2nmプロセス半導体の試験製造が前倒しで開始。生成AIアクセラレータや自動運転向けチップの国内供給網確立を目指します。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        publishedAt: '10分前',
        source: { name: 'ITmedia NEWS' },
        category: 'テクノロジー',
        commentsCount: 142,
        likesCount: 1890,
      },
      {
        id: 'cl-tech-2',
        title: '新型生成AIモデル「Gemini 3」発表 高速マルチモーダル推論が日常デバイスへ',
        description: '超軽量アーキテクチャと低遅延ストリーミング処理を兼ね備えた最新モデルが登場。スマートフォンやPC上のエッジデバイスで複雑な推論タスクがリアルタイムに稼働します。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
        publishedAt: '25分前',
        source: { name: 'TechCrunch Japan' },
        category: 'テクノロジー',
        commentsCount: 95,
        likesCount: 1240,
      },
      {
        id: 'cl-tech-3',
        title: '完全自動運転EVタクシー、都心主要エリアで実証運行を拡大',
        description: 'LiDARと高精度3Dマップを連携させた自動運転車両が大手町〜お台場間での乗客輸送実証を開始。混雑路での車線変更や歩行者回避性能が確認されました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        publishedAt: '45分前',
        source: { name: '日経クロステック' },
        category: 'テクノロジー',
        commentsCount: 68,
        likesCount: 810,
      },
      {
        id: 'cl-tech-4',
        title: '量子コンピューティング実用化へ 国内共同研究拠点が新アルゴリズム公開',
        description: '新材料探索や創薬シミュレーションの計算時間を大幅に短縮する量子ハイブリッド手法が実証され、産業界からの注目が集まっています。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        publishedAt: '1時間前',
        source: { name: 'PC Watch' },
        category: 'テクノロジー',
        commentsCount: 44,
        likesCount: 650,
      },
    ],
    sports: [
      {
        id: 'cl-sports-1',
        title: '大谷翔平 圧巻の50号本塁打＆盗塁ラッシュ スタジアム熱狂の歴史的快挙',
        description: 'メジャーリーグの歴史を塗り替える驚異的な活躍。勝負を決める特大アーチを放ち、チームをプレーオフ進出へと力強く牽引しました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        publishedAt: '15分前',
        source: { name: 'スポーツ報知' },
        category: 'スポーツ',
        commentsCount: 380,
        likesCount: 4500,
      },
      {
        id: 'cl-sports-2',
        title: 'サッカー日本代表 W杯最終予選で難敵を圧倒 攻守に冴えわたる連動性',
        description: 'アウェーの過酷な環境の中、前半立ち上がりから主導権を握り3得点を奪取。グループ首位を盤石なものとしました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        publishedAt: '35分前',
        source: { name: 'サッカーダイジェスト' },
        category: 'スポーツ',
        commentsCount: 210,
        likesCount: 2890,
      },
      {
        id: 'cl-sports-3',
        title: 'プロ野球 クライマックスシリーズ熱戦開幕 各球団のエースが力投',
        description: '日本シリーズ進出を懸けた激闘が開幕。満員のファンの声援の中、息詰まる投手戦が繰り広げられました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
        publishedAt: '1時間前',
        source: { name: '日刊スポーツ' },
        category: 'スポーツ',
        commentsCount: 155,
        likesCount: 1670,
      },
      {
        id: 'cl-sports-4',
        title: '陸上・短距離界に新星現る 日本学生新記録を樹立し世界選手権へ弾み',
        description: '追い風参考ではない公認記録で大台を突破。スタートからの加速と力強いフォームで自己ベストを大幅に更新しました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
        publishedAt: '2時間前',
        source: { name: '共同通信' },
        category: 'スポーツ',
        commentsCount: 78,
        likesCount: 920,
      },
    ],
    economy: [
      {
        id: 'cl-econ-1',
        title: '日経平均株価が大幅反発 半導体・ハイテク株主導で全面高の展開',
        description: '米株式市場の上昇や好決算発表を受け、東京株式市場では海外投資家の買い注文が先行。取引時間中の高値を更新しました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        publishedAt: '8分前',
        source: { name: 'ロイター' },
        category: '経済',
        commentsCount: 185,
        likesCount: 2240,
      },
      {
        id: 'cl-econ-2',
        title: '日銀 総裁会見で金融緩和の修正ペースについて言及 為替は小幅円高へ',
        description: '賃金と物価の好循環を確認しながら、慎重かつ段階的な利上げを検討する姿勢を改めて表明。市場では政策の予見可能性が高まったと受け止められています。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
        publishedAt: '22分前',
        source: { name: 'ブルームバーグ' },
        category: '経済',
        commentsCount: 130,
        likesCount: 1480,
      },
      {
        id: 'cl-econ-3',
        title: '新NISA口座開設数が過去最高ペース 若年層の資産形成シフトが加速',
        description: '非課税投資枠を活用した長期分散投資が定着。主要ネット証券各社でのインデックス投信の積立設定額が過去最大を更新しました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
        publishedAt: '50分前',
        source: { name: 'ダイヤモンド・オンライン' },
        category: '経済',
        commentsCount: 92,
        likesCount: 1120,
      },
      {
        id: 'cl-econ-4',
        title: '国内大手メーカー 今冬のボーナス引き上げを相次ぎ発表 過去最高水準へ',
        description: '人手不足への対応と物価高を受けた処遇改善として、主要製造業の冬期一時金が大幅増額で妥結しています。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        publishedAt: '1時間前',
        source: { name: '東洋経済オンライン' },
        category: '経済',
        commentsCount: 64,
        likesCount: 780,
      },
    ],
    entertainment: [
      {
        id: 'cl-ent-1',
        title: '人気アニメの最新劇場版が興行収入100億円を最速突破 記念イベント開催',
        description: '世界同時公開でも大ヒットを記録中の最新作が国内記録を更新。舞台挨拶には主要キャストが登壇し、ファンへの感謝を語りました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        publishedAt: '18分前',
        source: { name: 'オリコンニュース' },
        category: 'エンタメ',
        commentsCount: 220,
        likesCount: 3100,
      },
      {
        id: 'cl-ent-2',
        title: '世界的音楽フェスが日本初上陸 海外トップアーティストが続々出演発表',
        description: '臨海副都心特設ステージにて開催される超大型野外フェスの第1弾ラインナップが解禁。チケット先行抽選にアクセスが殺到しています。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        publishedAt: '40分前',
        source: { name: 'ナタリー' },
        category: 'エンタメ',
        commentsCount: 110,
        likesCount: 1950,
      },
      {
        id: 'cl-ent-3',
        title: '話題の配信ドラマが世界トレンド1位に 圧倒的な映像美とサスペンス展開',
        description: '豪華キャストが集結した新作オリジナルシリーズが配信開始直後から話題沸騰。SNS上での考察合戦が過熱しています。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        publishedAt: '1時間前',
        source: { name: 'シネマトゥデイ' },
        category: 'エンタメ',
        commentsCount: 88,
        likesCount: 1340,
      },
    ],
    society: [
      {
        id: 'cl-soc-1',
        title: '次世代超伝導リニアの新型車両による時速500km試験走行を公開',
        description: '山梨実験線にて報道陣に公開された新型車両は、空力性能の向上とエネルギー消費量15%削減を実証。営業線に向けた技術開発が加速しています。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
        publishedAt: '12分前',
        source: { name: '毎日新聞' },
        category: '社会',
        commentsCount: 175,
        likesCount: 2100,
      },
      {
        id: 'cl-soc-2',
        title: '首都圏の大規模再開発プロジェクト 新たな歩行者専用緑道と商業棟が完成',
        description: '都市の防災機能向上と回遊性向上を目的とした新街区がオープン。災害時の一時避難場所や備蓄倉庫を備えた先進的なまちづくりが特徴です。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        publishedAt: '30分前',
        source: { name: '読売新聞オンライン' },
        category: '社会',
        commentsCount: 92,
        likesCount: 1180,
      },
    ],
    world: [
      {
        id: 'cl-wld-1',
        title: '気候変動対策の国際首脳会議 次世代クリーンエネルギー投資協定を採択',
        description: '主要国首脳が共同宣言を発表。洋上風力発電と水素エネルギーインフラ整備に向けた官民ファンドの設立で合意しました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        publishedAt: '20分前',
        source: { name: 'AFPBB News' },
        category: '国際',
        commentsCount: 140,
        likesCount: 1720,
      },
      {
        id: 'cl-wld-2',
        title: '月周回有人探査計画「アルテミス」新型着陸船の総合燃焼試験に成功',
        description: '有人月面着陸に向けた重要マイルストーンをクリア。国際宇宙協力による深宇宙探査が新たなステージに入りました。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
        publishedAt: '50分前',
        source: { name: 'BBC News Japan' },
        category: '国際',
        commentsCount: 86,
        likesCount: 1250,
      },
    ],
    local: [
      {
        id: 'cl-loc-1',
        title: '東京都心で秋のフード＆クラフトフェス開催 各地の特産品が集結',
        description: '週末の代々木公園にて全国の有名店が出店する野外フェスティバルが開幕。好天に恵まれ多くの家族連れや観光客で賑わっています。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        publishedAt: '14分前',
        source: { name: '東京ウォーカー' },
        category: '地域',
        commentsCount: 65,
        likesCount: 930,
      },
      {
        id: 'cl-loc-2',
        title: '関西エリアの鉄道路線 ダイヤ改正で新型特急車両の運行本数を拡大',
        description: '快適性と省エネ性能を高めた新型車両が主要区間に順次投入。通勤・観光客双方の利便性が向上します。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
        publishedAt: '42分前',
        source: { name: '関西ニュース' },
        category: '地域',
        commentsCount: 48,
        likesCount: 710,
      },
    ],
  },
  en: {
    technology: [
      {
        id: 'cl-tech-en-1',
        title: 'Next-Gen 2nm Semiconductor Pilot Line Starts Operation in Japan',
        description: 'Advanced extreme ultraviolet (EUV) pilot manufacturing began ahead of schedule, reinforcing domestic chip supply chains for generative AI and autonomous vehicles.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        publishedAt: '10m ago',
        source: { name: 'TechCrunch' },
        category: 'Technology',
        commentsCount: 142,
        likesCount: 1890,
      },
      {
        id: 'cl-tech-en-2',
        title: 'Gemini 3 Multimodal Architecture Unveiled for On-Device Low Latency AI',
        description: 'Featuring instant streaming reasoning and reduced compute overhead, the new model brings enterprise-grade intelligence to everyday smartphones and PCs.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
        publishedAt: '25m ago',
        source: { name: 'VentureBeat' },
        category: 'Technology',
        commentsCount: 95,
        likesCount: 1240,
      },
    ],
    sports: [
      {
        id: 'cl-sports-en-1',
        title: 'Shohei Ohtani Delivers 50th Home Run and Stolen Base in Historic Victory',
        description: 'The baseball superstar rewrote league milestones with a clutch blast, energizing fans and propelling his franchise toward the postseason.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        publishedAt: '15m ago',
        source: { name: 'ESPN' },
        category: 'Sports',
        commentsCount: 380,
        likesCount: 4500,
      },
      {
        id: 'cl-sports-en-2',
        title: 'Japan National Soccer Team Triumphs in Crucial World Cup Qualifier',
        description: 'A commanding tactical performance secured three early goals, strengthening their lead at the top of the qualifying table.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        publishedAt: '35m ago',
        source: { name: 'BBC Sport' },
        category: 'Sports',
        commentsCount: 210,
        likesCount: 2890,
      },
    ],
    economy: [
      {
        id: 'cl-econ-en-1',
        title: 'Tokyo Stocks Rally Sharply Led by High-Tech and Semiconductor Shares',
        description: 'Nikkei index surged on strong corporate earnings and international capital inflows, touching fresh multi-month milestones.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        publishedAt: '8m ago',
        source: { name: 'Reuters' },
        category: 'Economy',
        commentsCount: 185,
        likesCount: 2240,
      },
    ],
    entertainment: [
      {
        id: 'cl-ent-en-1',
        title: 'Record-Breaking Animated Feature Surpasses $100 Million at Box Office',
        description: 'Global audience demand sets new theatrical benchmarks as producers announce celebratory worldwide screenings.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        publishedAt: '18m ago',
        source: { name: 'Variety' },
        category: 'Entertainment',
        commentsCount: 220,
        likesCount: 3100,
      },
    ],
    society: [
      {
        id: 'cl-soc-en-1',
        title: 'Next-Generation Superconducting Maglev Shinkansen Achieves 500 km/h Trials',
        description: 'Public testing in Yamanashi demonstrated a 15% efficiency gain and enhanced aerodynamic stability for upcoming commercial corridors.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
        publishedAt: '12m ago',
        source: { name: 'Kyodo News' },
        category: 'Society',
        commentsCount: 175,
        likesCount: 2100,
      },
    ],
    world: [
      {
        id: 'cl-wld-en-1',
        title: 'Global Climate Summit Adopts Multinational Renewable Energy Accord',
        description: 'World leaders greenlight joint sovereign funding initiatives for offshore wind and green hydrogen infrastructure.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        publishedAt: '20m ago',
        source: { name: 'Associated Press' },
        category: 'World',
        commentsCount: 140,
        likesCount: 1720,
      },
    ],
    local: [
      {
        id: 'cl-loc-en-1',
        title: 'Autumn Food and Craft Festival Welcomes Thousands in Central Tokyo',
        description: 'Regional artisans and gourmet pop-ups drew huge weekend crowds in Yoyogi Park under pleasant seasonal skies.',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        publishedAt: '14m ago',
        source: { name: 'Japan Times' },
        category: 'Local',
        commentsCount: 65,
        likesCount: 930,
      },
    ],
  },
};

export function getClientCategoryFallback(category: string, lang: 'ja' | 'en'): Article[] {
  const langData = CLIENT_CATEGORY_ARTICLES[lang] || CLIENT_CATEGORY_ARTICLES.ja;
  
  const key = (category || 'technology').toLowerCase();
  if (langData[key]) return langData[key];

  // Alias lookups
  if (key === 'business' && langData.economy) return langData.economy;
  if (key === 'nation' && langData.society) return langData.society;
  if (key === 'tokyo' || key === 'osaka' || key === 'nagoya' || key === 'fukuoka') return langData.local || [];

  // Default mix
  const mix = [
    ...(langData.technology || []),
    ...(langData.economy || []),
    ...(langData.sports || []),
    ...(langData.entertainment || []),
    ...(langData.society || []),
  ];
  return mix.slice(0, 8);
}

export function searchArticles(query: string, lang: 'ja' | 'en'): Article[] {
  const langData = CLIENT_CATEGORY_ARTICLES[lang] || CLIENT_CATEGORY_ARTICLES.ja;
  const allArticles: Article[] = [];
  const seenIds = new Set<string>();

  for (const list of Object.values(langData)) {
    for (const art of list) {
      if (!seenIds.has(art.id)) {
        seenIds.add(art.id);
        allArticles.push(art);
      }
    }
  }

  const clean = query.trim().toLowerCase();
  if (!clean) return allArticles.slice(0, 8);

  // Split into search terms (e.g. "大谷" "50号")
  const terms = clean.split(/\s+/).filter(Boolean);

  const results = allArticles.filter((art) => {
    const haystack = `${art.title} ${art.description} ${art.category} ${art.source?.name || ''}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });

  return results;
}

