import { supabase } from "../../lib/supabaseClient";
import BattleSystem from "./BattleSystem";

export default async function BattlePage() {
  // 敵データを取得
  const { data: enemies, error } = await supabase
    .from("enemies")
    .select("*")
    .order("id");

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">戦闘</h1>
        <div className="text-red-500">敵データの取得に失敗しました</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">戦闘システム</h1>
      <BattleSystem enemies={enemies || []} />
    </div>
  );
} 