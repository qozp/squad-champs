import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex flex-row justify-center items-center gap-4 py-4 text-center text-sm text-foreground">
      <div className="flex flex-row gap-4 items-center">
        <a
          href="mailto:contact@squadchamps.com"
          className="hover:underline font-medium flex items-center gap-1"
        >
          <Mail className="h-4 w-4" />
          Contact Us
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
