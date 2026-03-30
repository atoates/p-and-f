import { NextResponse } from "next/server";

export function middleware() {
  // Allow all access for now — auth protection will be added
  // once the database tables are created and seeded
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
