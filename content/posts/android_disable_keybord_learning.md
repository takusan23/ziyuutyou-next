---
title: Androidアプリ側でキーボードの学習機能を無効にしたい
created_at: 2022-04-27
tags:
- Android
- Kotlin
---

どうもこんばんわ。  
これは D.C.4 の 白河ひより ちゃん ↘

![Imgur](https://imgur.com/8dvXL9p.png)

# 本題
アプリ側でIMEの学習機能をOFFに出来ます。  
ChromeとかFirefoxのプライベートモードで~~やましい事を~~検索しようとする際に有効になったりする。

全てのキーボードアプリが対応してるかは分からん...

# 作り方

`EditText`に`android:imeOptions="flagNoPersonalizedLearning"`を指定するだけです、はい

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <EditText
        android:id="@+id/edit_text_disable_leaning"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:hint="IMEの学習機能がOFFです"
        android:imeOptions="flagNoPersonalizedLearning"
        android:minHeight="48dp"
        android:text=""
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <EditText
        android:id="@+id/edit_text"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:hint="IMEの学習機能がONです"
        android:minHeight="48dp"
        android:text=""
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/edit_text_disable_leaning" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

これで実行すると、EditTextが2つ出てると思います。  
上のEditTextでは何回同じキーワードを入れても学習しない（入力候補に出るが優先順位が変わらない）が、下のEditTextでは特に指定していないため、  
2回目以降は入力候補に優先的に表示されていると思います。

![Imgur](https://imgur.com/7jRK3ff.png)
若干キーボードのUIが変わる。

![Imgur](https://imgur.com/TmbubM2.png)

以上です。

# おわりに
最近ねむい