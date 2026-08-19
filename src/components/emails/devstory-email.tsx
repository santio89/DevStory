import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import type { CSSProperties } from "react";
import type { Era } from "@/lib/devstory/story";

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

export function DevStoryEmail({
  title,
  summary,
  eras,
  username,
  ps,
  storyUrl,
}: {
  title: string;
  summary: string;
  eras: Era[];
  username: string;
  ps: string;
  storyUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{summary}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>DevStory</Text>
          <Heading style={heading}>{title}</Heading>
          <Text style={subtitle}>
            The story of {username}&apos;s invisible hours.
          </Text>
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
          <Text style={muted}>
            {username}&apos;s DevStory is a narrative timeline generated from
            their GitHub history — commits are letters, repos are chapters.
          </Text>
          <Section style={cta}>
            <Button href={storyUrl} style={button}>
              Read {username}&apos;s full story
            </Button>
          </Section>
          {ps ? <Text style={psText}>P.S. {ps}</Text> : null}
          <Hr style={hr} />
          <Text style={footer}>— crafted by DevStory</Text>
        </Container>
      </Body>
    </Html>
  );
}