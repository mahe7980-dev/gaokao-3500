import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WordCard from './WordCard';
import type { Vocab } from '../services/db';
import { loadDailyWords, updateWordMastery, recordStudyProgress } from '../services/db';

interface StudyPageProps {
  onComplete: () => void;
}

export default function StudyPage({ onComplete }: StudyPageProps) {
  const [currentWords, setCurrentWords] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [points, setPoints] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    setLoading(true);
    const words = await loadDailyWords();
    setCurrentWords(words);
    setLoading(false);
  };

  const handleMarkKnown = async () => {
    if (currentIndex >= currentWords.length) return;

    const word = currentWords[currentIndex];
    await updateWordMastery(word.id, true);

    // 连击逻辑
    const newCombo = combo + 1;
    setCombo(newCombo);
    const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
    setPoints(p => p + (10 * multiplier));

    setCompleted(c => c + 1);
    nextWord();
  };

  const handleMarkBlurry = async () => {
    if (currentIndex >= currentWords.length) return;

    const word = currentWords[currentIndex];
    await updateWordMastery(word.id, false);

    setCombo(0);
    setCompleted(c => c + 1);
    nextWord();
  };

  const handleMarkUnknown = async () => {
    if (currentIndex >= currentWords.length) return;

    const word = currentWords[currentIndex];
    await updateWordMastery(word.id, false);

    setCombo(0);
    setCompleted(c => c + 1);
    nextWord();
  };

  const nextWord = () => {
    if (currentIndex < currentWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 完成今日任务
      recordStudyProgress(completed + 1, currentWords.length);
      onComplete();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (currentWords.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">没有可用的单词</h2>
          <p className="text-gray-600 mb-8">请稍后再试</p>
          <button
            onClick={loadWords}
            className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const currentWord = currentWords[currentIndex];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#37352F] flex flex-col items-center p-4">
      {/* 顶部状态栏 */}
      <nav className="w-full max-w-md flex justify-between mb-8 p-4 bg-white rounded-2xl shadow-sm">
        <div className="font-mono font-bold text-blue-600">
          Score: {points.toLocaleString()}
        </div>
        {combo >= 3 && (
          <motion.div
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-black"
          >
            {combo} COMBO!
          </motion.div>
        )}
        <div className="text-gray-400">
          {currentIndex + 1}/{currentWords.length}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <WordCard
          key={currentWord.id}
          word={currentWord}
          onMarkKnown={handleMarkKnown}
          onMarkBlurry={handleMarkBlurry}
          onMarkUnknown={handleMarkUnknown}
          currentIndex={currentIndex}
          totalWords={currentWords.length}
        />
      </AnimatePresence>
    </div>
  );
}