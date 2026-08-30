import type * as React from 'react';
import * as ReactDom from 'react-dom';

import { useFloatingPortalNode } from '@floating-ui/react';

type TFloatingPortalLiteProps = {
    children?: React.ReactNode;
    root?: HTMLElement | null | React.Ref<HTMLElement | null>;
};

export function FloatingPortalLite(props: TFloatingPortalLiteProps) {
    const { root, children } = props;
    const portalNode = useFloatingPortalNode({ root });

    return portalNode && ReactDom.createPortal(children, portalNode);
}
