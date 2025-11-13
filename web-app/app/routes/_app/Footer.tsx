export default function Footer() {
  return (
    <footer className="flex flex-row justify-center items-center gap-4 py-4 text-center text-sm text-foreground">
      <div className="flex flex-row gap-4 items-center">
        <a
          href="https://squadchamps.com"
          className="hover:underline font-medium"
        >
          Main Site
        </a>
        {/* <a
            href="https://squadchamps.com/blog"
            className="hover:underline font-medium"
          >
            Blog
          </a>
          <a
            href="https://squadchamps.com/careers"
            className="hover:underline font-medium"
          >
            Careers
          </a> */}
      </div>
      <span className="">&copy; {new Date().getFullYear()} Squad Champs</span>
    </footer>
  );
}
