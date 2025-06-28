"use client";

import { useState } from "react";

interface Enemy {
  id: number;
  name: string;
  hp: number;
  attack: number;
  exp_reward: number;
}

interface Player {
  hp: number;
  maxHp: number;
  attack: number;
  level: number;
  exp: number;
  expToNext: number;
}

interface BattleLog {
  id: number;
  message: string;
  type: "player" | "enemy" | "system";
}

export default function BattleSystem({ enemies }: { enemies: Enemy[] }) {
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [player, setPlayer] = useState<Player>({
    hp: 100,
    maxHp: 100,
    attack: 15,
    level: 1,
    exp: 0,
    expToNext: 100
  });
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [isInBattle, setIsInBattle] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const addBattleLog = (message: string, type: "player" | "enemy" | "system") => {
    setBattleLogs(prev => [...prev, {
      id: Date.now(),
      message,
      type
    }]);
  };

  const startBattle = (enemy: Enemy) => {
    setCurrentEnemy({ ...enemy });
    setIsInBattle(true);
    setIsPlayerTurn(true);
    setBattleLogs([]);
    addBattleLog(`${enemy.name}が現れた！`, "system");
  };

  const playerAttack = () => {
    if (!currentEnemy || !isPlayerTurn) return;

    const damage = Math.floor(Math.random() * player.attack) + 1;
    const newEnemyHp = Math.max(0, currentEnemy.hp - damage);
    
    addBattleLog(`あなたの攻撃！${currentEnemy.name}に${damage}のダメージ！`, "player");
    
    if (newEnemyHp <= 0) {
      // 敵を倒した
      addBattleLog(`${currentEnemy.name}を倒した！`, "system");
      addBattleLog(`${currentEnemy.exp_reward}の経験値を獲得！`, "system");
      
      // 経験値獲得とレベルアップ処理
      let newExp = player.exp + currentEnemy.exp_reward;
      let newLevel = player.level;
      let newExpToNext = player.expToNext;
      
      while (newExp >= newExpToNext) {
        newExp -= newExpToNext;
        newLevel++;
        newExpToNext = newLevel * 100;
        addBattleLog(`レベルアップ！レベル${newLevel}になった！`, "system");
      }
      
      setPlayer(prev => ({
        ...prev,
        exp: newExp,
        level: newLevel,
        expToNext: newExpToNext
      }));
      
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

  const enemyAttack = () => {
    if (!currentEnemy) return;
    
    const damage = Math.floor(Math.random() * currentEnemy.attack) + 1;
    const newPlayerHp = Math.max(0, player.hp - damage);
    
    addBattleLog(`${currentEnemy.name}の攻撃！あなたは${damage}のダメージを受けた！`, "enemy");
    
    if (newPlayerHp <= 0) {
      // プレイヤーが倒れた
      addBattleLog("あなたは倒れてしまった...", "system");
      setIsInBattle(false);
      setCurrentEnemy(null);
      // HPを回復
      setPlayer(prev => ({ ...prev, hp: prev.maxHp }));
      return;
    }
    
    setPlayer(prev => ({ ...prev, hp: newPlayerHp }));
    setIsPlayerTurn(true);
  };

  const heal = () => {
    if (!isPlayerTurn || player.hp >= player.maxHp) return;
    
    const healAmount = Math.floor(player.maxHp * 0.3);
    const newHp = Math.min(player.maxHp, player.hp + healAmount);
    
    addBattleLog(`回復魔法！HPが${healAmount}回復した！`, "player");
    setPlayer(prev => ({ ...prev, hp: newHp }));
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };

  const flee = () => {
    if (!isInBattle) return;
    
    addBattleLog("逃げ出した！", "system");
    setIsInBattle(false);
    setCurrentEnemy(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左側：敵選択と戦闘 */}
      <div className="space-y-6">
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

            {/* プレイヤーの状態 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-lg text-blue-800">あなた (Lv.{player.level})</h3>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-blue-700">HP: {player.hp}/{player.maxHp}</div>
              <div className="text-sm text-blue-700">経験値: {player.exp}/{player.expToNext}</div>
            </div>

            {/* アクションボタン */}
            {isPlayerTurn && (
              <div className="flex gap-2">
                <button
                  onClick={playerAttack}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  攻撃
                </button>
                <button
                  onClick={heal}
                  disabled={player.hp >= player.maxHp}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  回復
                </button>
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