import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default async function EnemiesPage() {
  // 敵データを取得
  const { data: enemies, error } = await supabase
    .from("enemies")
    .select("*")
    .order("id");

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">敵一覧</h1>
        <div className="text-red-500">データの取得に失敗しました</div>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">エラー詳細:</h3>
          <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">敵一覧</h1>
        <div className="flex gap-2">
          <Link
            href="/battle"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            ⚔️ 戦闘を開始
          </Link>
          <Link
            href="/adventure"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            🗺️ 冒険モード
          </Link>
        </div>
      </div>
      
      {enemies && enemies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enemies.map((enemy: any) => (
            <div key={enemy.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{enemy.name}</h3>
                <span className="text-sm text-gray-500">ID: {enemy.id}</span>
              </div>
              
              <div className="space-y-2">
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
                {enemy.weakness && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">弱点:</span>
                    <span className="font-medium text-red-600">{enemy.weakness}</span>
                  </div>
                )}
                {enemy.resistance && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">耐性:</span>
                    <span className="font-medium text-blue-600">{enemy.resistance}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">敵データがありません。</p>
        </div>
      )}
    </div>
  );
} 