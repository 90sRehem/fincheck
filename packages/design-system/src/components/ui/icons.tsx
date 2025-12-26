import { cn } from "@/lib/utils";

export const Icons = {
  Cash: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x={1} y={1} width={42} height={42} rx={21} fill="#E9ECEF" />
      <rect
        x={1}
        y={1}
        width={42}
        height={42}
        rx={21}
        stroke="#fff"
        strokeWidth={2}
      />
      <path
        d="M16.188 14.95h11.624c1.965 0 3.188 1.387 3.188 3.35V25.7c0 1.963-1.223 3.35-3.19 3.35H16.189C14.223 29.05 13 27.662 13 25.7V18.3c0-1.963 1.229-3.35 3.188-3.35zM16.664 21.299v1.403M27.336 22.702v-1.403"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M24.287 22a2.287 2.287 0 10-4.575 0 2.287 2.287 0 004.575 0z"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Investments: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x={1} y={1} width={42} height={42} rx={21} fill="#E9ECEF" />
      <rect
        x={1}
        y={1}
        width={42}
        height={42}
        rx={21}
        stroke="#fff"
        strokeWidth={2}
      />
      <path
        d="M15.52 30.274v-1.92"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M16.255 28.354h-1.47a1.422 1.422 0 01-1.425-1.42v-4.841c0-.784.638-1.419 1.425-1.419h1.47c.787 0 1.425.635 1.425 1.419v4.841c0 .784-.638 1.42-1.425 1.42z"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.52 20.674v-1.92M22 26.434v-2.4"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M22.734 24.034h-1.47a1.422 1.422 0 01-1.424-1.42v-1.001c0-.785.638-1.42 1.424-1.42h1.47c.788 0 1.426.635 1.426 1.42v1c0 .785-.638 1.42-1.426 1.42z"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 20.194v-5.28M28.48 23.554v-2.4"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M29.215 21.154h-1.47a1.422 1.422 0 01-1.425-1.42v-2.921c0-.785.638-1.42 1.425-1.42h1.47c.787 0 1.425.635 1.425 1.42v2.92c0 .785-.638 1.42-1.425 1.42z"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28.48 15.394v-2.4"
        stroke="#495057"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  EyeClosed: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.999 7.477c3.2 6.933 12.8 6.933 16 0M6.862 11.016l-2.86 3.929m13.142-3.93l2.858 3.93m-8.003-2.265v3.866"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  EyeOpen: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Eye open icon</title>
      <path
        d="M4 12.747c3.2-6.934 12.8-6.934 16 0m-7.997 3.73a2.315 2.315 0 01-2.312-2.312 2.316 2.316 0 012.312-2.313 2.316 2.316 0 012.313 2.313 2.315 2.315 0 01-2.313 2.313z"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Plus icon</title>
      <path
        d="M6 12h12m-6-6v12"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Arrow left icon</title>
      <path
        d="M15 6l-6 6 6 6"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Arrow right icon</title>
      <path
        d="M9 6l6 6-6 6"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ArrowDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Arrow down icon</title>
      <path
        d="M18 9l-6 6-6-6"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Close: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Close icon</title>
      <path
        d="M6 6l12 12m0-12L6 18"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Calendar icon</title>
      <path
        d="M3.093 9.404h17.824m-4.475 3.906h.01m-4.447 0h.009m-4.456 0h.01m8.874 3.886h.01m-4.447 0h.009m-4.456 0h.01M16.043 2v3.29M7.966 2v3.29m8.272-1.71H7.771C4.834 3.58 3 5.214 3 8.221v9.05C3 20.326 4.834 22 7.771 22h8.458C19.175 22 21 20.355 21 17.348V8.222c.01-3.007-1.816-4.643-4.762-4.643z"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Delete: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Delete icon</title>
      <path
        d="M19.325 9.468s-.543 6.735-.858 9.572c-.15 1.355-.987 2.15-2.358 2.174-2.61.047-5.221.05-7.83-.005-1.318-.027-2.141-.83-2.288-2.162-.317-2.862-.857-9.579-.857-9.579M20.708 6.24H3.75m13.69 0a1.648 1.648 0 01-1.614-1.324L15.583 3.7a1.28 1.28 0 00-1.237-.95h-4.233a1.28 1.28 0 00-1.237.95l-.243 1.216A1.648 1.648 0 017.018 6.24"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Filter: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Filter icon</title>
      <path
        clipRule="evenodd"
        d="M4.565 3C3.701 3 3 3.713 3 4.59v.936c0 .65.247 1.276.69 1.746l4.845 5.152.002-.003A5.157 5.157 0 0110 16.023v4.572c0 .306.32.5.585.357l2.76-1.504c.416-.228.676-.67.676-1.15v-2.287c0-1.342.519-2.631 1.446-3.587l4.846-5.152c.44-.47.688-1.096.688-1.746V4.59C21 3.713 20.3 3 19.436 3H4.566z"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Alert: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Alert icon</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.333 12.75c-.001-.523-.318-.854-.74-.721-.264.084-3.38 2.172-3.016 9.665.059.777.397 1.302.976 1.701.568.392.718.887.662 1.546-.13 1.559-.22 2.173-.307 3.736-.044.788.537 1.361 1.298 1.32.658-.036 1.126-.573 1.127-1.321.004-2.853.004-14.23 0-15.926z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.683 12.374c.065 1.46.136 2.92.195 4.38.038.946-.286 1.759-.994 2.387-.969.857-1.207 1.913-1.076 3.165.241 2.31.418 3.68.583 6.003.066.93-.77 1.698-1.617 1.698s-1.683-.768-1.617-1.698c.165-2.323.342-3.693.583-6.003.131-1.252-.107-2.308-1.076-3.165-.708-.628-1.032-1.441-.994-2.387.058-1.46.129-2.92.194-4.38"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.768 15.916l.01-3.465"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Home: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Home icon</title>
      <path
        d="M13.497 17.775v-8.725c0-1.692-1.372-3.064-3.064-3.064h-8.879c-1.692 0-3.064 1.372-3.064 3.064v8.725"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 18.956l-7.526-5.957c-.864-.683-2.084-.683-2.948 0L2 18.956"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.668 13.943v2.354"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.644 29.514v-3.719c0-.8 0-1.201.149-1.509.147-.306.394-.552.7-.7.309-.148.709-.148 1.51-.148s1.201 0 1.51.148c.305.148.552.394.699.7.149.308.149.708.149 1.509v3.719"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Revenue: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x={1} y={1} width={42} height={42} rx={21} fill="#EBFBEE" />
      <rect
        x={1}
        y={1}
        width={42}
        height={42}
        rx={21}
        stroke="#fff"
        strokeWidth={2}
      />
      <path
        d="M23.26 28.348h-6.838c-1.888 0-3.062-1.332-3.062-3.217v-7.103c0-1.885 1.174-3.217 3.06-3.217h11.16c1.88 0 3.06 1.332 3.06 3.217v1.919M26.538 25.551l2.05-2.051 2.051 2.051M28.589 23.5v4.848M16.444 18.173h1.347"
        stroke="#2B8A3E"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M19.803 21.58a2.196 2.196 0 114.392 0 2.196 2.196 0 01-4.392 0z"
        stroke="#2B8A3E"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Expense: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x={1} y={1} width={42} height={42} rx={21} fill="#FFF5F5" />
      <rect
        x={1}
        y={1}
        width={42}
        height={42}
        rx={21}
        stroke="#fff"
        strokeWidth={2}
      />
      <path
        d="M23.26 28.348h-6.838c-1.888 0-3.062-1.332-3.062-3.217v-7.103c0-1.885 1.174-3.217 3.06-3.217h11.16c1.88 0 3.06 1.332 3.06 3.217v1.919M16.444 18.171h1.347"
        stroke="#C92A2A"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M19.805 21.58a2.196 2.196 0 114.391 0 2.196 2.196 0 01-4.391 0z"
        stroke="#C92A2A"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.538 26.298l2.05 2.05 2.051-2.05M28.589 23.5v4.848"
        stroke="#C92A2A"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  BankAccounts: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x={1} y={1} width={42} height={42} rx={21} fill="#E7F5FF" />
      <rect
        x={1}
        y={1}
        width={42}
        height={42}
        rx={21}
        stroke="#fff"
        strokeWidth={2}
      />
      <path
        d="M13.722 18.552l7.87-5.08a.701.701 0 01.76 0l7.87 5.08c.2.13.32.351.32.59v.551a.7.7 0 01-.7.7h-15.74a.7.7 0 01-.7-.7v-.552c0-.238.12-.46.32-.589zM21.971 17.455v.01"
        stroke="#1864AB"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M30.568 30.044l-.37-1.686a.49.49 0 00-.48-.384H14.225a.49.49 0 00-.479.384l-.37 1.686a.49.49 0 00.477.594h16.239a.49.49 0 00.477-.594z"
        stroke="#1864AB"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.138 20.391v7.584m4.333-7.584v7.584M15.47 20.39v7.584m4.333-7.584v7.584"
        stroke="#1864AB"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Transactions: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Transactions icon</title>
      <path
        d="M21 14.24h-3.548a2.359 2.359 0 010-4.717H21m-3.713 2.306h-.004M4.23 9.887v-1.03c0-2.54 2.06-4.6 4.599-4.6h7.573c2.539 0 4.598 2.06 4.598 4.6v6.288a4.599 4.599 0 01-4.598 4.598h-2.316m-4.723-.107v-5.554m0 5.554l1.734-1.671m-1.734 1.671l-1.732-1.671m-2.897-3.883v5.554m0-5.554L3 15.754m1.734-1.672l1.732 1.672"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Transfer: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Transfer icon</title>
      <path
        d="M29.999 23.24h-3.547c-1.302 0-2.358-1.056-2.358-2.358s1.056-2.359 2.358-2.359h3.547"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.286 20.829h-.004"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.23 18.887v-1.031c0-2.54 2.06-4.6 4.599-4.6h7.573c2.539 0 4.598 2.06 4.598 4.6v6.288a4.599 4.599 0 01-4.598 4.598h-2.316"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.363 28.636v-5.554"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.097 26.965l-1.733 1.671-1.733-1.671"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.734 23.082v5.554"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 24.754l1.733-1.672 1.733 1.672"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  CurrentAccount: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-gray-7", props.className)}
      {...props}
    >
      <rect x={1} y={1} width={42} height={42} rx={21} fill="#E9ECEF" />
      <rect
        x={1}
        y={1}
        width={42}
        height={42}
        rx={21}
        stroke="#fff"
        strokeWidth={2}
      />
      <path
        clipRule="evenodd"
        d="M27.035 14.54H16.964c-2.436 0-3.964 1.724-3.964 4.165v6.588c0 2.442 1.52 4.167 3.964 4.167h10.07c2.445 0 3.966-1.725 3.966-4.167v-6.588c0-2.44-1.52-4.166-3.965-4.166z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 19.834h18M17.177 25.17h2.968"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Chart: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Chart icon</title>
      <path
        d="M4.52 29.274v-1.92"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.255 27.354H3.784c-.786 0-1.424-.636-1.424-1.42v-4.841c0-.785.638-1.42 1.424-1.42h1.471c.787 0 1.425.635 1.425 1.42v4.84c0 .785-.638 1.421-1.425 1.421z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.52 19.674v-1.92"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 25.434v-2.4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.735 23.034h-1.471c-.786 0-1.424-.636-1.424-1.42v-1.001c0-.785.638-1.42 1.424-1.42h1.471c.787 0 1.425.635 1.425 1.42v1c0 .785-.638 1.421-1.425 1.421z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 19.194v-5.28"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.48 22.554v-2.4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.215 20.154h-1.471c-.786 0-1.424-.636-1.424-1.42v-3.321c0-.785.638-1.42 1.424-1.42h1.471c.787 0 1.425.635 1.425 1.42v3.32c0 .785-.638 1.421-1.425 1.421z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.48 13.994v-2.0"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Food: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Food icon</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.333 12.75c-.001-.523-.318-.854-.74-.721-.264.084-3.38 2.172-3.016 9.665.059.777.397 1.302.976 1.701.568.392.718.887.662 1.546-.13 1.559-.22 2.173-.307 3.736-.044.788.537 1.361 1.298 1.32.658-.036 1.126-.573 1.127-1.321.004-2.853.004-14.23 0-15.926z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.683 12.374c.065 1.46.136 2.92.195 4.38.038.946-.286 1.759-.994 2.387-.969.857-1.207 1.913-1.076 3.165.241 2.31.418 3.68.583 6.003.066.93-.77 1.698-1.617 1.698s-1.683-.768-1.617-1.698c.165-2.323.342-3.693.583-6.003.131-1.252-.107-2.308-1.076-3.165-.708-.628-1.032-1.441-.994-2.387.058-1.46.129-2.92.194-4.38"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.768 15.916l.01-3.465"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Transport: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Transport icon</title>
      <path
        d="M24.156 22.556h1.725"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.63 22.556h1.725"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.124 18.537c5.723.811 11.531.811 17.254 0"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.127 27.311c-.002.532.428.964.96.964h1.902c.53 0 .96-.422.96-.893v-.393c0-.53.429-.96.96-.96h7.692c.53 0 .96.43.96.96v.393c0 .471.43.893.96.893h1.915c.53 0 .96-.422.96-.893v-5.019c0-.778-.249-1.536-.708-2.164l-1.12-1.5c-.089-.126-.161-.264-.214-.41l-1.007-2.798c-.253-.719-.908-1.268-1.661-1.39-2.598-.41-5.245-.41-7.843 0-.749.125-1.404.674-1.659 1.39l-1.007 2.798c-.053.14-.125.271-.215.393l-1.138 1.565c-.45.621-.691 1.369-.69 2.137l-.015 4.997z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Housing: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Housing icon</title>
      <path
        d="M13.497 17.775v-8.725c0-1.692-1.372-3.064-3.064-3.064h-8.879c-1.692 0-3.064 1.372-3.064 3.064v8.725"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 18.956l-7.526-5.957c-.864-.683-2.084-.683-2.948 0L2 18.956"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.668 13.943v2.354"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.644 29.514v-3.719c0-.8 0-1.201.149-1.509.147-.306.394-.552.7-.7.309-.148.709-.148 1.51-.148s1.201 0 1.51.148c.305.148.552.394.699.7.149.308.149.708.149 1.509v3.719"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Packages: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Packages icon</title>
      <path
        d="M12 17.565l7.917-3.869c.707-.345 1.533-.345 2.239 0l7.02 3.431c1.099.536 1.099 2.102 0 2.638l-7.02 3.431c-.706.346-1.532.346-2.239 0l-3.278-1.602c-.371-.181-.803.089-.803.501v3.579c0 .936.549 1.808 1.42 2.149 2.485.975 4.96.988 7.425.007.865-.343 1.408-1.212 1.408-2.143v-4.403"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.451 25.495v-4.078c0-.876.638-1.622 1.505-1.758l3.752-.588"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Security: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Security icon</title>
      <path
        d="M25.857 17.246l.013 1.132c-1.501.628-2.527 2.118-2.527 3.844 0 2.304 1.872 4.167 4.177 4.167h6.971c2.294 0 4.173-1.863 4.173-4.167 0-1.726-1.039-3.211-2.54-3.584l.034-1.09c0-1.554-.607-3.092-1.804-4.082-.911-.751-2.077-1.203-3.348-1.203-1.452 0-2.766.59-3.717 1.544-.965.969-1.426 2.334-1.426 3.702z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28.891 21.38l2.11 2.11"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 21.97l2.11-2.11"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 30v-11.387"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Work: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Work icon</title>
      <path
        d="M14.323 14.949h13.368c.657 0 1.221.468 1.341 1.114l.623 3.326c.137.585-.306 1.145-.908 1.145H15.253c-.601 0-1.044-.56-.908-1.145l.638-3.31c.122-.644.686-1.13 1.34-1.13z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.251 12h9.499"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.091 14.949v5.585M17.966 14.949v5.383"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.02 29.997h-3.993M13.255 20.531v7.615c0 1.023.829 1.852 1.85 1.852h11.79c1.021 0 1.85-.829 1.85-1.852v-7.615"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.463 24.984h1.111"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.02 30v-3.953c0-1.102-.894-1.996-1.996-1.996s-1.996.894-1.996 1.996V30"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Service: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Service icon</title>
      <path
        d="M23.055 21.048l5.53 2.289c.857.354 1.415 1.19 1.415 2.116 0 1.266-1.025 2.291-2.29 2.291H14.29c-1.266 0-2.291-1.025-2.291-2.29v-.087c0-.92.551-1.751 1.398-2.111 0 0 7.986-4.42 8.426-4.685.94-.565 1.628-1.476 1.257-2.771-.204-.714-.74-1.28-1.458-1.471-1.47-.389-2.794.79-2.794 2.197"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Health: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Health icon</title>
      <path
        d="M15.846 30.002H6.154c-2.231 0-4.04-1.809-4.04-4.04v-7.059c0-2.231 1.809-4.04 4.04-4.04h9.692c2.231 0 4.04 1.809 4.04 4.04v7.059c0 2.231-1.809 4.04-4.04 4.04z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.969 24.398h-3.934"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 22.43v3.936"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.383 14.862v-.875c0-1.07-.867-1.937-1.937-1.937h-2.89c-1.07 0-1.937.867-1.937 1.937v.875"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.838 19.383H2.162"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Account: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-white", props.className)}
      {...props}
    >
      <title>Account icon</title>
      <path
        d="M9.332 16.989c0-1.158.914-2.6 3.547-2.6s3.548 1.431 3.548 2.59M2.499 8.426h3.178M2.5 16.23h3.178m-1.653.184V8.236c0-2.844 1.58-4.607 4.483-4.598h7.74c2.905 0 4.493 1.763 4.493 4.607v8.168c0 2.837-1.616 4.608-4.565 4.608H8.507c-2.904 0-4.483-1.771-4.483-4.608zm11.12-6.478a2.265 2.265 0 11-4.53 0 2.265 2.265 0 014.53 0z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Logout: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Logout icon</title>
      <path
        d="M14.482 4.08h-6.42A3.742 3.742 0 004.32 7.822v7.875a3.742 3.742 0 003.742 3.742h6.42m1.49-11.121l3.708 3.442m0 0l-3.707 3.442m3.707-3.442h-9.004"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Upload: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Document upload icon</title>
      <path
        d="M12.259 27.348H5.422c-1.888 0-3.062-1.332-3.062-3.217V17.028c0-1.885 1.174-3.217 3.06-3.217h11.16c1.88 0 3.06 1.332 3.06 3.217v1.919"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.54 24.551l2.05-2.051m0 0l2.051 2.051M17.59 22.5v4.848"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.444 17.173h1.347"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.803 20.58c0-1.213.983-2.196 2.196-2.196s2.196.983 2.196 2.196-983 2.196-2.196 2.196-2.196-.983-2.196-2.196z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Download: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Document download icon</title>
      <path
        d="M12.26 27.348H5.42c-1.888 0-3.062-1.332-3.062-3.217V17.028c0-1.885 1.174-3.217 3.06-3.217h11.16c1.88 0 3.06 1.332 3.06 3.217v1.919"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.44 17.171h1.35"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.8 20.58c0-1.213.983-2.196 2.196-2.196s2.196.983 2.196 2.196-.983 2.196-2.196 2.196S8.8 21.794 8.8 20.58z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.54 25.298l2.05 2.05 2.051-2.05"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.59 22.5v4.848"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Att: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Att icon</title>
      <path
        d="M21 12a9 9 0 00-9-9 9 9 0 109 9zM14.33 9.666L9.668 14.33m4.668.006l-4.67-4.67"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
