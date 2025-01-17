---
title: 批評空間を使ってエロゲソングのプレイリストを作りたい
created_at: 2024-01-08
tags:
- 批評空間
- Kotlin
---
どうもこんばんわ。  
初夢は悪夢でした。いや普段は起きたら忘れちゃうんですけどなんか覚えてた（？）

# 本題
![Imgur](https://i.imgur.com/wLn4BDt.png)

持ってるエロゲソング、いつもアルバムか歌手のプレイリストなので、もっとなんかいい感じのプレイリストを作りたい！！  
メーカー別とか、年代別とか、OP / 挿入歌 / ED 別とかのプレイリストが欲しい！！！

## しかし
手動で一つずつ入れていくのは確実に無理。  
数が多すぎる。。。

# ErogameScape
https://erogamescape.dyndns.org/

えろすけとか、批評空間とか呼ばれているこのサイト、エロゲの情報が集まってるサイトなんですが、  
ありがたいことに！、`SQL`を書くことでサイトのデータベースに問い合わせることが出来ます。

https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_form.php

```sql
SELECT ml.*,    -- 曲テーブル
    gm.*,       -- ゲーム曲テーブル
    gl.*,       -- ゲームテーブル
    bl.*        -- メーカーテーブル
FROM musiclist ml
    INNER JOIN game_music gm ON ml.id = gm.music
    INNER JOIN gamelist gl ON gm.game = gl.id
    INNER JOIN brandlist bl ON gl.brandname = bl.id
WHERE name = '恋するMODE'; -- エロゲソング名
```

コレを使って、エロゲソング名からゲーム情報やメーカー情報をとって、プレイリストを作ろうと思います！！！

## SQL フォーム
一部のテーブルは文書化されています。  
https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_tablelist.php

が、全て文書化されているわけではないので、どうするのが正攻法かは知りませんが、`PostgreSQL`のテーブル一覧を吐き出す`SQL`を叩いて、それっぽいテーブルを適当に`SELECT * FROM hogehoge LIMIT 10`とかで見て、探す必要が多分あります？

今回のエロゲソング関連のテーブルはこんな感じになってます。  

- musiclist
    - エロゲソングの情報が格納されています
- gamelist
    - エロゲソングがどのエロゲで使わたかの情報が格納されています
    - 中間テーブルですね
- gamelist
    - エロゲ情報が格納されています

中間テーブルがあるので、一つのエロゲソングが複数のエロゲに使われてもちゃんと表現できるわけなんですね。  
データベース設計難しそう

https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/music.php?music=1331

# 環境
スクレイピングができればなんでも良いはず。  
私は`Kotlin（Java）`でいきます

## 入ってる曲一覧が欲しい
さて、問題が。  
パソコンに入ってる曲から曲一覧が無いと始まらないのですが、どうやって取ろうかなあ...

### 音楽ファイルを音楽フォルダから探す
音楽の入ってるフォルダを渡して、ファイル一覧を出すやつ。  

```kotlin
fun getFileList(filePath: String): List<File> {
    // 音楽ファイル一覧
    val result = arrayListOf<File>()
    File(filePath)
        .listFiles()
        ?.forEach {
            // フォルダなら再帰的に
            // 拡張子 flac ならリストに追加 
            when {
                it.isDirectory -> result += getFileList(it.path)
                it.extension == "flac" -> result += it
            }
        }
    return result
}
```

ただ、これだと`ファイル名`が曲名として使えるかは微妙なんですよね。  
なんかインデックスがファイル名に入っちゃってるのと、なんか`_`で置換されちゃってるファイルもある。  

やっぱ正規ルートは`ID3 タグ?`を解析する...？  
`FFmpeg`についてくる`ffprobe`がもしかすると`ID3 タグ`のパースに対応しているかも。

```kotlin
01-ダカーポ5～メグリメグル世界～.flac
02-どっち_.flac
03-哀しみリフレイン.flac
04-アイノキオク.flac
05-暁に祈りを.flac
06-キミが微笑むから.flac
```

### Music Center から取り出す
私は`Music Center for PC`という音楽プレイヤーを使ってるのですが、  
`tracks.db`ファイルがこのアプリが認識している曲一覧を持っているファイルであることが分かりました。  

パスはここで、拡張子こそ`SQLite`ぽく見えますが、テキストファイルとして開くことが出来ます。  

`C:\Users\{ユーザー名}\AppData\Roaming\Sony\Music Center\db`

![Imgur](https://i.imgur.com/Uaz0tRH.png)

テキストの構造ですが、1行ごとが`JSON`になっているみたいなので、1行取り出して、`JSON`パーサーにかけると良いと思います。  
`kotlinx.serialization`だとこんな感じ？

```kotlin
// kotlinx.serialization で JSON パース
private val json = Json

fun main(args: Array<String>) {

    // Music Center の tracks.db ファイルのパス
    val tracksDb = File("""C:\\Users\\takusan23\\Desktop\\Dev\\Kotlin\\ErogePlaylistMaker\\tracks.db""")
    // 1行ごとに JSON パーサーにかける
    tracksDb
        .readText()
        .lines()
        .filter { it.isNotEmpty() }
        .forEach {
            val jsonElement = json.decodeFromString<JsonElement>(it)
            println(jsonElement.jsonObject.entries)
        }

}
```

いいかんじ！！に出力されています！

![Imgur](https://i.imgur.com/BNJsNGq.png)

### Android から取り出す
`Android`端末が音楽プレイヤーで`Android`の開発環境があれば、曲一覧の取得は多分コレが一番早いかもしれない。  

```kotlin
// 曲一覧を問い合わせる
val result = context.contentResolver.query(
    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
    arrayOf(MediaStore.MediaColumns.TITLE, MediaStore.MediaColumns.DISPLAY_NAME, MediaStore.MediaColumns.RELATIVE_PATH),
    null,
    null,
    null
)?.use { cursor ->
    // 配列にして返す
    cursor.moveToFirst()
    (0 until cursor.count)
        .map {
            // タイトルとファイル名、ファイルパスを取得
            // ファイルパスは sdcard/Music からの相対パス
            val title = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.TITLE))
            val name = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME))
            val relativePath = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.RELATIVE_PATH))
            val data = TrackData(title, "$relativePath$name")
            cursor.moveToNext()
            data
        }
} ?: emptyList()
```

## 要らなそうなのを消す
カラオケ版（`Instrumental`、`Karaoke`、`off volcal`）を消します。  
それから、明らかにエロゲソングじゃないやつも手動で弾きます、ほとんどがエロゲソングなので手動で何とかなってそう。  
あとはエロゲソングじゃないBGMとかも残っちゃうんだけどこれはもう`SQL`に書いちゃおうかな...

あんまり参考にならんと思うけどこんな感じにしてみた

```kotlin
/** 曲とパスが書かれた JSON */
private val musicListJsonFile = File("trackdata_list.json")

private fun generateTrackDataListJson() {
    // タイトルに入っていれば消す
    // カラオケ版を消すため
    // タイトルに instrumental とか入っていれば
    val deleteFilterKeywordList = listOf(
        "instrumental",
        "off vocal",
        "karaoke",
        "inst"
    )

    // 例外にするフォルダ名
    val ignoreFolderNameList = listOf(
        // あれば
    )

    // Music Center の tracks.db ファイルのパス
    val tracksDb = File("""C:\\Users\\takusan23\\Desktop\\Dev\\Kotlin\\ErogePlaylistMaker\\tracks.db""")

    // タイトルだけのが欲しい
    val titleList = File("""title_list.txt""")
    // 一応消しておく
    titleList.delete()
    musicListJsonFile.delete()

    // 正規表現で余計なかっこを消す
    val bracketRegex = """(\[.+?\]|\(.+?\))""".toRegex()
    val prefixNumberRegex = """^\d{2}""".toRegex()

    // data.TrackData の配列する
    val trackDataList = arrayListOf<TrackData>()

    // 1行ごとに JSON パーサーにかける
    tracksDb
        .readText()
        .lines()
        .filter { it.isNotEmpty() }
        .map { json.decodeFromString<JsonElement>(it) }
        // もし重複があれば消す
        // TODO 同じタイトルがあればやめる
        .distinctBy { jsonElement ->
            jsonElement.jsonObject["title"]?.jsonPrimitive?.content!!
        }
        // カラオケ版とかを消す
        .filter { jsonElement ->
            val title = jsonElement.jsonObject["title"]?.jsonPrimitive?.content!!
            deleteFilterKeywordList.none { keyword -> title.contains(keyword, ignoreCase = true) }
        }
        // 例外にするフォルダ名
        .filter { jsonElement ->
            val filePath = jsonElement.jsonObject["file"]?.jsonObject?.get("uri")?.jsonPrimitive?.content!!
            ignoreFolderNameList.none { filePath.contains(it, ignoreCase = true) }
        }
        // テキストに吐き出す
        // ここでも色々やる
        .forEach { jsonElement ->
            val title = jsonElement
                .jsonObject["title"]
                ?.jsonPrimitive
                ?.content!!
                // 正規表現
                // カッコが含まれている場合は消す
                .replace(bracketRegex, "")
                // 先頭に2桁の数字があれば消す
                .replace(prefixNumberRegex, "")
                // 余計な空白があれば消す
                .trim()
                .trimEnd()

            val filePath = jsonElement
                .jsonObject["file"]
                ?.jsonObject
                ?.get("uri")
                ?.jsonPrimitive
                ?.content!!

            // JSON
            trackDataList += TrackData(title, filePath)

            // タイトルだけ
            titleList.appendText(title)
            titleList.appendText("\r\n")
        }

    musicListJsonFile.writeText(json.encodeToString(trackDataList))
}
```

## SQL を書く

複数の文字一致は`WHERE カラム名 in ('文字', '文字')`みたいな感じでできるらしい。  
`カラム名 = '文字' or カラム名 = '文字'`と同じらしい。

というわけで試してみる。  
ちゃんと複数でも動いていそう。

```sql
SELECT ml.*,
    gm.*,
    gl.*,
    bl.*
FROM musiclist ml
    INNER JOIN game_music gm ON ml.id = gm.music
    INNER JOIN gamelist gl ON gm.game = gl.id
    INNER JOIN brandlist bl ON gl.brandname = bl.id
WHERE name in (
    'Pleasure garden',
    '奇跡メロディ'
);
```

あとはこれをもとに`SQL`を組み立てて（今回は面倒なので文字列連結しますが、プレースホルダー等を使いましょうね）、  
`POST`リクエストしてスクレイピングすれば良さそう！

というわけでこんな感じ（かなり端折ってるので雰囲気つかんで）  
`OkHttp`を使ってます。

```kotlin
/** 批評空間からとってきた結果 */
private val hihyoukuukanJsonFile = File("hihyoukuukan.json")

private fun requestErogameScapeSql() {

    // 曲名を入れる
    // PostgreSQL でエスケープ必須なものはエスケープしてね
    val musicList = """
        
    Pleasure garden
    奇跡メロディ
    
    """.trimIndent()
        .lines()
        .filter { it.isNotEmpty() }
        .joinToString(separator = ",") { name -> """'$name'""" }

    val sql = """
        SELECT ml.*,
            gm.*,
            gl.*,
            bl.*
        FROM musiclist ml
            INNER JOIN game_music gm ON ml.id = gm.music
            INNER JOIN gamelist gl ON gm.game = gl.id
            INNER JOIN brandlist bl ON gl.brandname = bl.id
        WHERE name in ( $musicList );
    """.trimIndent()

    // 批評空間に SQL を流す
    val formData = FormBody.Builder().apply {
        add("sql", sql)
    }.build()
    val request = Request.Builder().apply {
        url("https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_form.php")
        addHeader("User-Agent", "@takusan_23@diary.negitoro.dev")
        post(formData)
    }.build()

    val response = okHttpClient.newCall(request).execute()
    val html = response.body?.string()

    // 失敗時は例外
    if (!response.isSuccessful) {
        throw RuntimeException("リクエストに失敗しました")
    }

    // スクレイピングする
    val document = Jsoup.parse(html)
    val column = document
        .getElementsByTag("tr")
        .drop(1)
        .map { tr -> tr.getElementsByTag("td").map { it.text() } }

    // 前回のを足す
    val currentJson = hihyoukuukanJsonFile
        .takeIf { it.exists() }
        ?.readText()
        ?.takeIf { it.isNotEmpty() }
        ?.let { json.decodeFromString<List<HihyoukuukanData>>(it) } ?: emptyList()

    // 書き込む
    val jsonArray = currentJson + column.map { item -> HihyoukuukanData(item[1], item) }
    hihyoukuukanJsonFile.writeText(json.encodeToString(jsonArray))
}
```

これで`JSON`形式でいい感じに批評空間でSQL叩いた結果が保存されるようになりました。  
これを煮るなり焼くなりすればプレイリスト作れそう。

## プレイリストをつくる
作ります！  
手始めに年代別出してみます！

21 番目なのは`SQL`実行結果の表の列のことですね。

```kotlin
private fun generatePlaylistFromHihyoukuukanJson() {
    // 批評空間からとってきた結果と、曲一覧のJSONをパースする
    val hihyoukuukanDataList = json.decodeFromString<List<HihyoukuukanData>>(hihyoukuukanJsonFile.readText())
    val musicList = json.decodeFromString<List<TrackData>>(musicListJsonFile.readText())

    // 年代別！
    // 21 番目が sellday
    val selldayList = hihyoukuukanDataList.groupBy { it.queryResult[21].split("-").first() }
    selldayList.forEach { (year, dataList) ->
        println(year)
        println(dataList.map { it.name })
        println("---")
    }
}
```

ほい！

![Imgur](https://i.imgur.com/73hCnYX.png)

あとはプレイリストを作るだけですね！  

### m3u8 ファイル
`.m3u`とか、`.m3u8`言われてるこれ、音楽ファイルのパスを列挙すればいいらしい？  
`.m3u8`といえば`HLS`ですが（一筋縄でダウンロードさせてくれないやつで有名）、音楽のプレイリスト作るのにも使うんですね。

こんな感じでしょうか。  
どうやら`Music Center`は`.m3u8`にしないとダメだった、`.m3u`だとなんか私の作り方が悪いのかダメでした。

```plaintext
#EXTM3U8
C:\music\track1.flac
C:\music\track2.flac
```

というわけでコレを目指して作ってみます。  
年代別で`m3u8`ファイルを作って

```kotlin
private fun generatePlaylistFromHihyoukuukanJson() {
    // 批評空間からとってきた結果と、曲一覧のJSONをパースする
    val hihyoukuukanDataList = json.decodeFromString<List<HihyoukuukanData>>(hihyoukuukanJsonFile.readText())
    val musicList = json.decodeFromString<List<TrackData>>(musicListJsonFile.readText())

    // 年代別！
    // 21 番目が sellday
    val selldayList = hihyoukuukanDataList.groupBy { it.queryResult[21].split("-").first() }
    selldayList.forEach { (year, dataList) ->
        // ファイルパスを探す
        // 曲一覧 JSON にある
        val filePathList = dataList.map { hihyoukuukan -> musicList.first { it.name == hihyoukuukan.name }.filePath }
        // .m3u8 を作る
        val m3u8Text = "#EXTM3U8\n${filePathList.joinToString(separator = "\n")}"
        // 吐き出す
        playlistFolder.resolve("${year}年発売エロゲソング.m3u8").writeText(m3u8Text)
    }
}
```

出来てる出来てる

![Imgur](https://i.imgur.com/VzOIiqy.png)

`Music Center`のここから、生成した`.m3u8`を取り込めば良いはず！

![Imgur](https://i.imgur.com/1yVMMwk.png)

はい！できたああああ

![Imgur](https://i.imgur.com/XrAqnTe.png)

## いろいろ作ってみた
ブランド別

```kotlin
// ブランド別
val brandList = hihyoukuukanDataList.groupBy { it.queryResult[96] }
brandList.forEach { (brandName, dataList) ->
    // ファイルパスを探す
    // 曲一覧 JSON にある
    val filePathList = dataList
        .distinctBy { hihyoukuukan -> hihyoukuukan.name }
        .map { hihyoukuukan ->
            musicList.first { it.name == hihyoukuukan.name }.filePath
        }
    // 10曲以上あれば（なんとなく
    if (filePathList.size >= 10) {
        // .m3u8 を作る
        val m3u8Text = "#EXTM3U8\n${filePathList.joinToString(separator = "\n")}"
        // 吐き出す
        playlistFolder.resolve("${brandName}の曲一覧.m3u8").writeText(m3u8Text)
    }
}
```

`OP / ED / 挿入歌`別  
挿入歌、地味にすごい

```kotlin
// OP ED
val musicCategory = hihyoukuukanDataList.groupBy { it.queryResult[15] }
musicCategory.forEach { (category, dataList) ->
    // ファイルパスを探す
    // 曲一覧 JSON にある
    val filePathList = dataList
        .distinctBy { hihyoukuukan -> hihyoukuukan.name }
        .map { hihyoukuukan ->
            musicList.first { it.name == hihyoukuukan.name }.filePath
        }
    // 10曲以上あれば（なんとなく
    if (filePathList.size >= 10) {
        // .m3u8 を作る
        val m3u8Text = "#EXTM3U8\n${filePathList.joinToString(separator = "\n")}"
        // 吐き出す
        playlistFolder.resolve("${category}曲一覧.m3u8").writeText(m3u8Text)
    }
}
```

いい感じ！！

![Imgur](https://i.imgur.com/45asO1p.png)

# もっと頑張らないとダメそう
次やるならこの点にも気をつけたい

- コンシューマー版（家庭用ゲーム機版）の発売日が紛れ込んでいる
    - もうクエリ叩き直すのめんどかったので、`Music Center`側のリリース年と批評空間側の発売日を突き合わせて、リリース年が一致するか、リリース年がそもそも無ければそれも無条件で入れる。ようにしました
        - コンシューマー版を消すクエリを書く？
- 同じ曲が2個はいってる場合
    - 例えば`原曲ver`と`ヒロインが歌ったver`みたいなのには対応していない
- タイトル被り
    - 大変そう
    - タイトル被ったら被ったものだけ集めて、追加情報を渡してふるいにかけるような`SQL`を書くと良いかもしれない。
- カラオケ版以外にもアレンジ版とかがあれば弾くべき？

# おわりに
つかったコード置いておきます、断片的でまともに使えないと思いますが...  

https://github.com/takusan23/ErogePlaylistMaker/blob/master/src/main/kotlin/Main.kt

**そして批評空間にエロゲソング情報を残してくれた方、ありがとうございます。大変助かりました；；**