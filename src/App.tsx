import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, List, BarChart3 } from 'lucide-react';
import StudyPage from './components/StudyPage';
import WordList from './components/WordList';
import ProgressPage from './components/ProgressPage';
import { initData, getStudyStats } from './services/db';
import type { StudyRecord } from './services/db';

// 页面类型
type Page = 'study' | 'wordList' | 'progress';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('study');
  const [stats, setStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    masteryRate: 0,
    streak: 0,
    recentRecords: [] as StudyRecord[]
  });
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    await initData();
    const data = await getStudyStats();
    setStats(data);
    setLoading(false);
  };

  const handleStudyComplete = () => {
    setShowCompleteModal(true);
  };

  const handleModalClose = async () => {
    setShowCompleteModal(false);
    const data = await getStudyStats();
    setStats(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">初始化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#37352F] flex flex-col">
      {/* 主内容区域 */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentPage === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StudyPage onComplete={handleStudyComplete} />
            </motion.div>
          )}
          {currentPage === 'wordList' && (
            <motion.div
              key="wordList"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WordList />
            </motion.div>
          )}
          {currentPage === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProgressPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部导航栏 */}
      <nav className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setCurrentPage('study')}
            className={`flex flex-col items-center ${currentPage === 'study' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <BookOpen size={24} />
            <span className="text-xs mt-1">学习</span>
          </button>
          <button
            onClick={() => setCurrentPage('wordList')}
            className={`flex flex-col items-center ${currentPage === 'wordList' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <List size={24} />
            <span className="text-xs mt-1">单词列表</span>
          </button>
          <button
            onClick={() => setCurrentPage('progress')}
            className={`flex flex-col items-center ${currentPage === 'progress' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <BarChart3 size={24} />
            <span className="text-xs mt-1">进度</span>
          </button>
        </div>
      </nav>

      {/* 完成任务弹窗 */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">今日任务完成！</h2>
              <p className="text-gray-600 mb-8">累计打卡 {stats.streak + 1} 天</p>
              <button
                onClick={handleModalClose}
                className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition"
              >
                确定
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}