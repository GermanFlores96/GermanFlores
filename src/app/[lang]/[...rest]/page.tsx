import { notFound } from "next/navigation";

// Any unknown path under a locale lands here, so the branded 404 renders inside the locale layout.
export default function CatchAll() {
  notFound();
}
