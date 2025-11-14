import * as React from "react";
import { sampleEvaluation } from "@/data/sample-evaluation";
import { RadarSpiderChart } from "@/components/charts/radar-spider-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { EvaluationPayload, DomainScore } from "@/types/evaluation";
import { cn } from "@/lib/utils";
import { Award, BarChart3, Lightbulb, NotebookPen, UploadCloud, Users } from "lucide-react";

const scoreColors: Record<number, string> = {
  4: "text-emerald-600 bg-emerald-50",
  3: "text-sky-600 bg-sky-50",
  2: "text-amber-600 bg-amber-50",
  1: "text-rose-600 bg-rose-50"
};

const scoreLabels: Record<number, string> = {
  4: "Exemplary",
  3: "Effective",
  2: "Developing",
  1: "Unsatisfactory"
};

export default function DashboardPage() {
  const evaluation = sampleEvaluation;
  const tiles = buildStatTiles(evaluation);
  const domainEntries = React.useMemo(() => Object.entries(evaluation.domain_scores), [evaluation]);
  const radarData = React.useMemo(() => buildRadarData(evaluation.domain_scores), [evaluation]);

  return (
    <TooltipProvider>
      <AuroraBackground className="!h-auto min-h-screen w-full bg-transparent px-3 py-6 dark:bg-transparent md:px-6 lg:px-8">
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-2 py-4 sm:px-4 sm:py-10">
          <header className="rounded-3xl border bg-white px-6 py-6 shadow-sm lg:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Lesson overview</p>
                <h1 className="text-3xl font-semibold text-slate-900">{evaluation.lesson_overview.teacher_name}</h1>
                <p className="max-w-2xl text-base text-muted-foreground">{evaluation.lesson_overview.overall_impression}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary" className="bg-slate-900 text-white">
                    {evaluation.lesson_overview.school_name}
                  </Badge>
                  <Badge variant="outline">{evaluation.lesson_overview.region}</Badge>
                  <Badge variant="outline">{evaluation.lesson_overview.subject}</Badge>
                  <Badge variant="outline">{evaluation.lesson_overview.lesson_type}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Button className="gap-2 text-base">
                  <UploadCloud className="h-4 w-4" />
                  Upload lesson
                </Button>
                <p className="text-sm text-muted-foreground">
                  Connect to the Django backend at <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/api/evaluate/</code> to
                  feed new lessons.
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tiles.map((tile) => (
              <Card key={tile.label} className="border-none bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">{tile.label}</CardDescription>
                  <tile.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-slate-900">{tile.value}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tile.description}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="border-none bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Spider web of rubric scores</CardTitle>
                <CardDescription>Visual snapshot of performance across all domains (scale 1–4).</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Max score 4
              </Badge>
            </CardHeader>
            <CardContent>
              <RadarSpiderChart data={radarData} />
            </CardContent>
          </Card>

          <Tabs defaultValue="domains" className="space-y-6">
            <TabsList className="w-full justify-start overflow-auto">
              <TabsTrigger value="domains">Domain insights</TabsTrigger>
              <TabsTrigger value="growth">Strengths & growth</TabsTrigger>
              <TabsTrigger value="limits">Limits of inference</TabsTrigger>
            </TabsList>

            <TabsContent value="domains" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {domainEntries.map(([domainKey, domain]) => (
                  <DomainCard key={domainKey} title={formatDomainTitle(domainKey)} domain={domain} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="growth">
              <Card className="border-none bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Strengths celebrated</CardTitle>
                  <CardDescription>What the evaluator praised about this lesson.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evaluation.global_rating.top_strengths.map((item) => (
                    <ListItem key={item} icon={<Award className="h-4 w-4 text-emerald-600" />} text={item} />
                  ))}
                </CardContent>
                <Separator />
                <CardHeader>
                  <CardTitle>Priority areas for growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evaluation.global_rating.priority_areas_for_growth.map((item) => (
                    <ListItem key={item} icon={<Lightbulb className="h-4 w-4 text-amber-600" />} text={item} />
                  ))}
                </CardContent>
                <Separator />
                <CardHeader>
                  <CardTitle>Concrete next steps</CardTitle>
                  <CardDescription>Ready-to-use moves for upcoming lessons.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {evaluation.global_rating.concrete_next_steps_for_teacher.map((step, idx) => (
                    <div key={step} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="limits">
              <Card className="border-none bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Limits of inference</CardTitle>
                  <CardDescription>Contextual reminders from an audio-only capture.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-900">Audio-only constraints</p>
                    <p className="text-sm text-muted-foreground">{evaluation.limits_of_inference.audio_only_constraints}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-900">Insufficient evidence</p>
                    <ul className="space-y-2">
                      {evaluation.limits_of_inference.insufficient_evidence_domains.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <NotebookPen className="mt-0.5 h-4 w-4 text-slate-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-none bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Domain evidence & suggestions</CardTitle>
                <CardDescription>Use this table to plan coaching conversations or share targeted feedback.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead className="w-32">Score</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Suggestions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainEntries.map(([domainKey, domain]) => (
                      <TableRow key={domainKey}>
                        <TableCell className="font-medium text-slate-900">{formatDomainTitle(domainKey)}</TableCell>
                        <TableCell>
                          <ScoreBadge score={domain.score_1_to_4_or_NA} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{domain.evidence}</TableCell>
                        <TableCell>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {domain.suggestions.map((suggestion) => (
                              <li key={suggestion}>{suggestion}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </AuroraBackground>
    </TooltipProvider>
  );
}

type DomainCardProps = {
  title: string;
  domain: DomainScore;
};

const DomainCard = ({ title, domain }: DomainCardProps) => {
  const scoreValue = typeof domain.score_1_to_4_or_NA === "number" ? domain.score_1_to_4_or_NA : null;
  const label = scoreValue ? scoreLabels[scoreValue] : "Not scored";

  return (
    <Card className="h-full border-none bg-white shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <ScoreBadge score={domain.score_1_to_4_or_NA} />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </div>
        {domain.subject_specific_notes && <CardDescription>{domain.subject_specific_notes}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Evidence</p>
          <p className="mt-1 text-sm text-slate-700">{domain.evidence}</p>
        </div>
        <Separator />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Next actions</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {domain.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
        {scoreValue && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress vs. mastery</span>
              <span>{scoreValue}/4</span>
            </div>
            <Progress value={(scoreValue / 4) * 100} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ListItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
    <div className="mt-1">{icon}</div>
    <p className="text-sm text-slate-700">{text}</p>
  </div>
);

const ScoreBadge = ({ score }: { score: DomainScore["score_1_to_4_or_NA"] }) => {
  if (typeof score !== "number") {
    return <Badge variant="outline">N/A</Badge>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-[3.5rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold",
        scoreColors[score]
      )}
    >
      {score.toFixed(1)}
    </span>
  );
};

function calculateAverageScore(data: EvaluationPayload) {
  const numericScores = Object.values(data.domain_scores).filter((domain) => typeof domain.score_1_to_4_or_NA === "number") as Array<
    DomainScore & { score_1_to_4_or_NA: number }
  >;
  if (!numericScores.length) {
    return 0;
  }
  const sum = numericScores.reduce((total, domain) => total + domain.score_1_to_4_or_NA, 0);
  return sum / numericScores.length;
}

function buildStatTiles(data: EvaluationPayload) {
  const firstSentence = data.lesson_overview.curriculum_goal_inferred_or_given.split(".")[0] ?? data.lesson_overview.curriculum_goal_inferred_or_given;
  return [
    {
      label: "Overall rating",
      value: data.global_rating.overall_score_average_or_band,
      icon: Award,
      description: "LLM composite judgement"
    },
    {
      label: "Average domain score",
      value: calculateAverageScore(data).toFixed(1),
      icon: BarChart3,
      description: "Across eight rubric domains"
    },
    {
      label: "Learner profile",
      value: data.lesson_overview.age_group,
      icon: Users,
      description: data.lesson_overview.region
    },
    {
      label: "Concept focus",
      value: data.lesson_overview.subject,
      icon: Lightbulb,
      description: firstSentence
    }
  ];
}

function buildRadarData(domainScores: EvaluationPayload["domain_scores"]) {
  return Object.entries(domainScores).map(([key, domain]) => ({
    domain: formatDomainTitle(key),
    score: typeof domain.score_1_to_4_or_NA === "number" ? domain.score_1_to_4_or_NA : 0
  }));
}

function formatDomainTitle(domainKey: string) {
  return domainKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
