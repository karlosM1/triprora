import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArticlesGrid } from "@/components/articles/articles-grid";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { PageHeader } from "@/components/layout/page-header";
import { ARTICLES } from "@/lib/articles";
import { fadeInUp } from "@/lib/motion";

export const Route = createFileRoute("/articles/")({
  component: ArticlesPage,
});

function ArticlesPage() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="articles" />
      <main className="mx-auto max-w-245 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <PageHeader
          eyebrow="Travel Journal"
          title="Tips, insights & inspiration."
          subtitle="Explore Aurora Province through local stories, travel guides, and insider tips, from surfing in Baler to hidden waterfalls across the Sierra Madre."
        />

        <ArticlesGrid articles={ARTICLES} className="mt-12" animate="visible" />

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-12 text-center text-[15px] text-[#86868b]"
        >
          More stories coming soon. Have a tip to share?{" "}
          <a
            href="mailto:crabr0001@gmail.com"
            className="text-[#0066cc] hover:underline"
          >
            Get in touch
          </a>
          .
        </motion.p>
      </main>
      <Footer />
    </div>
  );
}
