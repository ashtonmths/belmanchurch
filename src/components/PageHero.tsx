import Image from "next/image";

/** Photo header used at the top of inner pages. */
export default function PageHero({
  eyebrow,
  title,
  description,
  image = "/carousel/nave.jpg",
  imageAlt = "",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-[420px] items-end overflow-hidden bg-ink md:min-h-[500px]">
      {image && (
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="-z-20 object-cover" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/50 to-ink" />
      <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-36">
        {eyebrow && (
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-10 bg-primary" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.05] text-white md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
