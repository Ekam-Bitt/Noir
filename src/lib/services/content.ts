import {
  collectionStories as seededCollectionStories,
  defaultStoreSettings,
  faqs as seededFaqs,
  lookbookEntries as seededLookbookEntries,
} from "@/lib/data/store";
import { getSql } from "@/lib/server/postgres";
import type { CollectionStory, FAQItem, LookbookEntry, StoreSettings } from "@/lib/types";

type StoreSettingsRow = {
  brand_name: string;
  logo_text: string;
  brand_tagline: string;
  announcement: string;
  hero_title: string;
  hero_copy: string;
  hero_cta: string;
  hero_secondary_cta: string;
  marquee: string[];
  newsletter_heading: string;
  newsletter_placeholder: string;
  about_headline: string;
  about_body: string;
  laboratory_title: string;
  laboratory_body: string;
  faq_title: string;
  shipping_title: string;
  contact_email: string;
  contact_phone: string;
  contact_hours: string;
  brand_canvas: string;
  brand_ink: string;
  brand_accent: string;
  payment_methods: StoreSettings["paymentMethods"];
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  express_shipping_fee: number;
};

type CollectionStoryRow = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  narrative: string;
  mood: string;
  palette: CollectionStory["palette"];
  featured_product_slugs: string[];
  is_visible: boolean;
  is_featured: boolean;
};

type LookbookEntryRow = {
  slug: string;
  title: string;
  season: string;
  caption: string;
  palette: LookbookEntry["palette"];
};

type FaqRow = {
  question: string;
  answer: string;
};

let contentSeedPromise: Promise<void> | null = null;

async function ensureContentSeeded() {
  const sql = getSql();
  if (!sql) {
    return;
  }

  if (!contentSeedPromise) {
    contentSeedPromise = (async () => {
      const [settingsRow] = await sql<{ count: number }[]>`
        select count(*)::int as count from store_settings
      `;

      if ((settingsRow?.count ?? 0) === 0) {
        await sql`
          insert into store_settings (
            id, brand_name, logo_text, brand_tagline, announcement, hero_title, hero_copy, hero_cta,
            hero_secondary_cta, marquee, newsletter_heading, newsletter_placeholder, about_headline, about_body,
            laboratory_title, laboratory_body, faq_title, shipping_title, contact_email, contact_phone,
            contact_hours, brand_canvas, brand_ink, brand_accent, payment_methods, free_shipping_threshold,
            standard_shipping_fee, express_shipping_fee
          ) values (
            1,
            ${defaultStoreSettings.brandName},
            ${defaultStoreSettings.logoText},
            ${defaultStoreSettings.brandTagline},
            ${defaultStoreSettings.announcement},
            ${defaultStoreSettings.heroTitle},
            ${defaultStoreSettings.heroCopy},
            ${defaultStoreSettings.heroCta},
            ${defaultStoreSettings.heroSecondaryCta},
            ${sql.json(defaultStoreSettings.marquee)},
            ${defaultStoreSettings.newsletterHeading},
            ${defaultStoreSettings.newsletterPlaceholder},
            ${defaultStoreSettings.aboutHeadline},
            ${defaultStoreSettings.aboutBody},
            ${defaultStoreSettings.laboratoryTitle},
            ${defaultStoreSettings.laboratoryBody},
            ${defaultStoreSettings.faqTitle},
            ${defaultStoreSettings.shippingTitle},
            ${defaultStoreSettings.contactEmail},
            ${defaultStoreSettings.contactPhone},
            ${defaultStoreSettings.contactHours},
            ${defaultStoreSettings.brandCanvas},
            ${defaultStoreSettings.brandInk},
            ${defaultStoreSettings.brandAccent},
            ${sql.json(defaultStoreSettings.paymentMethods)},
            ${defaultStoreSettings.freeShippingThreshold},
            ${defaultStoreSettings.standardShippingFee},
            ${defaultStoreSettings.expressShippingFee}
          )
        `;
      }

      const [storyCount] = await sql<{ count: number }[]>`
        select count(*)::int as count from collection_stories
      `;
      if ((storyCount?.count ?? 0) === 0) {
        for (const story of seededCollectionStories) {
          await sql`
            insert into collection_stories (
              slug, title, eyebrow, intro, narrative, mood, palette, featured_product_slugs, is_visible, is_featured
            ) values (
              ${story.slug},
              ${story.title},
              ${story.eyebrow},
              ${story.intro},
              ${story.narrative},
              ${story.mood},
              ${sql.json(story.palette)},
              ${sql.json(story.featuredProductSlugs)},
              ${story.isVisible ?? true},
              ${story.isFeatured ?? false}
            )
            on conflict (slug) do nothing
          `;
        }
      }

      const [lookbookCount] = await sql<{ count: number }[]>`
        select count(*)::int as count from lookbook_entries
      `;
      if ((lookbookCount?.count ?? 0) === 0) {
        for (const entry of seededLookbookEntries) {
          await sql`
            insert into lookbook_entries (slug, title, season, caption, palette)
            values (
              ${entry.slug},
              ${entry.title},
              ${entry.season},
              ${entry.caption},
              ${sql.json(entry.palette)}
            )
            on conflict (slug) do nothing
          `;
        }
      }

      const [faqCount] = await sql<{ count: number }[]>`
        select count(*)::int as count from faq_items
      `;
      if ((faqCount?.count ?? 0) === 0) {
        for (const [index, item] of seededFaqs.entries()) {
          await sql`
            insert into faq_items (question, answer, sort_order)
            values (${item.question}, ${item.answer}, ${index})
          `;
        }
      }
    })();
  }

  await contentSeedPromise;
}

