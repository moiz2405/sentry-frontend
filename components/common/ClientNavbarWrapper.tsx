"use client";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function ClientNavbarWrapper() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  if (pathname === "/auth/sign-in") return null;
  return <Navbar />;
}
