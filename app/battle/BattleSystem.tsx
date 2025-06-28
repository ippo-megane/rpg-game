"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  icon: string;
  image: string;
  attackEffect: string;
  damageEffect: string;
}

interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  icon: string;
  image: string;
  attackEffect: string;
  damageEffect: string;
  weaknesses: string[];
  resistances: string[];
}

const jobs: Character[] = [
  {
    id: "wizard",
    name: "魔法使い",
    hp: 80,
    maxHp: 80,
    attack: 25,
    defense: 15,
    icon: "🧙‍♂️",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    attackEffect: "✨",
    damageEffect: "💥"
  },
  {
    id: "warrior",
    name: "戦士",
    hp: 120,
    maxHp: 120,
    attack: 30,
    defense: 25,
    icon: "⚔️",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    attackEffect: "⚡",
    damageEffect: "💢"
  },
  {
    id: "hero",
    name: "勇者",
    hp: 100,
    maxHp: 100,
    attack: 35,
    defense: 20,
    icon: "👑",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    attackEffect: "🌟",
    damageEffect: "💔"
  },
  {
    id: "rogue",
    name: "遊び人",
    hp: 70,
    maxHp: 70,
    attack: 40,
    defense: 10,
    icon: "🎭",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    attackEffect: "🎯",
    damageEffect: "💫"
  },
  {
    id: "monk",
    name: "僧侶",
    hp: 90,
    maxHp: 90,
    attack: 20,
    defense: 30,
    icon: "🙏",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    attackEffect: "🙏",
    damageEffect: "💙"
  }
];

const enemies: Enemy[] = [
  {
    id: "goblin",
    name: "ゴブリン",
    hp: 60,
    maxHp: 60,
    attack: 20,
    defense: 10,
    icon: "👹",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    attackEffect: "🗡️",
    damageEffect: "💚",
    weaknesses: ["warrior", "hero"],
    resistances: ["wizard"]
  },
  {
    id: "orc",
    name: "オーク",
    hp: 100,
    maxHp: 100,
    attack: 30,
    defense: 20,
    icon: "👺",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    attackEffect: "🪓",
    damageEffect: "🟢",
    weaknesses: ["wizard", "rogue"],
    resistances: ["warrior"]
  },
  {
    id: "dragon",
    name: "ドラゴン",
    hp: 150,
    maxHp: 150,
    attack: 40,
    defense: 30,
    icon: "🐉",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    attackEffect: "🔥",
    damageEffect: "🔴",
    weaknesses: ["hero", "monk"],
    resistances: ["wizard", "rogue"]
  },
  {
    id: "skeleton",
    name: "スケルトン",
    hp: 50,
    maxHp: 50,
    attack: 25,
    defense: 15,
    icon: "💀",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    attackEffect: "⚔️",
    damageEffect: "⚪",
    weaknesses: ["monk", "wizard"],
    resistances: ["rogue"]
  },
  {
    id: "slime",
    name: "スライム",
    hp: 40,
    maxHp: 40,
    attack: 15,
    defense: 5,
    icon: "🟢",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    attackEffect: "💧",
    damageEffect: "💚",
    weaknesses: ["warrior", "hero"],
    resistances: ["monk"]
  }
];

