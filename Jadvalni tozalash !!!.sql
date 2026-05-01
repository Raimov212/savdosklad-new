-- 1. Hisoblagichni jadvalga biriktirish (bu faqat bir marta qilinadi)
ALTER SEQUENCE public.markets_id_seq OWNED BY public.markets.id;

-- 2. Endi jadvalni tozalang (ID endi aniq 1-dan boshlanadi)
TRUNCATE TABLE public.markets RESTART IDENTITY CASCADE;
