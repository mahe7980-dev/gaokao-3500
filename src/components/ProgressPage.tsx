import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStudyStats } from '../services/db';
import type { StudyRecord } from '../services/db';

export default function ProgressPage() {
  const [stats, setStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    masteryRate: 0,
    streak: 0,
    recentRecords: [] as StudyRecord[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStudyStats();
    setStats(data);
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#37352F] p-4">
      {/* 顶部导航 */}
      <div className="w-full max-w-md mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">学习进度</h1>
      </div>

      {/* 总体进度卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto bg-blue-600 text-white p-6 rounded-3xl shadow-lg mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">总体进度</h2>
          <div className="flex items-center gap-1 font-bold text-yellow-300">
            🔥 已连续 {stats.streak} 天
          </div>
        </div>
        <div className="text-4xl font-black mb-2">
          {stats.masteredWords} / {stats.totalWords}
        </div>
        <div className="w-full bg-blue-500 rounded-full h-2 mb-4">
          <div 
            className="bg-white h-2 rounded-full" 
            style={{ width: `${stats.masteryRate}%` }}
          ></div>
        </div>
        <div className="text-xl font-bold">
          掌握率: {stats.masteryRate.toFixed(1)}%
        </div>
      </motion.div>

      {/* 最近学习记录 */}
      <div className="w-full max-w-md mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">最近学习记录</h2>
        <div className="space-y-3">
          {stats.recentRecords.map((record, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Day {record.date}</h3>
                <span className="text-sm text-gray-500">{record.completed} / {record.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(record.completed / record.total) * 100}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-2xl shadow-sm text-center"
        >
          <h3 className="text-sm text-gray-500 mb-2">总单词数</h3>
          <p className="text-2xl font-bold">{stats.totalWords}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-2xl shadow-sm text-center"
        >
          <h3 className="text-sm text-gray-500 mb-2">已掌握</h3>
          <p className="text-2xl font-bold text-green-500">{stats.masteredWords}</p>
        </motion.div>
      </div>
    </div>
  );
}