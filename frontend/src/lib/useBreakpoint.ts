import { useMediaQuery } from 'react-responsive';
import resolveConfig from 'tailwindcss/resolveConfig';
// @ts-expect-error - tailwind config is not typed
import tailwindConfig from '../../tailwind.config.mjs';
import { Config } from 'tailwindcss/types/config';
const fullConfig = resolveConfig(tailwindConfig as Config);

const breakpoints = fullConfig.theme.screens;

type BreakpointKey = keyof typeof breakpoints & string;

export function useBreakpoint<K extends BreakpointKey>(breakpointKey: K) {
  const bool = useMediaQuery({
    query: `(min-width: ${breakpoints[breakpointKey]})`,
  });
  const capitalizedKey =
    breakpointKey[0].toUpperCase() + breakpointKey.substring(1);
  type Key = `is${Capitalize<K>}`;
  return {
    [`is${capitalizedKey}`]: bool,
  } as Record<Key, boolean>;
}
