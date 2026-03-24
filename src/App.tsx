import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Flame, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import Dexie from 'dexie';

// 1. 数据库定义
class VocabDB extends Dexie {
  words: Dexie.Table<any, number>;
  constructor() {
    super('GaokaoVocab');
    this.version(1).stores({ words: 'id, mastered, reviewLevel, nextReview' });
  }
}
const db = new VocabDB();

// 2. 间隔重复算法配置 (天)
const SRS_INTERVALS = [0, 1, 3, 7, 15, 30];

export default function App() {
  const [currentWords, setCurrentWords] = useState([]); // 今日待学
  const [currentIndex, setCurrentIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [points, setPoints] = useState(0);
  const [stats, setStats] = useState({ mastered: 0, streak: 0 });
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'learning' | 'finished'

  // 初始化数据（首次进入加载3500词）
  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    const count = await db.words.count();
    if (count === 0) {
      // 此处应循环导入你OCR识别出的3500个单词数组
      // demo 模拟数据
      const initialBatch = Array.from({ length: 3500 }).map((_, i) => ({
        id: i,
        word: `Word_${i}`,
        meaning: "这里是词义解释",
        phonetic: "/.../",
        mastered: false,
        reviewLevel: 0,
        nextReview: Date.now(),
      }));
      await db.words.bulkAdd(initialBatch);
    }
    loadDailyWords();
  };

  const loadDailyWords = async () => {
    // 逻辑：新词50个 + 到期复习词
    const toReview = await db.words
      .where('nextReview').below(Date.now())
      .and(w => w.mastered === true)
      .limit(50)
      .toArray();

    const newWords = await db.words
      .where('mastered').equals(false)
      .limit(50 - toReview.length)
      .toArray();

    setCurrentWords([...toReview, ...newWords]);
  };

  // 3. 核心消消乐消除逻辑
  const handleMastery = async (isKnown: boolean) => {
    const word = currentWords[currentIndex];

    if (isKnown) {
      // 连击逻辑
      const newCombo = combo + 1;
      setCombo(newCombo);
      const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
      setPoints(p => p + (10 * multiplier));

      // 间隔重复更新
      const newLevel = Math.min(word.reviewLevel + 1, 5);
      await db.words.update(word.id, {
        mastered: true,
        reviewLevel: newLevel,
        nextReview: Date.now() + SRS_INTERVALS[newLevel] * 86400000
      });
    } else {
      setCombo(0); // 错误清零
      await db.words.update(word.id, { mastered: false, reviewLevel: 0 });
    }

    if (currentIndex < currentWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameState('finished');
      setStats(s => ({ ...s, streak: s.streak + 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#37352F] flex flex-col items-center p-4">
      {/* 顶部状态栏 */}
      <nav className="w-full max-w-md flex justify-between mb-8 p-4 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-1 font-bold text-orange-500">
          <Flame size={20} /> {stats.streak} 天
        </div>
        <div className="font-mono font-bold text-blue-600">
          Score: {points.toLocaleString()}
        </div>
        <div className="text-gray-400">
          {currentIndex + 1}/{currentWords.length}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-20">
            <h1 className="text-4xl font-black mb-4 tracking-tight">高考 3500</h1>
            <p className="mb-8 text-gray-500">今日任务: 50 词消消乐</p>
            <button
              onClick={() => setGameState('learning')}
              className="bg-black text-white px-12 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition"
            >
              开始消除
            </button>
          </motion.div>
        )}

        {gameState === 'learning' && (
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }} // 消消乐消失动画
            className="w-full max-w-md"
          >
            {/* 单词卡片 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-96 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {combo >= 3 && (
                <motion.div
                  initial={{ x: 50 }} animate={{ x: 0 }}
                  className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-black"
                >
                  {combo} COMBO!
                </motion.div>
              )}

              <h2 className="text-5xl font-black mb-4">{currentWords[currentIndex]?.word}</h2>
              <p className="text-gray-400 font-mono mb-6">{currentWords[currentIndex]?.phonetic}</p>
              <div className="h-px w-12 bg-gray-100 mb-6"></div>
              <p className="text-xl text-gray-600">{currentWords[currentIndex]?.meaning}</p>
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => handleMastery(false)}
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
              >
                <XCircle /> 不认识
              </button>
              <button
                onClick={() => handleMastery(true)}
                className="flex items-center justify-center gap-2 bg-green-500 py-4 rounded-2xl font-bold text-white shadow-lg shadow-green-200 hover:bg-green-600 transition"
              >
                <CheckCircle2 /> 已掌握
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-20">
            <Trophy size={80} className="mx-auto text-yellow-500 mb-6" />
            <h2 className="text-3xl font-bold mb-2">今日任务达成！</h2>
            <p className="text-gray-500 mb-8">累计打卡 {stats.streak} 天</p>
            <button
              onClick={() => { loadDailyWords(); setGameState('menu'); setCurrentIndex(0); }}
              className="flex items-center gap-2 mx-auto text-blue-500 font-bold"
            >
              <RotateCcw size={20} /> 再来一组
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}