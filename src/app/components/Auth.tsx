"use client";

import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// 自作Authタグからもらう引数はインターフェースとして固められるため
interface AuthProps {
  user: User | null;
}

// 分割代入で変数をもらう
export default function Auth({ user }: AuthProps) {

  // ログイン（今回は一番簡単な「メールアドレス」でのログインを想定）
  // ※本来は入力フォームを作りますが、まずは機能確認用のデモコードです
  const handleLogin = async () => {
    // ポップアップの入力枠で記入させる
    const email = window.prompt("メールアドレスを入力してください");
    const password = window.prompt("パスワードを入力してください");
    // なければ終了
    if (!email || !password) return;
    // サインインを試みる。うまくいくとログインチケットがもらえる。
    // 引数は、オブジェクト（変数名とキー名が同じなら省略できる書き方）
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // ログインできない場合
    if (error) alert("ログイン失敗: " + error.message);
  };

  // ログアウト
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // htmlタグとして出力される部分
  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-gray-600">{user.email} さん</span>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm transition"
          >
            ログアウト
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
        >
          ログイン / 新規登録
        </button>
      )}
    </div>
  );
}