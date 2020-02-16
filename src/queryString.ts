import qs, { StringifyOptions } from "query-string";

type Query = {
  [key: string]:
    | string
    | string[]
    | number
    | number[]
    | boolean
    | null
    | undefined;
};

const queryString = {
  stringify: (obj: Query, options?: Omit<StringifyOptions, "arrayFormat">) => {
    return qs.stringify(obj, { ...options, arrayFormat: "bracket" });
  },
  parse: <TParsed extends Query>(str: string): TParsed => {
    const parsed = qs.parse(str) as TParsed;
    return Object.entries(parsed).reduce((acc, [key, item]) => {
      if (key.endsWith("[]")) {
        acc[key.replace(/\[\]$/, "")] = Array.isArray(item) ? item : [item];
      } else {
        acc[key] = item;
      }
      return acc;
    }, {} as any);
  }
};

export default queryString;
