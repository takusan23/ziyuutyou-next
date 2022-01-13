---
title: SQLiteの思い出をRoomへお引越しする
created_at: 2020-07-11
tags:
- Android
- Kotlin
- Room
---

進路どーすっかな

# 本題
既存のAndroidアプリにデータベースを追加したいわけですが、これから作るならRoomをやっぱ使いたいわけですよ。  
でもRoomとSQLite（旧式）が共存してるのなんか気持ち悪いので**めっちゃ面倒くさそうだけど**Roomへ移行しようというわけです。

# 環境
| なまえ  | あたい    |
|---------|-----------|
| Android | 11 Beta 2 |
| 言語    | Kotlin    |

# やること
SQLite -> Room

# ライブラリを入れる
## build.gradleを開いて
以下のコードを足します。  
ファイルの一番上に`apply plugin: 'kotlin-kapt'`を書かないとエラー出ます。  
あとついでにコルーチンも入れましょう。無くても`thread {}`使って別スレッドで扱えば使えますがコールバック地獄になるのでやめとこう

```gradle
apply plugin: 'kotlin-kapt' // 一番上に

dependencies {

    // Room
    def room_version = "2.2.5"
    implementation "androidx.room:room-runtime:$room_version"
    implementation "androidx.room:room-ktx:$room_version"
    kapt "androidx.room:room-compiler:$room_version"
    
    // Coroutines
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.3.4"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.3.4"
   
    // 省略...

}
```

# なんでコルーチン

**RoomはUIスレッドでは使えません。**  
だからコルーチンが必要だったのですね。

# Roomの構成
Roomさんは3つのコンポーネントで成り立ってます。

- RoomDatabase
    - データベースの中心的な役割
    - 説明がめんどいし何するのかよくわかっていない。
    - DAOにはこいつが必要
- Entity
    - テーブル。Excelだと一番上の行。
    - データベースの中身を定義する（主キーとか）
- DAO
    - データベースへアクセスする際に使う関数を定義する
    - クエリも入力補助が付いたので間違いが減った（＋実行前に間違いが分かるようになってる）

# 移行する
流石にちょっと怖くね？

## Entityを作成する
今回はファイル名を`CommentCollectionEntity.kt`とします。  

### 例

SQLiteHelperがこうなっているとして

```kotlin
// データーベース名
private val DATABASE_NAME = "CommentCollection.db"
private val TABLE_NAME = "comment_collection_db"
private val DESCRIPTION = "description"
private val YOMI = "yomi"
private val COMMENT = "comment"
private val _ID = "_id"
// , を付け忘れるとエラー
private val SQL_CREATE_ENTRIES = "CREATE TABLE " + TABLE_NAME + " (" +
        _ID + " INTEGER PRIMARY KEY," +
        COMMENT + " TEXT ," +
        YOMI + " TEXT ," +
        DESCRIPTION + " TEXT" +
        ")"
```

Entityはこうなります（例がクソわかりにくい。**まるで教科書の例題の解き方が参考にならない問題みたい**）

```kotlin
@Entity(tableName = "comment_collection_db")
data class CommentCollectionEntity(
    @ColumnInfo(name = "_id") @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "comment") val comment: String,
    @ColumnInfo(name = "yomi") val yomi: String,
    @ColumnInfo(name = "description") val description: String
)
```

#### Entity書くときに注意しないといけないこと
- `@Entity(tableName = "")`を書かないとだめ。
    - `CREATE TABLE {ここ} `の値ですね。忘れそう
- カラムと変数名が同じじゃない場合は`@ColumnInfo`を使う
- **実はnullを許容するように書くと移行のときだけ楽になる**
    - `Migrationを書く`の工程がほぼなくなり楽になりますが、使うときに毎回nullの可能性がある値を使う羽目になるので今回は**null絶対許さん**方針で行きます。
    - nullを許容する場合は`String?`や`Int?`のように最後に`?`をつければいいですが**今回はつけません**。

### DAOを書く
データベースへアクセスするする際に使う関数を定義します。  
クエリもここに書きます。  
ここでは一般的に使いそうな動作を例として置いとくので、各自Entityクラス名等を書き換えてください。

ファイル名は`CommentCollectionDAO.kt`で

