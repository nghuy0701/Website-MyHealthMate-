import { Toaster as Sonner } from "sonner@2.0.3";

/**
 * Wrapper for the Sonner toaster.
 * The original shadcn snippet expected a next-themes ThemeProvider, but this
 * project doesn't use that provider. Calling useTheme without the provider
 * throws at render time, which crashed the whole app and left a blank page.
 * We keep a simple light theme to stay safe in any environment.
 */
const Toaster = ({ ...props }) => (
  <Sonner
    theme="light"
    className="toaster group"
    style={{
      "--normal-bg": "var(--popover)",
      "--normal-text": "var(--popover-foreground)",
      "--normal-border": "var(--border)",
    }}
    {...props}
  />
);

export { Toaster };
