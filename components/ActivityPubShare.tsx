// useState / onClick を使いたいのでクライアントコンポーネント
"use client"

import { useState } from "react"
import IconParent from "./IconParent"
import Button from "./Button"
import RoundedCornerBox from "./RoundedCornerBox"
import ShareIcon from "../public/icon/share.svg"
import CloseIcon from "../public/icon/close.svg"
import SendIcon from "../public/icon/send.svg"

/** ActivityPubShare に渡すデータ */
type ActivityPubShareProps = {
    /** タイトル */
    title: string
    /** URL */
    url: string
}

/** Mastodon / Misskey で共有するボタン。サーバー名入力コンポーネントがある */
export default function ActivityPubShare({ title, url }: ActivityPubShareProps) {
    const [isOpen, setOpen] = useState(false)

    return (
        <>
            {
                isOpen
                    ? <ActivityPubInputForm
                        onClose={() => setOpen(false)}
                        onSubmit={(serverName) => {
                            // Enter / ボタン押した時に呼ばれる
                            // 新しいタブで開く
                            const shareUrl = `https://${serverName}/share?text=${encodeURIComponent(title)}\n${encodeURIComponent(url)}`
                            window.open(shareUrl, '__blank')
                        }} />
                    : <ActivityPubShareButton
                        onClick={() => setOpen(true)} />
            }
        </>
    )
}

/** ActivityPubInputForm に渡すデータ */
type ActivityPubInputFormProps = {
    /** 閉じるを押した時に呼ばれる */
    onClose: () => void
    /** 投稿ボタン押したら呼ばれる */
    onSubmit: (serverName: string) => void
}

/** Mastodon / Misskey のサーバー名を入力するコンポーネント */
function ActivityPubInputForm({ onClose, onSubmit }: ActivityPubInputFormProps) {
    const [serverName, setServerName] = useState('')

    return (
        <RoundedCornerBox
            className="bg-container-primary-light dark:bg-container-secondary-dark"
            rounded="large">

            <form
                className="flex flex-row p-2 space-x-2"
                onSubmit={(ev) => {
                    ev.preventDefault()
                    // 空じゃないとき
                    if (serverName) {
                        onSubmit(serverName)
                    }
                }}>

                <button type="button" onClick={onClose}>
                    <IconParent className="fill-content-primary-light dark:fill-content-primary-dark">
                        <CloseIcon />
                    </IconParent>
                </button>

                <input
                    className="grow focus:outline-hidden bg-transparent text-content-text-light dark:text-content-text-dark w-40 border-b-2 border-b-content-primary-light dark:border-b-content-primary-dark"
                    placeholder="サーバー名を入力"
                    onChange={(ev) => setServerName(ev.target.value)}
                    value={serverName} />

                <button type="submit">
                    <IconParent className="fill-content-primary-light dark:fill-content-primary-dark">
                        <SendIcon />
                    </IconParent>
                </button>

            </form>
        </RoundedCornerBox>
    )
}

/** ActivityPubShareButton に渡すデータ */
type ActivityPubShareButtonProps = {
    /** ボタンを押したら呼ばれる */
    onClick: () => void
}

/** Mastodon / Misskey で共有するボタン */
function ActivityPubShareButton({ onClick }: ActivityPubShareButtonProps) {
    return (
        <div className="flex" onClick={onClick}>
            <Button
                variant="text"
                startIcon={<ShareIcon />}
                text="Mastodon / Misskey で共有" />
        </div>
    )
}