"use client";

import { useState, useEffect} from "react";
import { supabase } from "@/lib/supabase";

// DBの1行分がどんなデータか定義する
interface Comment {
  id: number;
  content: string;
  created_at: string;
}

// Next.jsでメインとなる関数
export default function Home() {
  // ブラウザと共有する変数
  const [text, setText] = useState("");
  // Comment[]はCommentインターフェースのリスト（list[Comment]と同様）
  const [comments, setComments] = useState<Comment[]>([]);
  // デジタルの呼び鈴（スイッチ）何かが起きたことをuseEffectに教える
  const [refreshSignal, setRefreshSignal] = useState(0);

  // [refreshSignal]が変わったとき、自動で実行される関数
  // useeffectの第一引数がエフェクト関数（発火時の処理）、第二引数が依存配列
  useEffect(() => {
    // 競合状態を防ぐためのフラグ
    let ignore = false;
    // useEffectの中でだけ使う非同期関数を定義
    const startFetching = async () => {
      // DBからデータ取得（大きい順）
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      // 競合フラグが立っていない、かつデータがある場合のみStateを更新
      if (!ignore && data) {
        setComments(data);
      }
      if (error) console.error(error);
    };
    // 関数実行実行
    startFetching();
    // returnにはクリーンアップ関数、別でuseEffectが発火したときには
    // 処理が終わってなかろうと、クリーンアップ関数だけ起動する。これ重要。
    return () => {
      ignore = true;
    };
  }, [refreshSignal]); // refreshSignalが変わるたびに実行

  // 送信ボタン押下時に発火する関数
  const handleSubmit = async (e: React.FormEvent) => {
    // ページのリフレッシュをしない
    e.preventDefault();
    // テキストが空ならReturn
    if (!text) return;
    // DBにテキストを挿入
    const { error } = await supabase.from("comments").insert([{ content: text }]);

    // エラーでなければ
    if (!error) {
      // テキスト初期化
      setText("");
      // setRefreshSignalの引数にはアロー関数をいれる
      // アロー関数の引数には現在の値が入れ込まれる
      setRefreshSignal(s => s + 1);
    }
  };

  // 描画部分
  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-5">DB接続テスト</h1>

      {/* 入力エリア */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 rounded text-black"
          placeholder="メッセージを入力"
        />
        <button className="bg-linear-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-full font-bold hover:opacity-80 transition">
          送信
        </button>
      </form>

      {/* --- 【追加】表示エリア（Pythonのリスト内包表記のようなイメージ） --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">投稿一覧</h2>
        {/* 三項演算子です 条件文 ? Trueの処理 : Falseの処理*/}
        {comments.length === 0 ? (
          <p className="text-gray-500">まだ投稿はありません。</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded shadow-sm border text-black"
            >
              <p>{comment.content}</p>
              <small className="text-gray-400">
                {new Date(comment.created_at).toLocaleString("ja-JP")}
              </small>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
