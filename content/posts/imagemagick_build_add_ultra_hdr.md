---
title: Ubuntu で UltraHDR に対応した ImageMagick を作る
created_at: 2025-05-06
tags:
- Linux
- Ubuntu
- ImageMagick
---
どうもこんばんわ。

仕事に遅刻して面目次第もありません。わたしです。  
どーやっても間に合わねえよってなった。よってそこそこ大事なのに。がんばった。

# 本題
`ImageMagick`を自分でビルドすれば`UltraHDR`にも対応できるらしい。  
別件で`ImageMagick`使ってみたくて、自分でビルドするの一回やってみたかったんですよね。

https://imagemagick.org/script/download.php

↑で`ImageMagick`も実行できるバイナリを配布していますが、これは`UltraHDR`に対応していない状態でビルドされていて、  
その場合は普通の`JPEG`画像として扱われてしまう。眩しい情報のゲインマップが消えてしまっている？眩しくない。

ので、今回は`UltraHDR`に対応させた`ImageMagick`を作りたい。  

## 番外編 そもそも配布してるバイナリも起動しない
`Complete portable application on Linux ...`をダウンロードしてきたけど。

```shell
chmod +x magick
./magick
```

で、起動しない。

```plaintext
takusan23@DESKTOP-ULEKIDB:~$ ./magick
dlopen(): error loading libfuse.so.2

AppImages require FUSE to run.
You might still be able to extract the contents of this AppImage
if you run it with the --appimage-extract option.
See https://github.com/AppImage/AppImageKit/wiki/FUSE
for more information
```

`Wiki`を見ろってことなので見たところ、`Ubuntu 24.04`以降を使っている場合は`sudo apt install libfuse2t64`をしないといけないらしい。

```shell
suto apt update
sudo apt upgrade
sudo apt install libfuse2t64
```

これで`./magick --version`すると情報が出てくるようになるはず。  

```shell
takusan23@DESKTOP-ULEKIDB:~$ ./magick --version
Version: ImageMagick 7.1.1-45 Q16-HDRI x86_64 3cbce5696:20250308 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5)
Delegates (built-in): bzlib djvu fontconfig freetype heic jbig jng jp2 jpeg lcms lqr lzma openexr png raqm tiff webp x xml zlib
Compiler: gcc (9.4)
```

**で、Delegates の欄に uhdr があれば UltraHDR 画像もサイズ変更等が出来るわけですが、ありません。自分でビルドする必要があります。**

一方サポート形式の中には`UltraHDR`があるので、自分でビルドすれば`UltraHDR`対応版`ImageMagick`が作れる！！  
https://imagemagick.org/script/formats.php

# 流れ
https://imagemagick.org/script/advanced-linux-installation.php

ちなみに`UltraHDR`の名前をこれ以降`uhdr`とします。  
なんでその名前かはわからん、、`UltraHDR`のソースコードをビルドした時に出来るライブラリ名が`libuhdr.so`だからですかね？

- `Ubuntu`マシンを用意する
    - こんかいは`WSL2`の上の`Ubuntu`です
- `libultrahdr`のビルド
- `ImageMagick`のビルド

`ImageMagick`のビルド、初期状態だとほとんどの画像形式が非対応になっているので、対応させたい画像形式に必要な`デリゲートライブラリ`と呼ばれるものをインストールします。  
`jpeg`や`png`や`webp`のサポートに必要なデリゲートライブラリは`apt`から入れれば良い一方、**UltraHDR**のライブラリは`apt`で配布されてないため、自分でビルドする必要があります。  
https://imagemagick.org/script/formats.php

# Ubuntu マシンの用意
`WSL2`で用意しました。`sudo apt update`と`sudo apt upgrade`はやってね（お作法感ある）。  

# libultrahdr ビルド手順

ドキュメントに書いてあるとおりに進めればいいと思う。特に難しくないはず。  
https://github.com/google/libultrahdr/blob/main/docs/building.md

`CMake`と`Ninja`とかのビルドに使うパッケージを入れます。`apt`で行けるそう。

```shell
sudo apt install cmake pkg-config libjpeg-dev ninja-build
```

