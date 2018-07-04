export type RelationshipField = {
    name: string,
    type: "relationship",
    relationshipName: string,
    relatedModelName: string
};

export type Field =
{ name: string, type: "text", size?: number } |
{ name: string, type: "longtext", columns?: number, rows?: number } |
{ name: string, type: "date" } |
{ name: string, type: "number", max?: number, min?: number } |
RelationshipField;

export const FIELD_TYPES = [
    "text",
    "longtext",
    "date",
    "number",
    "relationship"
];

export interface Model {
    name: string;
    displayField: string;
    fields: Field[];
}
