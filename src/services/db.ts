import Dexie from 'dexie';

// 单词数据结构
export interface Vocab {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  partOfSpeech: string;
  forms: {
    base: string;
    third: string;
    past: string;
    pastParticiple: string;
    ing: string;
  };
  tags: string[];
  mastered: boolean;
  reviewLevel: number;
  lastReviewed: number;
  nextReview: number;
  streak: number;
}

// 学习记录
export interface StudyRecord {
  id: number;
  date: string;
  completed: number;
  total: number;
  streak: number;
}

// 数据库定义
export class VocabDB extends Dexie {
  words!: Dexie.Table<Vocab, number>;
  studyRecords!: Dexie.Table<StudyRecord, number>;

  constructor() {
    super('GaokaoVocab');
    this.version(1).stores({
      words: 'id, mastered, reviewLevel, nextReview, streak',
      studyRecords: 'id, date, completed, total, streak'
    });
  }
}

// 导出数据库实例
export const db = new VocabDB();

// 间隔重复算法配置 (天)
export const SRS_INTERVALS = [0, 1, 3, 7, 15, 30];

// 初始化数据
export async function initData() {
  const count = await db.words.count();
  if (count === 0) {
    // 这里应该导入真实的3900+单词数据
    // 暂时使用模拟数据
    const initialBatch = Array.from({ length: 3900 }).map((_, i) => ({
      id: i,
      word: `Word_${i}`,
      phonetic: `/wɜːrd_${i}/`,
      meaning: `词义解释 ${i}`,
      partOfSpeech: i % 3 === 0 ? 'v.' : i % 3 === 1 ? 'n.' : 'adj.',
      forms: {
        base: `Word_${i}`,
        third: `Word_${i}s`,
        past: `Word_${i}ed`,
        pastParticiple: `Word_${i}ed`,
        ing: `Word_${i}ing`
      },
      tags: i % 2 === 0 ? ['高频'] : ['不规则'],
      mastered: false,
      reviewLevel: 0,
      lastReviewed: 0,
      nextReview: Date.now(),
      streak: 0
    }));
    await db.words.bulkAdd(initialBatch);
  }
}

// 加载每日单词
export async function loadDailyWords() {
  // 逻辑：新词50个 + 到期复习词
  const toReview = await db.words
    .where('nextReview').below(Date.now())
    .and(w => w.mastered === true)
    .limit(50)
    .toArray();

  const newWords = await db.words
    .where('mastered').equals(0 as any)
    .limit(50 - toReview.length)
    .toArray();

  return [...toReview, ...newWords];
}

// 更新单词掌握状态
export async function updateWordMastery(id: number, isKnown: boolean) {
  const word = await db.words.get(id);
  if (!word) return;

  if (isKnown) {
    const newLevel = Math.min(word.reviewLevel + 1, 5);
    await db.words.update(id, {
      mastered: true,
      reviewLevel: newLevel,
      lastReviewed: Date.now(),
      nextReview: Date.now() + SRS_INTERVALS[newLevel] * 86400000,
      streak: word.streak + 1
    });
  } else {
    await db.words.update(id, {
      mastered: false,
      reviewLevel: 0,
      lastReviewed: Date.now(),
      nextReview: Date.now() + 86400000, // 1天后复习
      streak: 0
    });
  }
}

// 记录学习进度
export async function recordStudyProgress(completed: number, total: number) {
  const today = new Date().toISOString().split('T')[0];
  const existingRecord = await db.studyRecords.where('date').equals(today).first();
  
  const streak = await calculateStreak();
  
  if (existingRecord) {
    await db.studyRecords.update(existingRecord.id, {
      completed,
      total,
      streak
    });
  } else {
    await db.studyRecords.add({
      id: Date.now(),
      date: today,
      completed,
      total,
      streak
    });
  }
}

// 计算连续打卡天数
async function calculateStreak() {
  const records = await db.studyRecords
    .orderBy('date')
    .reverse()
    .toArray();
  
  if (records.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (const record of records) {
    const recordDate = new Date(record.date);
    const diffTime = Math.abs(today.getTime() - recordDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// 获取学习统计
export async function getStudyStats() {
  const totalWords = await db.words.count();
  const masteredWords = await db.words.where('mastered').equals(1 as any).count();
  const records = await db.studyRecords
    .orderBy('date')
    .reverse()
    .limit(7)
    .toArray();
  
  const streak = await calculateStreak();
  
  return {
    totalWords,
    masteredWords,
    masteryRate: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0,
    streak,
    recentRecords: records
  };
}