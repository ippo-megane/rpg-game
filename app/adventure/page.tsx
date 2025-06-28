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
    setIsInBattle(false);
    setBattleLogs([]);
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

  if (showBattle && selectedEnemy && isInBattle) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">第{currentBattle}戦</h1>
              <div className="flex justify-center gap-4 text-lg">
                <span className="text-green-600">勝利: {wins}</span>
                <span className="text-red-600">敗北: {losses}</span>
              </div>
            </div>
            <Link
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              🏠 ホームに戻る
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：戦闘画面 */}
            <div className="space-y-6">
              {/* パーティー情報 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">パーティー</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {players.map((player, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-3 ${
                        index === currentPlayerIndex && isInBattle
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{player.job.icon}</span>
                        <div>
                          <div className="font-semibold">{player.job.name}</div>
                          <div className="text-sm text-gray-600">Lv.{player.level}</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        HP: {player.hp}/{player.maxHp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 戦闘画面 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">戦闘中</h2>
                
                {/* 敵の状態 */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-lg text-red-800">{selectedEnemy.icon} {selectedEnemy.name}</h3>
                  <div className="w-full bg-red-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentEnemyHp / selectedEnemy.hp) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-red-700">HP: {currentEnemyHp}/{selectedEnemy.hp}</div>
                </div>

                {/* 現在のプレイヤーの状態 */}
                {getCurrentPlayer() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-lg text-blue-800">
                      {getCurrentPlayer()!.job.icon} {getCurrentPlayer()!.job.name} (Lv.{getCurrentPlayer()!.level})
                    </h3>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(getCurrentPlayer()!.hp / getCurrentPlayer()!.maxHp) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-blue-700">HP: {getCurrentPlayer()!.hp}/{getCurrentPlayer()!.maxHp}</div>
                    <div className="text-sm text-blue-700">経験値: {getCurrentPlayer()!.exp}/{getCurrentPlayer()!.expToNext}</div>
                  </div>
                )}

                {/* アクションボタン */}
                {isPlayerTurn && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={playerAttack}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      攻撃
                    </button>
                    <button
                      onClick={playerMagic}
                      className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
                    >
                      魔法
                    </button>
                    <button
                      onClick={heal}
                      disabled={getCurrentPlayer()?.hp >= getCurrentPlayer()?.maxHp}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      回復
                    </button>
                    {players.length > 1 && (
                      <button
                        onClick={nextPlayer}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                      >
                        交代
                      </button>
                    )}
                    <button
                      onClick={flee}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      逃げる
                    </button>
                  </div>
                )}

                {!isPlayerTurn && (
                  <div className="text-center py-4">
                    <div className="animate-pulse text-gray-600">敵のターン...</div>
                  </div>
                )}
              </div>
            </div>

            {/* 右側：戦闘ログ */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">戦闘ログ</h2>
              <div className="h-96 overflow-y-auto space-y-2">
                {battleLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">戦闘ログがありません</p>
                ) : (
                  battleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded text-sm ${
                        log.type === "player" ? "bg-blue-100 text-blue-800" :
                        log.type === "enemy" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.message}
                    </div>
                  ))
                )}
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">冒険モード</h1>
          <Link
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            🏠 ホームに戻る
          </Link>
        </div>

        <div className="text-center mb-8">
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