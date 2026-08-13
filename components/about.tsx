import { aboutTags } from "@/lib/site";

export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">
          About
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-tight md:text-4xl">
          브랜드가 기억되는 순간을
          <br />
          패키징과 화면으로 만듭니다.
        </h2>
        <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500 md:text-[15px]">
          화장품 패키징의 촉감과 실루엣부터, 웹과 상세페이지에서 이어지는
          구매 경험까지. 하나의 톤으로 연결되는 비주얼을 설계합니다.
        </p>
        <ul className="mt-12 flex flex-wrap gap-3">
          {aboutTags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line bg-white px-5 py-2 text-sm text-neutral-600"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
