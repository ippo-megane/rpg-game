"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import BattleSystem from "../battle/BattleSystem";

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
  hp: number;
  attack: number;
  defense: number;
  magic: number;
}

interface Player {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  magic: number;
  level: number;
  exp: number;
  expToNext: number;
  job: Job;
}

interface BattleLog {
  id: number;
  message: string;
  type: "player" | "enemy" | "system";
}

const jobs: Job[] = [
  { id: "wizard", name: "魔法使い", icon: "🧙‍♂️", hp: 60, attack: 8, defense: 5, magic: 25 },
  { id: "warrior", name: "戦士", icon: "⚔️", hp: 120, attack: 18, defense: 15, magic: 3 },
  { id: "hero", name: "勇者", icon: "👑", hp: 100, attack: 20, defense: 12, magic: 8 },
  { id: "rogue", name: "遊び人", icon: "🎭", hp: 80, attack: 15, defense: 8, magic: 5 },
  { id: "monk", name: "僧侶", icon: "🙏", hp: 90, attack: 10, defense: 18, magic: 15 }
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
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentBattle, setCurrentBattle] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [showBattle, setShowBattle] = useState(false);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [currentEnemyHp, setCurrentEnemyHp] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [isInBattle, setIsInBattle] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleCount, setBattleCount] = useState(0);

  useEffect(() => {
    loadEnemies();
    loadSelectedJobs();
    const savedBattleCount = localStorage.getItem('battleCount');
    
    if (savedBattleCount) {
      setBattleCount(parseInt(savedBattleCount));
    }
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
      const jobIds = JSON.parse(savedJobs);
      setSelectedJobs(jobIds);
      
      // プレイヤーを初期化
      const initializedPlayers = jobIds.map((jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        if (!job) return null;
        
        return {
          hp: job.hp,
          maxHp: job.hp,
          attack: job.attack,
          defense: job.defense,
          magic: job.magic,
          level: 1,
          exp: 0,
          expToNext: 100,
          job: job
        };
      }).filter(Boolean) as Player[];
      
      setPlayers(initializedPlayers);
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

  const startAdventure = () => {
    if (selectedJobs.length === 0) {
      alert('先にキャラクターを選択してください！');
      return;
    }
    
    // 冒険モードフラグを設定
    localStorage.setItem('isAdventureMode', 'true');
    localStorage.setItem('battleCount', '0');
    localStorage.removeItem('usedCharacters');
    localStorage.removeItem('foughtEnemies');
    
    setBattleStarted(true);
    setBattleCount(0);
  };

  const resetAdventure = () => {
    localStorage.removeItem('isAdventureMode');
    localStorage.removeItem('battleCount');
    localStorage.removeItem('usedCharacters');
    localStorage.removeItem('foughtEnemies');
    
    setBattleStarted(false);
    setBattleCount(0);
  };

  const selectEnemy = (enemy: Enemy) => {
    setSelectedEnemy(enemy);
    setCurrentEnemyHp(enemy.hp);
    setShowBattle(true);
    setIsInBattle(true);
    setIsPlayerTurn(true);
    setCurrentPlayerIndex(0);
    setBattleLogs([]);
    addBattleLog(`${enemy.name}が現れた！`, "system");
  };

  const addBattleLog = (message: string, type: "player" | "enemy" | "system") => {
    setBattleLogs(prev => [...prev, {
      id: Date.now(),
      message,
      type
    }]);
  };

  const getCurrentPlayer = () => players[currentPlayerIndex];

  const getCompatibilityScore = (enemyName: string) => {
    if (!selectedJobs.length || !compatibility[enemyName]) return 1.0;
    
    const scores = selectedJobs.map(jobId => {
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

  const playerAttack = () => {
    if (!selectedEnemy || !isPlayerTurn || players.length === 0) return;

    const player = getCurrentPlayer();
    if (!player) return;

    // 相性によるダメージ倍率を計算
    const compatibilityScore = getCompatibilityScore(selectedEnemy.name);
    const baseDamage = Math.floor(Math.random() * player.attack) + 1;
    const damage = Math.floor(baseDamage * compatibilityScore);
    const newEnemyHp = Math.max(0, currentEnemyHp - damage);
    
    addBattleLog(`${player.job.name}の攻撃！${selectedEnemy.name}に${damage}のダメージ！`, "player");
    if (compatibilityScore > 1.1) {
      addBattleLog(`相性が良く、ダメージが${compatibilityScore.toFixed(1)}倍になった！`, "system");
    } else if (compatibilityScore < 0.9) {
      addBattleLog(`相性が悪く、ダメージが${compatibilityScore.toFixed(1)}倍になった...`, "system");
    }
    
    if (newEnemyHp <= 0) {
      // 敵を倒した
      addBattleLog(`${selectedEnemy.name}を倒した！`, "system");
      addBattleLog(`${selectedEnemy.exp_reward}の経験値を獲得！`, "system");
      
      // 全プレイヤーに経験値を分配
      const expPerPlayer = Math.floor(selectedEnemy.exp_reward / players.length);
      const newPlayers = players.map(p => {
        let newExp = p.exp + expPerPlayer;
        let newLevel = p.level;
        let newExpToNext = p.expToNext;
        
        while (newExp >= newExpToNext) {
          newExp -= newExpToNext;
          newLevel++;
          newExpToNext = newLevel * 100;
          addBattleLog(`${p.job.name}がレベルアップ！レベル${newLevel}になった！`, "system");
        }
        
        return {
          ...p,
          exp: newExp,
          level: newLevel,
          expToNext: newExpToNext
        };
      });
      
      setPlayers(newPlayers);
      handleBattleResult(true);
      return;
    }
    
    setCurrentEnemyHp(newEnemyHp);
    setIsPlayerTurn(false);
    
    // 敵の攻撃
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };

  const playerMagic = () => {
    if (!selectedEnemy || !isPlayerTurn || players.length === 0) return;

    const player = getCurrentPlayer();
    if (!player) return;

    // 魔法攻撃（相性の影響は少ない）
    const compatibilityScore = getCompatibilityScore(selectedEnemy.name);
    const baseDamage = Math.floor(Math.random() * player.magic) + 1;
    const damage = Math.floor(baseDamage * (compatibilityScore * 0.8 + 0.2)); // 相性の影響を軽減
    const newEnemyHp = Math.max(0, currentEnemyHp - damage);
    
    addBattleLog(`${player.job.name}の魔法攻撃！${selectedEnemy.name}に${damage}のダメージ！`, "player");
    
    if (newEnemyHp <= 0) {
      addBattleLog(`${selectedEnemy.name}を倒した！`, "system");
      addBattleLog(`${selectedEnemy.exp_reward}の経験値を獲得！`, "system");
      
      const expPerPlayer = Math.floor(selectedEnemy.exp_reward / players.length);
      const newPlayers = players.map(p => {
        let newExp = p.exp + expPerPlayer;
        let newLevel = p.level;
        let newExpToNext = p.expToNext;
        
        while (newExp >= newExpToNext) {
          newExp -= newExpToNext;
          newLevel++;
          newExpToNext = newLevel * 100;
          addBattleLog(`${p.job.name}がレベルアップ！レベル${newLevel}になった！`, "system");
        }
        
        return {
          ...p,
          exp: newExp,
          level: newLevel,
          expToNext: newExpToNext
        };
      });
      
      setPlayers(newPlayers);
      handleBattleResult(true);
      return;
    }
    
    setCurrentEnemyHp(newEnemyHp);
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };

  const heal = () => {
    if (!isPlayerTurn || players.length === 0) return;

    const player = getCurrentPlayer();
    if (!player || player.hp >= player.maxHp) return;
    
    const healAmount = Math.floor(player.maxHp * 0.3);
    const newHp = Math.min(player.maxHp, player.hp + healAmount);
    
    addBattleLog(`${player.job.name}の回復魔法！HPが${healAmount}回復した！`, "player");
    
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = { ...player, hp: newHp };
    setPlayers(newPlayers);
    
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };

  const enemyAttack = () => {
    if (!selectedEnemy || players.length === 0) return;
    
    const player = getCurrentPlayer();
    if (!player) return;
    
    // 防御力を考慮したダメージ計算
    const baseDamage = Math.floor(Math.random() * selectedEnemy.attack) + 1;
    const damage = Math.max(1, baseDamage - Math.floor(player.defense / 2));
    const newPlayerHp = Math.max(0, player.hp - damage);
    
    addBattleLog(`${selectedEnemy.name}の攻撃！${player.job.name}は${damage}のダメージを受けた！`, "enemy");
    
    if (newPlayerHp <= 0) {
      addBattleLog(`${player.job.name}は倒れてしまった...`, "system");
      
      // 次のプレイヤーに交代
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextIndex);
      
      // 全員倒れた場合
      if (nextIndex === 0) {
        addBattleLog("パーティー全員が倒れてしまった...", "system");
        handleBattleResult(false);
        return;
      }
      
      setIsPlayerTurn(true);
      return;
    }
    
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = { ...player, hp: newPlayerHp };
    setPlayers(newPlayers);
    setIsPlayerTurn(true);
  };

  const nextPlayer = () => {
    if (players.length <= 1) return;
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    addBattleLog(`${players[nextIndex].job.name}のターン！`, "system");
  };

  const flee = () => {
    if (!isInBattle) return;
    
    addBattleLog("逃げ出した！", "system");
    handleBattleResult(false);
  };

  const handleBattleResult = (won: boolean) => {
    if (won) {
      setWins(wins + 1);
      if (wins + 1 >= 3) {
        // クリア！
        addBattleLog("🎉 冒険をクリアしました！おめでとうございます！", "system");
        setTimeout(() => {
          alert("🎉 冒険をクリアしました！おめでとうございます！");
          setShowBattle(false);
          setSelectedEnemy(null);
          setIsInBattle(false);
        }, 2000);
        return;
      }
    } else {
      setLosses(losses + 1);
      if (losses + 1 >= 3) {
        // ゲームオーバー
        addBattleLog("💀 ゲームオーバー... もう一度挑戦してください。", "system");
        setTimeout(() => {
          alert("💀 ゲームオーバー... もう一度挑戦してください。");
          setShowBattle(false);
          setSelectedEnemy(null);
          setIsInBattle(false);
        }, 2000);
        return;
      }
    }
    
    setCurrentBattle(currentBattle + 1);
    setShowBattle(false);
    setSelectedEnemy(null);
    setIsInBattle(false);
    
    // 全員のHPを回復
    const recoveredPlayers = players.map(p => ({ ...p, hp: p.maxHp }));
    setPlayers(recoveredPlayers);
    
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">キャラクターが選択されていません</h1>
          <Link href="/character" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            キャラクター選択へ
          </Link>
        </div>
      </div>
    );
  }

  if (battleStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">冒険モード</h1>
            <div className="flex gap-4">
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                戦闘 {battleCount}/3
              </div>
              <button 
                onClick={resetAdventure}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                冒険をリセット
              </button>
              <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                🏠 ホーム
              </Link>
            </div>
          </div>
          <BattleSystem />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-800">冒険モード</h1>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            🏠 ホーム
          </Link>
        </div>

        {/* 説明 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-700">冒険のルール</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚔️</div>
              <div>
                <strong>3回連続戦闘</strong><br />
                ランダムに選ばれた2体の敵と戦います
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🎭</div>
              <div>
                <strong>キャラクター使用制限</strong><br />
                一度使ったキャラクターは、その戦闘中は再使用できません
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">👹</div>
              <div>
                <strong>敵の重複なし</strong><br />
                同じ敵とは2回以上戦いません
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🏆</div>
              <div>
                <strong>クリア条件</strong><br />
                3回全て勝利すると冒険クリア！
              </div>
            </div>
          </div>
        </div>

        {/* 選択されたキャラクター */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-700">選択されたパーティー</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedJobs.map((jobId) => {
              const job = jobs.find(j => j.id === jobId);
              return (
                <div key={jobId} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                  <div className="text-4xl mb-3">{job?.icon}</div>
                  <div className="text-xl font-bold text-gray-800">{job?.name}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    HP: {job?.hp} | 攻撃: {job?.attack} | 防御: {job?.defense}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 開始ボタン */}
        <div className="text-center">
          <button 
            onClick={startAdventure}
            className="bg-green-500 text-white px-12 py-6 rounded-lg hover:bg-green-600 transition-colors font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚀 冒険を始める
          </button>
        </div>
      </div>
    </div>
  );
} 