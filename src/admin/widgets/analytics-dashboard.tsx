import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Badge } from "@medusajs/ui"

// Live Clarity project for recession.netlify.app. Rotate via the
// Clarity dashboard if you ever need a fresh one; VITE_CLARITY_PROJECT_ID
// env var overrides this at build time if set.
const CLARITY_PROJECT_ID =
  (import.meta as { env?: Record<string, string> }).env?.VITE_CLARITY_PROJECT_ID ||
  "xnidslu1jm"

const AnalyticsDashboardWidget = () => {
  const configured = CLARITY_PROJECT_ID.length > 0
  const dashboardUrl = configured
    ? `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}/dashboard`
    : "https://clarity.microsoft.com/signup"

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Heading level="h2">Customer Journey Analytics</Heading>
          {configured ? (
            <Badge color="green" size="2xsmall">
              Live
            </Badge>
          ) : (
            <Badge color="orange" size="2xsmall">
              Setup required
            </Badge>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        <Text size="small" className="text-ui-fg-subtle">
          {configured ? (
            <>
              Heat maps, session recordings, and click tracking for the storefront.
              Powered by Microsoft Clarity — free forever, no data caps. Sessions
              are captured on every page and grouped per individual visitor.
            </>
          ) : (
            <>
              To enable customer journey tracking (heat maps, session recordings,
              click tracking, dwell time), create a free Microsoft Clarity project,
              paste the project ID into <code className="font-mono">CLARITY_PROJECT_ID</code>{" "}
              at the top of this widget, and set{" "}
              <code className="font-mono">NEXT_PUBLIC_CLARITY_PROJECT_ID</code> on the
              storefront (netlify.toml or Netlify env vars) to the same value.
            </>
          )}
        </Text>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="small" asChild>
            <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
              {configured ? "Open Dashboard" : "Sign up for Clarity"}
            </a>
          </Button>
          <Button variant="secondary" size="small" asChild>
            <a
              href="https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup"
              target="_blank"
              rel="noopener noreferrer"
            >
              Setup guide
            </a>
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default AnalyticsDashboardWidget