```kotlin
/**
 * データベースへアクセスするときに使う関数を定義する
 * */
@Dao
interface CommentCollectionDAO {
    /** 全データ取得 */
    @Query("SELECT * FROM comment_collection_db")
    fun getAll(): List<CommentCollectionEntity>

    /** データ更新 */
    @Update
    fun update(commentCollectionEntity: CommentCollectionEntity)

    /** データ追加 */
    @Insert
    fun insert(commentCollectionEntity: CommentCollectionEntity)

    /** データ削除 */
    @Delete
    fun delete(commentCollectionEntity: CommentCollectionEntity)

    /** データをIDを使って検索 */
    @Query("SELECT * FROM comment_collection_db WHERE _id = :id")
    fun findById(id: Int): CommentCollectionEntity
}
```

これを書く際も入力補助が聞くので間違いが減ります（この記事二回目の発言）

#### 注意点
なくない？

### Database
中心的な役割を持ちます。  
ファイル名は`CommentCollectionDB.kt`で

```kotlin
/**
 * コメントコレクションのデータベース。
 * SQLiteから移行する場合はバージョンを上げる必要がある
 * */
@Database(entities = [CommentCollectionEntity::class], version = 2)
abstract class CommentCollectionDB : RoomDatabase() {
    abstract fun commentCollectionDAO(): CommentCollectionDAO
}
```

#### 注意点
- バージョンを上げないといけないそうです。

## データベースへアクセス
データベースを使うときにバージョンを上げる処理を書きます。  

```kotlin
// データベース初期化
val commentCollectionDB = Room.databaseBuilder(this, CommentCollectionDB::class.java, "CommentCollection.db")
    .addMigrations(object : Migration(1, 2) {
        override fun migrate(database: SupportSQLiteDatabase) {
        }
    })
    .build()
GlobalScope.launch(Dispatchers.Main) {
    // コルーチン
    withContext(Dispatchers.IO) {
        // データベースから値を取る
        commentCollectionDB.commentCollectionDAO().getAll().forEach { data ->
            println(data.comment)
        }
    }
}
```

まあこれじゃ動かないんですけどね。  
そのための **addMigrations** があるので使っていきます。

### なんで？動かないの？
実はEntityでnullを許容すればこの問題は消えます。  
```kotlin
@ColumnInfo(name = "comment") val comment: String? // null ok!
```
しかしnullを許容すると使うときに面倒くさくなります（この例だと`comment?.length`みたいに?付けないといけなくなる）

この問題はSQLiteとRoomとでnullを許すかどうかで問題が発生しています。
- **SQLiteくん**
    - null？良いんじゃね？
- **Roomくん**
    - `Entity`がnullを許してくれない；；
    - よし落とすか←いまここ

ちなみに出力されたエラーはこちら。
```js
Expected:
    TableInfo{name='comment_collection_db', columns={description=Column{name='description', type='TEXT', affinity='2', notNull=true, primaryKeyPosition=0, defaultValue='null'}, comment=Column{name='comment', type='TEXT', affinity='2', notNull=true, primaryKeyPosition=0, defaultValue='null'}, yomi=Column{name='yomi', type='TEXT', affinity='2', notNull=true, primaryKeyPosition=0, defaultValue='null'}, _id=Column{name='_id', type='INTEGER', affinity='3', notNull=true, primaryKeyPosition=1, defaultValue='null'}}, foreignKeys=[], indices=[]}
Found:
    TableInfo{name='comment_collection_db', columns={description=Column{name='description', type='TEXT', affinity='2', notNull=false, primaryKeyPosition=0, defaultValue='null'}, comment=Column{name='comment', type='TEXT', affinity='2', notNull=false, primaryKeyPosition=0, defaultValue='null'}, yomi=Column{name='yomi', type='TEXT', affinity='2', notNull=false, primaryKeyPosition=0, defaultValue='null'}, _id=Column{name='_id', type='INTEGER', affinity='3', notNull=false, primaryKeyPosition=1, defaultValue='null'}}, foreignKeys=[], indices=[]}
```

よく見ると上の`Expected`の方の`notNull`は`true(null良いよ)`ですが、  
`Found(今回作ったEntity)`は`notNull`が`false(nullだめだよ)`ってことで中身が噛み合わず例外が発生しています。

## Migration
nullを許容 から nullを許さん に変更したいのですが、残念ながら変更するにはデータベースを作り直す必要があるそうです。  

