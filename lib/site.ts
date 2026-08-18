export const site = {
  name: "Yeon Ji Han",
  nameEn: "Yeon Ji Han",
  title: "패키징 · 웹 · 상세페이지 디자이너",
  intro: "화장품 브랜드의 첫인상부터 마지막 클릭까지 디자인합니다.",
  instagram: "https://instagram.com/",
  instagramHandle: "@studio",
  heroImage: "/hero.jpg",
};

export const skills = [
  { name: "Photoshop", level: 100, icon: "photoshop" },
  { name: "Illustrator", level: 100, icon: "illustrator" },
  { name: "InDesign", level: 100, icon: "indesign" },
  { name: "After Effects", level: 100, icon: "aftereffects" },
  { name: "Premiere Pro", level: 100, icon: "premierepro" },
  { name: "Shopify", level: 100, icon: "shopify" },
  { name: "AI", level: 100, icon: "ai" },
] as const;

export type SkillIconId = (typeof skills)[number]["icon"];

export const aboutTags = [
  "패키징 디자인",
  "웹디자인",
  "상세페이지 디자인",
] as const;
