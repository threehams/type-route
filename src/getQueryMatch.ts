import { QueryParameterDefinitionCollection } from "./types";
import qs from "./queryString";
import { isNumeric } from "./isNumeric";
import { error } from "./validate";

const isBooleanString = (value: unknown): value is "true" | "false" => {
  return value === "true" || value === "false";
};

export function getQueryMatch(
  queryString: string,
  queryParameters: QueryParameterDefinitionCollection
) {
  const match: {
    [name: string]: string | number | string[] | number[] | boolean;
  } = {};

  const queryParameterNames = Object.keys(queryParameters);

  if (queryParameterNames.length === 0 && queryString === "") {
    return match;
  }

  const queryParameterValues = qs.parse(queryString) as Record<
    string,
    string | string[]
  >;

  for (const name of queryParameterNames) {
    const kind = queryParameters[name];
    const value = queryParameterValues[name];

    if (kind === "query.param.number") {
      if (value === undefined || !isNumeric(value)) {
        return false;
      }

      match[name] = parseFloat(value);
    } else if (kind === "query.param.string") {
      if (value === undefined || Array.isArray(value)) {
        return false;
      }

      match[name] = value;
    } else if (kind === "query.param.boolean") {
      if (value === undefined || !isBooleanString(value)) {
        return false;
      }
      match[name] = value === "true" ? true : false;
    } else if (kind === "query.param.number.optional") {
      if (value !== undefined && isNumeric(value)) {
        match[name] = parseFloat(value);
      }
    } else if (kind === "query.param.string.optional") {
      if (typeof value === "string") {
        match[name] = value;
      }
    } else if (kind === "query.param.boolean.optional") {
      if (isBooleanString(value)) {
        match[name] = value === "true" ? true : false;
      }
    } else if (kind === "query.param.array.number.optional") {
      if (Array.isArray(value) && value.every(val => isNumeric(val))) {
        match[name] = value.map(val => parseFloat(val));
      }
    } else if (kind === "query.param.array.string.optional") {
      if (Array.isArray(value) && value.every(val => typeof val === "string")) {
        match[name] = value;
      }
    } else if (kind === "query.param.array.number") {
      if (Array.isArray(value) && value.every(val => isNumeric(val))) {
        match[name] = value.map(val => parseFloat(val));
      } else {
        return false;
      }
    } else if (kind === "query.param.array.string") {
      if (Array.isArray(value) && value.every(val => typeof val === "string")) {
        match[name] = value;
      } else {
        return false;
      }
    } else {
      throw error(`\n\nUnexpected kind "${kind}"\n`);
    }

    delete queryParameterValues[name];
  }

  if (Object.keys(queryParameterValues).length > 0) {
    return false;
  }

  return match;
}
