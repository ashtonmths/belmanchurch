import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  admin?: boolean;
  contentClassName?: string;
};

export default function PageShell({
  children,
  title,
  description,
  admin = false,
  contentClassName = "",
}: PageShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#17110c] text-white">
      <div
        className={`fixed inset-x-0 top-0 h-[100lvh] bg-cover bg-center ${
          admin ? "bg-[url('/bg/admin.jpg')]" : "bg-[url('/bg/home.jpg')]"
        }`}
      />
      <div className="fixed inset-x-0 top-0 h-[100lvh] bg-gradient-to-b from-black/80 via-[#17110c]/85 to-[#17110c]" />

      <div className="relative mx-auto min-h-screen w-full max-w-[90rem] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pt-32">
        {(title !== undefined || description !== undefined) && (
          <header className="mb-8 max-w-3xl sm:mb-10">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                {description}
              </p>
            )}
          </header>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    </main>
  );
}
