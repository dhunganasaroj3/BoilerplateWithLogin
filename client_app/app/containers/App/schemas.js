import { schema } from 'normalizr';


export const contentTemplateSchema = new schema.Entity(
  "contentTemplate", {}, { idAttribute: "template_name" }
);

