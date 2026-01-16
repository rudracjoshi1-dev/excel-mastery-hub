import { useState, useCallback, useRef, useMemo } from "react";
import { Check, Eye, RotateCcw, Lightbulb, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  UniverSpreadsheet, 
  UniverSpreadsheetRef, 
  SheetData, 
  arrayToCellData 
} from "./UniverSpreadsheet";

interface ValidationResult {
  status: "correct" | "partial" | "incorrect";
  message: string;
  details?: string[];
}

interface UniverInteractiveLessonProps {
  instructions: string;
  initialData: string[][];
  expectedResult: string[][];
  hints: string[];
  answerExplanation: string;
  validationRules: string[];
}

// Default validation function - can be swapped per lesson
function validateSpreadsheetData(
  currentData: string[][],
  _expectedData: string[][],
  _rules: string[]
): ValidationResult {
  const results: { passed: boolean; message: string }[] = [];
  
  // Check headers
  const firstRow = currentData[0] || [];
  const nonEmptyHeaders = firstRow.filter(h => h.trim() !== "");
  if (nonEmptyHeaders.length < 3) {
    results.push({ 
      passed: false, 
      message: "First row should contain at least 3 column headers (e.g., Date, Description, Amount)" 
    });
  } else {
    results.push({ passed: true, message: "Headers look good!" });
  }
  
  // Check for blank rows in middle of data
  let dataStarted = false;
  let blankRowsInData = 0;
  for (let i = 0; i < currentData.length; i++) {
    const isBlank = currentData[i].every(cell => cell.trim() === "");
    if (!isBlank) dataStarted = true;
    else if (dataStarted && isBlank) {
      const hasMoreData = currentData.slice(i + 1).some(r => r.some(c => c.trim() !== ""));
      if (hasMoreData) blankRowsInData++;
    }
  }
  if (blankRowsInData > 0) {
    results.push({ 
      passed: false, 
      message: `Found ${blankRowsInData} blank row(s) within your data - avoid gaps in data` 
    });
  } else {
    results.push({ passed: true, message: "No blank rows in data!" });
  }
  
  // Check for multiple values in single cells
  const problematicCells: string[] = [];
  for (let r = 0; r < currentData.length; r++) {
    for (let c = 0; c < currentData[r].length; c++) {
      const cell = currentData[r][c];
      if (cell.includes(" + ") || cell.includes(" & ") || (cell.includes(", ") && /\d/.test(cell))) {
        problematicCells.push(`${String.fromCharCode(65 + c)}${r + 1}`);
      }
    }
  }
  if (problematicCells.length > 0) {
    results.push({ 
      passed: false, 
      message: `Cells ${problematicCells.join(", ")} appear to contain multiple values - each cell should have one value` 
    });
  } else {
    results.push({ passed: true, message: "Single values per cell - good practice!" });
  }
  
  // Check minimum data rows
  const dataRows = currentData.filter(row => row.some(cell => cell.trim() !== ""));
  if (dataRows.length < 2) {
    results.push({ 
      passed: false, 
      message: "Add at least one header row and one data row" 
    });
  } else {
    results.push({ passed: true, message: "Data structure looks complete!" });
  }

  // Summarize results
  const failed = results.filter(r => !r.passed);
  const passed = results.filter(r => r.passed);
  
  if (failed.length === 0) {
    return { 
      status: "correct", 
      message: "✅ Excellent! Your spreadsheet is correctly structured.", 
      details: passed.map(r => r.message) 
    };
  } else if (failed.length <= 1) {
    return { 
      status: "partial", 
      message: "⚠️ Almost there! Just a few things to fix:", 
      details: failed.map(r => r.message) 
    };
  }
  return { 
    status: "incorrect", 
    message: "❌ Let's work on the structure:", 
    details: failed.map(r => r.message) 
  };
}

