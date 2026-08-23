import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "react-email";
import type { CSSProperties } from "react";
import type { Era } from "@/lib/devstory/story";

const profileRow: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: "16px",
  marginBottom: "16px",
};

const avatar: CSSProperties = {
  border: "2px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "12px",
  display: "block",
  height: "64px",
  objectFit: "cover",
  width: "64px",
};

const handleText: CSSProperties = {
  color: "#a1a1aa",
  fontFamily: "ui-monospace, monospace",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  margin: "4px 0 0",
  textTransform: "uppercase",
};

const body: CSSProperties = {
  backgroundColor: "#09090b",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const container: CSSProperties = {
  backgroundColor: "#18181b",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const brand: CSSProperties = {
  color: "#f59e0b",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const heading: CSSProperties = {
  color: "#fafafa",
  fontSize: "28px",
  fontWeight: 600,
  lineHeight: "1.2",
  margin: "12px 0 8px",
};

const subtitle: CSSProperties = {
  color: "#a1a1aa",
  fontSize: "15px",
  margin: "0 0 16px",
};

const summaryText: CSSProperties = {
  color: "#e4e4e7",
  fontSize: "15px",
  lineHeight: "1.6",
};

const hr: CSSProperties = {
  borderColor: "rgba(255, 255, 255, 0.1)",
  margin: "24px 0",
};

const eraBlock: CSSProperties = {
  marginBottom: "20px",
};

const eraYear: CSSProperties = {
  color: "#f59e0b",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  margin: 0,
  textTransform: "uppercase",
};

const eraName: CSSProperties = {
  color: "#fafafa",
  fontSize: "17px",
  fontWeight: 600,
  margin: "4px 0",
};

const eraDesc: CSSProperties = {
  color: "#d4d4d8",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: 0,
};

const muted: CSSProperties = {
  color: "#a1a1aa",
  fontSize: "13px",
  lineHeight: "1.6",
};

const cta: CSSProperties = {
  marginTop: "24px",
  textAlign: "center",
};

const button: CSSProperties = {
  backgroundColor: "#f59e0b",
  borderRadius: "10px",
  color: "#18181b",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
};

const psText: CSSProperties = {
  color: "#e4e4e7",
  fontStyle: "italic",
  fontSize: "14px",
  lineHeight: "1.6",
};

const footer: CSSProperties = {
  color: "#71717a",
  fontSize: "12px",
  margin: 0,
};

export type EmailTemplateLabels = {
  brand: string;
  subtitle: string;
  blurb: string;
  cta: string;
  psLabel: string;
  footer: string;
};

export function DevStoryEmail({
  title,
  summary,
  eras,
  username,
  handle,
  avatarUrl,
  ps,
  storyUrl,
  labels,
  locale = "en",
}: {
  title: string;
  summary: string;
  eras: Era[];
  username: string;
  handle: string;
  avatarUrl?: string | null;
  ps: string;
  storyUrl: string;
  labels: EmailTemplateLabels;
  locale?: "en" | "es";
}) {
  const handleLabel = handle.startsWith("@") ? handle : `@${handle}`;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{summary}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>{labels.brand}</Text>
          <Section style={profileRow}>
            {avatarUrl ? (
              <Img
                src={avatarUrl}
                alt={username}
                width={64}
                height={64}
                style={avatar}
              />
            ) : null}
            <div>
              <Heading style={{ ...heading, margin: 0 }}>{username}</Heading>
              <Text style={handleText}>{handleLabel}</Text>
            </div>
          </Section>
          <Heading style={heading}>{title}</Heading>
          <Text style={subtitle}>{labels.subtitle}</Text>
          <Text style={summaryText}>{summary}</Text>
          <Hr style={hr} />
          {eras.map((era) => (
            <Section key={`${era.year}-${era.name}`} style={eraBlock}>
              <Text style={eraYear}>{era.year}</Text>
              <Text style={eraName}>{era.name}</Text>
              <Text style={eraDesc}>{era.description}</Text>
            </Section>
          ))}
          <Hr style={hr} />
          <Text style={muted}>{labels.blurb}</Text>
          <Section style={cta}>
            <Button href={storyUrl} style={button}>
              {labels.cta}
            </Button>
          </Section>
          {ps ? (
            <Text style={psText}>
              {labels.psLabel} {ps}
            </Text>
          ) : null}
          <Hr style={hr} />
          <Text style={footer}>{labels.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}