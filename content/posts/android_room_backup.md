---
title: Roomのバックアップを取りたい
created_at: 2021-02-19
tags:
- Android
- Kotlin
- Room
---
家の回線調子わるい

# 本題
Androidのデータベース、Roomのバックアップを取りたい  
他のスマホにデータベースを移したい

## データベースのファイル　どこ？
`data/data/${packageName}/databases`にある。  
なおこんな面倒なことしなくても、`Context#databaseList()`を使うとこのフォルダに入ってるファイルの名前を配列で返してくれるし、  
これを使って`Context#getDatabasePath()`を使えばパスが取れる。

なお、`data/data`は`root`権限がないと見れないが、開発中のアプリはAndroid Studioの`Device File Explorer`から見ることができる。

## どれがデータベースのファイル？
`.db`と`.db-shm`と`.db-wal`をコピーすれば多分見れる。  
`.db`ファイル一個だけにしたい場合は、`Room.databaseBuilder`のときに`setJournalMode(RoomDatabase.JournalMode.TRUNCATE)`を呼べばもしかすると`.db`一個だけになるかもしれない。

```kotlin
nicoHistoryDB = Room.databaseBuilder(context, NicoHistoryDB::class.java, "NicoHistory.db")
    .setJournalMode(RoomDatabase.JournalMode.TRUNCATE) // これ
    .build()
```

# バックアップ
今回は`Context#getExternalFileDir()`の場所に保存したいと思います。  
なお`Android 10`まではファイルマネージャーで見ることができますが、`Android 11`ではサードパーティファイルマネージャーでは見れません。  
Android標準のファイルマネージャー（`com.google.android.documentui`）を開ければ見れると思います（Pixel以外はしらん）

```kotlin
// アプリ固有ストレージに逃がす
context.databaseList()
    .map { name -> context.getDatabasePath(name) }
    .forEach { dbFile ->
        // アプリ固有ストレージ（外部）に保存する
        File(context.getExternalFilesDir(null), dbFile.name).let { file ->
            // ファイル作成
            file.createNewFile()
            // データ書き込み
            file.writeBytes(dbFile.readBytes())
        }
    }
```

`sdcard/Android/data/パッケージ名/files`にあると思います。  
なんか思ったよりきれいに書きことができた

# リストア
コピーのときと同じように、`Context#getExternalFilesDir()`にデータベースのデータが有るとして、  
そいつらを`data/data/パッケージ名/databases`に移せばおｋ

```kotlin
// データベースのパス。Context#getDataDir()はAndroid 7以降のみなのでCompatを使う
val dbFolder = File(ContextCompat.getDataDir(context), "databases")
// アプリ固有ストレージ（外部）のファイルを取り出す
context.getExternalFilesDir(null)?.listFiles()?.forEach { dbFile ->
    File(dbFolder, dbFile.name).let { file ->
        // ファイル作成
        file.createNewFile()
        // データ書き込み
        file.writeBytes(dbFile.readBytes())
    }
}
```

# ファイルピッカーで選ばせたほうがいいよね
`Storage Access Framework`でユーザーにファイルを選ばせる（作成、復元）ほうがいいと思います。    
ただ複数のファイルを選ぶ機能は`SAF`には(多分)無いので、データベースのファイルを`zip`ファイルにまとめて扱うことになりそう（他にもあるかも）  

というわけで例です：

`Activity Result API`を使うので、`app/build.gradle`に数行足してください。

```gradle
dependencies {
    // Activity Result APIでonActivityResultを駆逐する。
    implementation 'androidx.activity:activity-ktx:1.3.0-alpha02'
    implementation 'androidx.fragment:fragment-ktx:1.3.0'

}
```

## バックアップする

```kotlin
/** データベースをバックアップする */
class BackupActivity : AppCompatActivity() {

    /** Activity Result API を使う。[AppCompatActivity.onActivityResult]の後継 */
    private val callback = registerForActivityResult(ActivityResultContracts.CreateDocument()) { uri ->
        if (uri != null) {
            // ZIP作成。
            val outputStream = contentResolver.openOutputStream(uri)
            ZipOutputStream(outputStream).let { zip ->
                /**
                 * データベースフォルダをすべてZipに入れる
                 * */
                databaseList()
                    .map { name -> getDatabasePath(name) }
                    // よくわからんファイルは持ってこない。
                    .filter { file -> !file.name.contains("com.google.android.datatransport") }
                    .forEach { file ->
                        val inputStream = file.inputStream() // ファイル読み出し
                        val entry = ZipEntry(file.name) // ファイル名
                        zip.putNextEntry(entry)
                        zip.write(inputStream.readBytes()) // 書き込む。Kotlinかんたんすぎい
                        inputStream.close()
                        zip.closeEntry()
                    }
                // おしまい
                zip.close()
                // 終了
                Toast.makeText(this, "バックアップできた", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_backup)

        // Storage Access Framework開始
        callback.launch("backup.zip")

    }
}
```

## リストアする

```kotlin
/** リストアするActivity */
class RestoreActivity : AppCompatActivity() {

    /** Activity Result API を使う。[AppCompatActivity.onActivityResult]の後継 */
    private val callback = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            // データベースが保存されているフォルダのパス。ContextCompatで後方互換性もはいばっちり！
            val databaseFolder = File(ContextCompat.getDataDir(this), "databases")
            // 一応前のデータを消す
            databaseFolder.listFiles()?.forEach { file -> file.delete() }
            // Zip展開
            val inputStream = contentResolver.openInputStream(uri)
            ZipInputStream(inputStream).let { zip ->
                var zipEntry: ZipEntry?
                // Zip内のファイルをなくなるまで繰り返す
                while (zip.nextEntry.also { zipEntry = it } != null) {
                    if (zipEntry != null) {
                        // コピー先ファイル作成
                        val dbFile = File(databaseFolder, zipEntry!!.name)
                        dbFile.createNewFile()
                        // データを書き込む
                        dbFile.writeBytes(zip.readBytes())
                    }
                }
            }
            // おわった
            Toast.makeText(this, "リストアおわった", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_restore)

        // Storage Access Framework
        callback.launch(arrayOf("*/*")) // application/zip 動かないのかな

    }
}
```

以上です。

# おわりに
```
Caused by: java.lang.IllegalArgumentException: Can only use lower 16 bits for requestCode
```

これは、`app/build.gradle`に`implementation 'androidx.fragment:fragment-ktx:1.3.0'`を付け足すと直ります？  
`Activity`しか使わんしって思ったんですけどだめっぽいです。