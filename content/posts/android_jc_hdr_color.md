---
title: JetpackCompose で HDR の眩しい画面を作ろう
created_at: 2026-08-25
tags:
- Android
- JetpackCompose
- HDR
---
どうもこんばんわ。`DLSite`でためしに`TLもの`買ったら送られてくるメールが180度変わった話する？しません。

じゃあ`Google Store 表参道`行ってきたのでその話を、まあ写真取り損ねてるしオープンしてからしばらくたった後ですが。  
場所は`Galaxy Harajuku`の近く。~~偶然なの？~~

![GoogleStore表参道](https://oekakityou.negitoro.dev/resize/17392f70-c84c-4576-82bd-cea368730360.jpg)

`HiLight`体験コーナー。電話をかけると隣の`Pixel`の`HiLight`（カメラのフラッシュにあるやつ）が光る。

![Pixel11HiLight実演](https://oekakityou.negitoro.dev/resize/0d5370c7-26a7-4118-92c1-e1c08fbb68b8.jpg)

なおこの光るやつ、すでに内部の`API`が解析された？らしい。まあ案の定サードパーティー開発者には解放されてなく`Shizuku`を使って代わりに`API`を叩く必要があるらしい。  
昔の`Android`端末には`LED インジゲーター`があったので、通知が来たときに光らせるための`NotificationCompat.Builder#setLights`があったわけですがこれを復活させる気は無いの？

https://9to5google.com/2026/08/20/google-pixel-11-pro-hilight-third-party-control-feature/

`Watch`とかは紐で括りつけられてなかった、まあデモ機っぽいからいいのかな  
あとは交換するバンドも展示されてました。確かに高いだけあって物がよさそう感。高いからさすがに買わないけど、、

![PixelWatch展示](https://oekakityou.negitoro.dev/resize/23691291-0aa3-4c86-9d17-f52bf78de8fa.jpg)

もちろん(？)二階に上がることもできました。`AI`体験コーナーとお土産コーナーがありました。写真は取り損ねました。  
あばたー？が作れるらしい。

お土産コーナーも撮り損ねたわけですが、`Google Chrome タブで分けられるクリアファイル`とか`水筒`とか`醤油入れ？`とか`ステッカー`とか`ボールペン`とかありました。  
今回は`Google Chrome`の`恐竜ステッカー`を買ってみた。2枚買って780円だったので1枚300円ちょいだと思います。ドロイド君グッズも置いてほしいです。

![買ってきたもの](https://oekakityou.negitoro.dev/resize/18dc8cc2-a1b0-4931-8db5-a1fc8c020181.jpg)

なんか高々シールを二枚しか買ってないのにオシャレな手提げ袋をもらった。このサイズと色は日本限定らしい！  
中にケーブルをまとめられるペーパークラフトみたいなのも入れてくれた！

ちなみに支払いは（ほかのスマホ購入とかは知らないけど）近くにいたおねーさんに言ってその場で支払いできた。というかレジがない！  
`クレカ`と`PayPay`とあと何かで払えるって言ってたはず。おねーさんが`Pixel`と決済するスマホみたいなのを操作しててその場で支払えた。

まあシールにしてはちょっと高いかな～とか思いつつミスって机の下に落っことしたときに気付いた。**このシール蓄光じゃね！？**  
電気消してみた。蓄光だった！！暗がりで光る`Chrome の恐竜`。ほかのシールもそうなのかな、おねーさんなにも言ってなかったはず。

![蓄光シールだった](https://oekakityou.negitoro.dev/resize/18af496a-1a40-4cf8-83c1-160d6a6ba3b3.jpg)

# 本題
https://android-developers.googleblog.com/2026/08/jetpack-compose-august-2026-release.html

`Jetpack Compose Bom 2026.08`から`HDR`の色が使えるようになったぽいので試します。確かに眩しい！！  
（`BT.2020 (Rec.2020)`のカラースペースが使える？）

![HDRの色を描画したJetpackComposeでできた画面](https://oekakityou.negitoro.dev/resize/3642a0f0-4e31-4f87-b48c-9456ecc7a0cd.jpg)

`Chrome`と`HDR対応ディスプレイ`の組み合わせなら、↑の`UltraHDR`が眩しい写真になってるはず。

# HDR 入門
詳しくは前書いた記事に譲ります。カラースペースとかガンマカーブとか！

https://takusan.negitoro.dev/posts/android_hdr_camera_video_editor/

# 環境

`HDR`が表示できるディスプレイで`Android 13`以上ならいいと思います。エミュレーターでできるかは知らない。  
冒頭に貼った写真が`UltraHDR`で、これが`Android Chrome`で眩しく表示されたら多分`HDR`ディスプレイを搭載しているはずです。

| なまえ        | あたい                                  |
|---------------|-----------------------------------------|
| AndroidStudio | Android Studio Quail 3 2026.1.3 Patch 1 |
| 端末          | Xperia 1 VIII / Pixel 10 Pro Fold       |

# 分からなかったこと
`Modifier.background()`の時は眩しかったけど、`Text()`の`color`や`Icon()`の`tint`には適用されてない気がする。私が何か間違えているかもしれない。

# Activity で HDR を有効にする
`UltraHDR`を表示するときと同じように`ActivityInfo.COLOR_MODE_HDR`を呼び出す

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 多分 UltraHDR を表示するのと同じ要領でこれが必要だと思う
        window.colorMode = ActivityInfo.COLOR_MODE_HDR
    }
}
```

# Color() を作るときに colorSpaces を指定する
`ColorSpaces.Bt2020Hlg`と`ColorSpaces.Bt2020Pq`があります。  
名前通りカラースペースは`BT.2020 (Rec.2020)`で、それぞれガンマカーブが`HLG`と`PQ (ST2084)`だと思います。

https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/colorspace/ColorSpaces

```kotlin
Color(red = 1f, green = 0f, blue = 0f, alpha = 1f, colorSpace = ColorSpaces.Bt2020Hlg)
```

コード例

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 多分 UltraHDR を表示するのと同じ要領でこれが必要だと思う
        window.colorMode = ActivityInfo.COLOR_MODE_HDR

        setContent {
            JetpackComposeHdrColorTheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    Scaffold { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            MessageCard(text = "SDR の色", colorSpace = ColorSpaces.Srgb) // sRGB が動画で言うところの Rec.709 (BT.709) にあたる
            MessageCard(text = "HDR の色", colorSpace = ColorSpaces.Bt2020Hlg)
            MessageCard(text = "眩しい広告！", colorSpace = ColorSpaces.Bt2020Hlg)

            Icon(
                painter = painterResource(R.drawable.ic_launcher_foreground),
                contentDescription = null,
                tint = Color(red = 1f, green = 0f, blue = 0f, alpha = 1f, colorSpace = ColorSpaces.Bt2020Hlg)
            )

            Box(
                modifier = Modifier
                    .size(200.dp)
                    .background(
                        Brush.horizontalGradient(
                            listOf(
                                Color(red = 1f, green = 0f, blue = 0f, alpha = 1f, colorSpace = ColorSpaces.Bt2020Hlg),
                                Color(red = 0f, green = 1f, blue = 0f, alpha = 1f, colorSpace = ColorSpaces.Bt2020Hlg),
                                Color(red = 0f, green = 0f, blue = 1f, alpha = 1f, colorSpace = ColorSpaces.Bt2020Hlg)
                            )
                        )
                    )
            )
        }
    }
}

@Composable
private fun MessageCard(
    modifier: Modifier = Modifier,
    text: String,
    colorSpace: ColorSpace
) {
    Box(modifier = modifier.background(Color(red = 1f, green = 1f, blue = 1f, alpha = 1f, colorSpace = colorSpace))) {
        Text(
            modifier = Modifier.padding(10.dp),
            text = text,
            fontSize = 50.sp,
            color = Color(red = 1f, green = 0f, blue = 0f, alpha = 1f, colorSpace = colorSpace)
        )
    }
}
```

# 眩しい画面が出来た！
手元だとなぜか`Text()`とかは眩しくなってない気がします・・

![冒頭の再掲](https://oekakityou.negitoro.dev/resize/3642a0f0-4e31-4f87-b48c-9456ecc7a0cd.jpg)

# おわりに
いままで`HDR`の色を表示するには`OpenGL ES`を書かないといけなかった気がして？いい時代になりました！！！