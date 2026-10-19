import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type RightLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  rightId: string;
  fallbackQuery?: string;
  children: ReactNode;
};

/** Ordinary links preserve browser history, new tabs and keyboard navigation. */
export function RightLink({ rightId, fallbackQuery, children, ...props }: RightLinkProps) {
  const query = fallbackQuery ?? (typeof children === "string" ? children : rightId);
  const href = rightId
    ? `/rechten/${encodeURIComponent(rightId)}`
    : `/rechten/verkennen?q=${encodeURIComponent(query)}`;
  return <Link {...props} href={href} prefetch={false}>{children}</Link>;
}
