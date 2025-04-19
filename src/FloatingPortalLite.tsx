import type * as React from 'react';
import { useFloatingPortalNode } from '@floating-ui/react';
import * as ReactDOM from 'react-dom';

type TFloatingPortalLiteProps = {
  children?: React.ReactNode;
  root?: HTMLElement | null | React.Ref<HTMLElement | null>;
};

export function FloatingPortalLite(props: TFloatingPortalLiteProps) {
  const { root, children } = props;
  const portalNode = useFloatingPortalNode({ root });

  return portalNode && ReactDOM.createPortal(children, portalNode);
}