次にソースコードを落として、ビルド用のフォルダを作って移動します。  
一行ずつ叩けばおｋ

```shell
git clone https://github.com/google/libultrahdr.git
cd libultrahdr
mkdir build_directory
cd build_directory
```

次にこれでビルドの準備をします。  
例では`clang`を使っているけど、`build-essential`経由で入る`gcc/g++`でビルドできると思う！！

```shell
cmake -G Ninja -DCMAKE_C_COMPILER=gcc-13 -DCMAKE_CXX_COMPILER=g++-13 -DUHDR_BUILD_TESTS=1 ../
```

## libultrahdr cmake エラー

```shell
-- Found JPEG: /usr/lib/x86_64-linux-gnu/libjpeg.so (found version "80")
-- Configuring done (1.1s)
CMake Error at CMakeLists.txt:771 (add_library):
  The install of the uhdr target requires changing an RPATH from the build
  tree, but this is not supported with the Ninja generator unless on an
  ELF-based or XCOFF-based platform.  The CMAKE_BUILD_WITH_INSTALL_RPATH
  variable may be set to avoid this relinking step.


CMake Error at CMakeLists.txt:771 (add_library):
  The install of the uhdr target requires changing an RPATH from the build
  tree, but this is not supported with the Ninja generator unless on an
  ELF-based or XCOFF-based platform.  The CMAKE_BUILD_WITH_INSTALL_RPATH
  variable may be set to avoid this relinking step.


CMake Error at CMakeLists.txt:643 (add_executable):
  The install of the ultrahdr_app target requires changing an RPATH from the
  build tree, but this is not supported with the Ninja generator unless on an
  ELF-based or XCOFF-based platform.  The CMAKE_BUILD_WITH_INSTALL_RPATH
  variable may be set to avoid this relinking step.
```

もしこれが出た場合は、一度`build_directory`フォルダを消してもう一度作って、`cmake -G Ninja ...`のコマンドを実行するとよいです。  
2回目はなんか直りました（よくわからない）