export default function BattleSystem() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy'>('player');
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [usedCharacters, setUsedCharacters] = useState<string[]>([]);
  const [foughtEnemies, setFoughtEnemies] = useState<string[]>([]);
  const [battleCount, setBattleCount] = useState(0);
  const [isAdventureMode, setIsAdventureMode] = useState(false);
  const [effects, setEffects] = useState<{type: string, target: string, effect: string}[]>([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem('selectedJobs');
    const savedUsedCharacters = localStorage.getItem('usedCharacters');
    const savedFoughtEnemies = localStorage.getItem('foughtEnemies');
    const savedBattleCount = localStorage.getItem('battleCount');
    const savedIsAdventureMode = localStorage.getItem('isAdventureMode');

    if (savedJobs) {
      setSelectedJobs(JSON.parse(savedJobs));
    }
    if (savedUsedCharacters) {
      setUsedCharacters(JSON.parse(savedUsedCharacters));
    }
    if (savedFoughtEnemies) {
      setFoughtEnemies(JSON.parse(savedFoughtEnemies));
    }
    if (savedBattleCount) {
      setBattleCount(parseInt(savedBattleCount));
    }
    if (savedIsAdventureMode) {
      setIsAdventureMode(JSON.parse(savedIsAdventureMode));
    }
  }, []);

  const getAvailableEnemies = () => {
    return enemies.filter(enemy => !foughtEnemies.includes(enemy.id));
  };

  const getAvailableCharacters = () => {
    return selectedJobs.filter(jobId => !usedCharacters.includes(jobId));
  };

  const getCharacterById = (id: string): Character | undefined => {
    return jobs.find(job => job.id === id);
  };

  const calculateDamage = (attacker: Character | Enemy, defender: Character | Enemy, isPlayerAttack: boolean) => {
    let baseDamage = Math.max(1, attacker.attack - defender.defense);
    
    if (isPlayerAttack && 'weaknesses' in defender) {
      const attackerJob = attacker.id;
      if (defender.weaknesses.includes(attackerJob)) {
        baseDamage = Math.floor(baseDamage * 1.5);
      } else if (defender.resistances.includes(attackerJob)) {
        baseDamage = Math.floor(baseDamage * 0.7);
      }
    }
    
    return Math.max(1, baseDamage);
  };

  const addEffect = (type: string, target: string, effect: string) => {
    const newEffect = {type, target, effect};
    setEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e !== newEffect));
    }, 1000);
  };

  const playerAttack = () => {
    if (!selectedEnemy || gameOver) return;

    const availableCharacters = getAvailableCharacters();
    if (availableCharacters.length === 0) {
      addLog("使用可能なキャラクターがいません！");
      return;
    }

    const randomCharacterId = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    const character = getCharacterById(randomCharacterId);
    
    if (!character) return;

    const damage = calculateDamage(character, selectedEnemy, true);
    const newEnemyHp = Math.max(0, selectedEnemy.hp - damage);
    
    addLog(`${character.name}の攻撃！${selectedEnemy.name}に${damage}ダメージ！`);
    addEffect('attack', 'player', character.attackEffect);
    addEffect('damage', 'enemy', selectedEnemy.damageEffect);
    
    setSelectedEnemy({ ...selectedEnemy, hp: newEnemyHp });
    
    if (newEnemyHp <= 0) {
      handleVictory();
    } else {
      setCurrentTurn('enemy');
      setTimeout(enemyAttack, 1500);
    }
  };

  const playerHeal = () => {
    if (gameOver) return;

    const availableCharacters = getAvailableCharacters();
    if (availableCharacters.length === 0) {
      addLog("使用可能なキャラクターがいません！");
      return;
    }

    const randomCharacterId = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    const character = getCharacterById(randomCharacterId);
    
    if (!character) return;

    const healAmount = Math.floor(character.maxHp * 0.3);
    const newHp = Math.min(character.maxHp, character.hp + healAmount);
    
    addLog(`${character.name}の回復！HPが${healAmount}回復！`);
    addEffect('heal', 'player', '💚');
    
    // キャラクターのHPを更新（selectedJobsは文字列配列なので、ローカルストレージで管理）
    const updatedCharacter = { ...character, hp: newHp };
    localStorage.setItem(`character_${randomCharacterId}`, JSON.stringify(updatedCharacter));
    
    setCurrentTurn('enemy');
    setTimeout(enemyAttack, 1500);
  };

  const enemyAttack = () => {
    if (!selectedEnemy || gameOver) return;

    const availableCharacters = getAvailableCharacters();
    if (availableCharacters.length === 0) {
      addLog("使用可能なキャラクターがいません！");
      return;
    }

    const randomCharacterId = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    const character = getCharacterById(randomCharacterId);
    
    if (!character) return;

    const damage = calculateDamage(selectedEnemy, character, false);
    const newCharacterHp = Math.max(0, character.hp - damage);
    
    addLog(`${selectedEnemy.name}の攻撃！${character.name}に${damage}ダメージ！`);
    addEffect('attack', 'enemy', selectedEnemy.attackEffect);
    addEffect('damage', 'player', character.damageEffect);
    
    // キャラクターのHPを更新（ローカルストレージで管理）
    const updatedCharacter = { ...character, hp: newCharacterHp };
    localStorage.setItem(`character_${randomCharacterId}`, JSON.stringify(updatedCharacter));
    
    if (newCharacterHp <= 0) {
      addLog(`${character.name}が倒れました！`);
      setUsedCharacters(prev => [...prev, randomCharacterId]);
      
      // 全キャラクターが倒れたかチェック
      const remainingCharacters = getAvailableCharacters().filter(id => id !== randomCharacterId);
      if (remainingCharacters.length === 0) {
        handleDefeat();
      } else {
        setCurrentTurn('player');
      }
    } else {
      setCurrentTurn('player');
    }
  };

  const handleVictory = () => {
    addLog(`${selectedEnemy?.name}を倒しました！`);
    setVictory(true);
    setGameOver(true);
    
    if (isAdventureMode) {
      const newBattleCount = battleCount + 1;
      setBattleCount(newBattleCount);
      localStorage.setItem('battleCount', newBattleCount.toString());
      
      if (newBattleCount >= 3) {
        // 冒険クリア - クリアページに遷移
        setTimeout(() => {
          window.location.href = '/clear';
        }, 2000);
      } else {
        // 次の戦闘へ
        setTimeout(() => {
          resetBattle();
        }, 2000);
      }
    }
  };

  const handleDefeat = () => {
    addLog("全員が倒れました...");
    setGameOver(true);
  };

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const startBattle = () => {
    if (!selectedEnemy) return;
    
    // 戦闘開始時にキャラクターのHPをリセット
    selectedJobs.forEach(jobId => {
      const character = getCharacterById(jobId);
      if (character) {
        localStorage.setItem(`character_${jobId}`, JSON.stringify(character));
      }
    });
    
    setBattleStarted(true);
    setGameOver(false);
    setVictory(false);
    setBattleLog([]);
    setCurrentTurn('player');
    addLog(`戦闘開始！${selectedEnemy.name}が現れた！`);
  };

  const resetBattle = () => {
    setBattleStarted(false);
    setGameOver(false);
    setVictory(false);
    setBattleLog([]);
    setCurrentTurn('player');
    setSelectedEnemy(null);
    setUsedCharacters([]);
    setFoughtEnemies([]);
    setBattleCount(0);
    
    // ローカルストレージをクリア
    localStorage.removeItem('usedCharacters');
    localStorage.removeItem('foughtEnemies');
    localStorage.removeItem('battleCount');
    localStorage.removeItem('isAdventureMode');
    
    // キャラクターデータもクリア
    selectedJobs.forEach(jobId => {
      localStorage.removeItem(`character_${jobId}`);
    });
  };

  const flee = () => {
    addLog("逃げ出した！");
    setGameOver(true);
    
    if (isAdventureMode) {
      setTimeout(() => {
        window.location.href = '/adventure';
      }, 1500);
    }
  };

  const selectEnemy = (enemy: Enemy) => {
    setSelectedEnemy(enemy);
    setFoughtEnemies(prev => [...prev, enemy.id]);
    localStorage.setItem('foughtEnemies', JSON.stringify([...foughtEnemies, enemy.id]));
  };

  const getCharacterDisplay = (jobId: string) => {
    const character = getCharacterById(jobId);
    if (!character) return null;
    
    // ローカルストレージからHPを取得
    const savedCharacter = localStorage.getItem(`character_${jobId}`);
    const currentHp = savedCharacter ? JSON.parse(savedCharacter).hp : character.hp;
    
    const isUsed = usedCharacters.includes(jobId);
    const isDead = currentHp <= 0;
    
    return (
      <div key={jobId} className={`relative ${isUsed || isDead ? 'opacity-50' : ''}`}>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={character.image} 
                alt={character.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              {effects.filter(e => e.target === 'player' && e.type === 'attack').map((effect, index) => (
                <div key={index} className="absolute inset-0 flex items-center justify-center text-2xl animate-ping">
                  {effect.effect}
                </div>
              ))}
              {effects.filter(e => e.target === 'player' && e.type === 'damage').map((effect, index) => (
                <div key={index} className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
                  {effect.effect}
                </div>
              ))}
              {isUsed && <div className="absolute inset-0 bg-red-500 bg-opacity-50 rounded-full flex items-center justify-center text-white font-bold">×</div>}
              {isDead && <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center text-white font-bold">💀</div>}
            </div>
            <div>
              <div className="font-bold">{character.name} {character.icon}</div>
              <div className="text-sm text-gray-600">
                HP: {currentHp}/{character.maxHp}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentHp / character.maxHp) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getEnemyDisplay = () => {
    if (!selectedEnemy) return null;
    
    return (
      <div className="bg-red-50 rounded-lg p-6 shadow-lg border-2 border-red-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={selectedEnemy.image} 
              alt={selectedEnemy.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            {effects.filter(e => e.target === 'enemy').map((effect, index) => (
              <div key={index} className="absolute inset-0 flex items-center justify-center text-2xl animate-ping">
                {effect.effect}
              </div>
            ))}
          </div>
          <div>
            <div className="text-xl font-bold text-red-800">{selectedEnemy.name} {selectedEnemy.icon}</div>
            <div className="text-sm text-red-600">
              HP: {selectedEnemy.hp}/{selectedEnemy.maxHp}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(selectedEnemy.hp / selectedEnemy.maxHp) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedJobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">キャラクターが選択されていません</h1>
          <Link href="/character" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            キャラクター選択へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">戦闘システム</h1>
          <div className="flex gap-4">
            <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              🏠 ホーム
            </Link>
            {isAdventureMode && (
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                戦闘 {battleCount}/3
              </div>
            )}
          </div>
        </div>

        {/* 敵選択 */}
        {!battleStarted && !gameOver && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">敵を選択してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAvailableEnemies().map(enemy => (
                <div 
                  key={enemy.id}
                  onClick={() => selectEnemy(enemy)}
                  className={`bg-white rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedEnemy?.id === enemy.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={enemy.image} 
                      alt={enemy.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold">{enemy.name} {enemy.icon}</div>
                      <div className="text-sm text-gray-600">HP: {enemy.hp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {getAvailableEnemies().length === 0 && (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600 mb-4">全ての敵と戦いました！</p>
                <button 
                  onClick={resetBattle}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                >
                  リセット
                </button>
              </div>
            )}
          </div>
        )}

        {/* 戦闘画面 */}
        {battleStarted && !gameOver && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 味方パーティー */}
            <div>
              <h2 className="text-2xl font-bold mb-4">味方パーティー</h2>
              <div className="space-y-4">
                {selectedJobs.map(jobId => getCharacterDisplay(jobId))}
              </div>
            </div>

            {/* 敵 */}
            <div>
              <h2 className="text-2xl font-bold mb-4">敵</h2>
              {getEnemyDisplay()}
            </div>
          </div>
        )}

        {/* 戦闘ログ */}
        {battleStarted && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">戦闘ログ</h3>
            <div className="bg-gray-100 rounded-lg p-4 h-40 overflow-y-auto">
              {battleLog.map((log, index) => (
                <div key={index} className="text-sm mb-1">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        {!battleStarted && selectedEnemy && (
          <div className="mt-8 text-center">
            <button 
              onClick={startBattle}
              className="bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 text-lg font-bold"
            >
              戦闘開始！
            </button>
          </div>
        )}

        {battleStarted && !gameOver && currentTurn === 'player' && (
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={playerAttack}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold"
            >
              攻撃
            </button>
            <button 
              onClick={playerHeal}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-bold"
            >
              回復
            </button>
            <button 
              onClick={flee}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-bold"
            >
              逃走
            </button>
          </div>
        )}

        {battleStarted && !gameOver && currentTurn === 'enemy' && (
          <div className="mt-8 text-center">
            <div className="text-lg font-bold text-red-600">敵のターン...</div>
          </div>
        )}

        {/* ゲームオーバー */}
        {gameOver && (
          <div className="mt-8 text-center">
            {victory ? (
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-800 mb-4">勝利！</h2>
                {isAdventureMode && battleCount < 3 ? (
                  <p className="text-green-700 mb-4">次の戦闘に進みます...</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-700">おめでとうございます！</p>
                    <Link href="/battle" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                      新しい戦闘
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-red-800 mb-4">敗北...</h2>
                <div className="space-y-4">
                  <p className="text-red-700">全員が倒れました</p>
                  <button 
                    onClick={resetBattle}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
                  >
                    リトライ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 