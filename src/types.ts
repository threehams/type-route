import { MemoryHistory, History } from "history";

export type PathParamString = "path.param.string";
export type PathParamNumber = "path.param.number";
export type QueryParamString = "query.param.string";
export type QueryParamNumber = "query.param.number";
export type QueryParamBoolean = "query.param.boolean";
export type QueryParamArrayString = "query.param.array.string";
export type QueryParamArrayNumber = "query.param.array.number";
export type QueryParamStringOptional = "query.param.string.optional";
export type QueryParamNumberOptional = "query.param.number.optional";
export type QueryParamBooleanOptional = "query.param.boolean.optional";
export type QueryParamArrayStringOptional = "query.param.array.string.optional";
export type QueryParamArrayNumberOptional = "query.param.array.number.optional";

export type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type ParsedPathParameter = {
  name: string;
  kind: PathParamNumber | PathParamString;
  id: string;
};

export type ParsedPath = (string | ParsedPathParameter)[];

export type ParsedPathParameterCollection = {
  [name: string]: ParsedPathParameter;
};

export type ParameterDefinition =
  | PathParamString
  | PathParamNumber
  | QueryParamString
  | QueryParamNumber
  | QueryParamBoolean
  | QueryParamArrayString
  | QueryParamArrayNumber
  | QueryParamStringOptional
  | QueryParamNumberOptional
  | QueryParamBooleanOptional
  | QueryParamArrayStringOptional
  | QueryParamArrayNumberOptional;

export type QueryParameterDefinitionCollection = {
  [parameterName: string]:
    | QueryParamNumber
    | QueryParamString
    | QueryParamBoolean
    | QueryParamArrayNumber
    | QueryParamArrayString
    | QueryParamNumberOptional
    | QueryParamStringOptional
    | QueryParamBooleanOptional
    | QueryParamArrayNumberOptional
    | QueryParamArrayStringOptional;
};

export type ParameterDefinitionCollection = {
  [parameterName: string]: ParameterDefinition;
};

export type PathParameterDefinitionCollection = {
  [parameterName: string]: PathParamNumber | PathParamString;
};

export type PathParams<T> = Record<
  KeysMatching<T, PathParamNumber | PathParamString>,
  string
>;

export type PathFn<T> = (params: PathParams<T>) => string;

export type MatchFnParams = {
  pathName: string;
  queryString?: string;
};

export type MatchFn<T> = (params: MatchFnParams) => RouteParameters<T> | false;

export type RouteParameters<T> = Record<
  KeysMatching<T, QueryParamString | PathParamString>,
  string
> &
  Record<KeysMatching<T, QueryParamNumber | PathParamNumber>, number> &
  Record<KeysMatching<T, QueryParamBoolean>, boolean> &
  Record<KeysMatching<T, QueryParamArrayNumber>, number[]> &
  Record<KeysMatching<T, QueryParamArrayString>, string[]> &
  Partial<Record<KeysMatching<T, QueryParamStringOptional>, string>> &
  Partial<Record<KeysMatching<T, QueryParamNumberOptional>, number>> &
  Partial<Record<KeysMatching<T, QueryParamBooleanOptional>, boolean>> &
  Partial<Record<KeysMatching<T, QueryParamArrayStringOptional>, string[]>> &
  Partial<Record<KeysMatching<T, QueryParamArrayNumberOptional>, number[]>>;

type RouteParameterFunction<T, R> = KeysMatching<
  T,
  QueryParamString | QueryParamNumber | PathParamNumber | PathParamString
> extends never
  ? (params?: RouteParameters<T>) => R
  : (params: RouteParameters<T>) => R;

export type RouteDefinitionBuilder<T> = {
  params: T;
  path: PathFn<T>;

  extend<K extends ParameterDefinitionCollection>(
    params: K,
    path: PathFn<K>
  ): RouteDefinitionBuilder<T & K>;
  extend(path: string): RouteDefinitionBuilder<T>;
};

export type ClickEvent = {
  preventDefault?: () => void;
  button?: number | null;
  defaultPrevented?: boolean | null;
  metaKey?: boolean | null;
  altKey?: boolean | null;
  ctrlKey?: boolean | null;
  shiftKey?: boolean | null;
  target?: { target?: string | null } | null;
};

export type OnClickHandler = (event?: any) => void;

export type RouteDefinition<K, T> = {
  name: K;

  href: RouteParameterFunction<T, string>;

  push: RouteParameterFunction<T, Promise<boolean>>;

  link: RouteParameterFunction<T, { href: string; onClick: OnClickHandler }>;

  replace: RouteParameterFunction<T, Promise<boolean>>;

  match: MatchFn<T>;

  [".builder"]: RouteDefinitionBuilder<T>;

  [".type"]: {
    name: K;
    action: Action;
    params: RouteParameters<T>;
  };
};

export type RouteDefinitionBuilderCollection = {
  [routeName: string]: RouteDefinitionBuilder<ParameterDefinitionCollection>;
};

export type RouteDefinitionCollection = {
  [routeName: string]: RouteDefinition<string, ParameterDefinitionCollection>;
};

export type Action = "push" | "replace" | "pop" | "initial";

export type BrowserHistoryRouterConfig = {
  type: "browser";
  forceRefresh?: boolean;
};

export type MemoryHistoryRouterConfig = {
  type: "memory";
  initialEntries?: string[];
  initialIndex?: number;
};

export type HistoryConfig =
  | BrowserHistoryRouterConfig
  | MemoryHistoryRouterConfig;

export type RouteDefinitionToRoute<
  T extends RouteDefinition<string, ParameterDefinitionCollection>
> = {
  name: T["name"];
  action: Action;
  params: RouteParameters<T[".builder"]["params"]>;
};

export type NotFoundRoute = {
  name: false;
  action: Action;
  params: {};
};

export type RouteDefinitionGroup<T extends any> = {
  [".type"]: T[number][".type"];
  routeNames: T[number][".type"]["name"][];
  has(route: Route<any>): route is T[number][".type"];
};

export type Route<T> = T extends RouteDefinition<any, any>
  ? RouteDefinitionToRoute<T>
  : T extends RouteDefinitionGroup<any>
  ? T[".type"]
  :
      | {
          [K in keyof T]: {
            name: K;
            action: Action;
            params: T[K] extends RouteDefinition<any, any>
              ? RouteParameters<T[K][".builder"]["params"]>
              : T[K] extends RouteDefinitionBuilder<any>
              ? RouteParameters<T[K]["params"]>
              : never;
          };
        }[keyof T]
      | NotFoundRoute;

export type NavigationHandler<T> = (
  nextRoute: Route<T>
) => Promise<boolean | void> | boolean | void;

export type Router<T extends { [key: string]: any }> = {
  routes: { [K in keyof T]: RouteDefinition<K, T[K]["params"]> };

  listen: (handler: NavigationHandler<T>) => () => void;

  getCurrentRoute: () => Route<T>;

  history: {
    getActiveInstance: () =>
      | ({ type: "browser" } & History)
      | ({ type: "memory" } & MemoryHistory);
    configure: (config: HistoryConfig) => void;
  };
};
