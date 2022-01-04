---
title: このサイトについて
created_at: 2022-01-04
---

`JetpackCompose`に似てる`React`やってみたいなーって感じで`Next.js`で書き直しています。正月休み短いってば

いやマジで`JetpackCompose`やん`React`。**CSSがダルい**以外で差があんまりない。

```kotlin
@Composable
fun ExpandedText(){
    val isExpanded by remember{ mutableStateOf(false) }

    Column {
        Text(text = "Hello")
        if(isExpanded){
            Text(text = "World")
        }
        Button(
            onClick = {isExpanded = !isExpanded}
        ){ Text(text = "Open!") }
    }
}
```

```tsx
const ExpandedText = () => {
    const [isExpanded, setExpanded] = useState(false)

    return (
        <>
            <p>Hello</p>
            {
                isExpanded && <p>World</p>
            }
            <Button onClick={()=> setExpanded(!isExpanded)}>
                Open!
            </Button>
        </p>
    )
}

export default ExpandedText
```

# 利用している技術

後で書く