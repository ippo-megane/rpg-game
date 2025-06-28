"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

interface Enemy {
  id: number;
  name: string;
  hp: number;
  attack: number;
  exp_reward: number;
  weakness?: string;
  resistance?: string;
  icon?: string;
}

interface Job {
  id: string;
  name: string;
  icon: string;
}

const jobs: Job[] = [
  { id: "wizard", name: "魔法使い", icon: "🧙‍♂️" },
  { id: "warrior", name: "戦士", icon: "⚔️" },
  { id: "hero", name: "勇者", icon: "👑" },
  { id: "rogue", name: "遊び人", icon: "🎭" },
  { id: "monk", name: "僧侶", icon: "🙏" }
];

// 相性システム
const compatibility: { [key: string]: { [key: string]: number } } = {
  "スライム": {
    "wizard": 1.5, // 魔法使いはスライムに強い
    "warrior": 0.8, // 戦士はスライムに弱い
    "hero": 0.7, // 勇者はスライムに弱い
    "rogue": 1.2, // 遊び人はスライムにやや強い
    "monk": 1.0 // 僧侶は普通
  },
  "ゴブリン": {
    "wizard": 0.8,
    "warrior": 1.3,
    "hero": 1.2,
    "rogue": 1.4,
    "monk": 1.1
  },
  "オーク": {
    "wizard": 1.2,
    "warrior": 0.9,
    "hero": 1.1,
    "rogue": 0.8,
    "monk": 1.3
  },
  "ドラゴン": {
    "wizard": 0.6,
    "warrior": 0.8,
    "hero": 1.5, // 勇者はドラゴンに強い
    "rogue": 0.7,
    "monk": 1.2
  },
  "デーモン": {
    "wizard": 1.4,
    "warrior": 0.9,
    "hero": 1.1,
    "rogue": 0.8,
    "monk": 1.5 // 僧侶はデーモンに強い
  }
};

