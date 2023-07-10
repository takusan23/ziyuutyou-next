import { Metadata } from "next";
import ClientNotFoundPage from "./ClientNotFoundPage";
import EnvironmentTool from "../src/EnvironmentTool";

/** <head> に入れる値 */
export const metadata: Metadata = {
    title: `404 - ${EnvironmentTool.SITE_NAME}`
}

/** 404ページ */
export default function NotFound() {
    return <ClientNotFoundPage />
}