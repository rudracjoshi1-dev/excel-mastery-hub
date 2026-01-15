import { useState, useCallback, useMemo } from "react";
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";
import { Check, Eye, RotateCcw, Lightbulb, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ValidationResult {
  status: "correct" | "partial" | "incorrect";
  message: string;
  details?: string[];
}

interface InteractiveLessonProps {
  instructions: string;
  initialData: string[][];
  expectedResult: string[][];
  hints: string[];
  answerExplanation: string;
  validationRules: string[];
}

// Convert string[][] to Matrix<CellBase>
function toMatrix(data: string[][]): Matrix<CellBase> {
  return data.map(row => row.map(value => ({ value })));
}

// Convert Matrix back to string[][]
function fromMatrix(matrix: Matrix<CellBase>): string[][] {
  return matrix.map(row => row.map(cell => cell?.value?.toString() || ""));
}

// Validation functions
function validateData(data: string[][]): ValidationResult {
  const results: { passed: boolean; message: string }[] = [];
  
  // Check headers
  const firstRow = data[0] || [];
  const nonEmptyHeaders = firstRow.filter(h => h.trim() !== "");
  if (nonEmptyHeaders.length < 3) {
    results.push({ passed: false, message: "First row should contain at least 3 column headers (e.g., Date, Description, Amount)" });
  } else {
    results.push({ passed: true, message: "Headers look good!" });
  }
  
  // Check for blank rows
  let dataStarted = false;
  let blankRowsInData = 0;
  for (let i = 0; i < data.length; i++) {
    const isBlank = data[i].every(cell => cell.trim() === "");
    if (!isBlank) dataStarted = true;
    else if (dataStarted && isBlank) {
      const hasMoreData = data.slice(i + 1).some(r => r.some(c => c.trim() !== ""));
      if (hasMoreData) blankRowsInData++;
    }
  }
  if (blankRowsInData > 0) {
    results.push({ passed: false, message: `Found ${blankRowsInData} blank row(s) within your data` });
  } else {
    results.push({ passed: true, message: "No blank rows!" });
  }
  
  // Check for multiple values in cells
  const problematicCells: string[] = [];
  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const cell = data[r][c];
      if (cell.includes(" + ") || cell.includes(" & ") || (cell.includes(", ") && /\d/.test(cell))) {
        problematicCells.push(`${String.fromCharCode(65 + c)}${r + 1}`);
      }
    }
  }
  if (problematicCells.length > 0) {
    results.push({ passed: false, message: `Cells ${problematicCells.join(", ")} contain multiple values` });
  } else {
    results.push({ passed: true, message: "Single values per cell!" });
  }
  
  const failed = results.filter(r => !r.passed);
  if (failed.length === 0) {
    return { status: "correct", message: "✅ Excellent! Your spreadsheet is correctly structured.", details: results.map(r => r.message) };
  } else if (failed.length <= 1) {
    return { status: "partial", message: "⚠️ Almost there!", details: failed.map(r => r.message) };
  }
  return { status: "incorrect", message: "❌ Needs more work:", details: failed.map(r => r.message) };
}

export function InteractiveLesson({
  instructions,
  initialData,
  expectedResult,
  hints,
  answerExplanation,
}: InteractiveLessonProps) {
  const initialMatrix = useMemo(() => toMatrix(initialData), [initialData]);
  const modelMatrix = useMemo(() => toMatrix(expectedResult), [expectedResult]);
  
  const [data, setData] = useState<Matrix<CellBase>>(initialMatrix);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleCheckAnswer = useCallback(() => {
    const result = validateData(fromMatrix(data));
    setValidationResult(result);
  }, [data]);

  const handleReset = () => {
    setData(toMatrix(initialData));
    setShowModelAnswer(false);
    setValidationResult(null);
  };

  const handleRevealAnswer = () => {
    setShowModelAnswer(true);
    setValidationResult(null);
  };

  const columnLabels = useMemo(() => 
    Array.from({ length: Math.max(6, initialData[0]?.length || 4) }, (_, i) => String.fromCharCode(65 + i)),
    [initialData]
  );

  return (
    <div className="space-y-6">
      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Check className="h-5 w-5 text-info" />
          Your Task
        </h4>
        <p className="text-muted-foreground">{instructions}</p>
      </div>

      {showModelAnswer && (
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Model Answer</AlertTitle>
          <AlertDescription>This is the correct solution.</AlertDescription>
        </Alert>
      )}

      <div className="spreadsheet-container p-2">
        <Spreadsheet
          data={showModelAnswer ? modelMatrix : data}
          onChange={showModelAnswer ? undefined : setData}
          columnLabels={columnLabels}
        />
      </div>

      {validationResult && !showModelAnswer && (
        <Alert variant={validationResult.status === "incorrect" ? "destructive" : "default"}>
          {validationResult.status === "correct" ? <CheckCircle className="h-5 w-5 text-success" /> :
           validationResult.status === "partial" ? <AlertCircle className="h-5 w-5 text-warning" /> :
           <XCircle className="h-5 w-5" />}
          <AlertTitle>{validationResult.message}</AlertTitle>
          {validationResult.details && (
            <AlertDescription>
              <ul className="list-disc list-inside mt-2">
                {validationResult.details.map((d, i) => <li key={i} className="text-sm">{d}</li>)}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />Reset
        </Button>
        {!showModelAnswer && (
          <Button onClick={handleCheckAnswer} className="gap-2">
            <Check className="h-4 w-4" />Check Answer
          </Button>
        )}
        <Button variant={showModelAnswer ? "secondary" : "outline"} onClick={handleRevealAnswer} disabled={showModelAnswer} className="gap-2">
          <Eye className="h-4 w-4" />{showModelAnswer ? "Model Answer Shown" : "Reveal Model Answer"}
        </Button>
      </div>

      <Accordion type="single" collapsible>
        {hints.map((hint, i) => (
          <AccordionItem key={i} value={`hint-${i}`}>
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" />Hint {i + 1}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-warning/10 border border-warning/20 rounded-md p-3 text-sm">{hint}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {showModelAnswer && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-4">
          <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />Answer Explanation
          </h4>
          <p className="text-muted-foreground">{answerExplanation}</p>
        </div>
      )}
    </div>
  );
}