function mapStoreSettings(row: {
  brand_name: string;
  logo_text: string;
  brand_tagline: string;
  announcement: string;
  hero_title: string;
  hero_copy: string;
  hero_cta: string;
  hero_secondary_cta: string;
  marquee: string[];
  newsletter_heading: string;
  newsletter_placeholder: string;
  about_headline: string;
  about_body: string;
  laboratory_title: string;
  laboratory_body: string;
  faq_title: string;
  shipping_title: string;
  contact_email: string;
  contact_phone: string;
  contact_hours: string;
  brand_canvas: string;
  brand_ink: string;
  brand_accent: string;
  payment_methods: StoreSettings["paymentMethods"];
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  express_shipping_fee: number;
}): StoreSettings {
  return {
    brandName: row.brand_name,
    logoText: row.logo_text,
    brandTagline: row.brand_tagline,
    announcement: row.announcement,
    heroTitle: row.hero_title,
    heroCopy: row.hero_copy,
    heroCta: row.hero_cta,
    heroSecondaryCta: row.hero_secondary_cta,
    marquee: row.marquee,
    newsletterHeading: row.newsletter_heading,
    newsletterPlaceholder: row.newsletter_placeholder,
    aboutHeadline: row.about_headline,
    aboutBody: row.about_body,
    laboratoryTitle: row.laboratory_title,
    laboratoryBody: row.laboratory_body,
    faqTitle: row.faq_title,
    shippingTitle: row.shipping_title,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    contactHours: row.contact_hours,
    brandCanvas: row.brand_canvas,
    brandInk: row.brand_ink,
    brandAccent: row.brand_accent,
    paymentMethods: row.payment_methods,
    freeShippingThreshold: row.free_shipping_threshold,
    standardShippingFee: row.standard_shipping_fee,
    expressShippingFee: row.express_shipping_fee,
  };
}

export async function getStoreSettings() {
  const sql = getSql();
  await ensureContentSeeded();
  const [row] = await sql<StoreSettingsRow[]>`select * from store_settings where id = 1 limit 1`;
  return row ? mapStoreSettings(row) : defaultStoreSettings;
}

export async function updateStoreSettings(payload: Partial<StoreSettings>) {
  const sql = getSql();
  await ensureContentSeeded();
  const current = await getStoreSettings();
  const next = {
    ...current,
    ...payload,
    paymentMethods: payload.paymentMethods ?? current.paymentMethods,
    marquee: payload.marquee ?? current.marquee,
  };

  await sql`
    update store_settings
    set
      brand_name = ${next.brandName},
      logo_text = ${next.logoText},
      brand_tagline = ${next.brandTagline},
      announcement = ${next.announcement},
      hero_title = ${next.heroTitle},
      hero_copy = ${next.heroCopy},
      hero_cta = ${next.heroCta},
      hero_secondary_cta = ${next.heroSecondaryCta},
      marquee = ${sql.json(next.marquee)},
      newsletter_heading = ${next.newsletterHeading},
      newsletter_placeholder = ${next.newsletterPlaceholder},
      about_headline = ${next.aboutHeadline},
      about_body = ${next.aboutBody},
      laboratory_title = ${next.laboratoryTitle},
      laboratory_body = ${next.laboratoryBody},
      faq_title = ${next.faqTitle},
      shipping_title = ${next.shippingTitle},
      contact_email = ${next.contactEmail},
      contact_phone = ${next.contactPhone},
      contact_hours = ${next.contactHours},
      brand_canvas = ${next.brandCanvas},
      brand_ink = ${next.brandInk},
      brand_accent = ${next.brandAccent},
      payment_methods = ${sql.json(next.paymentMethods)},
      free_shipping_threshold = ${next.freeShippingThreshold},
      standard_shipping_fee = ${next.standardShippingFee},
      express_shipping_fee = ${next.expressShippingFee},
      updated_at = timezone('utc', now())
    where id = 1
  `;

  return next;
}

