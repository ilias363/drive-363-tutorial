export default function HomePage(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-white">
      <main className="text-center">{props.children}</main>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} Drive363. All rights reserved.
      </footer>
    </div>
  );
}
