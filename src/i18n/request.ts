import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const supportedLocales = ["es", "en"] as const;
type Locale = (typeof supportedLocales)[number];

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;

  // 👇 OBLIGATORIO await
  const requestHeaders = await headers();
  const acceptLanguage = requestHeaders.get("accept-language");
  const browserLocale = acceptLanguage?.split(",")[0]?.split("-")[0] as
    | Locale
    | undefined;

  let locale: Locale = "es";
  if (supportedLocales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else if (supportedLocales.includes(browserLocale as Locale)) {
    locale = browserLocale as Locale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
