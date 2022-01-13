---
title: AndroidのMediaStoreでは 新しいファイル(31) 以上は自動で作れないらしい
created_at: 2021-12-05
tags:
- Android
- Kotlin
---
どうもこんばんわ。  
**同じ名前のファイルを作らなければいいだけの話です。**

## 本題

```
java.lang.IllegalStateException: Failed to build unique file:
```

`MediaStore`へ登録しようとしたら、ファイル名が被って作れなかったエラー

### 本来なら

同じ名前のファイルを登録しようとすると、自動的にファイル名がかぶらないように`(1)`とかをいい感じに付けてくれる

**ただ、`(31)`を超えると作れずに例外を吐く**

### なぜ

`FileUtils.java`の`buildUniqueNameIterator`が多分そう。  
ここの`hasNext()`が32までしか用意されてないから？

https://cs.android.com/android/platform/superproject/+/master:packages/providers/MediaProvider/src/com/android/providers/media/util/FileUtils.java;drc=master;l=636

```java
// Generate names like "foo (2)"
return new Iterator<String>() {
    int i = 0;
    @Override
    public String next() {
        final String res = (i == 0) ? name : name + " (" + i + ")";
        i++;
        return res;
    }
    @Override
    public boolean hasNext() {
        return i < 32;
    }
};
```