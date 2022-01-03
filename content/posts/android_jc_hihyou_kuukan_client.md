---
title: Jetpack Composeの練習
created_at: 2021-05-01
tags:
- Android
- Kotlin
- JetpackCompose
---
どうもこんばんわ。  

アオナツラインを完走しました。  

ことねちゃんが可愛かったです。続きが気になるから後日談みたいなのが欲しいと思った。      
BGMモードでOPの曲が聞けないので初回限定版を買えばよかったかなってちょっと後悔してたりもする。  

<img src="https://imgur.com/CNT3gWS.png" width="500">

# 本題
JetpackComposeでErogameScapeの情報を表示するアプリを作ってみます。

## 環境
| なまえ          | あたい |
|-----------------|--------|
| Jetpack Compose | Beta05 |

## 今回の仕組み的な
[ErogameScape](https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_form.php)っていうエロゲ専門サイトがあるんですが、これSQLを書いてPOSTするとなんとデータが返ってきます。このサイトやばい

```sql
SELECT * FROM gamelist WHERE gamename = '彼女のセイイキ'
```

<img src="https://imgur.com/BfK6Eea.png" width="500">

### 使うテーブル
- gamelist
    - ゲーム情報が入っている
- brandlist
    - gamelistにはブランド名が入ってないので別に取得
- campaign_game、campaignlist
    - （ついでなので）セール中のゲームが入ってる

`campaign_game`テーブルなんですが、なんか[ここのテーブル一覧](https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_tablelist.php)には乗っていないのですが、他の人が書いたSQLではなぜかセール中のゲームが取得できるんですよね。  
それでテーブル一覧を返すSQLを書いて見るとたしかにあるんですね。テーブル一覧のサイトが更新されていないだけかな。

```sql
SELECT * FROM pg_tables
```

### 今回使うSQL文
JetpackComposeが本題なのに時間がかかってしまった。  
ゲームの情報のほか、ブランド名、セール中ならセール情報を表示するようにしました。

```sql
SELECT DISTINCT g.id,
    g.gamename,
    c.content,
    c.name,
    c.end_timestamp,
    g.furigana,
    g.sellday,
    g.brandname,
    b.brandname,
    g.model,
    COALESCE(g.median, -1) AS median,
    COALESCE(g.average2, -1) AS average2,
    COALESCE(g.stdev, -1) AS stdev,
    COALESCE(g.count2, -1) AS count2,
    g.dmm,
    COALESCE(g.max2, -1) AS max2,
    COALESCE(g.min2, -1) AS min2,
    g.shoukai
FROM gamelist g
    INNER JOIN brandlist b ON g.brandname = b.id
    LEFT OUTER JOIN (
        SELECT g.content,
            l.name,
            g.game,
            l.end_timestamp
        FROM campaign_game g
            INNER JOIN campaignlist l ON g.campaign = l.id
        WHERE l.end_timestamp > now()
    ) c ON g.id = c.game
WHERE g.gamename = 'アオナツライン'
```

<div style="overflow-y:scroll">
<table>
<tbody><tr><th>id</th><th>gamename</th><th>content</th><th>name</th><th>end_timestamp</th><th>furigana</th><th>sellday</th><th>brandname</th><th>brandname</th><th>model</th><th>median</th><th>average2</th><th>stdev</th><th>count2</th><th>dmm</th><th>max2</th><th>min2</th><th>shoukai</th></tr>
<tr><td>27418</td><td>アオナツライン</td><td></td><td></td><td></td><td>アオナツライン</td><td>2019-03-29</td><td>84</td><td>戯画</td><td>PC</td><td>82</td><td>80</td><td>13</td><td>348</td><td>eg_0012</td><td>100</td><td>0</td><td>http://products.web-giga.com/aonatsu/</td></tr>
<tr><td>29203</td><td>アオナツライン</td><td></td><td></td><td></td><td>アオナツライン</td><td>2020-04-23</td><td>781</td><td>エンターグラム</td><td>PS4</td><td>78</td><td>78</td><td>18</td><td>2</td><td></td><td>90</td><td>65</td><td>http://www.entergram.co.jp/aonatsu/</td></tr>
<tr><td>29204</td><td>アオナツライン</td><td></td><td></td><td></td><td>アオナツライン</td><td>2020-04-23</td><td>781</td><td>エンターグラム</td><td>PSV</td><td>87</td><td>87</td><td>3</td><td>3</td><td></td><td>90</td><td>85</td><td>http://www.entergram.co.jp/aonatsu/</td></tr>
</tbody></table>
</div >

