---
title: 自作 MOD の Minecraft 1.21.4 移行メモ
created_at: 2025-01-05
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんにちわ  
`Fabric / Forge`共にリリースされているのに1ヶ月も空いてしまいすいません。なんなら`1.21.4 移行作業`と**一緒に年越し**してしまったのでいい加減やります。

# 本題
自作`MOD`の`Minecraft 1.21.4`移行記録です。  
ネタバレしますが今回は特に難しいところはないはず。というかあっさり終わって **これで良いの？** 感がある。一応遊んでみたけど動いてそうなんだよな。

![Imgur](https://i.imgur.com/fuiRyI6.png)

今回も今回とて`Fabric`の方々が差分を書いてくれているので、それにのっかります。ありざいす。  
https://fabricmc.net/2024/12/02/1214.html

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_1_21_2_migration/

# Gradle
今まで書いてなかったけど`Fabric`の方は`8.11.1`になってました。  
`Forge`は`8.7`みたいです。

# アイテムのテクスチャ指定が変更
ブロックのテクスチャで`assets/{mod_id}/blockstates`を作るのと同じように、アイテムでも`assets/{mod_id}/items`を作るようです。  

![Imgur](https://i.imgur.com/Wescj9U.png)

ファイル名は多分`{アイテムID}.json`で、内容は多分こんな感じ。

```json
{
  "model": {
    "type": "minecraft:model",
    "model": "clickmanaita:item/clickmanaita_wood"
  }
}
```

`clickmanaita:item/clickmanaita_wood`は`MOD の ID`と`アイテムの ID`。各自変えてね

## アイテムブロックのテクスチャ
アイテム状態のブロックに関しても同様に作成しないとアイテム状態のテクスチャが当たりません。  
で、ひとつ朗報があり、アイテムブロックの方は`/assets/{mod_id}/models/item`の方のファイルが不要になります。

例えば、`assets/{mod_id}/models/item/clickmanaita_block_wood.json`のようなファイルは削除して

```json
{
  "parent": "clickmanaita:block/clickmanaita_block_wood"
}
```

新しく`assets/{mod_id}/items/clickmanaita_block_wood.json`ファイルを作成し、以下のように書けば良いです。

```json
{
  "model": {
    "type": "minecraft:model",
    "model": "clickmanaita:block/clickmanaita_block_wood"
  }
}
```

# レシピの API
レシピにアクセスしてる箇所がなければスルーできます。

## 一部 Stream API を返す
`Stream API`ってのは他の言語で言うところのコレクション（配列）の操作関数の集まりで、`filter { }`とか`map { }`とかのあれ。  
`Java`だと明示的に`stream()`を呼んで変換する手間があったのでまあ`Java`で書いてる人向けなのかも。

`Kotlin`だといい感じに関数を生やしてくれてたので特に困ってなかった。というか配列じゃなくて`Stream`になったのでちょっと直さないとかも。  

## placementSlots が empty の場合は -1
`placementSlots`、レシピのパターンでスロットを使っていない場所（チェストだと真ん中のスロットは空っぽですよね）  
は`-1`を返すようになった？ので、`placementSlots`の分`for`で回して`ingredients[i]`している箇所があれば`-1`が来たときには`ItemStack.EMPTY`するなど対策が必要そう。

## getMatchingItems が非推奨
代替メソッドがわからない。`toDisplay().getStacks()`かなあ。  
なお`ContextParameterMap`は`SlotDisplayContexts.createParameters(World)`で作れます。  

# 差分
- `Fabric 1.21.3 -> 1.21.4` 
  - https://github.com/takusan23/ClickManaita2/compare/1.21.3-fabric...1.21.4-fabric
- `Forge 1.21.3 -> 1.21.4`
  - https://github.com/takusan23/ClickManaita2/compare/1.21.3-forge...1.21.4-forge

`Fabric`も`Forge`も`JSON`作って消すだけなので、両方作ってる場合は片方で作ってもう片方の`MOD Loader`の移行作業の際には`git checkout ファイルパス`で`JSON`を持ってくると速い。  
以下例

```bash
git checkout 1.21.4-forge
git checkout 1.21.4-fabric src/main/resources/assets/clickmanaita/items/
```

# 終わり
これ急げば移行作業と一緒に年越しするまでもなかったな...  
こんな差分少ないとは思わんかった（てか今までがおかしいんじゃないか？）