export async function getHomePageContent() {
  const settings = await getStoreSettings();
  return {
    heroTitle: settings.heroTitle,
    heroCopy: settings.heroCopy,
    heroCta: settings.heroCta,
    heroSecondaryCta: settings.heroSecondaryCta,
    marquee: settings.marquee,
  };
}

function mapStory(row: CollectionStoryRow): CollectionStory {
  return {
    slug: row.slug,
    title: row.title,
    eyebrow: row.eyebrow,
    intro: row.intro,
    narrative: row.narrative,
    mood: row.mood,
    palette: row.palette,
    featuredProductSlugs: row.featured_product_slugs,
    isVisible: row.is_visible,
    isFeatured: row.is_featured,
  };
}

export async function getCollectionStory(slug: string) {
  const sql = getSql();
  await ensureContentSeeded();
  const [row] = await sql<CollectionStoryRow[]>`
    select * from collection_stories
    where slug = ${slug} and is_visible = true
    limit 1
  `;
  return row ? mapStory(row) : null;
}

export async function getCollectionStories() {
  const sql = getSql();
  await ensureContentSeeded();
  const rows = await sql<CollectionStoryRow[]>`
    select * from collection_stories
    where is_visible = true
    order by created_at desc
  `;
  return rows.map(mapStory);
}

export async function getFeaturedCollectionStories() {
  const sql = getSql();
  await ensureContentSeeded();
  const rows = await sql<CollectionStoryRow[]>`
    select * from collection_stories
    where is_visible = true and is_featured = true
    order by created_at desc
  `;
  return rows.map(mapStory);
}

export async function createCollectionStory(payload: CollectionStory) {
  const sql = getSql();
  await ensureContentSeeded();
  await sql`
    insert into collection_stories (
      slug, title, eyebrow, intro, narrative, mood, palette, featured_product_slugs, is_visible, is_featured
    ) values (
      ${payload.slug},
      ${payload.title},
      ${payload.eyebrow},
      ${payload.intro},
      ${payload.narrative},
      ${payload.mood},
      ${sql.json(payload.palette)},
      ${sql.json(payload.featuredProductSlugs)},
      ${payload.isVisible ?? true},
      ${payload.isFeatured ?? false}
    )
  `;
  return payload;
}

export async function updateCollectionStory(slug: string, payload: Partial<CollectionStory>) {
  const sql = getSql();
  await ensureContentSeeded();
  const current = await getCollectionStory(slug);
  if (!current) {
    throw new Error("Drop not found.");
  }
  const next = { ...current, ...payload };
  await sql`
    update collection_stories
    set
      title = ${next.title},
      eyebrow = ${next.eyebrow},
      intro = ${next.intro},
      narrative = ${next.narrative},
      mood = ${next.mood},
      palette = ${sql.json(next.palette)},
      featured_product_slugs = ${sql.json(next.featuredProductSlugs)},
      is_visible = ${next.isVisible ?? true},
      is_featured = ${next.isFeatured ?? false},
      updated_at = timezone('utc', now())
    where slug = ${slug}
  `;
  return next;
}

export async function getLookbookEntries() {
  const sql = getSql();
  await ensureContentSeeded();
  const rows = await sql<LookbookEntryRow[]>`
    select * from lookbook_entries
    order by created_at desc
  `;
  return rows.map(
    (row): LookbookEntry => ({
      slug: row.slug,
      title: row.title,
      season: row.season,
      caption: row.caption,
      palette: row.palette,
    }),
  );
}

export async function getFaqs() {
  const sql = getSql();
  await ensureContentSeeded();
  const rows = await sql<FaqRow[]>`
    select question, answer
    from faq_items
    order by sort_order asc, created_at asc
  `;
  return rows.map(
    (row): FAQItem => ({
      question: row.question,
      answer: row.answer,
    }),
  );
}
