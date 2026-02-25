const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/senamekoffia",
    icon: "https://sename.lafricaine.org/wp-content/uploads/elementor/thumbs/2986087_facebook_media_social_icon-r1xe2u0ulrkh0aoxm9zd7tnspll95507u1f9oqdnzg.png"
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/sename__/?hl=fr",
    icon: "https://sename.lafricaine.org/wp-content/uploads/elementor/thumbs/2986059_instagram_media_social_icon-r1xe2r7c19gm1gt12qrhicdexfz5i1p0tngt8whui4.png"
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCQF4sKBKsFnwGWHvjrIaQTA/videos",
    icon: "https://sename.lafricaine.org/wp-content/uploads/elementor/thumbs/2986075_logo_media_social_icon-r1xe2yq1jxqwmci3uu0i2ah3oiy37mivioop346p4c.png"
  },
  {
    label: "Medium",
    href: "https://sename.medium.com/",
    icon: "https://sename.lafricaine.org/wp-content/uploads/elementor/thumbs/2986059_medium_media_social_icon-r1xe32heb9w1wscn8vn0c9iy22fk2exsv7an0814fg.png"
  },
  {
    label: "Plus",
    href: "https://play.google.com/store/apps/details?id=com.woelabo.lomeplus",
    icon: "https://sename.lafricaine.org/wp-content/uploads/elementor/thumbs/Plus-r1xe3ctmega7ghxmki3wlox0lb0lf32ukmgza9lsj0.png"
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sename-koffi-a-2a5432242/",
    icon: null,
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
            <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </div>
            <h2 className="text-base font-extrabold uppercase leading-tight tracking-tight text-[#181810] sm:text-lg">
              SENAME EDITION’S
            </h2>
          </div>
          <p className="text-[13px] font-bold md:text-center">info@artforintrovert.com</p>
          <div className="space-y-2 text-[13px] font-bold md:text-right">
            <p>
              Suite 4022, 43 Bedford Street,
              <br />
              London, United Kingdom, WC2E 9HA
            </p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-end">
          <div className="hidden md:block" />
          <div className="flex flex-wrap items-center justify-start gap-4 md:justify-center">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="inline-flex h-6 w-6 items-center justify-center"
              >
                {social.icon ? (
                  <img src={social.icon} alt={social.label} className="h-7 w-7 object-contain" />
                ) : (
                  <span className="text-lg font-black uppercase">{social.text}</span>
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