セール中ならこうなります。

<div style="overflow-y:scroll">
<table>
<tbody><tr><th>id</th><th>gamename</th><th>content</th><th>name</th><th>end_timestamp</th><th>furigana</th><th>sellday</th><th>brandname</th><th>brandname</th><th>model</th><th>median</th><th>average2</th><th>stdev</th><th>count2</th><th>dmm</th><th>max2</th><th>min2</th><th>shoukai</th></tr>
<tr><td>20228</td><td>彼女のセイイキ</td><td>1,017円 50%OFF</td><td>  スプリングセール 2021</td><td>2021-05-10 17:00:00</td><td>カノジョノセイイキ</td><td>2014-12-19</td><td>702</td><td>feng</td><td>PC</td><td>75</td><td>74</td><td>9</td><td>665</td><td>feng_0003</td><td>100</td><td>10</td><td>http://www.feng.jp/seiiki/</td></tr>
</tbody></table>
</div>

#### 簡単に解説
`SELECT`は取り出す列を書き出していきます。  
`FROM`はどこのテーブルから取り出すかです。まずはゲームの情報の入ってるテーブルですね。  
それから、`INNER JOIN`を利用してブランド名テーブルを結合します。`ON`のあとの条件式に当てはまれば結合されます。  
複数のテーブルを扱う場合はテーブル名のあとに名前をつけることが出来ます（この例では`g`とか`b`とか）  

`COALESCE`ってのはNULLのときに変わりに表示する値をセットできるやつです。今回はNULLの場合`-1`を入れるようにしてあります。  
`AS 名前`は列の名前を変えるときに使うんですが今回はスクレイピングしちゃうのであんまり関係ない。

#### セール中ならセール情報を取る
`LEFT OUTER JOIN`っていうのは、`ON`の条件式が当てはまらないときには代わりにNULLを入れてくれるやつです。  
`INNER JOIN`を使ってしまうとセールしてるときは表示されますが、セールしてないときは表示されなくなってしまいます。  

で、`LEFT OUTER JOIN`のあとの`SELECT`ですが、これはサブクエリって呼ばれるやつでクエリ内で使う値をクエリを使って取り出すときに使います。  

```sql
SELECT g.content,
    l.name,
    g.game,
    l.end_timestamp
FROM campaign_game g
    INNER JOIN campaignlist l ON g.campaign = l.id
WHERE l.end_timestamp > now()
```

このクエリを実行すると、以下のような内容が返ってきます。`campaign_game`と`campaignlist`のテーブルを結合して、セール中であるものを取得するクエリです。  

| content        | name                  | game  | end_timestamp       |
|----------------|-----------------------|-------|---------------------|
| 1,017円 50%OFF | スプリングセール 2021 | 20228 | 2021-05-10 17:00:00 |

この結果を、`LEFT OUTER JOIN`で結合します。上のサンプルでは`c`をクエリ結果の名前として指定しているため、`c.content`でセールの値段を取得することが出来ます。

`WHERE g.gamename = 'アオナツライン'`はゲーム名が「アオナツライン」と一致するものを取得するという意味です。

疲れたのであとは各自調べて。

その他使うものとしては

- ViewModel / LiveData
    - SQLをPOSTする処理をActivityに書くわけに行かないので
- OkHttp
    - POSTするときに使う
- Jsoup
    - POSTした結果を取り出すため
- Glide
    - 画像読み込み
- Coroutine
    - 非同期処理お助け

## ライブラリ入れる

```gradle
dependencies {

    // OkHttp
    implementation("com.squareup.okhttp3:okhttp:4.9.1")
    // HTML Parser
    implementation 'org.jsoup:jsoup:1.13.1'
    // CoroutineとLifeCycle考えてくれるやつ
    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.3.1"
    // Coroutines
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.4.3"
    // ViewModel
    implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:2.3.1"
    // LiveData
    implementation "androidx.lifecycle:lifecycle-livedata-ktx:2.3.1"
    // Glide
    implementation 'com.github.bumptech.glide:glide:4.11.0'
    // ComposeでLiveData
    implementation "androidx.compose.runtime:runtime-livedata:$compose_version"
    
    // 以下省略

}
```

