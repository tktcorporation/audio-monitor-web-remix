import { createCookieSessionStorage } from "@remix-run/node";

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    secure: process.env.NODE_ENV === "production",
    secrets: ["s3cr3t"],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => session.get("theme") || "light",
    setTheme: (theme: string) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}