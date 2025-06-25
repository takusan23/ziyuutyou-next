---
title: Amazon S3 と Lambda で画像を小さくして配信する
created_at: 2025-05-14
tags:
- AWS
- S3
- CloudFront
- Lambda
- ImageMagick
---
どうもこんにちは、飲み会した。  
今回の記事で作った`Amazon S3+Lambda+CloudFront`製`画像変換&配信システム`のお陰で、ちゃんと`UltraHDR`の画像が貼れているはず。

![おさけ](https://oekakityou.negitoro.dev/resize/48dd6b4a-c6c5-4877-94c4-2428ec800130.jpg)

![おさけ](https://oekakityou.negitoro.dev/resize/7162ff1d-9e12-4f1b-baae-1dded135b4c1.jpg)

![おさけ](https://oekakityou.negitoro.dev/resize/913a7cd6-bb33-4646-ae80-09908cd5e18e.jpg)

飯もあります。  
飯テロするか～～～ｗ

![ごはん](https://oekakityou.negitoro.dev/resize/49e896a8-1e3a-4249-a2b2-80182c0076a3.jpg)

![ごはん](https://oekakityou.negitoro.dev/resize/eb36ed5f-2147-49b6-a98a-0bb6963424eb.jpg)

そういえば言われた。  
わたし、更に痩せたらしい。のでいっぱい食べてきた。

# 本題
`UltraHDR`をブログに貼りたい。が、世の中のサービスは`UltraHDR`無視されて`JPEG`になってしまうので、`UltraHDR`のまま配信出来る何かを探す必要があった。  
あと、ブログ用に画像を`GIMP`で小さくしてるけど手間だし自動でやってほしいし、そもそも`UltraHDR`は無理だからそれもなんとかしたい。

# Lambda でリサイズからの S3 + CloudFront で配信
これだ。よくある`AWS`サーバーレス入門みたいなやつ。  
`S3`バケットにブログに貼りたい画像をアップロードすると、`Lambda`が起動して、`ImageMagick`を使って半分くらいのサイズにしたあと、  
リサイズ保存用`S3`バケットに放り込まれるようにし、このバケットを`CloudFront`で配信する。完璧じゃん。

# 作戦
`S3`に画像を放り込んだら`AWS Lambda`が起動して、`ImageMagick`で変換する。  
できる限りそのままの画像をアップする`/original`と、ブログに乗せる用に小さくした`/resize`へそれぞれ画像を配置する。

変換過程ですが、画像をアップロードすると`UUID`が払い出され、できる限りそのままの画像と、配信用に半分くらいにした画像が保存されます。  
おなじ`UUID`になる。

- /original/{UUID}.{拡張子}
    - 投稿した動画をできる限りそのままの画質で保存します
    - 基本的には小さくした画像を使うので、使いません、、
- /resize/{UUID}.{拡張子}
    - ziyuutyou ブログに貼る用

# 構成図
`CloudFront`の部分は`AWS S3+CloudFront`で静的サイトの記事で触ったので、あんまり触れません、、  
今回の記事は`AWS Lambda`で画像をリサイズしたいので。

![Imgur](https://imgur.com/ItAjX7E.png)

# つくる

- `AWS Lambda`で動く`UltraHDR`付き`ImageMagick`を作る（一番大変）
- `S3`の受け付け用、配信用バケットを作る
- `Lambda`で動かすためのコードを書く
- `S3`をトリガーに起動するようにする
- (任意) `CloudFront`で配信する

## Lambda で動く UltraHDR 付き ImageMagick をビルドする
画像を小さくするための`ImageMagick`を`Lambda`で動くようにビルドします

### Lambda で ImageMagick を動かすためには
いま`Node.js`で画像のリサイズをしたいなら`sharp`ってのが良いらしいんですが、  
`UltraHDR`に対応していないので今回は`ImageMagick`にします。

`ImageMagick`のビルドだけならそんなに難しくない。  
https://takusan.negitoro.dev/posts/imagemagick_build_add_ultra_hdr/

ただ、それはお使いのマシンに既にインストールされている（もしくはインストールした）`libjpeg-dev`や`lib-png`に依存しているからで、  
パッケージを新たに入れることが出来ない（`yum install` 出来ない）`AWS Lambda`では、少し考える必要があります。

`Lambda`には`Lambda Layer`と呼ばれる機能があり、`Lambda`が動くマシンに依存関係を配置させる事ができます。  
この機能を使い、必要なバイナリをすべて同梱して、`Lambda Layer`機能を使い、`Lambda`のマシンに`ImageMagick`のバイナリや必要なライブラリを配置させます。

と、いうわけで、今回は`Lambda`で動く`ImageMagick (ライブラリ同梱済み)`を作ろうと思います。

### ライブラリ同梱の詳細
先述の通り`AWS Lambda`環境下では、`apt install`等でインストールする事がが出来ないため、  
`libjpeg-dev`相当のライブラリも`ImageMagick`と一緒に同梱する必要がある。そのせいでビルドが結構面倒なことになってる。

今回は必要なライブラリをすべて`/opt`にインストールすることにします。（`/opt/bin`や`/opt/lib`みたいになる）  
なぜかと言うと、これで`/opt`をすべて`zip`に固めて`Lambda Layer`に登録すれば、パスが通った状態になるんですよね。  
（`Lambda Layer`は`/bin`にパスが通った状態になるそう）。

### ビルド準備
`Amazon Linux 2023`。`WSL`で起動する方法があるそうなのでこれでいきます。  
- https://aws.amazon.com/jp/blogs/developer/developing-on-amazon-linux-2-using-windows/
- https://github.com/rlove/AmazonLinux-2023-WSL

が、公式のものじゃないらしいので、どうしても気になる人は`EC2`借りるなり`Lightsail`で`Amazon Linux 2023`のマシンを用意しても良いかもしれません。  
スペックは多少高いものを選ばないとダメそう（`Lightsail`の一番下を選んだら固まってしまった...）

### Amazon Linux 2023 を用意する
これでビルドします。  
なぜかと言うと、`AWS Lambda`を実行するためのマシンが使っている、`Linux ディストリビューション`が`Amazon Linux 2023`だそうで、  
`OS`同じでビルドすれば多分動くでしょって。

![Imgur](https://imgur.com/JdeQLwV.png)

![Imgur](https://imgur.com/4rzTR4J.png)

というか`Ubuntu`でビルドしたら**何回やってもダメだった**から、`Lambda`の環境と同じディストリビューションにしてみた、  
標準Cライブラリとやらのバージョンが一致してないとかなんとかで。

```shell
Error: Command failed: /opt/bin/magick --version",
/opt/bin/magick: /lib64/libc.so.6: version `GLIBC_2.38' not found (required by /opt/lib/libMagickCore-7.Q16HDRI.so.10)
/opt/bin/magick: /lib64/libm.so.6: version `GLIBC_2.38' not found (required by /opt/lib/libMagickCore-7.Q16HDRI.so.10)
/opt/bin/magick: /lib64/libm.so.6: version `GLIBC_2.35' not found (required by /opt/lib/libMagickCore-7.Q16HDRI.so.10)
/opt/bin/magick: /lib64/libm.so.6: version `GLIBC_2.38' not found (required by /opt/lib/libMagickWand-7.Q16HDRI.so.10)
/opt/bin/magick: /lib64/libc.so.6: version `GLIBC_2.38' not found (required by /opt/lib/libMagickWand-7.Q16HDRI.so.10)
```

### 必要なパッケージを入れる
`update + upgrade`のコンボ、あと`apt`の`build-essential`に当たる`Development Tools`を入れます。  
`wget`も入ってなかった...

```shell
yum update
yum upgrade
yum groupinstall "Development tools"
yum install wget
```

### libjpeg
https://www.ijg.org/

ここからダウンロードリンクが探せるので、`wget`か何かで落として解凍。`gz`の方です。

```shell
cd ~
wget https://www.ijg.org/files/jpegsrc.v9f.tar.gz
tar xvzf jpegsrc.v9f.tar.gz
cd jpeg-9f
```

`prefix`オプションで`/opt`にインストールするように設定して、`make`して`install`。  
ライブラリ創作先に`/opt`を追加します。

```shell
./configure --prefix=/opt CPPFLAGS=-I/opt/include LDFLAGS=-L/opt/lib --disable-dependency-tracking --enable-shared
make
make install
```

`make install`すると`/opt`にバイナリが配置されているはずです。  
見てみましょう。

```shell
ls /opt
```

![Imgur](https://imgur.com/9x5iQUd.png)

入ってますね！

### zlib
https://www.zlib.net/

`libpng`がこれを使っているらしいのでこれもビルドします。  
同様にホームページからダウンロードリンクを探して`wget`で落とします。`gz`の方です。

```shell
cd ~
wget https://www.zlib.net/zlib-1.3.1.tar.gz
tar xvzf zlib-1.3.1.tar.gz
cd zlib-1.3.1
./configure --prefix=/opt
make
make install
```

### libpng
http://www.libpng.org/pub/png/libpng.html

同様に`libpng`もダウンロードリンクを探して`wget`で落とします。`gz`の方で。

```shell
cd ~
wget http://prdownloads.sourceforge.net/libpng/libpng-1.6.47.tar.gz
tar xvzf libpng-1.6.47.tar.gz
cd libpng-1.6.47
./configure --prefix=/opt CPPFLAGS=-I/opt/include LDFLAGS=-L/opt/lib --disable-dependency-tracking --enable-shared
make
make install
```

### libwebp
https://developers.google.com/speed/webp/docs/compiling?hl=ja

`webp`の画像を扱う予定があれば。この通りに進めます。  
`libgif`が無くてもビルドは出来た...、`GIF`が扱えないだけで`webp`は使えるのかな

```shell
cd ~
wget https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.5.0.tar.gz
tar xvzf libwebp-1.5.0.tar.gz
cd libwebp-1.5.0
./configure --prefix=/opt CPPFLAGS=-I/opt/include LDFLAGS=-L/opt/lib --disable-dependency-tracking --enable-shared
make
make install
```

### libultrahdr
https://github.com/google/libultrahdr/blob/main/docs/building.md

`UltraHDR`のビルドです。  
これは`CMake`なので他とは若干違う。また、`libjpeg`が必要なので、予めビルドして`/opt`にインストールしておいてください。

ビルド手順が`Debian`系列になっているので`CentOS`系列用？に読み替える必要があります。  
あといくつかオプションを指定して`Lambda Layer`に入れられるようにします。

まずはビルドに必要なツールを

```shell
yum install cmake pkg-config ninja-build
```

次にソースコードを落として、ビルド用のフォルダを作ります。

```shell
cd ~
git clone https://github.com/google/libultrahdr.git
cd libultrahdr
mkdir build_directory
cd build_directory
```

そしたらビルドします。  
オプションですが、

- `gcc`、`g++`をコンパイラに指定
    - 多分`yum groupinstall "Development Tools"`で付いてくるはず
- ライブラリ捜索先は`/opt/lib`に
    - さっきビルドした`libjpeg`が`/opt/lib`にあるので、それを使う
- ライブラリは`lib`に配置
    - `Debian`系は`/lib`に配置してくれるが、`CentOS系列？`は`lib64`に配置しようとする
    - `Lambda Layer`は`lib`にしかパスが通ってないので`lib`に合わせる
- インストール先は`/opt`
    - `--prefix=/opt`みたいな
- `../`は`pwd`が`build_directory`で、親にあるものを探すため

```shell
cmake -G Ninja -DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++ -DCMAKE_PREFIX_PATH=/opt/lib -DCMAKE_INSTALL_LIBDIR=lib -DCMAKE_INSTALL_PREFIX=/opt ../
ninja
ninja install
```

### ImageMagick
ソースコードを持ってきます  
`7.1.1-47`は最新リリースに合わせてください→ https://github.com/ImageMagick/ImageMagick/releases

```shell
cd ~
git clone --depth 1 --branch 7.1.1-47 https://github.com/ImageMagick/ImageMagick.git ImageMagick-7.1.1
cd ImageMagick-7.1.1
```

そうしたら、デリゲートライブラリの捜索先に`/opt/lib`を指定します。これでさっきビルドした`libjpeg`たちを発見できるはずです。  
`export ...`の1行ですね。  

`configure`は先駆者のママです。何も分からず。。これで`AWS Lambda`で動く。  
`UltraHDR`はデフォルト無効なので`yes`を付けます。

```shell
export PKG_CONFIG_PATH=/opt/lib/pkgconfig
./configure CPPFLAGS=-I/opt/include LDFLAGS=-L/opt/lib --prefix=/opt --disable-docs --without-modules --enable-delegate-build --without-magick-plus-plus --without-perl --without-x --without-dmr --without-heic --without-jbig --without-lcms --without-openjp2 --without-lqr --without-lzma --without-pango --without-raw --with-rsvg --without-tiff --disable-openmp --disable-dependency-tracking --with-uhdr=yes
```

![Imgur](https://imgur.com/ZC3zi6g.png)

`jpeg`や`png`、`uhdr`が`yes`になっているはず。

![Imgur](https://imgur.com/Qo3vPgf.png)

そしたら`make`して`make install`です。

```shell
make
make install
```

### ImageMagick
ソースコードを持ってきます  
`7.1.1-47`は最新リリースに合わせてください→ https://github.com/ImageMagick/ImageMagick/releases

```shell
cd ~
git clone --depth 1 --branch 7.1.1-47 https://github.com/ImageMagick/ImageMagick.git ImageMagick-7.1.1
cd ImageMagick-7.1.1
```

そうしたら、デリゲートライブラリの捜索先に`/opt/lib`を指定します。これでさっきビルドした`libjpeg`たちを発見できるはずです。  
`export ...`の1行ですね。  

`configure`は先駆者のママです。何も分からず。。  
`UltraHDR`はデフォルト無効なので`yes`を付けます。

```shell
export PKG_CONFIG_PATH=/opt/lib/pkgconfig
./configure CPPFLAGS=-I/opt/include LDFLAGS=-L/opt/lib --prefix=/opt --disable-docs --without-modules --enable-delegate-build --without-magick-plus-plus --without-perl --without-x --without-dmr --without-heic --without-jbig --without-lcms --without-openjp2 --without-lqr --without-lzma --without-pango --without-raw --with-rsvg --without-tiff --disable-openmp --disable-dependency-tracking --with-uhdr=yes
```

![Imgur](https://imgur.com/ZC3zi6g.png)

`jpeg`や`png`、`uhdr`が`yes`になっているはず。

![Imgur](https://imgur.com/Qo3vPgf.png)

そしたら`make`して`make install`です。

```shell
make
make install
```

### ビルドした ImageMagick を起動してみる
`version`返ってくるか確認です！  
ちゃんと`Delegates`の欄に`jpeg`や`png`や`uhdr`があります！

```shell
/opt/bin/magick --version
```

結果。

```shell
Version: ImageMagick 7.1.1-47 Q16-HDRI x86_64 c8f4e8cb7:20250329 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI
Delegates (built-in): jng jpeg png uhdr webp zlib zstd
Compiler: gcc (11.3)
```

### zip に固める
問題なく動作したら`Lambda Layer`を作りましょ。  
これで`/opt`にインストールした`libjpeg`や`ImageMagick`や`libc`が`zip`に。`Windows`のエクスプローラーから`WSL2`のドライブ見れるので拾ってください。

```shell
cd /opt
zip -r ~/imagemagick-layer.zip .
```

### Lambda Layer として登録
`Lambda`→`レイヤー`→`レイヤーの作成`へ進み、適当な名前をつけます。  

![Imgur](https://imgur.com/k2bciMQ.png)

![Imgur](https://imgur.com/dlgPMKy.png)

さっき作った`zip`を放り込んで、アーキテクチャは`x86_64`、ランタイムは`Node.js`で！  
これで`ImageMagick`を`AWS Lambda`から呼び出す準備はおっけーです。

## S3 バケットを作る
チュートリアルのそれと同じ

https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/with-s3-tutorial.html

バケットを作ります。画像を受け付けるバケットと、リサイズした画像を置いておくバケットです。  
事故が起きるくらいなら入力、出力で2つ作ったほうが良いです。

![Imgur](https://imgur.com/0MUELds.png)

## 受け付け用バケットに画像をいれる
`UltraHDR`の`ImageMagick`をビルドしたので、`UltraHDR`の画像で

![Imgur](https://imgur.com/9IXf23X.png)

## Lambda S3 のアクセス権限のためのポリシーとロール作成
`IAM`の`ポリシー`ページを開いて、以下の`JSON`を貼り付ける。  
`CloudWatch`は使わないので消しました、、(いいのか？)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::*/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::*/*"
        }
    ]
}
```

そしたら次に進んで、よしなに名前をつけてください。  
ポリシーが出来たら、ロールを作ります。`Lambda`を先に作成すると対応するロールが作成されているかもしれない、、

`IAM`の`ロール`ページを開いて、`ロールを作成`を押します。  
`AWS のサービス`を選び、その下は`Lambda`にします。

![Imgur](https://imgur.com/p9D4mK9.png)

そしたら次に進み、先程作成したポリシーを付けてあげて、次へ進みます。名前間違えてエラーになったのでリロードするなりして合ってるか確認してね。  
名前はよしなにつけてください。

![Imgur](https://imgur.com/gYTjKtv.png)

## Lambda Node.js で動かす JavaScript を書く
- https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/with-s3-tutorial.html#with-s3-tutorial-create-function-createfunction
- https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/typescript-package.html#aws-cli-ts

### 環境構築
今回は`JavaScript (Node.js)`にします、`Java`も出来るそう、、ですが郷に従え（チュートリアル）というわけで。  
別にこの規模なら`JavaScript`で良いし。ローカルで適当に`npm init`します。

```shell
npm init
```

![Imgur](https://imgur.com/jNqbea9.png)

つぎに、必要なライブラリをば。  
今回は`TypeScript`を`JavaScript`にして`zip`に詰めてアップロードする気でいます。

`aws-lambda`の型定義と、`esbuild`を入れます。  
`esbuild`で`ts`を`js`にして`Lambda`で動かします。`Node.js`で`.ts`はまだ厳しそう雰囲気（もう少しな気はする）  
あと`s3`クライアント

```shell
npm install -D @types/aws-lambda esbuild
npm i @aws-sdk/client-s3
```

![Imgur](https://imgur.com/eN1VdLW.png)

次に`.js`にするためのコマンドを書きます。`package.json`を開いて、`"scripts": { }`の部分をこうします。  
`Windows`でしか動かないと思います。多分`del`を`rm`に、`powershell Compress-Archive ...`を`zip`コマンドに置き換えれば`Linux`でも動くはず？

```json
"scripts": {
    "prebuild": "del /q dist",
    "build": "esbuild index.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js",
    "postbuild": "cd dist && powershell Compress-Archive -Force -Path index.js* -DestinationPath ../dist.zip"
},
```

### TypeScript
全部張ります。ドーン。  
`UltraHDR`に対応させたので複雑です、、、あとバケット名は`Lambda`環境変数から取り出すようにしました。

```ts
import child_process from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'
import { S3Event } from 'aws-lambda'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

// "GainMap"の文字をバイト配列
const GAINMAP_TEXT_BYTE = Buffer.from('GainMap', 'utf8')

// exec() を Promise に
const exec = promisify(child_process.exec)

// S3 クライアント
const s3 = new S3Client({ region: 'ap-northeast-1' })

// 変換した画像の保存先 S3 バケット名（Lambda 環境変数）
const RESULT_S3_BACKET_NAME = process.env['S3_RESULT_BACKET_NAME']

export const handler = async (event: S3Event) => {
    const bucket = event.Records[0].s3.bucket.name
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

    // 拡張子を取得
    const imageExtension = key.match(/\.([^.]*)$/)?.[0].toLowerCase()
    if (!imageExtension) {
        console.log('拡張子が不明です。')
        return
    }

    try {
        // S3 から追加された画像を取り出す
        const response = await s3.send(new GetObjectCommand({
            Bucket: bucket,
            Key: key
        }))
        const inputImageByteArray = await response.Body?.transformToByteArray()
        if (!inputImageByteArray) {
            console.log('S3 からデータが取得できませんでした')
            return
        }

        // 作業用フォルダをつくる
        // Lambda はインスタンス再利用されるかもなのでできればランダム
        const tempDirectory = await fs.mkdtemp('/tmp/image')

        // ImageMagick に渡すため /tmp に保存
        const inputFilePath = path.join(tempDirectory, `input${imageExtension}`)
        await fs.writeFile(inputFilePath, inputImageByteArray)

        // 変換した画像データの保存先
        // できる限りそのままの画像と、リサイズで2つ
        const originalImagePath = path.join(tempDirectory, `original${imageExtension}`)
        const resizeImagePath = path.join(tempDirectory, `resize${imageExtension}`)

        // ImageMagick でリサイズ
        // ついでに Exif に回転情報があれば画像自体を回転させて、Exif も消す（スマホの名前とか入ってる）
        if (Buffer.from(inputImageByteArray.buffer).includes(GAINMAP_TEXT_BYTE)) {
            // UltraHDR 画像の場合は uhdr: を付ける必要があるので
            await Promise.all([
                await exec(`magick -define uhdr:output-color-transfer=hlg -define uhdr:hdr-color-transfer=hlg uhdr:${inputFilePath} -auto-orient -strip uhdr:${originalImagePath}`),
                await exec(`magick -define uhdr:output-color-transfer=hlg -define uhdr:hdr-color-transfer=hlg uhdr:${inputFilePath} -auto-orient -strip -resize 50% uhdr:${resizeImagePath}`)
            ])
        } else {
            // UltraHDR じゃない
            await Promise.all([
                await exec(`magick ${inputFilePath} -auto-orient -strip ${originalImagePath}`),
                await exec(`magick ${inputFilePath} -auto-orient -strip -resize 50% ${resizeImagePath}`)
            ])
        }

        // 画像を取得
        const [originalByteArray, resizeByteArray] = await Promise.all(
            [originalImagePath, resizeImagePath]
                .map((imagePath) => fs.readFile(imagePath))
        )

        // Content-Type も付与する
        let contentType: string
        switch (imageExtension) {
            case ".jpg":
            case ".jpeg":
                contentType = 'image/jpeg'
                break
            case ".png":
                contentType = 'image/png'
                break
            default:
                // 知らない拡張子の場合は image/ をくっつけて返す
                contentType = `image/${imageExtension.replace('.', '')}`
                break
        }

        // 2つの画像で同じ UUID になるように
        // パスは /original と /resize
        const fileName = `${randomUUID()}${imageExtension}`
        const originalPut = new PutObjectCommand({
            Bucket: RESULT_S3_BACKET_NAME,
            Key: `original/${fileName}`,
            Body: originalByteArray,
            ContentType: contentType
        })
        const resizePut = new PutObjectCommand({
            Bucket: RESULT_S3_BACKET_NAME,
            Key: `resize/${fileName}`,
            Body: resizeByteArray,
            ContentType: contentType
        })

        // 出力先 S3 にアップロード
        await Promise.all([s3.send(originalPut), s3.send(resizePut)])
    } catch (error) {
        console.log(error)
    }
}
```

#### ContentType
を指定しないと、ブラウザで画像`URL`を開いたときに、画像ではなくダウンロード画面が表示されます。  
詳しくは

https://takusan.negitoro.dev/posts/aws_s3_metadata_edit_nodejs/

### zip にする
`index.js`と`index.js.map`を一つの`zip`にしてくれるコマンドを`scripts`で定義したので、これを叩けば`dist.zip`が出来上がるはずです。

```shell
npm run build
```

![Imgur](https://imgur.com/YU2Jqbg.png)

#### 画像が UltraHDR かどうかの判定
そのまま`ImageMagick`に入れると`jpeg`で処理されるため、`gainmap`が消えちゃう、（`uhdr:`指定が必要）。  
`UltraHDR`を配信するために`S3+CloudFront`にしているのに、、、

というわけで、`exec()`の段階で`UltraHDR`画像かを判定する必要がある。
バイナリエディタを眺めてた結果、`GainMap`ってバイト配列の文字列が入っていたので、このバイト配列があるかで判定すれば良いはず。  
**あんまり自信ないけど自分しか使わないし！**  

![Imgur](https://imgur.com/p9JZzs6.png)

それがこれです。

```ts
const GAINMAP_TEXT_BYTE = Buffer.from('GainMap', 'utf8')
const imageByteArray = await fs.readFile('nomikai.jpg') // 画像パス
const hasGainMap = imageByteArray.includes(GAINMAP_TEXT_BYTE) // GainMap があれば UltraHDR
```

### Lambda を作る
`Lambda`の作成ページを開いて、適当な名前をつけ、`x86_64`を選び、ロールはさっき作ったものを選びます。

![Imgur](https://imgur.com/zaDCauq.png)

あとは`関数を作成`を押せばいいです、  
できたら`アップロード先`を押して`.zip`をアップロードします。

![Imgur](https://imgur.com/EBiRrwa.png)

![Imgur](https://imgur.com/aZ2RR1B.png)

### Lambda 環境変数追加
**保存先バケットの名前**を環境変数から取り出すようにします。  
ここの`ENVIRONMENT VARIABLES`の`+`から以下の名前でバケット名を入れてください。

![Imgur](https://imgur.com/QBrArvp.png)

<span style="color:red">間違えても受け付け用バケットの名前を入れないように！（無限ループする）</span>

### LambdaLayer を追加
ここの`Layer`を押すとスクロールするので、`レイヤーの追加`からさっきアップロードした`LambdaLayer`を選択する。

![Imgur](https://imgur.com/EL12CUy.png)

![Imgur](https://imgur.com/39yOuPZ.png)

### メモリ上限とタイムアウトを緩和する
`ImageMagick`を`Lambda`のデフォルトスペックで動かすと厳しいっぽい？  

```plaintext
Error: Task timed out after 3.00 seconds
```

というわけでメモリ割り当てとタイムアウトを増やします、設定を開きます。  
10秒くらいで終わらせるためには`2GB (2048MB)`欲しいですね。。

![Imgur](https://imgur.com/74TvaiP.png)

よく見ると`10GB`まで使えるらしいですが、私の`AWS`アカウントだと`3GB`までしか使えませんでした！ｗ。
サポートに言えば解禁してくれるらしいです。

## テスト
`テスト`を選ぶ。  
よしなに名前をつけて、`JSON`は以下を貼り付けてください。が、一部直して貰う必要があります！！

```json
{
  "Records": [
    {
      "eventVersion": "2.0",
      "eventSource": "aws:s3",
      "awsRegion": "ap-northeast-1",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "responseElements": {
        "x-amz-request-id": "EXAMPLE123456789",
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "testConfigRule",
        "bucket": {
          "name": "受け付け用バケットの名前",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          },
          "arn": "受け付け用バケットの arn"
        },
        "object": {
          "key": "受け付け用バケットにアップロードした画像のkey （名前）",
          "size": 1024,
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901"
        }
      }
    }
  ]
}
```

できたら`保存`からの`テスト`で。スペックを上げたので10秒くらいで終わるはず。

![Imgur](https://imgur.com/2VCb7le.png)

## テストうごいた！
保存先バケットを開いてみてください。`original/`と`resize/`にちゃんと入っているはず！

![Imgur](https://imgur.com/w4m0LsO.png)

## 受け付け用バケットに画像が入ったら Lambda が起動するように
https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/with-s3-tutorial.html#with-s3-tutorial-configure-s3-trigger

`Lambda`の`トリガーを追加`を押します。

![Imgur](https://imgur.com/UwKQw3W.png)

そしたら`S3`を選んで

![Imgur](https://imgur.com/S8jY0bD.png)

`バケット`は受け付け用バケットに、`すべてのオブジェクト作成イベント`になってることを確認して、  
一番下にあるチェックマークにチェックを入れて、`追加`。

これで`S3`がいます！  
![Imgur](https://imgur.com/VxjBp56.png)

# 受け付け用バケットに入れてもうごく！
`S3`の画面に`JPEG`をどーーん

![Imgur](https://imgur.com/bIqaSs8.png)

`Lambda`の`モニタリング`の`Invocations`を見ると呼び出されてるのが分かるはず。  

![Imgur](https://imgur.com/REPH6NZ.png)

# 受け付け用バケットは勝手に削除されるように
https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html  
`ライフサイクル`機能があります。

今回は受け付け用バケットで、特に保護とかは興味がないので、バージョニングは無効です。  
無効にしている場合、上記の URL を見る限りライフサイクルがトリガーされ期限切れになったら、削除になるらしい（バージョニング無効なので）

というわけで追加します。**受け付け用バケットでやること。**  
作成を押します。

![Imgur](https://imgur.com/NsAlq4J.png)

`バケット内のすべてのオブジェクトに適用`にして、`オブジェクトの現行バージョンを有効期限切れにする`にチェックを入れます。  
日数はお好みで、まあ`1日`でも長いんですが

![Imgur](https://imgur.com/PWz3J8z.png)

ここもよく見ると、バージョニング無効の場合は有効期限切れが削除になるって。  
これでオブジェクトをアップロードしてみると、削除日時が表示されます。

![Imgur](https://imgur.com/JhF6Mqy.png)

# 完成
あとは保存先バケットを`CloudFront`で公開するなりすれば画像を配信する超簡易的サーバーの完成。  
`S3+CloudFront`は前に記事にしたのでそれで！！！

# おまけ CloudFront で公開する手順
詳しくは前書いた`S3 + CloudFront`で静的サイトの記事で。`CloudFront Functions`は不要です。  
https://takusan.negitoro.dev/posts/aws_sitatic_site_hosting/

- `CloudFront`のディストリビューションを作る
    - オリジンをリサイズ後の画像が保存される`S3`バケット
    - `S3`は公開しないので`OAC`を選ぶ
- ディストリビューションができたら、バケットポリシーの JSON がコピーできるので、保存先`S3`のバケットポリシーに貼り付ける
    - ![Imgur](https://imgur.com/04MWSxY.png)
    - ![Imgur](https://imgur.com/cUfza2n.png)
- デプロイされるまで待つ（最終変更日が表示される）
- ディストリビューションドメイン名 + `S3`の画像のキー をくっつけた URL でアクセス、画像が返ってくること。
    - ディストリビューションドメイン名をコピーする
    - `S3`にある画像を選んでキーをコピーする
- ドメインを割り当てる場合は最初にディストリビューションの設定を開き、`Custom SSL certificate - optional`の`Request certificate`を押す
    - パブリックを選び、`完全修飾ドメイン名`を埋めて、`DNS 検証`にして、リクエスト
    - `CNAME 名`と`CNAME 値`が表示されるので、自分のドメイン管理画面（私は`Cloudflare`）を開き`DNS レコード`を追加する。
        - `CNAME`を選んで、名前と値は`AWS`に指示されたものを
            - ![Imgur](https://imgur.com/wSH3Tbh.png)
    - これは`AWS`がドメインを所持しているかの確認のためで、自分のドメインで`CloudFront`を使うためには別の作業がいる
- 自分のドメインで`CloudFront`にアクセスできるようにするため、再度`DNS レコード`を追加する
    - `CNAME`を選び、サブドメインなら名前欄に入れる、値は`CloudFront ディストリビューション`の`ディストリビューションドメイン名`を入れる
        - ![Imgur](https://imgur.com/pFAefP0.png)
- `DNS`での確認が終わって、`AWS`の`SSL 証明書`が使えるようになったら、`CloudFront ディストリビューション`の管理画面を開き、`Custom SSL certificate - optional`ではさっき作った証明書を、`Alternative domain name (CNAMEs) - optional`で使いたいドメインを入れます。
    - `代替ドメイン名`と`カスタム SSL 証明書`が表示されてるはず
    - ![Imgur](https://imgur.com/UWyfS5w.png)
- 自分のドメインでもアクセスできるようになったはず

# おわりに
`AWS Lambda`で使ったソースコードです、`npm i`からの`npm run build`で`zip`が出来るので、説明通りデプロイして環境変数をセットすれば良いはず。  

https://github.com/takusan23/oekakityou-lambda

# おわりに2
ちなみに、自分ひとりしか使わないのでバリデーションとか一切していません。  
不特定多数に使わせる場合はちゃんと整備したほうが良いと思います。

# おわりに3
`S3`のコンソールにアクセスしないと画像わからんし、アップロードのためにコンソールログインするのもあれなので、次回はそれを解決します。  
超簡易的画像配信サーバーのクライアント編。