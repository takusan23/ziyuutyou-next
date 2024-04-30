import { PortfolioDetailData } from "../../src/data/PortfolioData"
import NextLinkButton from "../NextLinkButton"

/** カテゴリに含まれる一覧の各アイテム。画像付きのやつ */
export function PortfolioItem({ name, description, link, image, github }: PortfolioDetailData) {
    return (
        <div className="flex flex-row p-3 space-x-4 rounded-3xl bg-background-light dark:bg-background-dark">

            {/* 画像 */}
            <img
                className="basis-2/5 max-h-40 object-cover aspect-square border-[1px] rounded-3xl border-content-primary-light dark:border-content-primary-dark"
                src={image}
            />

            <div className="basis-3/5 flex flex-col space-y-4 overflow-hidden">

                {/* 名前と説明 */}
                <div className="grow">
                    <h3 className="truncate text-content-primary-light dark:text-content-primary-dark text-2xl">
                        {name}
                    </h3>
                    <p className="text-content-text-light dark:text-content-text-dark">
                        {description}
                    </p>
                </div>

                {/* ボタンたち。github はあれば表示 */}
                <div className="flex flex-row flex-wrap space-x-2 justify-end">

                    {
                        github && <NextLinkButton
                            text="GitHub"
                            variant="outlined"
                            href={github} />
                    }

                    <NextLinkButton
                        text="リンクを開く"
                        href={link} />
                </div>
            </div>
        </div>
    )
}