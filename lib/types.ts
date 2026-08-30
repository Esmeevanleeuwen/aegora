export type Domain =
  | "Zorg & cliënt"
  | "Wonen"
  | "Werk"
  | "Veiligheid"
  | "Familie"
  | "Overheid";

export type ApplicabilityStatus =
  | "bevestigd"
  | "waarschijnlijk"
  | "uitzondering-mogelijk"
  | "meer-context-nodig"
  | "menselijke-controle";

export type RightItem = {
  id: string;
  domain: Domain;
  title: string;
  summary: string;
  status: ApplicabilityStatus;
  conditions: string[];
  exceptions: string[];
  nextStep: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceDate: string;
};

export type RightsAnswer = {
  summary: string;
  status: ApplicabilityStatus;
  explanation: string;
  assumptions: string[];
  rights: Array<{ id: string; title: string }>;
  nextSteps: string[];
  sources: Array<{ title: string; url: string }>;
  warning: string | null;
  generatedBy: "ai" | "demo";
};
