import { randomUUID } from "node:crypto";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const id = () => text("id").primaryKey().$defaultFn(randomUUID);
const createdAt = () =>
  timestamp("createdAt", { precision: 3 }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updatedAt", { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const roleEnum = pgEnum("Role", [
  "USER",
  "PARISHONER",
  "PHOTOGRAPHER",
  "ADMIN",
  "DEVELOPER",
]);
export type Role = (typeof roleEnum.enumValues)[number];

export const donationTypeEnum = pgEnum("DonationType", [
  "CHURCH",
  "CHAPEL",
  "THANKSGIVING",
]);

export const priestRoleEnum = pgEnum("PriestRole", [
  "PARISH_PRIEST",
  "ASSISTANT_PRIEST",
]);

export const users = pgTable(
  "User",
  {
    id: id(),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp("emailVerified", { precision: 3 }),
    role: roleEnum("role").notNull().default("USER"),
    image: text("image"),
  },
  (table) => [uniqueIndex("User_email_key").on(table.email)],
);

export const accounts = pgTable(
  "Account",
  {
    id: id(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
  },
  (table) => [
    uniqueIndex("Account_provider_providerAccountId_key").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const sessions = pgTable(
  "Session",
  {
    id: id(),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { precision: 3 }).notNull(),
  },
  (table) => [uniqueIndex("Session_sessionToken_key").on(table.sessionToken)],
);

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { precision: 3 }).notNull(),
  },
  (table) => [
    uniqueIndex("VerificationToken_identifier_token_key").on(
      table.identifier,
      table.token,
    ),
    uniqueIndex("VerificationToken_token_key").on(table.token),
  ],
);

export const wards = pgTable(
  "Ward",
  {
    id: id(),
    name: text("name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("Ward_name_key").on(table.name)],
);

export const families = pgTable(
  "Family",
  {
    id: id(),
    name: text("name").notNull(),
    headId: text("headId"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("Family_headId_key").on(table.headId)],
);

export const parishoners = pgTable(
  "Parishoner",
  {
    id: id(),
    mobile: text("mobile").notNull(),
    mobileVerified: boolean("mobileVerified").notNull().default(false),
    userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
    name: text("name"),
    dateOfBirth: timestamp("dateOfBirth", { precision: 3 }),
    wardId: text("wardId").references(() => wards.id, { onDelete: "set null" }),
    familyId: text("familyId").references(() => families.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("Parishoner_mobile_key").on(table.mobile),
    uniqueIndex("Parishoner_userId_key").on(table.userId),
  ],
);

export const donations = pgTable(
  "Donation",
  {
    id: id(),
    paymentId: text("paymentId").notNull(),
    type: donationTypeEnum("type").notNull(),
    massTiming: text("massTiming"),
    amount: doublePrecision("amount").notNull(),
    forWhom: text("forWhom").notNull(),
    byWhom: text("byWhom").notNull(),
    email: text("email").notNull(),
    createdAt: createdAt(),
    receiptIssued: boolean("receiptIssued").notNull().default(false),
    orderId: text("orderId").references(() => orders.id),
  },
  (table) => [uniqueIndex("Donation_paymentId_key").on(table.paymentId)],
);

export const orders = pgTable(
  "Order",
  {
    id: id(),
    type: donationTypeEnum("type").notNull(),
    amount: doublePrecision("amount").notNull(),
    forWhom: text("forWhom").notNull(),
    byWhom: text("byWhom").notNull(),
    email: text("email").notNull(),
    status: text("status").notNull().default("PENDING"),
    razorpayOrderId: text("razorpayOrderId"),
    paymentId: text("paymentId"),
    massTiming: text("massTiming"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("Order_razorpayOrderId_key").on(table.razorpayOrderId),
  ],
);

export const events = pgTable("Event", {
  id: id(),
  name: text("name").notNull(),
  image: text("image").notNull().default(""),
  date: timestamp("date", { precision: 3 }).notNull(),
  venue: text("venue").notNull(),
  info: text("info"),
  createdAt: createdAt(),
});

export const bethkati = pgTable("Bethkati", {
  id: id(),
  url: text("url").notNull(),
  year: integer("year").notNull(),
  month: text("month").notNull(),
  createdAt: createdAt(),
});

export const priests = pgTable("Priest", {
  id: id(),
  name: text("name").notNull(),
  role: priestRoleEnum("role").notNull(),
  period: text("period").notNull(),
  imageUrl: text("imageUrl"),
  isCurrent: boolean("isCurrent").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const galleries = pgTable("Gallery", {
  id: id(),
  eventName: text("eventName").notNull(),
  eventDate: timestamp("eventDate", { precision: 3 }).notNull(),
  cloudinaryFolder: text("cloudinaryFolder").notNull(),
  createdAt: createdAt(),
});

export const galleryImages = pgTable(
  "GalleryImage",
  {
    id: id(),
    url: text("url").notNull(),
    likedBy: text("likedBy")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    createdAt: createdAt(),
    galleryId: text("galleryId")
      .notNull()
      .references(() => galleries.id, { onDelete: "cascade" }),
    uploadedById: text("uploadedById").references(() => users.id),
  },
  (table) => [uniqueIndex("GalleryImage_url_key").on(table.url)],
);

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  parishoner: one(parishoners),
  galleryImages: many(galleryImages),
}));
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
export const wardsRelations = relations(wards, ({ many }) => ({
  parishoners: many(parishoners),
}));
export const parishonersRelations = relations(parishoners, ({ one }) => ({
  user: one(users, { fields: [parishoners.userId], references: [users.id] }),
  ward: one(wards, { fields: [parishoners.wardId], references: [wards.id] }),
  family: one(families, {
    relationName: "familyMembers",
    fields: [parishoners.familyId],
    references: [families.id],
  }),
  familyHead: one(families, {
    relationName: "familyHead",
    fields: [parishoners.id],
    references: [families.headId],
  }),
}));
export const familiesRelations = relations(families, ({ one, many }) => ({
  head: one(parishoners, {
    relationName: "familyHead",
    fields: [families.headId],
    references: [parishoners.id],
  }),
  members: many(parishoners, { relationName: "familyMembers" }),
}));
export const ordersRelations = relations(orders, ({ many }) => ({
  donations: many(donations),
}));
export const donationsRelations = relations(donations, ({ one }) => ({
  order: one(orders, { fields: [donations.orderId], references: [orders.id] }),
}));
export const galleriesRelations = relations(galleries, ({ many }) => ({
  images: many(galleryImages),
}));
export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryImages.galleryId],
    references: [galleries.id],
  }),
  uploadedBy: one(users, {
    fields: [galleryImages.uploadedById],
    references: [users.id],
  }),
}));