## AndroidManifest.xml
インターネットパーミッションを忘れずに

## データクラス

`GameData.kt`

```kotlin
/**
 * ゲーム情報
 *
 * https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_tablelist.php
 *
 * @param id ID
 * @param gamename 名前
 * @param brandname_id ブランドのID
 * @param brandname ブランド名
 * @param content セール情報
 * @param endTimeStamp セール終了日時
 * @param model PCとかPSVとか
 * @param name セール名
 * @param furigana 名前のふりがな
 * @param sellday 発売日
 * @param median 得点中央値
 * @param average2 平均値
 * @param stdev 標準偏差
 * @param count2 得点データ数
 * @param dmm DMM（FANZA）のURLの一部
 * @param max2 最高得点
 * @param min2 最低得点
 * @param shoukai オフィシャルHPのURL
 * */
data class GameData(
    val id: Int,
    val gamename: String,
    val content: String,
    val name: String,
    val endTimeStamp: String,
    val furigana: String,
    val sellday: String,
    val brandname_id: Int,
    val brandname: String,
    val model: String,
    val median: Int,
    val average2: Int,
    val stdev: Int,
    val count2: Int,
    val dmm: String,
    val max2: Int,
    val min2: Int,
    val shoukai: String,
)
```

## データ取得関数を書く


`ErogameScape.kt`

```kotlin
/**
 * https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_tablelist.php
 * */
object ErogameScape {

    private val okHttpClient = OkHttpClient()

    /**
     * ゲーム情報を取得する
     *
     * @param gameName ゲーム名。「彼女のセイイキ」など
     * @return 成功すれば[GameData]の配列（コンシューマー移植などがあるため）
     * */
    suspend fun getGameInfo(gameName: String) = withContext(Dispatchers.Default) {
        // ゲーム情報配列
        val gameInfoList = arrayListOf<GameData>()
        // POST内容
        val sql = """ 
 SELECT DISTINCT g.id,
    g.gamename,
    c.content,
    c.name,
    c.end_timestamp,
    g.furigana,
    g.sellday,
    g.brandname,
    b.brandname,
    g.model,
    COALESCE(g.median, -1) AS median,
    COALESCE(g.average2, -1) AS average2,
    COALESCE(g.stdev, -1) AS stdev,
    COALESCE(g.count2, -1) AS count2,
    g.dmm,
    COALESCE(g.max2, -1) AS max2,
    COALESCE(g.min2, -1) AS min2,
    g.shoukai
FROM gamelist g
    INNER JOIN brandlist b ON g.brandname = b.id
    LEFT OUTER JOIN (
        SELECT g.content,
            l.name,
            g.game,
            l.end_timestamp
        FROM campaign_game g
            INNER JOIN campaignlist l ON g.campaign = l.id
        WHERE l.end_timestamp > now()
    ) c ON g.id = c.game
WHERE g.gamename = '$gameName'
 """
        val formData = FormBody.Builder().apply {
            add("sql", sql)
        }.build()
        val request = Request.Builder().apply {
            url("https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_form.php")
            post(formData)
        }.build()
        // POSTリクエストを飛ばす
        val response = okHttpClient.newCall(request).execute()
        // スクレイピング
        if (response.isSuccessful) {
            val document = Jsoup.parse(response.body!!.string())
            val trElementList = document.getElementsByTag("tr")
            repeat(trElementList.size - 1) {
                // テーブル一行目はいらない
                val index = it + 1
                val trElement = trElementList[index]
                val tdList = trElement.getElementsByTag("td")
                val id = tdList[0].text().toInt()
                val gamename = tdList[1].text()
                val content = tdList[2].text()
                val name = tdList[3].text()
                val end_time_stamp = tdList[4].text()
                val furigana = tdList[5].text()
                val sellday = tdList[6].text()
                val brandname_id = tdList[7].text().toInt()
                val brandname = tdList[8].text()
                val model = tdList[9].text()
                val median = tdList[10].text().toInt()
                val average2 = tdList[11].text().toInt()
                val stdev = tdList[12].text().toInt()
                val count2 = tdList[13].text().toInt()
                val dmm = tdList[14].text()
                val max2 = tdList[15].text().toInt()
                val min2 = tdList[16].text().toInt()
                val shoukai = tdList[17].text()
                // データクラスへ
                val gameData = GameData(
                    id,
                    gamename,
                    content,
                    name,
                    end_time_stamp,
                    furigana,
                    sellday,
                    brandname_id,
                    brandname,
                    model,
                    median,
                    average2,
                    stdev,
                    count2,
                    dmm,
                    max2,
                    min2,
                    shoukai,
                )
                gameInfoList.add(gameData)
            }
        }
        return@withContext gameInfoList
    }

}
```

