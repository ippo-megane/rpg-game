import { supabase } from "../../lib/supabaseClient";
import BattleSystem from "./BattleSystem";
import Link from "next/link";

export default async function BattlePage() {
  // 敵データを取得
  const { data: enemies, error } = await supabase
    .from("enemies")
    .select("*")
    .order("id");

  if (error) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">戦闘</h1>
          <Link
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            🏠 ホームに戻る
          </Link>
        </div>
        <div className="text-red-500">敵データの取得に失敗しました</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">戦闘システム</h1>
        <Link
          href="/"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          🏠 ホームに戻る
        </Link>
      </div>
      <BattleSystem enemies={enemies || []} />
    </div>
  );
} 