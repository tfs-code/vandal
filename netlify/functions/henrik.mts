import type { Config } from "@netlify/functions";

export default async (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/henrik\//, "");
    const target = `https://api.henrikdev.xyz/${path}${url.search}`;

    const res = await fetch(target, {
        headers: { Authorization: process.env.HENRIK_API_KEY ?? "" },
    });

    return new Response(res.body, {
        status: res.status,
        headers: {
            "content-type": res.headers.get("content-type") ?? "application/json",
        },
    });
};

export const config: Config = {
    path: "/api/henrik/*",
};
