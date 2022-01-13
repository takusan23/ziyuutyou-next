---
title: Fragmentが作れない
created_at: 2020-12-30
tags:
- Android
- Kotlin
- Fragment
---

Fragmentを作ろうとすると謎のメソッドを生成しないといけなくなってた。しかも何返せばいいんだこれ

```kotlin
class BlogListFragment : Fragment() {

    override fun <I : Any?, O : Any?> prepareCall(
        contract: ActivityResultContract<I, O>,
        callback: ActivityResultCallback<O>
    ): ActivityResultLauncher<I> {

    }

    override fun <I : Any?, O : Any?> prepareCall(
        contract: ActivityResultContract<I, O>,
        registry: ActivityResultRegistry,
        callback: ActivityResultCallback<O>
    ): ActivityResultLauncher<I> {

    }
    
}
```

## 解決
Fragmentのバージョンを上げます。  
`app`フォルダにある`build.gradle`を開いて、`dependencies`に一行足します。

```
dependencies {
    // Fragmentを作ろうとすると謎のメソッドをオーバーライドさせようとするので
    implementation 'androidx.fragment:fragment-ktx:1.3.0-rc01'
}
```

## 参考にしました
https://stackoverflow.com/questions/65342763/unable-to-create-fragment-class-in-jetpack-compose