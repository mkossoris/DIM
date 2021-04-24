import {
  applyStyles,
  arrow,
  computeStyles,
  flip,
  Instance,
  offset,
  Options,
  Padding,
  Placement,
  popperGenerator,
  popperOffsets,
  preventOverflow,
} from '@popperjs/core';
import _ from 'lodash';
import React, { useLayoutEffect, useRef } from 'react';

/** Makes a custom popper that doesn't have the event listeners modifier */
const createPopper = popperGenerator({
  defaultModifiers: [
    popperOffsets,
    offset,
    computeStyles,
    applyStyles,
    flip,
    preventOverflow,
    arrow,
  ],
});

const popperOptions = (
  placement: Options['placement'] = 'auto',
  arrowClassName?: string,
  boundarySelector?: string,
  offset = arrowClassName ? 5 : 0
): Partial<Options> => {
  const headerHeight = parseInt(
    document.querySelector('html')!.style.getPropertyValue('--header-height')!,
    10
  );
  const boundaryElement = boundarySelector && document.querySelector(boundarySelector);
  const padding: Padding = {
    left: 10,
    top: headerHeight + (boundaryElement ? boundaryElement.clientHeight : 0) + 5,
    right: 10,
    bottom: 10,
  };
  const hasArrow = Boolean(arrowClassName);
  return {
    placement,
    modifiers: _.compact([
      {
        name: 'preventOverflow',
        options: {
          priority: ['bottom', 'top', 'right', 'left'],
          boundariesElement: 'viewport',
          padding,
        },
      },
      {
        name: 'flip',
        options: {
          behavior: ['top', 'bottom', 'right', 'left'],
          boundariesElement: 'viewport',
          padding,
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, offset],
        },
      },
      hasArrow && {
        name: 'arrow',
        options: {
          element: '.' + arrowClassName,
        },
      },
    ]),
  };
};

export function usePopper({
  contents,
  reference,
  arrowClassName,
  boundarySelector,
  placement,
  offset,
}: {
  /** A ref to the rendered contents of a popper-positioned item */
  contents: React.RefObject<HTMLElement>;
  /** An ref to the item that triggered the popper, which anchors it */
  reference: React.RefObject<HTMLElement>;
  /** A class used to identify the arrow */
  arrowClassName?: string;
  /** An optional additional selector for a "boundary area" */
  boundarySelector?: string;
  /** Placement preference of the popper. Defaults to "auto" */
  placement?: Placement;
  /** Offset of how far from the element to shift the popper. */
  offset?: number;
}) {
  const popper = useRef<Instance | undefined>();

  const destroy = () => {
    if (popper.current) {
      popper.current.destroy();
      popper.current = undefined;
    }
  };

  useLayoutEffect(() => {
    // log('Effect', name, contents.current, reference.current);
    // Reposition the popup as it is shown or if its size changes
    if (!contents.current || !reference.current) {
      return destroy();
    } else {
      if (popper.current) {
        popper.current.update();
      } else {
        const options = popperOptions(placement, arrowClassName, boundarySelector, offset);
        popper.current = createPopper(reference.current, contents.current, options);
        popper.current.update();
        setTimeout(() => popper.current?.update(), 0); // helps fix arrow position
      }
    }

    return destroy;
  });
}
