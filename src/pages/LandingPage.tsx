import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { author, bookInfo } from '@/data/author';
import { getAllBooks, getGlobalPoemOfTheDay } from '@/data/books';

function BookCover({ slug, title, subtitle, authorName, gradient, delay = 0 }: {
  slug: string;
  title: string;
  subtitle?: string;
  authorName: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex-shrink-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <Link
        to={`/read/${slug}`}
        className="relative group outline-none block"
        aria-label={`Открыть книгу «${title}» для чтения`}
      >
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/10 blur-2xl rounded-full" />
        
        <div className={`relative w-[240px] sm:w-[280px] lg:w-[220px] xl:w-[260px] aspect-[3/4]
                        bg-gradient-to-br ${gradient}
                        rounded-sm shadow-2xl overflow-hidden
                        transform hover:scale-[1.02] transition-all duration-300
                        cursor-pointer group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]`}>
          <div className="absolute inset-4 border border-[#D4AF37]/30 rounded-sm" />
          <div className="absolute inset-6 border border-[#D4AF37]/20 rounded-sm" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-[#D4AF37]/60 text-3xl mb-4">&#10086;</div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#F5F0E8] mb-2">
              {title}
            </h2>
            {subtitle ? (
              <>
                <p className="font-serif text-sm text-[#D4AF37]/70 italic">
                  {subtitle}
                </p>
                <div className="w-16 h-px bg-[#D4AF37]/40 my-4" />
              </>
            ) : (
              <div className="w-16 h-px bg-[#D4AF37]/40 my-4" />
            )}
            <p className="font-serif text-[#F5F0E8]/80">
              {authorName}
            </p>
            <div className="text-[#D4AF37]/60 text-3xl mt-4">&#10087;</div>
          </div>
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 
                          transition-all duration-300 flex items-center justify-center
                          opacity-0 group-hover:opacity-100">
            <div className="flex flex-col items-center gap-2 text-center">
              <svg className="w-8 h-8 text-[#F5F0E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-[#F5F0E8] text-xs font-serif">Откройте книгу</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function LandingPage() {
  const books = useMemo(() => getAllBooks(), []);
  const poemOfTheDay = useMemo(() => getGlobalPoemOfTheDay(), []);
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <h1 className="sr-only">Просто человеком — сборник стихов Андрея Балашова</h1>
      <section id="book-content" className="min-h-screen flex items-center pt-20 md:pt-28 lg:pt-32">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 lg:gap-16">
            {/* Эпиграф над книгами */}
            {bookInfo.epigraph && (
              <motion.blockquote
                className="max-w-[640px] w-full text-center font-serif"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-base sm:text-lg text-[#2C3E50]/85 italic leading-relaxed whitespace-pre-line">
                  {bookInfo.epigraph}
                </p>
              </motion.blockquote>
            )}

            {/* Обложки книг: на телефонах — вертикально, на десктопах — в один горизонтальный ряд */}
            <div className="w-full flex flex-col items-center gap-8 sm:gap-10 lg:gap-4 xl:gap-6 lg:flex-row lg:justify-center lg:items-stretch">
              {books.map((book, i) => (
                <BookCover
                  key={book.slug}
                  slug={book.slug}
                  title={book.bookInfo.title}
                  subtitle={book.bookInfo.subtitle}
                  authorName={book.bookInfo.author}
                  gradient={book.coverGradient}
                  delay={i * 0.15}
                />
              ))}
            </div>
            
            {/* Текст и CTA — единая колонка по центру */}
            <motion.div
              className="flex-1 text-center w-full max-w-[720px] mx-auto flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="font-serif text-lg sm:text-xl text-[#2C3E50] mb-1">
                {author.fullName}
              </p>
              <p className="text-[#2C3E50]/80 text-sm sm:text-base mb-1">
                наш современник
              </p>
              <p className="text-[#2C3E50]/75 mb-6">
                {author.birthYear} г.р.
              </p>

              {/* Предисловие */}
              <div id="preface" className="max-w-[720px] w-full mt-8 mb-10 text-left">
                <motion.h2
                  className="text-xl sm:text-2xl font-serif text-[#2C3E50] mb-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  ВМЕСТО ПРЕДИСЛОВИЯ
                </motion.h2>
                <motion.div
                  className="font-serif text-lg sm:text-xl text-[#2C3E50] space-y-6 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <p>Обычно автор, а особенно малоизвестный, первыми словами кого‑то или что‑то благодарит, касается фактов своей истинной или додуманной биографии или, что ещё лучше, ищет нечто, привлекающее к его текстам внимание. Порой излагается некий биографический очерк или — отзыв матерого и маститого.</p>
                  <p>Здесь этого не будет. Как и не будет объяснений десятилетий творческого молчания.</p>
                  <p>Автор познаётся по текстам, как человек — по делам его.</p>
                  <p>Сам, избалованный настоящей литературой с детства, обычно (и порой неверно) решаю для себя — буду ли читать — после первых нескольких строк или страниц. Текст или идёт, или нет.</p>
                  <p>Для тех, кто готов пойти со мной дальше, посчитал своим долгом изложить причину и историю эпиграфа.</p>
                  <p>К Сосноре, переболев мальчишкой «Всадниками», я десятки лет не возвращался. Оставался и остаюсь любителем иных форм стихоречи, ритмических решений и рифм. С грустью узнал о его кончине в 2019, а потом ковидные будни убрали всю поэтику из моей повестки.</p>
                  <p>Осознанная потребность собрать что‑то из моего — не выброшенного, не забытого, не подаренного и отданного в мир, — упиралась в поиск первой строки, посыла. Того, что пояснило бы мне самому и тем, кто вдруг решится почитать, что это за тексты и для чего они.</p>
                  <p>В поездной скукоте наткнулся на какую‑то статью об «ахматовских сиротах» и литературном Ленинграде 60‑х. Пробегая по диагонали, споткнулся об Аронзона и Соснору. Взял почитать их из запасников — скорее желая освежить, вспомнить и сравнить с подростковым восприятием. Аронзон остался на подростковом светлом месте, а Соснора произвёл эффект землетрясения.</p>
                  <p>Так у фактически готового сборника появился и эпиграф, и ответ на мой вопрос о том, что и почему я делаю, а также,   пара текстов.  С Виктором Александровичем оказалось много созвучного и фантастически совпавшего.</p>
                  <p>Мне, наверное, крайне повезло, что я так поздно притронулся к Сосноре, тем самым избежав его влиятельности и системности мыслей, хотя заподозрить себя в приверженности или безусловном преклонении перед тем или иным автором, а также в копированиях и подражательстве, не решусь.</p>
                </motion.div>
              </div>

              {/* Фото автора: детское и современное */}
              <motion.div
                className="mb-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src="/images/author/childhood.jpg"
                  alt="Андрей Балашов в детстве"
                  title="Андрей Балашов в детстве"
                  className="rounded-lg shadow-lg max-w-[260px] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src="/images/author/photo_2026-01-22_17-15-55.jpg"
                  alt="Андрей Балашов — автор сборника стихов «Просто человеком»"
                  title="Андрей Балашов"
                  className="rounded-lg shadow-lg max-w-[260px] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>

              {/* Стихотворение дня */}
              <motion.div
                id="poem-of-the-day"
                className="w-full mb-12 text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-wide text-[#2C3E50] mb-3">
                  Стихотворение дня
                </h2>
                <div className="w-16 h-px mx-auto my-4 bg-[#2C3E50]/25" aria-hidden="true" />
                {poemOfTheDay.bookNumber && (
                  <p className="font-serif text-base sm:text-lg text-[#2C3E50]/70 mb-1">
                    Книга {poemOfTheDay.bookNumber}
                  </p>
                )}
                <h3 className="font-serif text-xl sm:text-2xl text-[#2C3E50] mb-4">
                  {poemOfTheDay.title}
                </h3>
                {(poemOfTheDay.dedication || poemOfTheDay.epigraph) && (
                  <p className="font-serif text-sm italic text-[#2C3E50]/85 mb-4 whitespace-pre-line">
                    {[poemOfTheDay.dedication, poemOfTheDay.epigraph].filter(Boolean).join('\n')}
                  </p>
                )}
                <div className="font-serif text-lg sm:text-xl text-[#2C3E50] leading-relaxed whitespace-pre-line">
                  {poemOfTheDay.content}
                </div>
              </motion.div>
              
              <div className="flex justify-center w-full">
                <Link
                  to="/read/book-1"
                  className="btn-cta"
                  aria-label="Открыть книгу для чтения"
                >
                  <span>Читать</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Копирайт */}
      <footer className="py-6 px-4 bg-[#F5F5F0]">
        <div className="max-w-[720px] mx-auto text-center text-sm text-[#2C3E50]/85 font-serif">
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <span aria-hidden="true">©</span>
            <span>{new Date().getFullYear()}</span>
            <span>Все права защищены.</span>
          </p>
          <p className="mt-2">
            Полная или частичная перепечатка (копирование) материалов, опубликованных на сайте, допускается только с письменного разрешения автора.
          </p>
        </div>
      </footer>
    </div>
  );
}