export function UniverInteractiveLesson({
  instructions,
  initialData,
  expectedResult,
  hints,
  answerExplanation,
  validationRules,
}: UniverInteractiveLessonProps) {
  const spreadsheetRef = useRef<UniverSpreadsheetRef>(null);
  const modelSpreadsheetRef = useRef<UniverSpreadsheetRef>(null);
  
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [key, setKey] = useState(0); // For forcing re-render on reset

  // Convert initial data to Univer format
  const initialSheetData: SheetData = useMemo(() => ({
    id: "lesson-sheet",
    name: "Practice",
    cellData: arrayToCellData(initialData),
    rowCount: Math.max(20, initialData.length + 5),
    columnCount: Math.max(10, initialData[0]?.length + 3 || 6),
  }), [initialData]);

  // Convert expected result to Univer format
  const modelSheetData: SheetData = useMemo(() => ({
    id: "model-sheet",
    name: "Model Answer",
    cellData: arrayToCellData(expectedResult),
    rowCount: Math.max(20, expectedResult.length + 5),
    columnCount: Math.max(10, expectedResult[0]?.length + 3 || 6),
  }), [expectedResult]);

  const handleCheckAnswer = useCallback(async () => {
    if (!spreadsheetRef.current) return;
    
    // End editing first to commit any pending cell edits
    await spreadsheetRef.current.endEditing();
    
    const dataArray = spreadsheetRef.current.getDataArray();
    if (!dataArray) {
      setValidationResult({
        status: "incorrect",
        message: "❌ Could not read spreadsheet data. Please try again.",
      });
      return;
    }
    
    const result = validateSpreadsheetData(dataArray, expectedResult, validationRules);
    setValidationResult(result);
  }, [expectedResult, validationRules]);

  const handleReset = useCallback(() => {
    setShowModelAnswer(false);
    setValidationResult(null);
    setKey(prev => prev + 1); // Force re-mount of spreadsheet
  }, []);

  const handleRevealAnswer = useCallback(() => {
    setShowModelAnswer(true);
    setValidationResult(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Task Instructions */}
      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Check className="h-5 w-5 text-info" />
          Your Task
        </h4>
        <p className="text-muted-foreground">{instructions}</p>
      </div>

      {/* Model Answer Alert */}
      {showModelAnswer && (
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Model Answer</AlertTitle>
          <AlertDescription>
            This shows the correct solution. Study the structure and data organization.
          </AlertDescription>
        </Alert>
      )}

      {/* Spreadsheet - User's workspace OR Model Answer */}
      <div className="univer-wrapper">
        {showModelAnswer ? (
          <UniverSpreadsheet
            key={`model-${key}`}
            ref={modelSpreadsheetRef}
            initialData={modelSheetData}
            height={450}
            readOnly
          />
        ) : (
          <UniverSpreadsheet
            key={`practice-${key}`}
            ref={spreadsheetRef}
            initialData={initialSheetData}
            height={450}
          />
        )}
      </div>

      {/* Keyboard Tips */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
        <strong>Keyboard shortcuts:</strong> Arrow keys to navigate • Enter to edit • Tab to move right • 
        Ctrl+C/V to copy/paste • Type formulas like =SUM(A1:A5)
      </div>

      {/* Validation Result */}
      {validationResult && !showModelAnswer && (
        <Alert 
          variant={validationResult.status === "incorrect" ? "destructive" : "default"}
          className={validationResult.status === "correct" ? "border-success/50 bg-success/10" : 
                     validationResult.status === "partial" ? "border-warning/50 bg-warning/10" : ""}
        >
          {validationResult.status === "correct" ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : validationResult.status === "partial" ? (
            <AlertCircle className="h-5 w-5 text-warning" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <AlertTitle>{validationResult.message}</AlertTitle>
          {validationResult.details && (
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validationResult.details.map((d, i) => (
                  <li key={i} className="text-sm">{d}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        {!showModelAnswer && (
          <Button onClick={handleCheckAnswer} className="gap-2">
            <Check className="h-4 w-4" />
            Check Answer
          </Button>
        )}
        <Button 
          variant={showModelAnswer ? "secondary" : "outline"} 
          onClick={handleRevealAnswer} 
          disabled={showModelAnswer} 
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {showModelAnswer ? "Model Answer Shown" : "Reveal Model Answer"}
        </Button>
      </div>

      {/* Hints Accordion */}
      <Accordion type="single" collapsible className="w-full">
        {hints.map((hint, i) => (
          <AccordionItem key={i} value={`hint-${i}`}>
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                Hint {i + 1}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-warning/10 border border-warning/20 rounded-md p-3 text-sm text-muted-foreground">
                {hint}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Answer Explanation - shown after revealing */}
      {showModelAnswer && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-4">
          <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Answer Explanation
          </h4>
          <p className="text-muted-foreground">{answerExplanation}</p>
        </div>
      )}
    </div>
  );
}