まあまあ面倒くさい。やることは以下の4つ
- 新しくデータベースを作成する
    - 今までのデータベースにあったカラムを全部書く
- 新しく作ったデータベースへデータを移す
- 古いデータベースを消す
- 新しく作ったデータベースの名前を古いデータベースの名前に変更する

これをKotlinで書くとこうなります。

```kotlin
override fun migrate(database: SupportSQLiteDatabase) {
    // SQLite移行。移行後のデータベースを作成する。カラムは移行前と同じ
    database.execSQL(
        """
        CREATE TABLE comment_collection_db_tmp (
          _id INTEGER NOT NULL PRIMARY KEY, 
          comment TEXT NOT NULL,
          yomi TEXT NOT NULL,
          description TEXT NOT NULL
        )
        """
    )
    // 移行後のデータベースへデータを移す
    database.execSQL(
        """
        INSERT INTO comment_collection_db_tmp (_id, comment, yomi, description)
        SELECT _id, comment, yomi, description FROM comment_collection_db
        """
    )
    // 前あったデータベースを消す
    database.execSQL("DROP TABLE comment_collection_db")
    // 移行後のデータベースの名前を移行前と同じにして移行完了
    database.execSQL("ALTER TABLE comment_collection_db_tmp RENAME TO comment_collection_db")
}
```

全部くっつけるとこう

```kotlin
// データベース初期化
val commentCollectionDB = Room.databaseBuilder(this, CommentCollectionDB::class.java, "CommentCollection.db")
    .addMigrations(object : Migration(1, 2) {
        override fun migrate(database: SupportSQLiteDatabase) {
            // SQLite移行。移行後のデータベースを作成する。カラムは移行前と同じ
            database.execSQL(
                """
                CREATE TABLE comment_collection_db_tmp (
                  _id INTEGER NOT NULL PRIMARY KEY, 
                  comment TEXT NOT NULL,
                  yomi TEXT NOT NULL,
                  description TEXT NOT NULL
                )
                """
            )
            // 移行後のデータベースへデータを移す
            database.execSQL(
                """
                INSERT INTO comment_collection_db_tmp (_id, comment, yomi, description)
                SELECT _id, comment, yomi, description FROM comment_collection_db
                """
            )
            // 前あったデータベースを消す
            database.execSQL("DROP TABLE comment_collection_db")
            // 移行後のデータベースの名前を移行前と同じにして移行完了
            database.execSQL("ALTER TABLE comment_collection_db_tmp RENAME TO comment_collection_db")
        }
    })
    .build()
GlobalScope.launch(Dispatchers.Main) {
    // コルーチン
    withContext(Dispatchers.IO) {
        // データベースから値を取る
        commentCollectionDB.commentCollectionDAO().getAll().forEach { data ->
            println(data.comment)
        }
    }
}
```

以上です。  

# 追加する方法
SQLite時代の`ContentValues`よりずっとわかりやすい。
```kotlin
GlobalScope.launch(Dispatchers.Main) { 
    withContext(Dispatchers.IO){
        val commentCollectionEntity = CommentCollectionEntity(comment = "comment", yomi = "yomi", description = "")
        commentCollectionDB.commentCollectionDAO().insert(commentCollectionEntity)
    }
}
```

# これ今まで通りSQLiteOpenHelper経由でアクセスするとどうなるの？

```terminal
android.database.sqlite.SQLiteException: Can't downgrade database from version 2 to 1
```

バージョン下げんなって怒られた。

# おわりに
カラムが縦か横かわからん時がよくあるのでその時は**TweetDeckがマルチカラム**だってことを思い出してあ～横並びのことか～って思い出すようにしています。

作らないと行けないファイルが多くて初見さんは大変そうだと思った（こなみ）

# 参考にしました
https://developer.android.com/training/data-storage/room/migrating-db-versions  
https://medium.com/@manuelvicnt/android-room-upgrading-alpha-versions-needs-a-migration-with-kotlin-or-nonnull-7a2d140f05b9  
https://stackoverflow.com/questions/47562157/android-room-migration-null-error  
https://qiita.com/arara_tepi/items/7267418ca4b6bd65d744#notnull%E3%82%92%E5%90%88%E3%82%8F%E3%81%9B%E3%82%8B