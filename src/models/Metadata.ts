export type TextField = { name: string, type: "text", size?: number };

export type URLField = { name: string, type: "url", size?: number };

export type RelationshipField = {
    name: string,
    type: "relationship",
    relationshipName: string,
    relatedModelName: string
};

export type ChoiceField = { name: string, type: "choice", choices: string[] };

export type MarkdownField = { name: string, type: "markdown" };

export type Field =
TextField |
ChoiceField |
RelationshipField |
MarkdownField;

export interface Model {
    name: string;
    displayField: string;
    fields: Field[];
}