## ViewModel
`MainViewModel.kt`

通信はここでやってる。

```kotlin
/**
 * [MainActivity]で使うViewModel
 * */
class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val context = application.applicationContext

    private val _gameInfoLiveData = MutableLiveData<GameData>()

    /** 結果を送信するLiveData */
    val gameInfoLiveData = _gameInfoLiveData as LiveData<GameData>

    /**
     * ゲームの情報を取得する関数
     * @param gameName ゲーム名。「彼女のセイイキ」など
     * */
    fun getGameInfo(gameName: String) {
        viewModelScope.launch {
            val data = ErogameScape.getGameInfo(gameName)
            if (data != null) {
                _gameInfoLiveData.postValue(data!!)
            }
        }
    }

}
```

# JetpackCompose
ViewModelで取得したデータを表示するようにしましょう。

## 各種部品を用意する
検索ボックスと、インターネット上の画像を表示するための部品を

`GameInfoUI.kt`

```kotlin
/**
 * 検索ボックス
 * */
@Composable
fun SearchBox(
    searchText: String,
    onChangeSearchText: (String) -> Unit,
    onClickSearchButton: () -> Unit,
) {
    Card(
        modifier = Modifier.padding(5.dp),
        elevation = 10.dp,
        shape = RoundedCornerShape(10.dp)
    ) {
        Row(modifier = Modifier.padding(start = 10.dp, end = 10.dp)) {
            TextField(
                modifier = Modifier.weight(1f),
                trailingIcon = {
                    IconButton(onClick = { onClickSearchButton() }) {
                        Icon(
                            painter = painterResource(R.drawable.ic_baseline_search_24),
                            contentDescription = "search"
                        )
                    }
                },
                value = searchText,
                onValueChange = { text -> onChangeSearchText(text) },
                placeholder = { Text(text = "ギャルゲ、エロゲのタイトルを入力") },
                maxLines = 1,
                colors = TextFieldDefaults.textFieldColors(
                    backgroundColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    disabledIndicatorColor = Color.Transparent,
                    errorIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                )
            )
        }
    }
}

/**
 * インターネット上の画像を表示する
 * */
@Composable
fun InternetImage(url: String) {
    val bitmap = remember { mutableStateOf<Bitmap?>(null) }
    Glide.with(LocalContext.current).asBitmap().load(url).into(object : CustomTarget<Bitmap>() {
        override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
            bitmap.value = resource
        }

        override fun onLoadCleared(placeholder: Drawable?) {

        }
    })
    if (bitmap.value != null) {
        Image(
            bitmap = bitmap.value!!.asImageBitmap(),
            contentDescription = "写真",
            modifier = Modifier
                .clip(RoundedCornerShape(10.dp))
                .width(200.dp)
                .height(200.dp)
        )
    }
}

/**
 * 二段のText。上の段のほうが文字が大きい
 * */
@Composable
fun RankText(modifier: Modifier, title: String, value: String) {
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontSize = 20.sp,
            fontWeight = FontWeight.W500,
            textAlign = TextAlign.Center,
        )
        Text(text = title)
    }
}
```

## 結果画面

UI作るの難しい。  
あとアイコンを https://fonts.google.com/icons から持ってきたので各自入れてね

`GameInfoScreen.kt`

