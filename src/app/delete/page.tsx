"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 型定義: TypeScriptでデータの形を明確にする
interface Comment {
  id: number;
  content: string;
  created_at: string;
}

export default function DeletePage() {
  // useStateは, [変数名, 変更関数] = useState<変数の型>(初期値)
  const [comments, setComments] = useState<Comment[]>([]);
  const [refreshSignal, setRefreshSignal] = useState(0);

  // [refreshSignal]が変わったとき、自動で実行される関数
  // useeffectの第一引数がエフェクト関数（発火時の処理）、第二引数が依存配列
  useEffect(() => {
    // 競合防止のフラグ
    let ignore = false;
    // 非同期でデータを取ってくる関数
    const fetchComments = async () => {
      // 大きい順でデータを取ってくる
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      // 競合フラグがたってないか確認
      if (!ignore) {
        if (error) {
          console.error("データ取得失敗:", error);
        } else if (data) {
          setComments(data);
        }
      }
    };
    // 非同期関数実行
    fetchComments();

    // クリーンアップ関数: 次のエフェクト実行前に古いフラグを立てる
    return () => {
      ignore = true;
    };
  }, [refreshSignal]); // refreshSignalが変わるたびに再取得する

  // 削除処理: 指定されたIDの行を削除する
  const handleDelete = async (id: number) => {
    // 誤操作防止のガード confirmでFalseだったらreutrn
    if (!confirm("この投稿を完全に削除してもよろしいですか？")) return;

    // Supabaseに削除命令を出す
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id); // 削除対象をIDで特定

    if (error) {
      alert("削除に失敗しました。RLSポリシーの設定を確認してください。");
      console.error(error);
    } else {
      // 成功したら画面を更新するためにシグナルを送る
      setRefreshSignal(s => s + 1);
    }
  };

  return (
    <main className="p-10 max-w-2xl mx-auto">
      {/* ナビゲーション */}
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-blue-500 hover:text-blue-700 transition flex items-center gap-1"
        >
          <span>←</span> <span>トップへ戻る</span>
        </Link>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
          管理モード
        </span>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">投稿の管理</h1>
        <p className="text-gray-600">
          不要なメッセージをデータベースから直接削除できます。
        </p>
      </header>

      {/* 一覧表示 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">表示できる投稿はありません。</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="flex justify-between items-center p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-red-200 transition-colors group text-black"
            >
              <div className="flex-1 pr-4">
                <p className="text-gray-800 leading-relaxed mb-1">{comment.content}</p>
                <time className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString("ja-JP")}
                </time>
              </div>

              <button
                onClick={() => handleDelete(comment.id)}
                className="bg-white text-red-500 border border-red-200 px-4 py-2 rounded-lg font-semibold text-sm 
                           hover:bg-red-500 hover:text-white hover:border-red-500 
                           active:scale-95 transition-all duration-200"
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}