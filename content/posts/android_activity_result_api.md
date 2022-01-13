---
title: startActivityForResultに打消し線が出た
created_at: 2020-09-19
tags:
- Android
- Kotlin
---

やっと週末が

# 本題
つまり非推奨になったってことです。

# startActivityForResult って何
画像を選択する時、選択した画像を受け取る時に使う。  

# Activity Result API とは
startActivityForResult よりも簡素化された？。  
第二引数の`REQUEST_CODE`が省略できるように。  
（代わりにその都度`startActivityForResult`を用意する模様？）

# Storage Access Framework での例

FragmentとActivityのバージョンをあげます。
多分Fragment/Activity両方書かないとエラー出ると思います。

```gradle
dependencies {
    implementation 'androidx.activity:activity-ktx:1.2.0-alpha08'
    implementation 'androidx.fragment:fragment:1.3.0-alpha08'
}
```

```kotlin
class MainActivity : AppCompatActivity() {

    /** 選択した画像をここで受け取る。Activity Result APIってやつらしい。 */
    val getContent =
        registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
            println(uri?.path)
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        content_select.setOnClickListener {
            // 画像選択。SAF。
            getContent.launch("image/*")
        }

    }

}
```

ボタンを作成して(IDは`content_select`)レイアウトに置いておいてください。