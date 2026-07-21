import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { PlaceInput } from "@/components/ui/place-input";
import { fadeIn, fadeInUp, staggerContainer } from "@/lib/motion";
import { DEFAULT_TRIP_SEARCH, todayDateInputValue } from "@/lib/trip-search";
import { TRIP_DESTINATION_PLACES } from "@/lib/places";
import heroBackground from "@/assets/beach-view.jpg";

export function HeroSection() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(DEFAULT_TRIP_SEARCH.from);
  const [to, setTo] = useState(DEFAULT_TRIP_SEARCH.to);
  const [departureDate, setDepartureDate] = useState("");

  function swapLocations() {
    setFrom(to);
    setTo(from);
  }

  function handleSearch() {
    navigate({
      to: "/find-vans",
      search: {
        from,
        to,
        departureDate: departureDate || undefined,
      },
    });
  }

  return (
    <section className="relative min-h-svh overflow-hidden bg-black">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/25 to-black/70" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col justify-end gap-8 px-4 pt-20 pb-6 sm:justify-between sm:gap-0 sm:px-6 sm:pt-24 sm:pb-10 lg:px-10 lg:pt-28">
        <motion.div
          className="flex flex-1 flex-col items-center justify-center text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-4 text-sm font-medium tracking-wide text-white/70 uppercase"
          >
            Aurora ↔ Metro Manila
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="max-w-3xl text-[32px] leading-[1.08] font-semibold tracking-[-0.02em] text-white min-[375px]:text-[36px] sm:text-[56px] lg:text-[72px]"
          >
            Your Journey Starts at Home
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 max-w-xl text-[16px] leading-relaxed font-normal text-white/75 sm:mt-5 sm:text-[19px] lg:text-[21px]"
          >
            Door-to-door van rides between Aurora and Metro Manila, both ways,
            fast, easy, and always on your schedule.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-6 flex w-full flex-row justify-center gap-3 sm:mt-8 sm:w-auto sm:flex-wrap sm:gap-4"
          >
            <Button
              size="lg"
              className="h-11 flex-1 rounded-full bg-[#0071e3] px-4 text-[15px] font-normal hover:bg-[#0077ed] sm:flex-none sm:px-7 sm:text-[17px]"
              onClick={handleSearch}
            >
              Find a van
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-11 flex-1 rounded-full px-4 text-[15px] font-normal text-white hover:bg-white/10 hover:text-[#2997ff] sm:flex-none sm:px-7 sm:text-[17px]"
              asChild
            >
              <Link to="/send-package">Send a Package</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.form
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{
            delay: 0.35,
            duration: 0.9,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-0 w-full rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-2xl sm:mt-12 sm:p-4 lg:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
            <div className="flex flex-1 flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row xl:gap-3">
              <div className="relative flex min-w-0 flex-col gap-2 sm:col-span-2 sm:flex-row sm:gap-3 lg:col-span-2 xl:flex-2 xl:basis-0">
                <PlaceInput
                  className="min-w-0 flex-1 basis-0"
                  value={from}
                  onChange={setFrom}
                  placeholder="Aurora"
                  places={TRIP_DESTINATION_PLACES}
                />
                <button
                  type="button"
                  onClick={swapLocations}
                  aria-label="Swap locations"
                  className="mx-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-md ring-2 ring-white/20 transition-colors hover:bg-[#2d2d2f] sm:absolute sm:top-1/2 sm:left-1/2 sm:z-10 sm:mx-0 sm:size-7 sm:-translate-x-1/2 sm:-translate-y-1/2"
                >
                  <ArrowLeftRight className="size-3.5" />
                </button>
                <PlaceInput
                  className="min-w-0 flex-1 basis-0"
                  value={to}
                  onChange={setTo}
                  placeholder="Metro Manila"
                  places={TRIP_DESTINATION_PLACES}
                />
              </div>
              <DatePicker
                className="xl:flex-1 xl:basis-0"
                value={departureDate}
                onChange={setDepartureDate}
                min={todayDateInputValue()}
                placeholder="Select date"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full shrink-0 rounded-xl bg-[#0071e3] px-8 text-[15px] font-normal hover:bg-[#0077ed] xl:w-36"
            >
              Search
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
