export default function LetterSection() {
  return (
    <section
      className="min-h-screen py-24 px-4 sm:px-8 lg:px-16 flex flex-col items-center justify-center bg-parchment"
    >
      {/* Section heading */}
      <h2
        className="font-display text-section text-crimson text-center mb-12 font-bold"
      >
        A Letter To You
      </h2>

      {/* Letter card with stamp border */}
      <div className="stamp-border w-full max-w-2xl mx-auto relative">
        {/* ── Postage stamps (top-right corner) ── */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {/* Stamp 1 — Heart / "LOVE MAIL" */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Serrated border rectangle */}
            <rect
              x="4"
              y="4"
              width="72"
              height="72"
              rx="2"
              fill="var(--color-gold)"
              stroke="var(--color-crimson)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            {/* Inner border */}
            <rect
              x="10"
              y="10"
              width="60"
              height="60"
              rx="1"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1"
            />
            {/* Heart icon */}
            <path
              d="M40 56 C40 56 22 44 22 33 C22 27 27 23 32 23 C36 23 39 26 40 28 C41 26 44 23 48 23 C53 23 58 27 58 33 C58 44 40 56 40 56Z"
              fill="var(--color-crimson)"
            />
            {/* Label */}
            <text
              x="40"
              y="70"
              textAnchor="middle"
              fontSize="7"
              fontWeight="700"
              fill="var(--color-crimson)"
              fontFamily="var(--font-lato), sans-serif"
            >
              LOVE MAIL
            </text>
          </svg>

          {/* Stamp 2 — Envelope / "FOREVER" */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Serrated border rectangle */}
            <rect
              x="4"
              y="4"
              width="72"
              height="72"
              rx="2"
              fill="var(--color-parchment-dark)"
              stroke="var(--color-crimson)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            {/* Inner border */}
            <rect
              x="10"
              y="10"
              width="60"
              height="60"
              rx="1"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1"
            />
            {/* Envelope body */}
            <rect
              x="22"
              y="28"
              width="36"
              height="24"
              rx="2"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1.5"
            />
            {/* Envelope flap */}
            <path
              d="M22 28 L40 42 L58 28"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Small heart seal */}
            <path
              d="M40 38 C40 38 36 35 36 33 C36 31.5 37.5 30.5 39 30.5 C39.8 30.5 40 31.2 40 31.2 C40 31.2 40.2 30.5 41 30.5 C42.5 30.5 44 31.5 44 33 C44 35 40 38 40 38Z"
              fill="var(--color-crimson)"
            />
            {/* Label */}
            <text
              x="40"
              y="70"
              textAnchor="middle"
              fontSize="7"
              fontWeight="700"
              fill="var(--color-crimson)"
              fontFamily="var(--font-lato), sans-serif"
            >
              FOREVER
            </text>
          </svg>
        </div>

        {/* ── Address lines ── */}
        <div className="mt-8 mb-6 space-y-2">
          <p className="font-script text-crimson text-lg">
            To:{" "}
            <span className="border-b border-crimson/40 pb-0.5">
              Naza
            </span>
          </p>
          <p className="font-script text-crimson text-lg">
            From:{" "}
            <span className="border-b border-crimson/40 pb-0.5">
              [BOYFRIEND_NAME]
            </span>
          </p>
        </div>

        {/* ── Salutation ── */}
        <p className="font-script text-crimson text-lead mt-4">
          My Dearest Naza,
        </p>

        {/* ── Letter body ── */}
        {/* BOYFRIEND: Replace the letter body below */}
        <div className="font-body text-ink italic mt-4 space-y-4 leading-[1.9] font-light">
          <p>
            [Replace this with your love letter. Write from the heart.
            Tell her what she means to you, your favorite memories together,
            and why today is so special. This is your moment to make her cry
            happy tears.]
          </p>
        </div>

        {/* ── Date ── */}
        <p className="font-body text-meta text-ink/70 mt-8">
          [BIRTHDAY_DATE]
        </p>

        {/* ── Postmark SVG (bottom-right) ── */}
        <div className="absolute bottom-6 right-6 opacity-50">
          <svg
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Outer circle */}
            <circle
              cx="45"
              cy="45"
              r="40"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="2"
            />
            {/* Inner circle */}
            <circle
              cx="45"
              cy="45"
              r="34"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1"
            />
            {/* Top arc text — "SEALED WITH LOVE" */}
            <defs>
              <path
                id="postmark-arc-top"
                d="M 12,45 A 33,33 0 0 1 78,45"
              />
              <path
                id="postmark-arc-bottom"
                d="M 78,45 A 33,33 0 0 1 12,45"
              />
            </defs>
            <text
              fontSize="7"
              fontWeight="600"
              fill="var(--color-crimson)"
              fontFamily="var(--font-lato), sans-serif"
              letterSpacing="2"
            >
              <textPath href="#postmark-arc-top" startOffset="50%" textAnchor="middle">
                SEALED WITH LOVE
              </textPath>
            </text>
            {/* Bottom arc text — date accent */}
            <text
              fontSize="6"
              fill="var(--color-crimson)"
              fontFamily="var(--font-lato), sans-serif"
              letterSpacing="1.5"
            >
              <textPath href="#postmark-arc-bottom" startOffset="50%" textAnchor="middle">
                ♥ LOVE MAIL ♥
              </textPath>
            </text>
            {/* Wavy line 1 */}
            <path
              d="M 14,42 Q 22,38 30,42 Q 38,46 45,42 Q 52,38 60,42 Q 68,46 76,42"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1.5"
            />
            {/* Wavy line 2 */}
            <path
              d="M 14,48 Q 22,44 30,48 Q 38,52 45,48 Q 52,44 60,48 Q 68,52 76,48"
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
