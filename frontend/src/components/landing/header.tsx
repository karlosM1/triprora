import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import heroLogo from "@/assets/crabr.png";

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
    | "articles"
    | "home"
    | "profile"
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
      <nav className="relative mx-auto flex h-11 max-w-245 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link
            to="/"
            className={cn(
              "inline-flex items-center gap-2 leading-none",
              !isHero && "text-[#1d1d1f]",
            )}
          >
            <HeroText isHero={isHero} scrollProgress={textDark}>
              <span className="inline-flex size-11 shrink-0 items-center justify-center">
                <img src={heroLogo} alt="" className="size-11 object-contain" />
              </span>
              <span className="text-[17px] font-semibold tracking-tight">
                Crabr
              </span>
            </HeroText>
          </Link>
        </div>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <MobileNavMenu
            navLinks={navLinks}
            activeLink={activeLink}
            isHero={isHero}
            scrollProgress={textDark}
            user={user}
            onSignOut={handleSignOut}
          />
          {loading ? (
            <HeroMuted isHero={isHero} scrollProgress={textDark}>
              ...
            </HeroMuted>
          ) : user ? (
            <>
              <Link
                to="/profile"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-[10px] leading-none font-semibold text-white ring-1 ring-black/5 transition-opacity hover:opacity-90"
                title={user.email ?? "Profile"}
              >
                {getInitials(user.email ?? "user")}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="hidden h-8 cursor-pointer rounded-full px-3 text-xs leading-none text-[#0066cc] hover:bg-[#0071e3]/10 hover:text-[#0077ed] sm:inline-flex"
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
                  "hidden h-8 items-center text-xs leading-none transition-colors md:inline-flex",
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
                  className="hidden h-8 items-center rounded-full bg-[#0071e3] px-4 text-xs leading-none font-normal text-white hover:bg-[#0077ed] md:inline-flex"
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

type NavLink = (typeof baseNavLinks)[number] | {
  label: string;
  to: string;
  key: HeaderProps["activeLink"];
};

function MobileNavMenu({
  navLinks,
  activeLink,
  isHero,
  scrollProgress,
  user,
  onSignOut,
}: {
  navLinks: NavLink[];
  activeLink: HeaderProps["activeLink"];
  isHero: boolean;
  scrollProgress: ReturnType<typeof useTransform<number, number>>;
  user: ReturnType<typeof useAuth>["user"];
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    setOpen(false);
    await onSignOut();
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md transition-colors md:hidden",
            !isHero && "text-[#1d1d1f]/80 hover:bg-black/5 hover:text-[#0066cc]",
          )}
        >
          <HeroText isHero={isHero} scrollProgress={scrollProgress}>
            <Menu className="size-5" />
          </HeroText>
        </button>
      </DrawerTrigger>
      <DrawerContent className="flex h-full max-h-svh min-h-0 w-[min(100vw-2rem,320px)] flex-col overflow-hidden bg-white p-0 data-[vaul-drawer-direction=right]:h-full">
        <DrawerHeader className="shrink-0 border-b border-black/5 px-4 py-4 text-left">
          <DrawerTitle className="text-[17px] font-semibold text-[#1d1d1f]">
            Menu
          </DrawerTitle>
        </DrawerHeader>
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              onClick={() => setOpen(false)}
              className={cn(
                "block w-full rounded-lg px-3 py-3 text-left text-[15px] font-normal whitespace-nowrap transition-colors hover:bg-[#f5f5f7]",
                activeLink === link.key
                  ? "text-[#0066cc]"
                  : "text-[#1d1d1f]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <DrawerFooter className="mt-0 shrink-0 border-t border-black/5 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {user.email ? (
              <p className="truncate text-[13px] text-[#86868b]">{user.email}</p>
            ) : null}
            <Button
              variant="ghost"
              className="h-10 w-full rounded-full text-[14px] font-normal text-[#0066cc] hover:bg-[#0071e3]/5 hover:text-[#0077ed]"
              asChild
            >
              <Link to="/profile" onClick={() => setOpen(false)}>
                Profile
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="h-10 w-full rounded-full text-[14px] font-normal text-[#0066cc] hover:bg-[#0071e3]/5 hover:text-[#0077ed]"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </DrawerFooter>
        ) : (
          <DrawerFooter className="mt-0 shrink-0 border-t border-black/5 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              className="h-10 w-full rounded-full bg-[#0071e3] text-[14px] font-normal text-white hover:bg-[#0077ed]"
              asChild
            >
              <Link to="/sign-up" onClick={() => setOpen(false)}>
                Sign Up
              </Link>
            </Button>
            <Link
              to="/sign-in"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-full items-center justify-center rounded-full text-[14px] font-normal text-[#0066cc] transition-colors hover:bg-[#0071e3]/5"
            >
              Sign In
            </Link>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
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
      className="hidden overflow-hidden rounded-full backdrop-blur-sm md:inline-flex"
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
