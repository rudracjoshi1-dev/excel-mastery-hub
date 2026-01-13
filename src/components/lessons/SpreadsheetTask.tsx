import { useState } from "react";
import { Check, Lightbulb, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SpreadsheetTaskProps {
  instructions: string;
  initialData: string[][];
  expectedResult: string[][];
  hints: string[];
  answerExplanation: string;
  validationRules: string[];
}

export function SpreadsheetTask({
  instructions,
  initialData,
  hints,
  answerExplanation,
}: SpreadsheetTaskProps) {
  const [data, setData] = useState<string[][]>(initialData.map(row => [...row]));
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setData(newData);
  };

  const resetData = () => {
    setData(initialData.map(row => [...row]));
    setShowAnswer(false);
  };

  const getColumnLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="space-y-6">
      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Check className="h-5 w-5 text-info" />
          Your Task
        </h4>
        <p className="text-muted-foreground">{instructions}</p>
      </div>

      {/* Spreadsheet Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="spreadsheet-header-cell w-10"></th>
                {data[0]?.map((_, colIndex) => (
                  <th key={colIndex} className="spreadsheet-header-cell">
                    {getColumnLetter(colIndex)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="spreadsheet-header-cell">{rowIndex + 1}</td>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`spreadsheet-cell p-0 ${
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? "spreadsheet-cell-selected"
                          : ""
                      }`}
                    >
                      <Input
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                        className="border-0 rounded-none h-8 px-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={resetData} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          variant="default"
          onClick={() => setShowAnswer(!showAnswer)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {showAnswer ? "Hide Answer" : "Reveal Answer"}
        </Button>
      </div>

      {/* Hints */}
      <Accordion type="single" collapsible className="w-full">
        {hints.map((hint, index) => (
          <AccordionItem key={index} value={`hint-${index}`}>
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                Hint {index + 1}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="hint-reveal">{hint}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Answer Reveal */}
      {showAnswer && (
        <div className="answer-reveal animate-fade-in">
          <h4 className="font-semibold text-success mb-2">Answer Explanation</h4>
          <p className="text-muted-foreground">{answerExplanation}</p>
        </div>
      )}
    </div>
  );
}
