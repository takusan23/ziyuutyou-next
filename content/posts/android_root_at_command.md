---
title: Android で AT コマンドを叩いただけ
created_at: 2024-08-11
tags:
- Android
- Root
- Kotlin
---
この辺の技術はほとんどがクローズドソースというか、仕様が公開されていないので、  
結局何が出来るのかよく分からずあんまりおもしろくなかった。

# 本題
root 権限が必要です。自己責任で。

# あぷり
https://github.com/takusan23/AndroidAtCommandUI/releases/tag/1.0.0

`APK`を作りました、が、`AT コマンド`を知っていないと何も出来ないです。  
`AT コマンド`詳しい人がいれば（実在するの？）このアプリでいろいろ叩いてみて遊べるかもしれません。

![Imgur](https://github.com/user-attachments/assets/0108fb90-8497-4c7b-8372-0d912b5499d6)

起動直後はデバイスが`/dev/smd0`とかになってますが、`ATコマンド`の欄でコマンドを実行して応答がなければ`/dev/smd7`とかに変更してみてください。  
テスト用コマンドは`AT`です。`OK`が返ってくるはず。

# おことわり
`Qualcomm`しか知りません。（`Google Pixel`とかは`Exynos`なので！）  

# 参考
https://stackoverflow.com/questions/8284067/

# 必要なもの
## root化済みの端末
最難関ですね。修理出来ないので壊したら終わり  
ところで、電波測定を最大限楽しむには`SIM フリー`じゃなくてキャリアで売られているスマホを買う必要が多分あります。
理由としては、  

- `5G SA`に接続できるか怪しい
- ドコモの`転用5G（なんちゃって5G / NR 化）`を掴むためにはドコモで買った端末が必要（`IMEI`をチェックしているらしい）
    - `au / softbank`は普通にキャリア以外の端末で`転用5G`つながる

しかし、キャリアで買ったスマホは`root化`が（ほぼ）出来ない状態です。壊れるかもしれない（一向に起動アニメーションが終わらない等）ので塞がれて正解ですが。。。  

`Android 4.x`くらいの時までは盛り上がっていたはずで、（`Nexus 7`いじるの楽しかったなあ）  
`Superuser`、`SuperSU`、あとは`KingRoot`とかいう怪しい雰囲気のやつとかありましたね、懐かしい

`Xperia Z3`くらいで`root`化の文化が途絶えてしまったわけですが、`Samsung`とかは今でもできるらしい？おサイフケータイだか`NFC`が4ぬらしいけど。  
キャリアで売られてる`Google Pixel`はどうかなあ、昔は`SIM`ロック解除さえすれば`Bootloader`がアンロック出来たはず？  
https://takusan.negitoro.dev/posts/android_12_dp_hitobashira/

なので、電波測定を犠牲にして`root`が必要なら`SIMフリー`を買うしかない。`SIM`フリーとして売られてる端末を買えば`root`行けるはず。  
Xperia も`SIMフリー`買えば今でもできるらしい？高い金払って壊れる可能性があるものに価値を見いだせるかというと、、、

# ADB がインストールされたパソコン
`Android Studio`入れたら付いてくるっしょ  
多分`adb`単品も行けるはず？`platform-tools`だけ入れる方法があった気がする

# とりあえず叩いてみる
先述の通り`Android`端末を`root化`、もとい`su`コマンドが叩ける状態にする必要があります。  

コマンドプロンプトでも`GitBash`でもなんでも良いのでターミナルさんを開いてください。  
`adb shell`した後`su`すると、`root`ユーザーに昇格できます。`$`（ドルマーク）だったのが`#`（シャープ、いげた）に変化するはず。

```bash
C:\Users\takusan23>adb shell
OnePlus7TPro:/ $ su
OnePlus7TPro:/ #
```

![Imgur](https://imgur.com/r461jpt.png)

あ、`Magisk`に許可するか聞かれたら許可してあげてください。  

![Imgur](https://imgur.com/lLxIe7H.png)

# AT コマンドを叩く
にはもう一個手間が必要で、`AT コマンドを叩く先`を探す必要があります。  
というのも、端末によっては`/dev/smd0`だったり、`/dev/smd7`だったりと違うみたいなんですよね。

とりあえずこれを叩いてみます。最後の`\r`が必要です。  
成功すれば`OK`という文字が出ます。

```bash
echo -e "AT\r" > /dev/smd7 && cat /dev/smd7
```

どうでしょうか。  
`AT`の後に`OK`がでましたか？出ていれば`AT コマンド`を叩ける状態です。  
`AT\r`の部分を好きな`AT コマンド`にすれば良いのですが、クローズドソースというか仕様が公開されていないため、何を叩けば良いのかは調べるしかないです。

```plaintext
AT
OK
```

ちなみに`Ctrl+C`で抜けることが出来ます（操作ができるようになります）

## ダメだった場合
`/dev/smd7`の部分を`/dev/smd0`とかにすれば良いのですが、まず`smd`が何種類あるのか見てみましょう。  
見つかったもの全てに`AT\r`を投げて`OK`が返ってくるものがあればそれを使えば良いはずです。

以下のコマンドを叩きます

```bash
ls /dev/smd*
```

すると、こんな感じに`smd7`とかが一覧で表示されるはず。（以下省略）

```plaintext
/dev/smd0  /dev/smd7 
```

あとは出てきた`smd`に対して`AT\r`を投げていって`OK`が出てくるまで繰り返せばおけ。  
（`/dev/smd0`の部分を置き換えていく）

```bash
echo -e "AT\r" > /dev/smd0 && cat /dev/smd0
```

# 色々叩いてみる

## 端末の情報
`ATI`を叩くと端末の情報が取れるそうです。

```bash
echo -e "ATI\r" > /dev/smd7 && cat /dev/smd7
```

適当に置き換えてますがこんな感じ

```plaintext
OnePlus7TPro:/ # echo -e "ATI\r" > /dev/smd7 && cat /dev/smd7
ATI
Manufacturer: QUALCOMM INCORPORATED
Model: 0000
Revision: xxxxx
SVN: 00
IMEI: 00000
+GCAP: +CGSM

OK
```

## ATコマンド一覧を表示
`AT+CLAC`を叩くと表示できるそうです。  
端末によっては塞がれている場合があるそうです。

```bash
OnePlus7TPro:/ # echo -e "AT+CLAC\r" > /dev/smd7 && cat /dev/smd7
AT+CLAC
&C
&D
&E
&F
&S
&V
&W
以下省略...
```

## EARFCN 取得（うまくいかなかった）
`AT$QRSRP`を叩くと、`EARFCN`（バンド）が取れるらしい、、、ですがうまく行きませんでした。  
`OK`が帰ってきますが何もでてきません。

```bash
OnePlus7TPro:/ # echo -e "AT$QRSRP\r" > /dev/smd7 && cat /dev/smd7
AT
OK
```

## 基地局を探す
`AT+COPS=?`を叩くと、しばらく待った後に近くの基地局を返してくれるそうです。  
先述の通り`OK`が表示されるまで、少し時間がかかります。

全部見せて良いのか知らんから隠すわ。

```bash
OnePlus7TPro:/ # echo -e "AT+COPS=?\r" > /dev/smd7 && cat /dev/smd7
AT+COPS=?
+COPS: (3,"JP DOCOMO","DOCOMO","44010",2) 以下省略

OK
```

## 選択したネットワークを取得
`AT+COPS?`で接続中のが見れるらしい。確かに`LINEMO`なのであっていそう

```bash
OnePlus7TPro:/ # echo -e "AT+COPS?\r" > /dev/smd7 && cat /dev/smd7
AT+COPS?
+COPS: 0,0,"SoftBank LINEMO",7

OK
```

# AT コマンドを叩く Android アプリを作る
## root 権限でコマンドを叩く
https://stackoverflow.com/questions/5484535/

`ping`コマンドとかは`Runtime.getRuntime().exec()`で良いのですが、`root`権限が（`su`する）必要な場合。  
`su -c`した後にコマンドを入れればいいらしいです。

```bash
su -c この後にコマンド
```

最小限の実装例です。  
文字列で渡すのではなく、`arrayOf`で一つ一つ分解するのが良いらしいです。

```kotlin
lifecycleScope.launch(Dispatchers.IO) {
    val command = arrayOf("su", "-c", "whoami")
    val process = Runtime.getRuntime().exec(command)
    process.inputStream.bufferedReader().forEachLine { readLine ->
        // 出力を logcat に
        println(readLine)
    }
}
```

`Magisk`で許可するか聞かれるので許可してあげてください。

![Imgur](https://imgur.com/MSVjiaQ.png)

## 適当に UI を作る
最低限で。  
`cat /dev/smd7`をループで舐めるやつと、コマンドを投げるやつを分けてみた。  
けどなんかうまく動いてない時がある。。。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            AndroidAtCommandUITheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    val scope = rememberCoroutineScope()
    val outputList = remember { mutableStateOf(emptyList<String>()) }
    val commandText = remember { mutableStateOf("AT") }

    /** AT コマンドを投げる */
    fun executeCommand() {
        scope.launch(Dispatchers.IO) {
            // 出力は outputList で
            Runtime.getRuntime().exec(
                arrayOf("su", "-c", "echo", "-e", """ "${commandText.value}\r" """, ">", "/dev/smd7")
            )
        }
    }

    // AT コマンドの出力を while ループで取り出す
    LaunchedEffect(key1 = Unit) {
        withContext(Dispatchers.IO) {
            val process = Runtime.getRuntime().exec(arrayOf("su", "-c", "cat", "/dev/smd7"))
            launch {
                // 出力を取り出す
                try {
                    process.inputStream.bufferedReader().use { bufferedReader ->
                        while (isActive) {
                            val readText = bufferedReader.readLine()?.ifEmpty { null } ?: continue
                            outputList.value += readText
                        }
                    }
                } catch (e: Exception) {
                    // 握りつぶす
                }
            }
            // cat を終わらせる
            try {
                awaitCancellation()
            } finally {
                process.destroy()
            }
        }
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            Row(
                modifier = Modifier.padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    modifier = Modifier.weight(1f),
                    value = commandText.value,
                    onValueChange = { commandText.value = it },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        imeAction = ImeAction.Go,
                        keyboardType = KeyboardType.Ascii
                    ),
                    keyboardActions = KeyboardActions(onGo = { executeCommand() }),
                    label = { Text(text = "AT コマンド") }
                )

                Button(onClick = { executeCommand() }) {
                    Text(text = "実行")
                }
            }

            LazyColumn {
                items(outputList.value) { output ->
                    Text(
                        modifier = Modifier.fillMaxWidth(),
                        text = output
                    )
                    HorizontalDivider(color = LocalContentColor.current.copy(alpha = 0.05f))
                }
            }
        }
    }
}
```

こんな感じです。  
下に積まれていくのでスクロールしないといけない。

![Imgur](https://imgur.com/LCN3cIz.png)

# ソースコード
https://github.com/takusan23/AndroidAtCommandUI

# おわりに
`AT コマンド`、マジで情報がないので時間を無駄にした間が半端ない。  
これなら`logcat -b radio`のログでも眺めてたほうがまだ有意義です。  