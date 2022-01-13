---
title: Jetpack Compose ダークモード時に真っ白
created_at: 2021-10-31
tags:
- Android
- JetpackCompose
- Kotlin
---

どうもこんばんわ。

# 本題
ダークモード時に黒くならない

![Imgur](https://imgur.com/tHm9Hog.png)

# 直し方

`Surface`で囲ってあげます。`material3`を入れている場合は`material3`の方の`Surface`で囲ってあげてください。

```kotlin
Surface {
    Column(modifier = Modifier.padding(10.dp)) {
        SetupButtons(
            modifier = Modifier
                .fillMaxWidth(),
            text = stringResource(id = R.string.launch_server),
            icon = painterResource(id = R.drawable.ic_outline_file_download_24),
            description = stringResource(id = R.string.launch_server_description),
            onClick = { onNavigate(NavigationLinkList.ServerSetupScreen) }
        )
        SetupButtons(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp),
            text = stringResource(id = R.string.launch_client),
            icon = painterResource(id = R.drawable.ic_outline_file_upload_24),
            onClick = { onNavigate(NavigationLinkList.ClientSetupScreen) }
        )
    }
}
```

![Imgur](https://imgur.com/EnBTZRz.png)

以上です。お疲れさまでした。