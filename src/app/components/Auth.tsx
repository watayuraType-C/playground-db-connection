"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// 引数の型定義
interface AuthProps {
  user: User | null;
}

export default function Auth({ user }: AuthProps) {
  // 入力された値を保持する変数（プロンプトではなくこのStateに文字が溜まる）
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 処理中のぐるぐる状態を管理
  const [loading, setLoading] = useState(false);

  // ログイン処理を実行する関数
  const handleLogin = async () => {
    setLoading(true);
    // 略記法 { email, password } でキーと値をセットにして送信
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("ログインエラー: " + error.message);
    setLoading(false);
  };

  // 新規登録（アカウント作成）を実行する関数
  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("登録エラー: " + error.message);
    } else {
      alert("確認メールを送信しました！メール内のリンクをクリックして登録を完了してください。");
    }
    setLoading(false);
  };

  // ログイン済みの場合の表示
  if (user) {
    return (
      <div className="flex flex-col items-end gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <span className="text-xs font-bold text-blue-800">{user.email}</span>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs bg-white text-gray-600 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 transition"
        >
          ログアウト
        </button>
      </div>
    );
  }

  // 未ログイン時のフォーム表示
  return (
    <div className="flex flex-col gap-2 p-4 bg-white border rounded-xl shadow-md min-w-70px">
      <h3 className="text-sm font-bold text-gray-700 mb-1">ログイン / 新規登録</h3>
      
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // 文字を打つたびにStateを更新
        className="border p-2 rounded text-sm text-black outline-none focus:border-blue-400"
      />
      
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded text-sm text-black outline-none focus:border-blue-400"
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-2 rounded text-xs font-bold hover:bg-blue-600 disabled:opacity-50 transition"
        >
          ログイン
        </button>
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="flex-1 bg-emerald-500 text-white py-2 rounded text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 transition"
        >
          新規登録
        </button>
      </div>
      
      <p className="text-[10px] text-gray-400 mt-1">
        ※新規登録の場合、本人確認メールが届きます。
      </p>
    </div>
  );
}