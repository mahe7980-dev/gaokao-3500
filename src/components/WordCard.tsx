import { motion } from 'framer-motion';
import type { Vocab } from '../services/db';

interface WordCardProps {
  word: Vocab;
  onMarkKnown: () => void;
  onMarkBlurry: () => void;
  onMarkUnknown: () => void;
  currentIndex: number;
  totalWords: number;
}

export default function WordCard({ word, onMarkKnown, onMarkBlurry, onMarkUnknown, currentIndex, totalWords }: WordCardProps) {
  return (
    <div className="w-full max-w-md">
      {/* 进度条 */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-500">{currentIndex + 1}/{totalWords}</span>
      </div>

      {/* 单词卡片 */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0, y: -20 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <h2 className="text-5xl font-black mb-4">{word.word}</h2>
        <p className="text-gray-400 font-mono mb-6">{word.phonetic}</p>
        <p className="text-xl text-gray-600 mb-8">{word.meaning}</p>
        <p className="text-sm text-gray-500 mb-6">{word.partOfSpeech}</p>

        {/* 词语变形 */}
        <div className="w-full bg-gray-50 p-4 rounded-xl mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">词语变形</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">过去式:</span> {word.forms.past}
            </div>
            <div>
              <span className="text-gray-500">过去分词:</span> {word.forms.pastParticiple}
            </div>
            <div>
              <span className="text-gray-500">现在分词:</span> {word.forms.ing}
            </div>
            <div>
              <span className="text-gray-500">第三人称单数:</span> {word.forms.third}
            </div>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {word.tags.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="w-full grid grid-cols-3 gap-4 mt-auto">
          <button
            onClick={onMarkUnknown}
            className="py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition"
          >
            Don't Know
          </button>
          <button
            onClick={onMarkBlurry}
            className="py-4 rounded-2xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition"
          >
            Blurry
          </button>
          <button
            onClick={onMarkKnown}
            className="py-4 rounded-2xl font-bold text-white bg-green-500 hover:bg-green-600 transition"
          >
            Know
          </button>
        </div>
      </motion.div>
    </div>
  );
}