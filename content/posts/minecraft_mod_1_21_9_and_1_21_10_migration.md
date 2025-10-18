---
title: 自作 MOD の Minecraft 1.21.9 (1.21.10) 移行メモ
created_at: 2025-10-11
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんばんわ。今回はほとんど修正無かった

# 本題
`1.21.9`（`1.21.10`は不具合修正）がリリースされたので`自作MOD`を対応させました。

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_1_21_6_and_1_21_7_migration/

# 公式
`Fabric`チームが`1.21.9`公開よりも**数日前に**リリースノートを書いてくれているので見ます。  
スナップショットから追いかけてたのかな

https://fabricmc.net/2025/09/23/1219.html

# Gradle
- Fabric 9.1.0
- NeoForge 8.14.3
- Forge 8.12.1

`Fabric`だと`Configuration cache`が意図的に無効になってますがこれが何なのかはよくわかりません、  
（`Android`にもあるっぽいけどよくわかってない、本当にやってる～？）

# Fabric
いつからか、`build.gradle`の書き方が変わってたようです。  
このバージョンになるまで追従しなかったんですが、このバージョンからいよいよビルドが通らなくなってしまったので、追従するようにしました。  
（いままではバージョンだけ上げてノータッチだった）

https://github.com/takusan23/ClickManaita2/commit/78e03e337095e897d6147cbd74b48a6ed6dc0797

あと`build.gradle`のここの部分はたぶん今作ってる`Mod`の`Id`のを入れる。

```gradle
loom {
    splitEnvironmentSourceSets()

    mods {
        "clickmanaita" { // ←ここ
            sourceSet sourceSets.main
            sourceSet sourceSets.client
        }
    }

}
```

**が、通らない...！**

## client モジュールしかクライアント側の API が使えなくなってた
`IDEA`開くの待てなかったので`GitHub`でごめん

![tree](https://oekakityou.negitoro.dev/original/e27d5b08-ca80-42db-9cef-7969fd2647fa.png)

こんな感じに、`main`モジュールと`client`モジュールに分割する必要があったようです。  
ツールチップを付与するためのコールバックが呼ばれる関数は、クライアント側でしか利用しないため、サーバー側（`main`モジュール）から見えなくなってたようです。

というわけで移動させました。  
`fabric.mod.json`は`main`の方にあればよいそうです。`mixin`も使ってないので適当に書きました。

https://github.com/takusan23/ClickManaita2/commit/9a75093fbc5a5a3dcc5456f377f8cc8ed4e7fc09

まさか`modding`でモジュール分割するとは思ってなかった、すごい

# NeoForge と Forge
まじでバージョン上げただけだった、小規模だからね仕方ないね。  
差分は最後に貼ります。

# 1.21.10 移行
バグ修正のため対応不要です

# 差分

`1.21.8`→`1.21.9`

- Fabric
    - https://github.com/takusan23/ClickManaita2/compare/1.21.8-fabric...1.21.9-fabric
- NeoForge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.8-neoforge...1.21.9-neoforge
- Forge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.8-forge...1.21.9-forge

`1.21.9`→`1.21.10`

- Fabric
    - https://github.com/takusan23/ClickManaita2/compare/1.21.9-fabric...1.21.10-fabric
- NeoForge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.9-neoforge...1.21.10-neoforge
- Forge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.9-forge...1.21.10-forge

# おわりに
`Pixel 10 Pro Fold`届いたああああ終わります。