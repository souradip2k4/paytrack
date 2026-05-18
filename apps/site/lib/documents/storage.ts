"use client";

import Dexie, { type Table } from "dexie";
import type { Document, DocumentType } from "./schema";

export type SavedTemplate = {
	id: string;
	name: string;
	type: DocumentType;
	doc: Document;
	createdAt: number;
	updatedAt: number;
};

export type SavedDraft = {
	type: DocumentType;
	doc: Document;
	updatedAt: number;
};

class DocumentsDB extends Dexie {
	templates!: Table<SavedTemplate, string>;
	drafts!: Table<SavedDraft, DocumentType>;

	constructor() {
		super("budgetbee-documents");
		this.version(1).stores({
			templates: "id, type, updatedAt",
			drafts: "type, updatedAt",
		});
	}
}

let dbInstance: DocumentsDB | null = null;

function db(): DocumentsDB {
	if (typeof window === "undefined") {
		throw new Error("storage.ts must run in the browser");
	}
	if (!dbInstance) dbInstance = new DocumentsDB();
	return dbInstance;
}

export async function listTemplates(
	type?: DocumentType,
): Promise<SavedTemplate[]> {
	const all = await db().templates.orderBy("updatedAt").reverse().toArray();
	return type ? all.filter(t => t.type === type) : all;
}

export async function saveTemplate(input: {
	id?: string;
	name: string;
	type: DocumentType;
	doc: Document;
}): Promise<SavedTemplate> {
	const now = Date.now();
	const id = input.id ?? crypto.randomUUID();
	const existing = input.id ? await db().templates.get(input.id) : undefined;
	const record: SavedTemplate = {
		id,
		name: input.name,
		type: input.type,
		doc: input.doc,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
	};
	await db().templates.put(record);
	return record;
}

export async function deleteTemplate(id: string): Promise<void> {
	await db().templates.delete(id);
}

export async function loadDraft(
	type: DocumentType,
): Promise<Document | null> {
	const row = await db().drafts.get(type);
	return row?.doc ?? null;
}

export async function saveDraft(
	type: DocumentType,
	doc: Document,
): Promise<void> {
	await db().drafts.put({ type, doc, updatedAt: Date.now() });
}

export async function clearDraft(type: DocumentType): Promise<void> {
	await db().drafts.delete(type);
}
