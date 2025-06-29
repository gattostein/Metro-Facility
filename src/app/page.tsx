import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Removed sm:items-start from the main element */}
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        {/* Replace this with your company's logo */}
        <Image
          className="dark:invert"
          src="/logo.png" // Replace with your company logo
          alt="Your company logo"
          width={180}
          height={38}
          priority
        />

        {/* Welcome message */}
        <h1 className="text-3xl font-bold text-center">
          Welcome to Metro Facility
        </h1>
        <p className="text-center mt-4">
          Manage your tasks, reports, and payments all in one place.
        </p>

        {/* Navigation buttons */}
        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/auth/signin" // Link to login page
          >
            Sign In
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto" // Removed md:w-[158px]
            href="/auth/signup" // Link to signup page
          >
            Create Account
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-center mt-8">© 2025 Metro Facility. All rights reserved.</p>
      </footer>
    </div>
  );
}
