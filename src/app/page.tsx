"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Auth from "./components/Auth";

// DBの1行分がどんなデータか定義する
interface Comment {
  id: number;
  content: string;
  created_at: string;
}

// Next.jsでメインとなる関数
export default function Home() {
  // ブラウザと共有する入力テキスト変数
  const [text, setText] = useState("");
  // Comment[]はCommentインターフェースのリスト（list[Comment]と同様）
  const [comments, setComments] = useState<Comment[]>([]);
  // デジタルの呼び鈴（スイッチ）何かが起きたことをuseEffectに教える
  const [refreshSignal, setRefreshSignal] = useState(0);
  // userがログインしているかを示す変数
  const [user, setUser] = useState<User | null>(null);

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

  // Userのログイン情報が変わるたびにsetUserを変えていく
  // 初回だけ起動し、そのときに監視機能をスタートする
  useEffect(() => {
    // 現在のログインユーザーを取得、未ログインはuserがnullでくる
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    // ログイン状態監視が始まる
    const {
      // subscriptionは監視の管理オブジェクト、これを階層の深い分割代入している。
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // ?のあとは、左がnullならundifined, ??でundifinedならnullにすると指定
      setUser(session?.user ?? null);
    });

    // クリーンアップ関数、監視役を終了させる
    return () => subscription.unsubscribe();
  }, []);

  // 送信ボタン押下時に発火する関数
  const handleSubmit = async (e: React.FormEvent) => {
    // ページのリフレッシュをしない
    e.preventDefault();

    // 未ログインと未入力のアラートを分けました
    if (!user) {
      alert("ログインが必要です");
      return;
    }
    if (!text) return; // 空文字送信は無言でガード

    // DBにテキストを挿入
    const { error } = await supabase
      .from("comments")
      .insert([{ content: text, user_id: user.id }]);

    // エラーでなければ
    if (!error) {
      // テキスト初期化
      setText("");
      // setRefreshSignalの引数にはアロー関数をいれる
      // アロー関数の引数には現在の値が入れ込まれる
      setRefreshSignal((s) => s + 1);
    }
  };

  // 描画部分
  return (
    <main className="p-10 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-10">
        <Link
          href="/delete/"
          className="text-blue-500 hover:text-blue-700 transition flex items-center gap-1 shrink-0 mt-2"
        >
          <span>削除画面へ</span>
        </Link>

        {/*自作Authコンポーネント、引数はuserをインターフェースとして固めて送られる */}
        <Auth user={user} />
      </div>

      <h1 className="text-2xl font-bold mb-5">今の感想を投稿しよう</h1>

      {/* 入力エリア */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 rounded text-black flex-1 focus:ring-2 focus:ring-cyan-500 outline-none"
          placeholder={user ? "メッセージを入力" : "ログインして投稿してください"}
          disabled={!user} // 未ログイン時は入力不可に
        />
        <button 
          disabled={!user} // 未ログイン時はボタンを無効に
          className="bg-linear-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-full font-bold hover:opacity-80 transition disabled:opacity-30"
        >
          送信
        </button>
      </form>

      {/* --- 表示エリア（Pythonのリスト内包表記のようなイメージ） --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">投稿一覧</h2>
        {/* 三項演算子です 条件文 ? Trueの処理 : Falseの処理*/}
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-10">まだ投稿はありません。</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded shadow-sm border text-black hover:bg-white transition"
            >
              <p className="whitespace-pre-wrap">{comment.content}</p>
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