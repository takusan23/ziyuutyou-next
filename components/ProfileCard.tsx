import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import Image from 'next/image'
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import BookRounded from "@mui/icons-material/BookRounded"
import Link from "next/link"

/** アイコンと名前と記事一覧ボタンがあるやつ */
const ProfileCard = () => {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3
            }}
        >
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
            >
                <Grid item xs={12} sx={{ paddingTop: 1 }}>
                    <Avatar
                        alt="takusan_23"
                        sx={{ width: 75, height: 75 }}
                    >
                        <Image src="/icon.png" layout="fill" />
                    </ Avatar>
                </Grid>
                <Grid item xs={12} sx={{ paddingTop: 1 }}>
                    <Typography variant="h5">
                        たくさん / takusan_23
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ paddingTop: 1, paddingBottom: 1 }}>
                    <Link href="/posts/page/1">
                        <Button variant="contained" startIcon={<BookRounded />}>
                            記事一覧へ
                        </Button>
                    </Link>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default ProfileCard