![Imgur](https://imgur.com/chQJ8kT.png)

## UltraHDR ビルド
`ninja`コマンドでビルド開始です。

```shell
ninja
```

![Imgur](https://imgur.com/eghzvKE.png)

## ビルドした UltraHDR をインストールする
以下のコマンドで`install`できます、`apt`みたいな感覚。

```shell
sudo ninja install
```

こんな感じにバイナリが配置される、らしい。

```shell
takusan23@DESKTOP-ULEKIDB:~/libultrahdr/build_directory$ sudo ninja install
[3/8] Performing configure step for 'googletest'
-- Configuring done (0.1s)
-- Generating done (0.0s)
-- Build files have been written to: /home/takusan23/libultrahdr/build_directory/googletest/src/googletest-build
[4/8] Performing build step for 'googletest'
ninja: no work to do.
[6/7] Install the project...
-- Install configuration: "Release"
-- Installing: /usr/local/lib/pkgconfig/libuhdr.pc
-- Installing: /usr/local/lib/libuhdr.so.1.4.0
-- Installing: /usr/local/lib/libuhdr.so.1
-- Installing: /usr/local/lib/libuhdr.so
-- Installing: /usr/local/include/ultrahdr_api.h
-- Installing: /usr/local/lib/libuhdr.a
-- Installing: /usr/local/bin/ultrahdr_app
-- You may need to add path /usr/local/lib/ to LD_LIBRARY_PATH if binaries are unable to load uhdr library
e.g. export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib/
```

これで`ImageMagick`がビルドで使う`libuhdr.so`が用意できました。次は`ImageMagick`のビルドです。

# ImageMagick ビルド手順
これも手順が書かれてるのでこれ通りにすればいいはず。  
有名なので知見がいっぱい

- https://imagemagick.org/script/install-source.php
- https://imagemagick.org/script/advanced-linux-installation.php

## ImageMagick ソースコードを用意
`git clone`でゲット。

`7.1.1-46`の部分は`GitHub Releases`ページから最新のバージョンに置き換えてください。  
https://github.com/ImageMagick/ImageMagick/releases

```shell
git clone --depth 1 --branch 7.1.1-46 https://github.com/ImageMagick/ImageMagick.git ImageMagick-7.1.1
cd ImageMagick-7.1.1/
```

次は`./configure`と叩きます。これでビルドに必要なデリゲートライブラリがインストールされているかとかを調べてくれます。  
が、が、が今は`jpeg`も`png`も何も入れてないので、`jpeg`も`png`も **no** って表示されるんじゃないかなと思います。  
（`UltraHDR`のビルドで`libjpeg-dev`を入れていれば`jpeg`は`yes`かも）

```shell
./configure
```

```shell
Delegate library configuration:
  BZLIB             --with-bzlib=yes                    no
  Autotrace         --with-autotrace=no                 no
  DJVU              --with-djvu=yes                     no
  DPS               --with-dps=no                       no
  FFTW              --with-fftw=no                      no
  FLIF              --with-flif=no                      no
  FlashPIX          --with-fpx=no                       no
  FontConfig        --with-fontconfig=yes               no
  FreeType          --with-freetype=yes                 no
  Ghostscript lib   --with-gslib=no                     no
  Graphviz          --with-gvc=yes                      no
  HEIC              --with-heic=yes                     no
  JBIG              --with-jbig=yes                     no
  JPEG v1           --with-jpeg=yes                     yes
  JPEG XL           --with-jxl=yes                      no
  DMR               --with-dmr=yes                      no
  LCMS              --with-lcms=yes                     no
  LQR               --with-lqr=yes                      no
  LTDL              --with-ltdl=no                      no
  LZMA              --with-lzma=yes                     no
  Magick++          --with-magick-plus-plus=yes         no (failed tests)
  OpenEXR           --with-openexr=yes                  no
  OpenJP2           --with-openjp2=yes                  no
  PANGO             --with-pango=yes                    no
  PERL              --with-perl=no                      no
  PNG               --with-png=yes                      no
  RAQM              --with-raqm=yes                     no
  RAW               --with-raw=yes                      no
  RSVG              --with-rsvg=no                      no
  TIFF              --with-tiff=yes                     no
  UHDR              --with-uhdr=no                      no
  WEBP              --with-webp=yes                     no
  WMF               --with-wmf=no                       no
  X11               --with-x=                           no
  XML               --with-xml=yes                      yes
  ZIP               --with-zip=yes                      no
  ZLIB              --with-zlib=yes                     no
  ZSTD              --with-zstd=yes                     no
```

## デリゲートライブラリを用意
この`Webページ`が対応している画像形式一覧です。説明をよく読むと、自分でビルドする際に必要なライブラリが書いてあります。  
https://imagemagick.org/script/formats.php

`png`と`jpeg`と`webp`、あとは調べてるとみんな書いてそうだったので`tiff`と`freetype`と`zlib`。  
(`zlib`は`png`で使う)

```shell
sudo apt install libpng-dev libjpeg-dev libwebp-dev libtiff-dev libfreetype6-dev zlib1g-dev
```

もしくは、`sudo apt build-dep imagemagick`で`ImageMagick`のビルドに必要なパッケージをある程度まとめてインストールする方法もあります。  
が、なんか手元の`Ubuntu 24.04`ではなんか動かなかったので一つずつ入れることにした。。。

これでもう一回`./configure`を叩くと、`png`や`webp`のサポートが追加されている（`no`じゃなくて`yes`）はずです。

```shell
Delegate library configuration:
  BZLIB             --with-bzlib=yes                    yes
  Autotrace         --with-autotrace=no                 no
  DJVU              --with-djvu=yes                     no
  DPS               --with-dps=no                       no
  FFTW              --with-fftw=no                      no
  FLIF              --with-flif=no                      no
  FlashPIX          --with-fpx=no                       no
  FontConfig        --with-fontconfig=yes               no
  FreeType          --with-freetype=yes                 yes
  Ghostscript lib   --with-gslib=no                     no
  Graphviz          --with-gvc=yes                      no
  HEIC              --with-heic=yes                     no
  JBIG              --with-jbig=yes                     yes
  JPEG v1           --with-jpeg=yes                     yes
  JPEG XL           --with-jxl=yes                      no
  DMR               --with-dmr=yes                      no
  LCMS              --with-lcms=yes                     no
  LQR               --with-lqr=yes                      no
  LTDL              --with-ltdl=no                      no
  LZMA              --with-lzma=yes                     yes
  Magick++          --with-magick-plus-plus=yes         yes
  OpenEXR           --with-openexr=yes                  no
  OpenJP2           --with-openjp2=yes                  no
  PANGO             --with-pango=yes                    no
  PERL              --with-perl=no                      no
  PNG               --with-png=yes                      yes
  RAQM              --with-raqm=yes                     no
  RAW               --with-raw=yes                      no
  RSVG              --with-rsvg=no                      no
  TIFF              --with-tiff=yes                     yes
  UHDR              --with-uhdr=no                      no
  WEBP              --with-webp=yes                     yes
  WMF               --with-wmf=no                       no
  X11               --with-x=                           no
  XML               --with-xml=yes                      yes
  ZIP               --with-zip=yes                      no
  ZLIB              --with-zlib=yes                     yes
  ZSTD              --with-zstd=yes                     yes
```

## UHDR も yes にする
これはデフォルトで`no`になっているので、`./configure`に引数を渡すと`yes`になります。  
`libultrahdr`をビルドするだけじゃデフォルトで無効だったぽい？

```shell
./configure --with-uhdr=yes
```

これで`UHDR`も`yes`になりました。

```shell
UHDR              --with-uhdr=yes                     yes
```

準備はできた、、、！

![Imgur](https://imgur.com/4Ex0RkH.png)

## ImageMagick ビルド
`make`コマンドで出来ます。

```shell
make
```

時間がかかるので待ちます。

![Imgur](https://imgur.com/kL83Wd2.png)

おわった！！

![Imgur](https://imgur.com/pbB84CG.png)

## ビルドした ImageMagick をインストール
すでに入っている場合は消してね。  
以下のコマンドでインストールされます。

```shell
sudo make install
```

で、実行しようとするとエラーになります。

```shell
/usr/local/bin/magick: error while loading shared libraries: libMagickCore-7.Q16HDRI.so.10: cannot open shared object file: No such file or directory
```

が、これはドキュメント通りにコマンドを一つ叩くと起動できるようになります。  
これです。https://imagemagick.org/script/install-source.php

```shell
sudo ldconfig /usr/local/lib
```

# 完成
`UltraHDR (uhdr)`対応版の`ImageMagick`が完成しました。**いえーーーい**

```shell
takusan23@DESKTOP-ULEKIDB:~/ImageMagick-7.1.1$ sudo ldconfig /usr/local/lib
takusan23@DESKTOP-ULEKIDB:~/ImageMagick-7.1.1$ /usr/local/bin/magick --version
Version: ImageMagick 7.1.1-46 Q16-HDRI x86_64 7ee7ea3c9:20250317 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5)
Delegates (built-in): bzlib freetype jbig jng jpeg lzma png tiff uhdr webp xml zlib zstd
Compiler: gcc (13.3)
```

# 使ってみる
`UltraHDR`画像を小さくしてみる。  
`UltraHDR`も拡張子は`jpg`なので、多分何もしないと`JPEG`だと思われてしまう。のでファイル名の前に`uhdr:`を付けます。  
https://imagemagick.org/script/command-line-processing.php

```shell
/usr/local/bin/magick -define uhdr:output-color-transfer=hlg -define uhdr:hdr-color-transfer=hlg uhdr:{入力 UltraHDR 画像のパス} -resize 50% uhdr:{出力 UltraHDR 画像のパス}
```

例です：  

```shell
/usr/local/bin/magick -define uhdr:output-color-transfer=hlg -define uhdr:hdr-color-transfer=hlg uhdr:original_uhdr.jpg -resize 50% uhdr:half_uhdr.jpg
```

`resize 50%`で半分にしてみた。  
![Imgur](https://imgur.com/tUNufAR.png)

ちゃんと`UltraHDR`のまま小さくなってます。良かった。  

おわりです。

# おわりに
次回は AWS Lambda で動かすぞ！