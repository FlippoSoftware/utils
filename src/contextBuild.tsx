import * as React from 'react';

type TProviderProps<TContextValue extends object | undefined> = React.PropsWithChildren<TContextValue>;

function contextBuild<TContextValue extends object | undefined>(rootComponentName: string, defaultContextValue?: TContextValue) {
  const Context = React.createContext<TContextValue | undefined>(defaultContextValue);

  function Provider(props: TProviderProps<TContextValue>): React.ReactElement<TProviderProps<TContextValue>> {
    const { children, ...context } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memorizedContext = React.useMemo(() => context, Object.values(context)) as TContextValue;
    return <Context value={ memorizedContext }>{children}</Context>;
  }

  const PROVIDER_NAME = `${rootComponentName}Provider`;

  Provider.displayName = PROVIDER_NAME;

  function useContext(ownerName: string) {
    const context = React.use(Context);

    if (context)
      return context;

    if (defaultContextValue)
      return defaultContextValue;

    throw new Error(`\`${ownerName}\` must be used in  ${PROVIDER_NAME}`);
  }

  return { Provider, useContext } as const;
}

type TScope<T = any> = { [scopeName: string]: React.Context<T>[] } | undefined;
type TScopeHook = (scope: TScope)=> { [__scopeProp: string]: TScope };
type TScopeBuild = {
  scopeName: string;
  (): TScopeHook;
};

function contextScopeBuild(scopeName: string, contextScopeBuilderDeps: TScopeBuild[] = []) {
  const defaultContexts: any[] = [];

  function contextBuild<TContextValue extends object | undefined>(rootComponentName: string, defaultContextValue?: TContextValue) {
    const DefaultContext = React.createContext<TContextValue | undefined>(defaultContextValue);
    const index = defaultContexts.length;
    defaultContexts.push(defaultContexts);

    function Provider(props: TProviderProps<TContextValue> & { scope: TScope<TContextValue> }):
    React.ReactElement<TProviderProps<TContextValue> & { scope: TScope<TContextValue> }> {
      const { children, scope, ...context } = props;
      const Context = scope?.[scopeName]?.[index] ?? DefaultContext;

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const memorizedContext = React.useMemo(() => context, Object.values(context)) as TContextValue;
      return <Context value={ memorizedContext }>{children}</Context>;
    }

    const PROVIDER_NAME = `${rootComponentName}Provider`;

    Provider.displayName = PROVIDER_NAME;

    function useContext(ownerName: string, scope: TScope<TContextValue | undefined>) {
      const Context = scope?.[scopeName]?.[index] ?? DefaultContext;
      const context = React.use(Context);

      if (context)
        return context;

      if (defaultContextValue)
        return defaultContextValue;

      throw new Error(`\`${ownerName}\` must be used in  ${PROVIDER_NAME}`);
    }

    return { Provider, useContext } as const;
  }

  const scopeBuild: TScopeBuild = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => React.createContext(defaultContext));

    return function useScope(scope: TScope) {
      const contexts = scope?.[scopeName] ?? scopeContexts;

      return React.useMemo(() => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }), [scope, contexts]);
    };
  };

  scopeBuild.scopeName = scopeName;

  return { contextBuild, scopeBuild: composeContextScope(scopeBuild, ...contextScopeBuilderDeps) } as const;
}

function composeContextScope(...scopes: [TScopeBuild, ...TScopeBuild[]]): TScopeBuild {
  const baseScope = scopes[0];
  if (scopes.length === 1)
    return baseScope;

  const scopeBuild: TScopeBuild = () => {
    const scopeHooks = scopes.map((scopeBuild) => ({ useScope: scopeBuild(), scopeName: scopeBuild.scopeName }));

    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes, { useScope, scopeName }) => {
        // We are calling a hook inside a callback which React warns against to avoid inconsistent
        // renders, however, scoping doesn't have render side effects so we ignore the rule.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes, ...currentScope };
      }, {});

      return React.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };

  scopeBuild.scopeName = baseScope.scopeName;
  return scopeBuild;
}

export { contextBuild, contextScopeBuild };
export type { TScope, TScopeBuild };
