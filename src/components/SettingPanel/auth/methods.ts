export const authMethods = [
  { value: "無認證", object: null, label: "None" },
  { value: "Basic", object: null, label: "Basic" },
];

export type AuthMethod = (typeof authMethods)[number]["value"];
