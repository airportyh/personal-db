export type TextField = { name: string, type: "text", size?: number };

export type URLField = { name: string, type: "url", size?: number };

export type RelationshipField = {
    name: string,
    type: "relationship",
    relationshipName: string,
    relatedModelName: string
};

export type ChoiceField = { name: string, type: "choice", choices: string[] };



export type Field =
TextField |
ChoiceField |
RelationshipField;

export const FIELD_TYPES = [
    "text",
    "url",
    "choice",
    // "longtext",
    // "date",
    // "number",
    "relationship"
];

export interface Model {
    name: string;
    displayField: string;
    fields: Field[];
}
