---
title: 2023年まとめ
created_at: 2023-12-31
tags:
- 年末
---

間に合いませんでした。どうもこんばんわ。  
今年はなんか４ぬほど暑かった気がする。

今年あんまりというか何もやって無くない？  
去年は突発で作ったので内容0でしたが、今回はネタ用意してきました、が大遅刻です

この記事には`Pixel 8 Pro`で撮影した**Ultra HDR**画像が含まれます。  
**Ultra HDR**が表示可能なディスプレイで見ている方、いきなり画面が光って眩しくなります、びっくりしないでください。

# 買ったもの
まーこれやるとガジェット系ばっかなのでそれ以外で！  

## 非ガジェット系

### お一人様 Misskey
`Amazon Lightsail`で動いてます。  
`Twitter`と一緒に沈む予定でしたが辞めました。`VPS`で何か動いているという体験はプライスレス（（？））  
円安ひどいですが、おそらく`Twitter`にお金払うよりはお一人様動かしてたほうが幸せになれる気がする。

### えっちげーむそんぐの CD
最近はエロゲの豪華版買わないと付いてこないパターンが増えてきてお高い。  
`CD`単品で出して；；

![Imgur](https://imgur.com/9R8WswI.png)

ガジェット系以外だと以上です、あんまり買ってないというか覚えてないかも。

## ガジェット系
ハイエンドを二台も買ったのでお金ないです。  
回線は去年と同じです、からあげクンを買うとギガが付いてくる`povo`助かる。オンライン限定プランでも`5G SA`提供して欲しい、、、

### Xperia 1 V
`5G SA`と`5G ミリ波`ために買いました。  
どっちも要らなければ`SIM フリー版`を買うと良いと思います。私は`NewRadioSupporter`で必要だったので、、、、お高い！！  
ドコモの場合は`5G SA`申し込むと必要なら無料で新しい`SIMカード`を送ってくれるみたい（端末料金しか支払ってない気がする）。オンラインじゃなくて店舗の場合は知らないです。  

![Imgur](https://imgur.com/XO4VLzQ.png)

本機から？ついに**持ち上げてスリープ解除**が実装されて、これだけでも買ってよかった。  
（ハイエンドモデルなのに無くて困ってたんですよね、ついに実装されたみたい）

![Imgur](https://imgur.com/SrmiPWO.png)

カメラはすごくなってる。  
`Xperia`のカメラって何も設定しない状態だとホワイトバランスが変になりがちなので、マニュアルにしてホワイトバランスくらいは一番近いのを選んだほうが良い気がしたんですが、  
今回はそれすらしなくてもいい感じにとれます。

たまにポケットの中で勝手に反応するのは未だに直ってないです。  
まあこれは`5 II`や`Pro-I`でもなってたのでそういうものだと思ってます。

（`Pro-I`よりも軽いの感動した）

### Pixel 8 Pro
`Ultra HDR`と`AV1`エンコーダーがすごい。あと今後の更新で音声がビットパーフェクトで出力できるようになるとかなんとか。  
`Pixel 6 Pro`で不満ないけど買っちゃった。まあ`Pixel`シリーズは奇数番のときはマイナーアップデートが多いので偶数のときに買っちゃえ的な。  

`Ultra HDR`には感動。写真が光ってる（？）。  

![ultrahdr](https://raw.githubusercontent.com/takusan23/AndroidUltraHdrApi/master/PXL_20231224_085621257.jpg)  
（2MB のクソデカ画像すいません）  
（六本木ヒルズ けやき坂 の近くを通ったので撮ってみた。一人で行くような場所ではない）

`Ultra HDR`用の`API`があるので遊べそうです。  
https://github.com/takusan23/AndroidUltraHdrApi

![Imgur](https://imgur.com/KbTDyMC.png)

![Imgur](https://imgur.com/NySkDxe.png)

`Pixel 6 Pro`よりは電波マシになった気がする、けど相変わらず`5G`に積極的に繋ぎに行ってくれない気がする（↑の`Xperia`あるし気にしてないです）。  
スマホでゲームしないので特に不満無いです。[^1]

# 雑談

## パソコンのディスプレイの話
机広くないので、お下がりのスクエアディスプレイを二個並べてたんですが、どっちも壊れてしまったので、これまたお下がりの`16:9ディスプレイ`一枚を使ってます。  
壊れたディスプレイ、はよどうにかしたい

で、やっぱ一枚だと若干不便ですね。二枚目に`音楽プレイヤー`を常駐させていたので...  
そんなわけで、仮想デスクトップ入門しました。もうこれで満足です。

仮想デスクトップの切り替えショートカットが分からない問題があるのですが、この問題は**自作で切り替えアプリ**を作ったので困ってません。  
**スマホのフリック操作と同じ感じ**で、仮想デスクトップの切り替えができます。`Win`+`Ctrl`を同時押しで最前面に開くようにしたので、快適快適。  

`Windows App SDK`で作りました。`UI`きれいなのでもっと流行って欲しい。。。

<video src="https://github.com/takusan23/DesktopLine/assets/32033405/fcd1ea41-09ed-4581-9548-77a2a8f2cc75" width="80%" controls></video>

## Twitter API の話
大昔に`TweetReader`とかいう、`Android`で見るだけの`Twitter`クライアントを作ってたんですけど、  
https://github.com/takusan23/TweetReader

`1.1 API`のまま放置してたらついに動かなくなりました、ついでにコンシューマキーも`SUSPENDED`状態になりました。  
`1.1 API`を使ってるからなのか、そもそも規約違反（クライアントを作ったらBAN）のどちらかで`SUSPENDED`になるらしいですが、おそらく後者でしょう（？）。

![Imgur](https://imgur.com/4vO1tvM.png)

`TweetDeck`も無くなっちゃった、、、もう誰も`334`なんてしてないよね？  
そういえば新しい`TweetDeck`には`Activity`のカラムが無いらしいですね、メリット更に無くなって笑う

## このブログの話
`Material-UI` → `Tailwind CSS`にしました。  
前話したとおりです。

それと、このブログのホスティングサービスが`Netlify`から`Amazon S3 + CloudFront`になりました。  
`2023/12`から向き先が`Amazon CloudFront`になっています。早い！！！

`Netlify`と違って、`Amazon CloudWatch`とかでアクセス数とかが見れるのが面白いと思いました。  
が、`Next.js`で出来たサイトなので、1アクセスで複数のファイル（`favicon / js / フォント`など）をリクエストするので、何回ページが表示されたか。みたいなことには向いて無さそう？  

## NewRadioSupporter の話
去年はデュアルSIM対応、今年はウィジェット対応をしました。  
`Android Jetpack Glance`はウィジェット開発の敷居が一気に下がったので試してみるべきです。

あ！！！  
`Google`さん、もし見てたら`PhysicalChannelConfig`を`公開 API`にしてください！！  
`*#*#4636#*#*`で開く画面の、**物理チャンネルの構成:**の表示でこの`API`を使ってるんですが、今のところプリインストールアプリしか使えない権限で保護されてて無理になってる。  
https://developer.android.com/reference/android/telephony/PhysicalChannelConfig

これがあると多分`LTEのキャリアアグリゲーション`の表示や、`EN-DC`のプライマリセルの`バンド`の表示、`Sub6-CA`の表示が出来るはず？なので何とかなりませんか・・・  
特に`Sub6-CA`の表示機能欲しいんで付けたいんですけど公開してくれないかな

![Imgur](https://imgur.com/HxwiGNm.png)

![Imgur](https://imgur.com/BQ7kJGj.png)

## PlayStore
今年なんか審査厳しいなって思ってたら、新規で開発アカウントを作る際の条件がくっそ厳しくなりましたね。  
20人集めてアプリを入れてもらってそれを14日間連続で起動しないといけないらしい。  
うーん、**マニアックなアプリ**だと集めるのほぼ不可能じゃないかなあ、、、

https://www.reddit.com/r/androiddev/comments/17rjgqh/

# 聞いた曲
あんまり変化無いかな思ってたけどそんな事なかった  

![Imgur](https://imgur.com/6tfYSuQ.png)

# 記事
2023 年書いた記事です

[Pixel 8 の AV1 ハードウェアエンコーダーを使ってみた](/posts/android_video_av1_pixel_8_hardware_encoder/)  
[秋葉原のエロゲショップめぐり 2023年 年末版](/posts/r5_akiba_eroge_shop/)  
[JavaScript の MediaRecorder で出来る WebM をシークできるようにする Kotlin/JS](/posts/kotlin_js_fix_javascript_mediarecorder_webm_seek/)  
[Play Console のフォアグラウンドサービスの権限を申告してみた](/posts/android_foreground_service_permission_play_console/)  
[CloudFront と S3 で静的サイトホスティングをする](/posts/aws_sitatic_site_hosting/)  
[わたし用メモ Android 初期設定](/posts/android_setup_memo/)  
[Kotlin の out T とか Nothing とかを理解したい](/posts/kotlin_class_generics_sealed/)  
[Play ストアでバックグラウンド位置情報取得権限 ACCESS_BACKGROUND_LOCATION を使うアプリを公開してみた](/posts/android_background_location_play_console/)  
[NewRadioSupporter にウィジェットを追加するため Glance を使ってみた](/posts/android_glance_new_radio_supporter/)  
[運転免許証を更新してきた](/posts/driver_license_kousin_syokai/)  
[Android Studio (IDEA) で行をコピーして貼り付けると上の行に貼り付けられる](/posts/android_studio_paste_setting/)  
[Kotlin Coroutines の Flow で collect したら別の Flow を collect したい](/posts/kotlin_coroutines_flow_latest/)  
[Tailwind CSS で作り直そうとしている](/posts/tailwind_css_migration/)  
[夏休みの自由研究 通常版とカラオケ版トラックを使ってボーカルだけの音楽を作る](/posts/summer_vacation_music_vocal_only/)  
[curl で 200 返ってくるのに、Node.js でリクエストすると 403 が返ってくる件の調査](/posts/curl_successful_httpclient_error/)  
[Misskey サーバーをお引越したメモ](/posts/misskey_server_ohikkosi/)  
[AWS の Lightsail でお一人様 Misskey サーバーを立ててみた (v10)](/posts/misskey_ohitorisama/)  
[CloudFront が使えないので AWS サポートセンターにお願いしてきた](/posts/aws_support_center/)  
[Next.js の AppRouter に移行する](/posts/next_js_13_app_router_migration/)  
[WinUI 3 で出来たアプリを配布する（インストーラー / zip を作る）](/posts/windows_winui3_installer_and_virtual_desktop/)  
[Cloudflare Pages と Next.js（静的書き出し）](/posts/cloudflare_pages_next_js/)  
[AndroidでCanvasから動画を作る](/posts/android_canvas_to_video/)  
[SMBCデビットで利用制限対象取引になったので電話で解除してもらった](/posts/smbc_debit_error/)  
[Android で前面と背面を同時に撮影できるカメラを作りたい](/posts/android_front_back_camera/)  
[AndroidでMediaCodecを利用して動画の上に文字をかさねる](/posts/android_add_canvas_text_to_video/)  
[Androidで新規プロジェクトを作ると何もしていないのに壊れた](/posts/android_new_project_jdk_error/)  
[GitHub Actions でビルドして Netlify で公開する](/posts/github_actions_netlify/)  
[AndroidのNonNullアノテーションはnullを返す場合があり、Kotlinで問題になる話](/posts/android_nonnull_annotation_kotlin/)  

# 以上です
また来年会いましょう。  
ニコ生主が立て続けに居なくなってしまって悲しい。  

[^1]: 最後にやったスマホゲーム、バトルガールハイスクールかも