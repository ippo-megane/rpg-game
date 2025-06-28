"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Enemy {
  id: number;
  name: string;
  hp: number;
  attack: number;
  exp_reward: number;
}

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

export default function BattleSystem({ enemies }: { enemies: Enemy[] }) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [isInBattle, setIsInBattle] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  // ローカルストレージから選択されたジョブを読み込み
  useEffect(() => {
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
    } else {
      setShowCharacterSelect(true);
    }
  }, []);

  const addBattleLog = (message: string, type: "player" | "enemy" | "system") => {
    setBattleLogs(prev => [...prev, {
      id: Date.now(),
      message,
      type
    }]);
  };

  const startBattle = (enemy: Enemy) => {
    if (players.length === 0) {
      setShowCharacterSelect(true);
      return;
    }
    
    setCurrentEnemy({ ...enemy });
    setIsInBattle(true);
    setIsPlayerTurn(true);
    setCurrentPlayerIndex(0);
    setBattleLogs([]);
    addBattleLog(`${enemy.name}が現れた！`, "system");
  };

  const getCurrentPlayer = () => players[currentPlayerIndex];

  const playerAttack = () => {
    if (!currentEnemy || !isPlayerTurn || players.length === 0) return;

    const player = getCurrentPlayer();
    if (!player) return;

    // 物理攻撃
    const damage = Math.floor(Math.random() * player.attack) + 1;
    const newEnemyHp = Math.max(0, currentEnemy.hp - damage);
    
    addBattleLog(`${player.job.name}の攻撃！${currentEnemy.name}に${damage}のダメージ！`, "player");
    
    if (newEnemyHp <= 0) {
      // 敵を倒した
      addBattleLog(`${currentEnemy.name}を倒した！`, "system");
      addBattleLog(`${currentEnemy.exp_reward}の経験値を獲得！`, "system");
      
      // 全プレイヤーに経験値を分配
      const expPerPlayer = Math.floor(currentEnemy.exp_reward / players.length);
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
      setIsInBattle(false);
      setCurrentEnemy(null);
      return;
    }
    
    setCurrentEnemy(prev => prev ? { ...prev, hp: newEnemyHp } : null);
    setIsPlayerTurn(false);
    
    // 敵の攻撃
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };

  const playerMagic = () => {
    if (!currentEnemy || !isPlayerTurn || players.length === 0) return;

    const player = getCurrentPlayer();
    if (!player) return;

    // 魔法攻撃
    const damage = Math.floor(Math.random() * player.magic) + 1;
    const newEnemyHp = Math.max(0, currentEnemy.hp - damage);
    
    addBattleLog(`${player.job.name}の魔法攻撃！${currentEnemy.name}に${damage}のダメージ！`, "player");
    
    if (newEnemyHp <= 0) {
      addBattleLog(`${currentEnemy.name}を倒した！`, "system");
      addBattleLog(`${currentEnemy.exp_reward}の経験値を獲得！`, "system");
      
      const expPerPlayer = Math.floor(currentEnemy.exp_reward / players.length);
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
      setIsInBattle(false);
      setCurrentEnemy(null);
      return;
    }
    
    setCurrentEnemy(prev => prev ? { ...prev, hp: newEnemyHp } : null);
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
    if (!currentEnemy || players.length === 0) return;
    
    const player = getCurrentPlayer();
    if (!player) return;
    
    // 防御力を考慮したダメージ計算
    const baseDamage = Math.floor(Math.random() * currentEnemy.attack) + 1;
    const damage = Math.max(1, baseDamage - Math.floor(player.defense / 2));
    const newPlayerHp = Math.max(0, player.hp - damage);
    
    addBattleLog(`${currentEnemy.name}の攻撃！${player.job.name}は${damage}のダメージを受けた！`, "enemy");
    
    if (newPlayerHp <= 0) {
      addBattleLog(`${player.job.name}は倒れてしまった...`, "system");
      
      // 次のプレイヤーに交代
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextIndex);
      
      // 全員倒れた場合
      if (nextIndex === 0) {
        addBattleLog("パーティー全員が倒れてしまった...", "system");
        setIsInBattle(false);
        setCurrentEnemy(null);
        // 全員のHPを回復
        const recoveredPlayers = players.map(p => ({ ...p, hp: p.maxHp }));
        setPlayers(recoveredPlayers);
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

  const flee = () => {
    if (!isInBattle) return;
    
    addBattleLog("逃げ出した！", "system");
    setIsInBattle(false);
    setCurrentEnemy(null);
  };

  const nextPlayer = () => {
    if (players.length <= 1) return;
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    addBattleLog(`${players[nextIndex].job.name}のターン！`, "system");
  };

  if (showCharacterSelect) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">キャラクターが選択されていません</h2>
        <p className="text-gray-600 mb-6">戦闘を開始する前に、キャラクターを選択してください。</p>
        <Link
          href="/character"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          キャラクター選択へ
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左側：敵選択と戦闘 */}
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

        {/* 敵選択 */}
        {!isInBattle && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">戦う敵を選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enemies.map((enemy) => (
                <div
                  key={enemy.id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => startBattle(enemy)}
                >
                  <h3 className="font-semibold text-lg">{enemy.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>HP: {enemy.hp}</div>
                    <div>攻撃力: {enemy.attack}</div>
                    <div>経験値: {enemy.exp_reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 戦闘画面 */}
        {isInBattle && currentEnemy && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">戦闘中</h2>
            
            {/* 敵の状態 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-lg text-red-800">{currentEnemy.name}</h3>
              <div className="w-full bg-red-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentEnemy.hp / (enemies.find(e => e.id === currentEnemy.id)?.hp || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-red-700">HP: {currentEnemy.hp}</div>
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
        )}
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
  );
} 