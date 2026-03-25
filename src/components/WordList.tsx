import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Vocab } from '../services/db';
import { db } from '../services/db';

export default function WordList() {
  const [words, setWords] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mastered' | 'unmastered'>('all');

  useEffect(() => {
    loadWords();
  }, [filter]);

  const loadWords = async () => {
    setLoading(true);
    let result: Vocab[] = [];
    
    if (filter === 'mastered') {
      result = await db.words.where('mastered').equals(1 as any).toArray();
    } else if (filter === 'unmastered') {
      result = await db.words.where('mastered').equals(0 as any).toArray();
    } else {
      result = await db.words.toArray();
    }
    
    setWords(result);
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
        <h1 className="text-2xl font-bold">单词列表</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('mastered')}
            className={`px-3 py-1 rounded-full text-sm ${filter === 'mastered' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            已掌握
          </button>
          <button
            onClick={() => setFilter('unmastered')}
            className={`px-3 py-1 rounded-full text-sm ${filter === 'unmastered' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            未掌握
          </button>
        </div>
      </div>

      {/* 单词列表 */}
      <div className="w-full max-w-md mx-auto space-y-2">
        {words.map((word) => (
          <motion.div
            key={word.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 bg-white rounded-2xl shadow-sm flex justify-between items-center ${word.mastered ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}
          >
            <div>
              <h3 className="font-bold">{word.word}</h3>
              <p className="text-sm text-gray-500">{word.meaning}</p>
            </div>
            <div className="text-sm text-gray-400">
              {word.mastered ? '已掌握' : '未掌握'}
            </div>
          </motion.div>
        ))}
      </div>

      {words.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">没有找到单词</p>
        </div>
      )}
    </div>
  );
}