import getConfigDataV2 from "@/utils/getConfigDataV2";
import { cookies } from "next/headers";
import Main from "./Main";

export default async function NotFound({ params: { locale } }) {
  const area = cookies().get("area")?.value || "us";
  const { LANG } = await getConfigDataV2({
    locale,
    area,
    configList: ["language"],
  });

  return <Main LANG={LANG} />;
}
