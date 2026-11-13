import Image from "next/image";
import Link from "next/link";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 36, className = "" }: LogoMarkProps) {
  return (
    <Image
      src="/logo-mark.svg"
      alt="NOVA"
      width={size}
      height={size}
      priority
      className={`shrink-0 rounded-xl ${className}`}
    />
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export function Logo({ size = "md", href, className = "" }: LogoProps) {
  const markSize = size === "sm" ? 30 : size === "lg" ? 44 : 36;
  const textSize =
    size === "sm"
      ? "text-sm"
      : size === "lg"
      ? "text-xl sm:text-2xl"
      : "text-base";

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-[#0f172a] ${textSize}`}>
          NOVA <span className="font-semibold text-[#475569]">Finance</span>
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
