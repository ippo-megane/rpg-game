"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClearPage() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // ローカルストレージから選択されたジョブを読み込み
    const savedJobs = localStorage.getItem('selectedJobs');
    if (savedJobs) {
      setSelectedJobs(JSON.parse(savedJobs));
    }
    
    // 少し遅延してから統計を表示
    setTimeout(() => setShowStats(true), 500);
  }, []);

  const jobs = [
    { id: "wizard", name: "魔法使い", icon: "🧙‍♂️" },
    { id: "warrior", name: "戦士", icon: "⚔️" },
    { id: "hero", name: "勇者", icon: "👑" },
    { id: "rogue", name: "遊び人", icon: "🎭" },
    { id: "monk", name: "僧侶", icon: "🙏" }
  ];

  const getSelectedJobNames = () => {
    return selectedJobs.map(jobId => {
      const job = jobs.find(j => j.id === jobId);
      return job ? job.name : jobId;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* クリア演出 */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-5xl font-bold text-yellow-800 mb-4 animate-pulse">
            冒険クリア！
          </h1>
          <div className="text-2xl text-orange-700 mb-8">
            おめでとうございます！
          </div>
        </div>

        {/* パーティー情報 */}
        {showStats && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">クリアしたパーティー</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {selectedJobs.map((jobId) => {
                const job = jobs.find(j => j.id === jobId);
                return (
                  <div key={jobId} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                    <div className="text-4xl mb-3">{job?.icon}</div>
                    <div className="text-xl font-bold text-gray-800">{job?.name}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-lg text-gray-600">
              選んだジョブ: {getSelectedJobNames().join("、")}
            </p>
          </div>
        )}

        {/* 統計情報 */}
        {showStats && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">冒険の記録</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">3</div>
                <div className="text-lg text-green-700">勝利回数</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-lg text-blue-700">戦闘回数</div>
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="space-y-4">
          <Link
            href="/character"
            className="inline-block bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔄 新しい冒険を始める
          </Link>
          
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              🏠 ホームに戻る
            </Link>
            <Link
              href="/battle"
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              ⚔️ 自由戦闘
            </Link>
          </div>
        </div>

        {/* 装飾 */}
        <div className="mt-12 text-4xl space-x-4 opacity-50">
          <span className="animate-spin">⭐</span>
          <span className="animate-pulse">🏆</span>
          <span className="animate-bounce">🎊</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
} 