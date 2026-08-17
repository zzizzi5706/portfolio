-- Placeholder careers for the Career section.
-- Run in the Supabase SQL editor (bypasses RLS). Safe to re-run.

delete from public.careers
where description like '%(예시 데이터 - 추후 실제 경력으로 교체 예정)%';

insert into public.careers (
  year_range,
  company,
  role,
  employment_type,
  description,
  display_order
) values
  (
    '2024.03 — 현재',
    '루미네 코스메틱',
    '패키징 디자이너',
    'regular',
    '스킨케어 라인의 용기·외함 패키징을 담당하며, 브랜드 리뉴얼에 맞춰 촉감과 실루엣을 정리했습니다. (예시 데이터 - 추후 실제 경력으로 교체 예정)',
    0
  ),
  (
    '2022.04 — 2024.02',
    '하프톤 디자인 스튜디오',
    '웹·상세페이지 디자이너',
    'contract',
    '화장품 브랜드 웹사이트와 제품 상세페이지를 제작하고, 시즌 캠페인 랜딩 구성을 맡았습니다. (예시 데이터 - 추후 실제 경력으로 교체 예정)',
    1
  ),
  (
    '2020.09 — 2022.03',
    '스튜디오 결',
    '패키징·상세페이지 디자이너',
    'freelancer',
    '소규모 뷰티 브랜드의 패키징과 상세페이지를 프로젝트 단위로 진행했습니다. (예시 데이터 - 추후 실제 경력으로 교체 예정)',
    2
  ),
  (
    '2018.03 — 2020.08',
    '아틀리에 문라이트',
    '주니어 그래픽 디자이너',
    'regular',
    '뷰티 편집 디자인과 웹 배너, 상세페이지 시안 작업을 담당하며 패키징 기초를 익혔습니다. (예시 데이터 - 추후 실제 경력으로 교체 예정)',
    3
  );
