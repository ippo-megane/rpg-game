"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  name: string;
  description: string;
  hp: number;
  attack: number;
  defense: number;
  magic: number;
  icon: string;
  color: string;
}

const jobs: Job[] = [
  {
    id: "wizard",
    name: "魔法使い",
    description: "強力な魔法で敵を攻撃する。HPは低いが魔法攻撃力が高い。",
    hp: 60,
    attack: 8,
    defense: 5,
    magic: 25,
    icon: "🧙‍♂️",
    color: "purple"
  },
  {
    id: "warrior",
    name: "戦士",
    description: "剣と盾で戦う。バランスの取れた能力を持つ。",
    hp: 120,
    attack: 18,
    defense: 15,
    magic: 3,
    icon: "⚔️",
    color: "red"
  },
  {
    id: "hero",
    name: "勇者",
    description: "伝説の勇者。全体的に高い能力を持つ。",
    hp: 100,
    attack: 20,
    defense: 12,
    magic: 8,
    icon: "👑",
    color: "gold"
  },
  {
    id: "rogue",
    name: "遊び人",
    description: "素早い動きで敵を翻弄する。回避率が高い。",
    hp: 80,
    attack: 15,
    defense: 8,
    magic: 5,
    icon: "🎭",
    color: "green"
  },
  {
    id: "monk",
    name: "僧侶",
    description: "回復魔法と防御に特化。味方を支える。",
    hp: 90,
    attack: 10,
    defense: 18,
    magic: 15,
    icon: "🙏",
    color: "blue"
  }
];

export default function CharacterSelectionPage() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const toggleJob = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    } else if (selectedJobs.length < 3) {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  const getSelectedJobs = () => {
    return jobs.filter(job => selectedJobs.includes(job.id));
  };

  const saveSelection = () => {
    // ローカルストレージに保存
    localStorage.setItem('selectedJobs', JSON.stringify(selectedJobs));
    setShowConfirm(true);
  };

  const startAdventure = () => {
    router.push('/adventure');
  };

  const resetAdventure = () => {
    localStorage.removeItem('selectedJobs');
    setSelectedJobs([]);
    setShowConfirm(false);
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      purple: "border-purple-300 bg-purple-50 hover:bg-purple-100",
      red: "border-red-300 bg-red-50 hover:bg-red-100",
      gold: "border-yellow-300 bg-yellow-50 hover:bg-yellow-100",
      green: "border-green-300 bg-green-50 hover:bg-green-100",
      blue: "border-blue-300 bg-blue-50 hover:bg-blue-100"
    };
    return colorMap[color] || "border-gray-300 bg-gray-50 hover:bg-gray-100";
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">キャラクター選択</h1>
          <Link
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            🏠 ホームに戻る
          </Link>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 mb-4">
            5つのジョブから3つを選んで、あなたのパーティーを作成してください
          </p>
          <div className="text-sm text-gray-500">
            選択済み: {selectedJobs.length}/3
          </div>
        </div>

        {/* ジョブ選択 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                selectedJobs.includes(job.id)
                  ? "border-4 border-green-500 bg-green-50 shadow-lg scale-105"
                  : getColorClasses(job.color)
              }`}
              onClick={() => toggleJob(job.id)}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{job.icon}</div>
                <h3 className="text-xl font-bold mb-2">{job.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold text-red-600">HP</div>
                    <div>{job.hp}</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold text-orange-600">攻撃</div>
                    <div>{job.attack}</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold text-blue-600">防御</div>
                    <div>{job.defense}</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="font-semibold text-purple-600">魔法</div>
                    <div>{job.magic}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 選択確認 */}
        {selectedJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">選択したジョブ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getSelectedJobs().map((job) => (
                <div key={job.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl">{job.icon}</span>
                  <div>
                    <div className="font-semibold">{job.name}</div>
                    <div className="text-sm text-gray-600">
                      HP: {job.hp} | 攻撃: {job.attack} | 防御: {job.defense} | 魔法: {job.magic}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-center gap-4">
          {selectedJobs.length === 3 ? (
            <button
              onClick={saveSelection}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              パーティーを確定する
            </button>
          ) : (
            <div className="text-gray-500 px-6 py-3">
              3つのジョブを選択してください
            </div>
          )}
          
          <button
            onClick={resetAdventure}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            🔄 冒険をやり直す
          </button>
        </div>

        {/* 確認モーダル */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">パーティー確定</h3>
              <p className="mb-6">選択したジョブでパーティーを確定しますか？</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={startAdventure}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  冒険を開始
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 