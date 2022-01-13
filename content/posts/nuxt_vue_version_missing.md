---
title: Vue packages version mismatch を直す
created_at: 2021-03-02
tags:
- Vue
- NuxtJS
---

`npm audit fix`したらこうなった

# 本題

```
✖ Nuxt Fatal Error                                                                   
                                                                                      
Error:                                                                                
                                                                                      
Vue packages version mismatch:                                                        
                                                                                      
- vue@2.6.11                                                                          
- vue-server-renderer@2.6.12                                                          
                                                                                      
This may cause things to work incorrectly. Make sure to use the same version for both.
```

はい

# 直し方
`vue`のバージョンをあげます

```
npm i vue
```

`+ vue@2.6.12`とか出てればおｋだと思う

これで実行できると思いきや、できない

```
Vue packages version mismatch:

- vue@2.6.12
- vue-template-compiler@2.6.11
```

というわけで`npm i vue-template-compiler`の方もバージョンをあげます

```
npm i vue-template-compiler
```

これで実行できるようになりました。おつ