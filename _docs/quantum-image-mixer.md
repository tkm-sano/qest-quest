# Quantum Image Mixer の公開と更新

## 配置

- 公開先: `https://q-est.org/quantum-image-mixer/`（末尾 `/` を付ける）。
- 元リポジトリ: `https://github.com/ngym/enjoy_quantum`
- 元ディレクトリ: `prototypes/quantum-image-mixer`
- 初回の元コミット: `c9db52479ec3b519157685e22f6aa7f1f18f1c11`
- 初回の split コミット: `375a3eade30658c518e2c88776bea1cdc3c4476e`
- 配置方式: 対象ディレクトリを `git subtree split` で切り出し、
  `git subtree add --squash --prefix=quantum-image-mixer` で取り込む。

`submodule` はリポジトリを参照するため、元リポジトリの一部だけを
そのまま参照する用途には適さない。subtree なら対象だけを通常の
ファイルとして保持でき、GitHub Pages の既存 Jekyll ビルドを利用できる。
独自の同期スクリプトや Node のビルドは不要。

`quantum-forensics` と `quantum-vault` は取り込まない。
アプリ内の `css/`、`js/`、`assets/` の構造・内容は元と同一に保つ。
画像は `import.meta.url` 基準なので、`baseurl` を設定したプレビューでも動く。
Jekyll の front matter や `.nojekyll` をアプリに追加しない。
開発用 README、package.json、test、scripts、画像生成プロンプトは
`_config.yml` で配信対象から除外する。この `_docs/` も Jekyll の配信対象外。

## 更新

元の変更を enjoy_quantum にコミットしてから、qest-quest で実行する。
元リポジトリを最新版にするかどうかは更新内容を確認して判断する。

```sh
cd /Users/shota/GITHUB/qest-quest
mixer_split=$(git -C ../enjoy_quantum subtree split --prefix=prototypes/quantum-image-mixer HEAD)
git subtree pull --prefix=quantum-image-mixer --squash ../enjoy_quantum "$mixer_split"
```

`subtree pull` はコミットを作成し、追跡済みファイルの作業途中の変更があると
実行を拒否する。既存作業を残して更新する場合は、別の worktree を使う。
次の例では作業場所・ブランチ名が未使用であることを確認する。

```sh
cd /Users/shota/GITHUB/qest-quest
mixer_split=$(git -C ../enjoy_quantum subtree split --prefix=prototypes/quantum-image-mixer HEAD)
git worktree add -b update-quantum-image-mixer ../qest-quest-mixer-update HEAD
git -C ../qest-quest-mixer-update subtree pull --prefix=quantum-image-mixer --squash /Users/shota/GITHUB/enjoy_quantum "$mixer_split"
```

更新ブランチを検証し、元の作業場所に戻って `git merge --ff-only update-quantum-image-mixer`
で取り込む。競合が出たら中断して既存作業を確認する。
Gemfile.lock、.bundle/、vendor/ をこの更新のコミットへ加えない。
通常の clone だけでアプリのファイルが揃い、submodule の初期化は不要。
元リポジトリの更新は自動反映されず、上記の取り込みが必要。

## 検証と公開

```sh
cd /Users/shota/GITHUB/qest-quest
node --test quantum-image-mixer/test/*.test.js
BUNDLE_FROZEN=true bundle exec jekyll build --safe --destination /tmp/qest-quest-preview
python3 -m http.server 8000 --directory /tmp/qest-quest-preview
```

`http://localhost:8000/quantum-image-mixer/` を開き、両方の画像セット、
言語切替、回路操作、測定を確認する。
`/quantum-forensics/`、`/quantum-vault/`、アプリの test/scripts が
ビルド出力に含まれないことも確認する。

既存環境の依存関係が未導入の場合は、利用者の Gemfile.lock を勝手に書き換えず、
別の作業場所で環境を整える。

確認できた既存の公開構成（2026-11-08）:

- `_config.yml`: Jekyll、`url: https://q-est.org`、空の `baseurl`。
- `CNAME`: `q-est.org`。
- リポジトリ独自の `.github/workflows` はなし。
- GitHub の `pages build and deployment` が `main` の
  `edff6fa16e21f7e85b20aa6e273faae39a31427c` で成功している。
  https://github.com/tkm-sano/qest-quest/actions/runs/31229238569
- main のルートからの既存 GitHub Pages/Jekyll 公開と整合する。
  認証が必要な Pages 設定 API は読み取れていないため、設定画面の値は未確認。

公開設定を変更せず、確認した変更を通常の公開元ブランチへ push して
既存 Pages ビルドを利用する。push 後は新しい Pages 実行の成功と
公開 URL・アセットの HTTP 応答を確認してから「公開済み」と判断する。
ローカルでの組み込み・ビルド成功だけでは公開完了ではない。
