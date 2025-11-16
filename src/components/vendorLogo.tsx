// src/lib/vendorLogo.ts

export type VendorLogo = {
    src: string;
    alt: string;
  };
  
  // Add more vendors here as needed
  const VENDOR_LOGOS: { pattern: RegExp; src: string; alt: string }[] = [
    {
      pattern: /amazon|aws/i,
      src: "/amazon.jpg",
      alt: "Amazon Web Services",
    },
    {
      pattern: /vercel/i,
      src: "/vercel.jpg",
      alt: "Vercel",
    },
    {
      pattern: /wework/i,
      src: "/wework.png",
      alt: "WeWork",
    },
  ];
  
  export function getVendorLogoFromText(
    ...texts: (string | undefined | null)[]
  ): VendorLogo | null {
    const combined = texts
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  
    if (!combined) return null;
  
    for (const entry of VENDOR_LOGOS) {
      if (entry.pattern.test(combined)) {
        return { src: entry.src, alt: entry.alt };
      }
    }
  
    return null;
  }
  