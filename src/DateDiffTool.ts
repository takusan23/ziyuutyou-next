/** 何日前？を計算するための関数がある */
class DateDiffTool {

    /**
     * 今の時間と比較して何日前かを計算する
     * 
     * @param diffTime yyyy-MM-dd 形式（ Date.parse でパースできる形式 ）
     * @returns 何日前か
     */
    static nowDateDiff(diffTime: string) {
        const fromDateTime = Date.parse(diffTime)
        const currentDateTime = Date.now()
        const diffTimeMs = currentDateTime - fromDateTime
        // ミリ秒 → 秒 → 分 → 時間 → 日
        const date = diffTimeMs / 1000 / 60 / 60 / 24
        // Intに変換する
        return Math.round(date)
    }

}

export default DateDiffTool