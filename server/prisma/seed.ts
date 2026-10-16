import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records for idempotent runs
  await prisma.bookmark.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.aISummary.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Taro user
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const taro = await prisma.user.create({
    data: {
      email: 'taro@yahoo-pulse.jp',
      passwordHash,
      name: 'Taro',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      region: 'tokyo',
      preferredCategories: 'technology,economy,sports,travel',
      points: 1230,
    },
  });
  console.log(`👤 Seeded User: ${taro.name} (${taro.email})`);

  // 3. Create initial articles
  const art1 = await prisma.article.create({
    data: {
      title: '日本の経済成長率 予想を上回る 個人消費の回復がけん引',
      description: '内閣府が発表した実質GDP速報値は、個人消費と企業の設備投資の回復により市場予想を上回るプラス成長を維持した。',
      url: 'https://news.yahoo.co.jp/articles/japan-economy-growth-2026',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      sourceName: 'Yahoo! 経済ニュース',
      sourceUrl: 'https://news.yahoo.co.jp',
      category: 'economy',
      publishedAt: '5分前',
    },
  });

  const art2 = await prisma.article.create({
    data: {
      title: '新型スマートフォンが発表 AI機能を大幅強化',
      description: '次世代オンデバイスAIチップを搭載し、リアルタイム音声通話翻訳や写真の高度な編集機能を標準実装。',
      url: 'https://news.yahoo.co.jp/articles/new-ai-smartphone-launch',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      sourceName: 'テクノロジー総合',
      sourceUrl: 'https://news.yahoo.co.jp',
      category: 'technology',
      publishedAt: '1時間前',
    },
  });

  const art3 = await prisma.article.create({
    data: {
      title: '秋に行きたい！日本の絶景 紅葉スポット10選',
      description: '京都の歴史的寺院から北海道の大自然まで、見頃を迎える美しい紅葉名所を厳選してご紹介。',
      url: 'https://news.yahoo.co.jp/articles/autumn-foliage-japan-spots',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      sourceName: 'トラベルガイド',
      sourceUrl: 'https://news.yahoo.co.jp',
      category: 'travel',
      publishedAt: '6時間前',
    },
  });

  // 4. Seed AI Summary for Article 1
  await prisma.aISummary.create({
    data: {
      articleId: art1.id,
      summary: '内閣府発表の実質GDP速報値は個人消費の復調により市場事前予測を上回り、持続的な景気拡大への期待が高まる。',
      keyPoints: JSON.stringify([
        '実質GDP成長率が年率換算で+1.8%を記録し市場予測を上回る。',
        'インバウンド需要と個人消費の堅調な拡大が成長をけん引。',
        '製造業・ハイテク設備投資が堅調に推移。',
      ]),
      model: 'gemini-1.5-flash',
    },
  });

  // 5. Seed Taro's Bookmarks & Reading History
  await prisma.bookmark.create({
    data: {
      userId: taro.id,
      articleId: art1.id,
    },
  });
  await prisma.bookmark.create({
    data: {
      userId: taro.id,
      articleId: art3.id,
    },
  });

  await prisma.readingHistory.create({
    data: {
      userId: taro.id,
      articleId: art1.id,
    },
  });
  await prisma.readingHistory.create({
    data: {
      userId: taro.id,
      articleId: art2.id,
    },
  });

  console.log('✅ Database seeded successfully with User, Articles, AI Summaries, Bookmarks, and Reading History!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
