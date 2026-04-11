import Logo from "@/components/Logo";
import Image from "next/image";

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/senamekoffia",
    icon: "/icons/facebook.jpg"
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/sename__/?hl=fr",
    icon: "/icons/instagram.jpg"
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCQF4sKBKsFnwGWHvjrIaQTA/videos",
    icon: "/icons/youtube.jpg"
  },
  {
    label: "Medium",
    href: "https://sename.medium.com/",
    icon: null,
    text: "M"
  },
  {
    label: "Plus",
    href: "https://play.google.com/store/apps/details?id=com.woelabo.lomeplus",
    icon: "/icons/plus.jpg"
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sename-koffi-a-2a5432242/",
    icon: "/icons/linkedlin.jpg",
    text: "in"
  },
  {
    label: "Twitter",
    href: "https://twitter.com/sename__",
    icon: null,
    text: "X"
  }
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto bg-primary px-4 py-6 text-[#181810] md:px-10">
      <div className="mx-auto max-w-7xl px-6 py-7 md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo />
            <h2 className="text-base font-extrabold uppercase leading-tight tracking-tight text-[#181810] sm:text-lg">
              laa éditions
            </h2>
          </div>
          <p className="text-[13px] font-bold md:text-center">contact@lafricainedarchitecture.com</p>
          <div className="space-y-2 text-[13px] font-bold md:text-right">
            <p>
              L&apos;AFRICAINE D&apos;ARCHITECTURE
              <br />
              2 bis Rue Dupont de l’Eure, 75020 Paris
            </p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-end">
          <div className="hidden md:block" />
          <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="inline-flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#181810]"
              >
                {social.icon ? (
                  <Image src={social.icon} alt={social.label} width={24} height={24} className="h-4 sm:h-5 w-auto object-contain mix-blend-multiply" />
                ) : (
                  <span className="text-[14px] sm:text-[18px] font-black uppercase leading-none">{social.text}</span>
                )}
              </a>
            ))}
          </div>
          <div />
        </div>
      </div>
    </footer>
  );
}
