import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import heroLogo from "@/assets/crabi-logo.png";

const baseNavLinks = [
  { label: "Home", to: "/" as const, key: "home" },
  { label: "Find Vans", to: "/find-vans" as const, key: "find-vans" },
  { label: "Schedules", to: "/schedules" as const, key: "schedules" },
  { label: "My Bookings", to: "/my-bookings" as const, key: "my-bookings" },
  { label: "Support", to: "/" as const, key: "support" },
] as const;

type HeaderProps = {
  activeLink?:
    | "find-vans"
    | "my-bookings"
    | "schedules"
    | "home"
    | "driver-register"
    | "driver-portal"
    | "admin"
    | "admin-drivers";
  variant?: "default" | "hero";
};

function getInitials(email: string) {
  const name = email.split("@")[0] ?? "U";
  return name.slice(0, 2).toUpperCase();
}

export function Header({
  activeLink = "home",
  variant = "default",
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, loading, profileReady, signOut, isAdmin, isDriver } = useAuth();
  const isHero = variant === "hero";
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 80],
    isHero
      ? ["rgba(0,0,0,0)", "rgba(255,255,255,0.72)"]
      : ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.72)"],
  );
  const headerBlur = useTransform(scrollY, [0, 80], [0, 20]);
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255,255,255,0)", "rgba(0,0,0,0.08)"],
  );
  const textDark = useTransform(scrollY, [0, 60], [0, 1]);
  const backdropFilter = useTransform(
    headerBlur,
    (v) => `blur(${v}px) saturate(180%)`,
  );
  const borderBottom = useTransform(headerBorder, (v) => `1px solid ${v}`);

  const showDriverPortal = profileReady && isDriver;
  const showAdminPortal = profileReady && isAdmin;

  const navLinks = [
    ...baseNavLinks,
    ...(showDriverPortal
      ? [
          {
            label: "Driver Portal",
            to: "/driver" as const,
            key: "driver-portal" as const,
          },
        ]
      : []),
    ...(showAdminPortal
      ? [{ label: "Admin", to: "/admin" as const, key: "admin" as const }]
      : []),
  ];

  async function handleSignOut() {
    await signOut();
    await navigate({ to: "/" });
  }

  return (
    <motion.header
      style={
        isHero
          ? {
              backgroundColor: headerBg,
              backdropFilter,
              borderBottom,
            }
          : {
              backgroundColor: headerBg,
              backdropFilter,
            }
      }
      className={cn(
        "inset-x-0 top-0 z-50",
        isHero ? "fixed" : "sticky border-b border-black/5",
      )}
      initial={isHero ? { y: -20, opacity: 0 } : false}
      animate={isHero ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <nav className="mx-auto grid h-11 max-w-245 grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-8">
        <div className="flex items-center justify-self-start">
          <Link
            to="/"
            className={cn(
              "inline-flex items-center gap-2 leading-none",
              !isHero && "text-[#1d1d1f]",
            )}
          >
            <HeroText isHero={isHero} scrollProgress={textDark}>
              <span className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden">
                <img src={heroLogo} alt="" className="size-10 object-contain" />
              </span>
              <span className="text-[17px] font-semibold tracking-tight">
                Crabi
              </span>
            </HeroText>
          </Link>
        </div>

        <ul className="hidden items-center gap-0.5 justify-self-center md:flex">
          {navLinks.map((link) => (
            <li key={link.key}>
              <Link
                to={link.to}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 text-xs leading-none font-normal transition-colors",
                  !isHero &&
                    cn(
                      "text-[#1d1d1f]/80 hover:text-[#0066cc]",
                      activeLink === link.key && "text-[#0066cc]",
                    ),
                )}
              >
                <HeroText isHero={isHero} scrollProgress={textDark}>
                  {link.label}
                </HeroText>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end gap-2">
          {showDriverPortal && (
            <Link
              to="/driver"
              className={cn(
                "inline-flex h-8 items-center rounded-md px-2.5 text-xs leading-none font-normal transition-colors md:hidden",
                !isHero &&
                  cn(
                    "text-[#1d1d1f]/80 hover:text-[#0066cc]",
                    activeLink === "driver-portal" && "text-[#0066cc]",
                  ),
              )}
            >
              <HeroText isHero={isHero} scrollProgress={textDark}>
                Driver
              </HeroText>
            </Link>
          )}
          {showAdminPortal && (
            <Link
              to="/admin"
              className={cn(
                "inline-flex h-8 items-center rounded-md px-2.5 text-xs leading-none font-normal transition-colors md:hidden",
                !isHero &&
                  cn(
                    "text-[#1d1d1f]/80 hover:text-[#0066cc]",
                    activeLink === "admin" && "text-[#0066cc]",
                  ),
              )}
            >
              <HeroText isHero={isHero} scrollProgress={textDark}>
                Admin
              </HeroText>
            </Link>
          )}
          {loading ? (
            <HeroMuted isHero={isHero} scrollProgress={textDark}>
              ...
            </HeroMuted>
          ) : user ? (
            <>
              <div
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] leading-none font-semibold",
                  !isHero && "bg-[#f5f5f7] text-[#1d1d1f]",
                  isHero && "bg-white/20 text-white",
                )}
                title={user.email ?? "Account"}
              >
                {getInitials(user.email ?? "user")}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hidden h-8 px-3 text-xs leading-none sm:inline-flex",
                  !isHero &&
                    "text-[#0066cc] hover:bg-transparent hover:text-[#0077ed]",
                  isHero && "text-white/90 hover:bg-white/10 hover:text-white",
                )}
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className={cn(
                  "hidden h-8 items-center text-xs leading-none transition-colors sm:inline-flex",
                  !isHero && "text-[#1d1d1f]/80 hover:text-[#0066cc]",
                )}
              >
                <HeroText isHero={isHero} scrollProgress={textDark}>
                  Sign In
                </HeroText>
              </Link>
              {isHero ? (
                <HeroSignUpButton scrollProgress={textDark} />
              ) : (
                <Button
                  size="sm"
                  className="inline-flex h-8 items-center rounded-full bg-[#0071e3] px-4 text-xs leading-none font-normal text-white hover:bg-[#0077ed]"
                  asChild
                >
                  <Link to="/sign-up">Sign Up</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

function HeroSignUpButton({
  scrollProgress,
}: {
  scrollProgress: ReturnType<typeof useTransform<number, number>>;
}) {
  const backgroundColor = useTransform(
    scrollProgress,
    [0, 1],
    ["rgba(255,255,255,0.22)", "rgba(0,113,227,1)"],
  );

  return (
    <motion.div
      style={{ backgroundColor }}
      className="inline-flex overflow-hidden rounded-full backdrop-blur-sm"
    >
      <Link
        to="/sign-up"
        className="inline-flex h-8 items-center px-4 text-xs leading-none font-normal text-white transition-opacity hover:opacity-90"
      >
        Sign Up
      </Link>
    </motion.div>
  );
}

function HeroText({
  children,
  isHero,
  scrollProgress,
}: {
  children: ReactNode;
  isHero: boolean;
  scrollProgress: ReturnType<typeof useTransform<number, number>>;
}) {
  const color = useTransform(
    scrollProgress,
    [0, 1],
    ["rgba(255,255,255,1)", "rgba(29,29,31,1)"],
  );

  if (!isHero) {
    return <span className="inline-flex items-center gap-2">{children}</span>;
  }

  return (
    <motion.span className="inline-flex items-center gap-2" style={{ color }}>
      {children}
    </motion.span>
  );
}

function HeroMuted({
  children,
  isHero,
  scrollProgress,
}: {
  children: ReactNode;
  isHero: boolean;
  scrollProgress: ReturnType<typeof useTransform<number, number>>;
}) {
  const color = useTransform(
    scrollProgress,
    [0, 1],
    ["rgba(255,255,255,0.7)", "rgba(134,134,139,1)"],
  );

  if (!isHero) {
    return (
      <span className="inline-flex h-8 items-center text-xs leading-none text-[#86868b]">
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className="inline-flex h-8 items-center text-xs leading-none"
      style={{ color }}
    >
      {children}
    </motion.span>
  );
}