export default function AdventurePage() {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedEnemies, setSelectedEnemies] = useState<Enemy[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentBattle, setCurrentBattle] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [showBattle, setShowBattle] = useState(false);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnemies();
    loadSelectedJobs();
  }, []);

  const loadEnemies = async () => {
    try {
      const { data, error } = await supabase
        .from("enemies")
        .select("*")
        .order("id");
      
      if (error) throw error;
      
      // アイコンを追加
      const enemiesWithIcons = data?.map(enemy => ({
        ...enemy,
        icon: getEnemyIcon(enemy.name)
      })) || [];
      
      setEnemies(enemiesWithIcons);
    } catch (error) {
      console.error("敵データの読み込みに失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedJobs = () => {
    const savedJobs = localStorage.getItem('selectedJobs');
    if (savedJobs) {
      setSelectedJobs(JSON.parse(savedJobs));
    }
  };

  const getEnemyIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      "スライム": "🟢",
      "ゴブリン": "👹",
      "オーク": "👺",
      "ドラゴン": "🐉",
      "デーモン": "😈"
    };
    return iconMap[name] || "👾";
  };

  const startNewAdventure = () => {
    // ランダムに5体から2体を選択
    const shuffled = [...enemies].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    setSelectedEnemies(selected);
    setCurrentBattle(1);
    setWins(0);
    setLosses(0);
    setShowBattle(false);
    setSelectedEnemy(null);
  };

  const selectEnemy = (enemy: Enemy) => {
    setSelectedEnemy(enemy);
    setShowBattle(true);
  };

  const getCompatibilityScore = (enemyName: string) => {
    if (!selectedJobs.length || !compatibility[enemyName]) return 1.0;
    
    const scores = selectedJobs.map(jobId => {
      const job = jobs.find(j => j.id === jobId);
      return compatibility[enemyName][jobId] || 1.0;
    });
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const getCompatibilityText = (score: number) => {
    if (score >= 1.3) return "非常に有利";
    if (score >= 1.1) return "有利";
    if (score >= 0.9) return "普通";
    if (score >= 0.7) return "不利";
    return "非常に不利";
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 1.3) return "text-green-600 bg-green-100";
    if (score >= 1.1) return "text-green-700 bg-green-50";
    if (score >= 0.9) return "text-gray-600 bg-gray-50";
    if (score >= 0.7) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const handleBattleResult = (won: boolean) => {
    if (won) {
      setWins(wins + 1);
      if (wins + 1 >= 3) {
        // クリア！
        alert("🎉 冒険をクリアしました！おめでとうございます！");
        setShowBattle(false);
        setSelectedEnemy(null);
        return;
      }
    } else {
      setLosses(losses + 1);
      if (losses + 1 >= 3) {
        // ゲームオーバー
        alert("💀 ゲームオーバー... もう一度挑戦してください。");
        setShowBattle(false);
        setSelectedEnemy(null);
        return;
      }
    }
    
    setCurrentBattle(currentBattle + 1);
    setShowBattle(false);
    setSelectedEnemy(null);
    
    // 新しい敵を選択
    const shuffled = [...enemies].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    setSelectedEnemies(selected);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">データを読み込み中...</p>
      </div>
    );
  }

  if (selectedJobs.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">冒険モード</h1>
        <p className="text-gray-600 mb-6">冒険を開始する前に、キャラクターを選択してください。</p>
        <Link
          href="/character"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          キャラクター選択へ
        </Link>
      </div>
    );
  }

  if (showBattle && selectedEnemy) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">第{currentBattle}戦</h1>
            <div className="flex justify-center gap-4 text-lg">
              <span className="text-green-600">勝利: {wins}</span>
              <span className="text-red-600">敗北: {losses}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">戦闘結果</h2>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">{selectedEnemy.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{selectedEnemy.name}</h3>
              <p className="text-gray-600 mb-4">との戦闘が終了しました</p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleBattleResult(true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  🏆 勝利
                </button>
                <button
                  onClick={() => handleBattleResult(false)}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  💀 敗北
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">冒険モード</h1>
          <p className="text-lg text-gray-600 mb-4">
            3回勝利して冒険をクリアしよう！敵との相性を考えて戦う相手を選んでください。
          </p>
          
          {currentBattle > 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-center gap-6 text-lg">
                <span className="text-green-600 font-semibold">勝利: {wins}</span>
                <span className="text-red-600 font-semibold">敗北: {losses}</span>
                <span className="text-blue-600 font-semibold">第{currentBattle}戦</span>
              </div>
            </div>
          )}
        </div>

        {selectedEnemies.length === 0 ? (
          <div className="text-center">
            <button
              onClick={startNewAdventure}
              className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
            >
              🗺️ 冒険を開始
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">戦う敵を選択</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedEnemies.map((enemy) => {
                  const compatibilityScore = getCompatibilityScore(enemy.name);
                  const compatibilityText = getCompatibilityText(compatibilityScore);
                  const compatibilityColor = getCompatibilityColor(compatibilityScore);
                  
                  return (
                    <div
                      key={enemy.id}
                      className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
                      onClick={() => selectEnemy(enemy)}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-3">{enemy.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{enemy.name}</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">HP:</span>
                            <span className="font-medium">{enemy.hp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">攻撃力:</span>
                            <span className="font-medium">{enemy.attack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">経験値:</span>
                            <span className="font-medium">{enemy.exp_reward}</span>
                          </div>
                        </div>
                        
                        <div className={`px-3 py-2 rounded-full text-sm font-semibold ${compatibilityColor}`}>
                          相性: {compatibilityText} ({compatibilityScore.toFixed(1)})
                        </div>
                        
                        {enemy.weakness && (
                          <div className="text-sm text-red-600 mt-2">
                            弱点: {enemy.weakness}
                          </div>
                        )}
                        {enemy.resistance && (
                          <div className="text-sm text-blue-600 mt-1">
                            耐性: {enemy.resistance}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">あなたのパーティー</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selectedJobs.map((jobId) => {
                  const job = jobs.find(j => j.id === jobId);
                  return (
                    <div key={jobId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                      <span className="text-2xl">{job?.icon}</span>
                      <div>
                        <div className="font-semibold">{job?.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 