import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const response = NextResponse.next(request);

	if (process.env.NODE_ENV === "development") {
		response.headers.set("Access-Control-Allow-Origin", "*");
	}

	return response;
}