```kotlin
/**
 * ゲーム情報表示画面
 * */
@Composable
fun GameInfoScreen(viewModel: MainViewModel) {
    val context = LocalContext.current
    // 検索ワード
    val searchText = remember { mutableStateOf("") }
    // ゲーム情報LiveDataを変換する
    val gameInfoList = viewModel.gameInfoLiveDataList.observeAsState()

    Scaffold(
        topBar = {
            SearchBox(searchText = searchText.value, onChangeSearchText = { searchText.value = it }) {
                // 検索ボタン押したとき
                viewModel.getGameInfo(searchText.value)
            }
        }
    ) {
        if (gameInfoList.value != null) {
            // 今回は一個だけ表示
            val gameInfo = gameInfoList.value!![0]
            // 写真URL
            val imgUrl = "https://pics.dmm.co.jp/digital/pcgame/${gameInfo.dmm}/${gameInfo.dmm}ps.jpg"

            Column {
                // 情報
                Row {
                    InternetImage(url = imgUrl)
                    Column {
                        Text(text = gameInfo.gamename, fontSize = 25.sp)
                        Text(text = gameInfo.furigana)
                        Text(text = gameInfo.brandname, fontSize = 20.sp)
                        Text(text = "発売日\n${gameInfo.sellday}")
                    }
                }
                // セール情報があれば
                if (gameInfo.content.isNotEmpty()) {
                    Card(
                        border = BorderStroke(1.dp, MaterialTheme.colors.primaryVariant),
                        elevation = 0.dp,
                        modifier = Modifier
                            .padding(10.dp)
                            .fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(text = "${gameInfo.name} (${gameInfo.end_time_stamp} まで)")
                            Text(text = gameInfo.content, fontSize = 20.sp)
                        }
                    }
                }
                // DMMで購入するボタン
                Button(
                    modifier = Modifier
                        .padding(10.dp)
                        .fillMaxWidth(),
                    onClick = {
                        context.startActivity(Intent(Intent.ACTION_VIEW, "https://dlsoft.dmm.co.jp/detail/${gameInfo.dmm}/".toUri()))
                    },
                ) {
                    Icon(painter = painterResource(id = R.drawable.ic_store_black_24dp), contentDescription = "shop")
                    Text(text = "DMMで購入する")
                }
                // 評価など
                Divider()
                Row {
                    RankText(
                        modifier = Modifier
                            .weight(1f)
                            .padding(5.dp),
                        "最高得点",
                        gameInfo.max2.toString()
                    )
                    RankText(
                        modifier = Modifier
                            .weight(1f)
                            .padding(5.dp),
                        "得点中央値",
                        gameInfo.median.toString()
                    )
                    RankText(
                        modifier = Modifier
                            .weight(1f)
                            .padding(5.dp),
                        "最低得点",
                        gameInfo.min2.toString()
                    )
                }
                Row {
                    RankText(
                        modifier = Modifier
                            .weight(1f)
                            .padding(5.dp),
                        "得点データ数",
                        gameInfo.count2.toString()
                    )
                    RankText(
                        modifier = Modifier
                            .weight(1f)
                            .padding(5.dp),
                        "平均値",
                        gameInfo.average2.toString()
                    )
                    RankText(
                        modifier = Modifier
                            .weight(1f)
                            .padding(5.dp),
                        "標準偏差",
                        gameInfo.stdev.toString()
                    )
                }
                Divider()
                // ErogameScapeで開く
                OutlinedButton(
                    modifier = Modifier
                        .padding(10.dp)
                        .fillMaxWidth(),
                    onClick = {
                        context.startActivity(Intent(Intent.ACTION_VIEW, "https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/game.php?game=${gameInfo.id}".toUri()))
                    },
                ) {
                    Icon(painter = painterResource(id = R.drawable.ic_open_in_browser_black_24dp), contentDescription = "shop")
                    Text(text = "ErogameScapeで開く")
                }
            }
        }
    }
}
```

## MainActivity

```kotlin
class MainActivity : ComponentActivity() {

    private val viewModel by viewModels<MainViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ErogameScapeDroidTheme {
                Surface(color = MaterialTheme.colors.background) {
                    // ゲーム詳細画面
                    GameInfoScreen(viewModel = viewModel)
                }
            }
        }
    }
}
```

動かすとこんな感じ

<img src="https://imgur.com/SYlsfEY.png" width="300">
<img src="https://imgur.com/pzYjBlU.png" width="300">

UI作るのって難しいよな

# 終わりに
ソースコードあります。  

https://github.com/takusan23/ErogameScapeDroid/tree/efa4137b777c4e069ebc7fa3eda5fcbccdba7500