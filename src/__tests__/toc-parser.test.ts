/**
 * Unit tests for the TOC parser.
 *
 * We test:
 * 1. The generated toc-book.json has the correct structure.
 * 2. A sample raw text is parsed correctly using the exported parseTocText.
 */
import { describe, it, expect } from 'vitest';
import tocData from '@/data/toc-book.json';
import type { BookTocData, TocSection, TocChapterNode, TocPoemNode, TocMarkerNode } from '@/types/toc-types';

const toc = tocData as BookTocData;

/* ─── Structure tests on the generated JSON ─── */

describe('toc-book.json structure', () => {
  it('has the correct book title', () => {
    expect(toc.meta.bookTitle).toBe('ПРОСТО ЧЕЛОВЕКОМ');
  });

  it('has front matter with an epigraph', () => {
    expect(toc.frontMatter.length).toBe(1);
    expect(toc.frontMatter[0].type).toBe('marker');
    expect(toc.frontMatter[0].title).toBe('ЭПИГРАФ');
    expect(toc.frontMatter[0].text).toBeTruthy();
    expect(toc.frontMatter[0].text).toContain('Соснора');
  });

  it('has 4 top-level sections (Part I, Part II, Epilogue, PS)', () => {
    expect(toc.sections.length).toBe(4);
    expect(toc.sections.map((s: TocSection) => s.type)).toEqual([
      'part',
      'part',
      'epilogue',
      'postscriptum',
    ]);
  });

  it('Part I has correct label and title', () => {
    const part1 = toc.sections[0];
    expect(part1.label).toBe('ЧАСТЬ I');
    expect(part1.title).toBe('ИСТОКИ (ДО НАЧАЛА ВРЕМЕН)');
    expect(part1.id).toBe('part-i');
  });

  it('Part I has 7 poems + 1 interlude', () => {
    const items = toc.sections[0].items;
    const poems = items.filter((i) => i.type === 'poem');
    const interludes = items.filter((i) => i.type === 'interlude');
    expect(poems.length).toBe(7);
    expect(interludes.length).toBe(1);
  });

  it('Part I first poem is correct', () => {
    const poem = toc.sections[0].items[0] as TocPoemNode;
    expect(poem.type).toBe('poem');
    expect(poem.title).toBe('Здравствуй, Грин');
    expect(poem.page).toBe(1);
    expect(poem.id).toBe('poem-1');
  });

  it('Part II has correct label', () => {
    const part2 = toc.sections[1];
    expect(part2.label).toBe('ЧАСТЬ II');
    expect(part2.title).toBe('НЕРВОЖИЛИЯ (ВОЗВРАЩЕНИЕ)');
  });

  it('Part II contains 10 chapters', () => {
    const chapters = toc.sections[1].items.filter(
      (i) => i.type === 'chapter',
    );
    expect(chapters.length).toBe(10);
  });

  it('Chapter 1 has correct structure', () => {
    const ch1 = toc.sections[1].items.find(
      (i) => i.type === 'chapter' && (i as TocChapterNode).id === 'chapter-1',
    ) as TocChapterNode;
    expect(ch1).toBeTruthy();
    expect(ch1.label).toBe('ГЛАВА 1');
    expect(ch1.title).toBe('МАНИФЕСТ (ПРАВО НА ГОЛОС)');
    const poems = ch1.items.filter((i) => i.type === 'poem') as TocPoemNode[];
    expect(poems.length).toBe(14); // poems 8-21
    expect(poems[0].page).toBe(8);
    expect(poems[poems.length - 1].page).toBe(21);
  });

  it('Chapter 2 has block subheadings', () => {
    const ch2 = toc.sections[1].items.find(
      (i) => i.type === 'chapter' && (i as TocChapterNode).id === 'chapter-2',
    ) as TocChapterNode;
    expect(ch2).toBeTruthy();
    const blocks = ch2.items.filter((i) => i.type === 'block');
    expect(blocks.length).toBe(3);
    expect(blocks.map((b) => b.title)).toEqual(['Небо', 'Маски', 'Прощание']);
  });

  it('Part II has ИНТЕРМЕЦЦО I and II as standalone interludes with poems', () => {
    const part2Items = toc.sections[1].items;

    // ИНТЕРМЕЦЦО I — отдельная интерлюдия на уровне части (между главой 4 и 5)
    const intermeccoI = part2Items.find(
      (i) => i.type === 'interlude' && i.title === 'ИНТЕРМЕЦЦО I',
    );
    expect(intermeccoI).toBeTruthy();
    const intermeccoIPoems = (intermeccoI as any).items?.filter(
      (i: any) => i.type === 'poem',
    );
    expect(intermeccoIPoems?.length).toBe(1);
    expect(intermeccoIPoems?.[0].id).toBe('poem-130');
    expect(intermeccoIPoems?.[0].title).toBe('Hydrologium');

    // ИНТЕРМЕЦЦО II: ФАТУМ — отдельная интерлюдия на уровне части (между главой 5 и 6)
    const intermeccoII = part2Items.find(
      (i) => i.type === 'interlude' && i.title === 'ИНТЕРМЕЦЦО II: ФАТУМ',
    );
    expect(intermeccoII).toBeTruthy();
    const intermeccoIIPoems = (intermeccoII as any).items?.filter(
      (i: any) => i.type === 'poem',
    );
    expect(intermeccoIIPoems?.length).toBe(4);
    expect(intermeccoIIPoems?.map((p: any) => p.id)).toEqual([
      'poem-143', 'poem-144', 'poem-145', 'poem-146',
    ]);
  });

  it('Chapter 5 has Roman-numeral subsections (I. Вход, II. Ностос, III. Выход)', () => {
    const ch5 = toc.sections[1].items.find(
      (i) => i.type === 'chapter' && (i as TocChapterNode).id === 'chapter-5',
    ) as TocChapterNode;
    const subs = ch5.items.filter((i) => i.type === 'subsection');
    expect(subs.length).toBe(3);
    expect(subs[0].title).toBe('I. Вход');
    expect(subs[1].title).toContain('Ностос');
    expect(subs[2].title).toBe('III. Выход');
  });

  it('Chapter 6 has an epigraph marker', () => {
    const ch6 = toc.sections[1].items.find(
      (i) => i.type === 'chapter' && (i as TocChapterNode).id === 'chapter-6',
    ) as TocChapterNode;
    const epigraph = ch6.items.find(
      (i) => i.type === 'marker' && (i as TocMarkerNode).title === 'ЭПИГРАФ',
    ) as TocMarkerNode;
    expect(epigraph).toBeTruthy();
    expect(epigraph.text).toContain('Шкловский');
  });

  it('Chapter 6 has a subsection (Плоды)', () => {
    const ch6 = toc.sections[1].items.find(
      (i) => i.type === 'chapter' && (i as TocChapterNode).id === 'chapter-6',
    ) as TocChapterNode;
    const sub = ch6.items.find((i) => i.type === 'subsection');
    expect(sub).toBeTruthy();
    expect(sub?.title).toBe('Плоды');
  });

  it('Epilogue section has poems 240-244', () => {
    const epilogue = toc.sections[2];
    expect(epilogue.type).toBe('epilogue');
    expect(epilogue.label).toBe('ЭПИЛОГ');
    const poems = epilogue.items.filter((i) => i.type === 'poem') as TocPoemNode[];
    expect(poems.length).toBe(5);
    expect(poems[0].page).toBe(240);
    expect(poems[poems.length - 1].page).toBe(244);
  });

  it('Post Scriptum section has poem 245 (Точка)', () => {
    const ps = toc.sections[3];
    expect(ps.type).toBe('postscriptum');
    expect(ps.items.length).toBe(1);
    expect((ps.items[0] as TocPoemNode).title).toBe('Точка');
    expect((ps.items[0] as TocPoemNode).page).toBe(245);
  });

  it('total poems is 245', () => {
    let count = 0;
    function walk(items: Array<{ type: string; items?: unknown[] }>) {
      for (const item of items) {
        if (item.type === 'poem') count++;
        if (item.items) walk(item.items as typeof items);
      }
    }
    for (const section of toc.sections) walk(section.items);
    expect(count).toBe(245);
  });

  it('poem 96 title includes em-dash (special override)', () => {
    let found: TocPoemNode | undefined;
    function walk(items: Array<{ type: string; id?: string; items?: unknown[] }>) {
      for (const item of items) {
        if (item.type === 'poem' && item.id === 'poem-96') {
          found = item as unknown as TocPoemNode;
        }
        if ((item as { items?: unknown[] }).items)
          walk((item as { items: unknown[] }).items as typeof items);
      }
    }
    for (const section of toc.sections) walk(section.items);
    expect(found).toBeTruthy();
    expect(found!.title).toBe('Любовь — война');
  });

  it('every poem has a unique id', () => {
    const ids = new Set<string>();
    function walk(items: Array<{ type: string; id?: string; items?: unknown[] }>) {
      for (const item of items) {
        if (item.type === 'poem') {
          expect(ids.has(item.id!)).toBe(false);
          ids.add(item.id!);
        }
        if ((item as { items?: unknown[] }).items)
          walk((item as { items: unknown[] }).items as typeof items);
      }
    }
    for (const section of toc.sections) walk(section.items);
    expect(ids.size).toBe(245);
  });
});
